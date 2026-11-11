import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { OrderService } from "@/lib/services/order.service";
import { requireAdminSession } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

const createOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name is required").max(120),
  customerPhone: z.string().min(10, "10-digit phone number is required").max(20),
  customerEmail: z.string().email().optional().nullable(),
  shippingAddress: z.string().min(5, "Delivery address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingState: z.string().default("India"),
  shippingPincode: z.string().min(4, "Pincode is required"),
  totalAmount: z.number().positive(),
  mrpTotal: z.number().optional(),
  savingsTotal: z.number().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      sku: z.string().optional(),
      title: z.string(),
      colorName: z.string().optional().nullable(),
      quantity: z.number().int().positive(),
      sellingPrice: z.number().positive(),
      mrp: z.number().optional(),
      imageUrl: z.string().optional(),
    })
  ).min(1, "At least one item is required"),
  notes: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    const order = await OrderService.createOrder({
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerEmail: validated.customerEmail,
      shippingAddress: validated.shippingAddress,
      shippingCity: validated.shippingCity,
      shippingState: validated.shippingState,
      shippingPincode: validated.shippingPincode,
      totalAmount: validated.totalAmount,
      mrpTotal: validated.mrpTotal,
      savingsTotal: validated.savingsTotal,
      items: validated.items.map((i) => ({
        ...i,
        colorName: i.colorName || undefined,
        mrp: i.mrp || i.sellingPrice,
      })),
      notes: validated.notes,
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid order details", details: err.errors } },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "ORDER_CREATION_FAILED", message: err.message || "Failed to create order" } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const orderList = await OrderService.getOrders();
    return NextResponse.json({ success: true, data: orderList });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "ORDERS_FETCH_FAILED", message: err.message || "Failed to fetch orders" } },
      { status: 500 }
    );
  }
}
