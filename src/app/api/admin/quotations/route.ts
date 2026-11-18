import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/rbac";
import { QuotationService } from "@/lib/services/quotation.service";

export const dynamic = "force-dynamic";

const createQuotationSchema = z.object({
  enquiryId: z.string().optional().nullable(),
  customerName: z.string().min(2, "Customer name is required"),
  businessName: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  phone: z.string().min(10, "10-digit phone number is required"),
  email: z.string().email().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  shippingCity: z.string().optional().nullable(),
  shippingState: z.string().optional().nullable(),
  shippingPincode: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        sku: z.string().min(1),
        title: z.string().min(1),
        colorName: z.string().optional().nullable(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        totalAmount: z.number().optional(),
      })
    )
    .min(1, "At least one item is required"),
  gstPercent: z.number().min(0).max(28).optional().default(5),
  shippingCost: z.number().min(0).optional().default(0),
  validDays: z.number().int().min(1).max(90).optional().default(15),
  terms: z.string().optional(),
  adminNotes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const list = await QuotationService.getAll();
    return NextResponse.json({ success: true, data: list, meta: { total: list.length } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to retrieve quotations" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validated = createQuotationSchema.parse(body);

    const quote = await QuotationService.create({
      enquiryId: validated.enquiryId,
      customerName: validated.customerName,
      businessName: validated.businessName,
      gstin: validated.gstin,
      phone: validated.phone,
      email: validated.email,
      shippingAddress: validated.shippingAddress,
      shippingCity: validated.shippingCity,
      shippingState: validated.shippingState,
      shippingPincode: validated.shippingPincode,
      items: validated.items.map((i) => ({
        ...i,
        totalAmount: i.quantity * i.unitPrice,
      })),
      gstPercent: validated.gstPercent,
      shippingCost: validated.shippingCost,
      validDays: validated.validDays,
      terms: validated.terms,
      adminNotes: validated.adminNotes,
    });

    return NextResponse.json({ success: true, data: quote }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { message: "Validation error", details: err.errors } },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to create quotation" } },
      { status: 500 }
    );
  }
}

