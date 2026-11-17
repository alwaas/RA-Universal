import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { PaymentService } from "@/lib/services/payment.service";
import { OrderService } from "@/lib/services/order.service";
import { ProductService } from "@/lib/services/product.service";
import { CouponService } from "@/lib/services/coupon.service";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  customerEmail: z.string().email().optional().or(z.literal("")),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingState: z.string().optional().default("India"),
  shippingPincode: z.string().min(6),
  items: z.array(
    z.object({
      productId: z.string(),
      sku: z.string().optional(),
      title: z.string(),
      colorName: z.string().optional(),
      quantity: z.number().int().positive(),
      sellingPrice: z.number().positive(),
      mrp: z.number().positive(),
      imageUrl: z.string().optional(),
    })
  ).min(1),
  totalAmount: z.number().positive(),
  mrpTotal: z.number().optional(),
  savingsTotal: z.number().optional(),
  shippingFee: z.number().default(0),
  couponCode: z.string().nullable().optional(),
  couponDiscount: z.number().default(0),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = verifySchema.parse(body);

    const isValid = PaymentService.verifyPaymentSignature({
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Payment verification failed. Invalid cryptographic signature." },
        },
        { status: 400 }
      );
    }

    const order = await OrderService.createOrder({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingState: data.shippingState,
      shippingPincode: data.shippingPincode,
      items: data.items,
      totalAmount: data.totalAmount,
      mrpTotal: data.mrpTotal,
      savingsTotal: data.savingsTotal,
      shippingFee: data.shippingFee,
      couponCode: data.couponCode,
      couponDiscount: data.couponDiscount,
      paymentGateway: "razorpay",
      paymentStatus: "paid",
      orderStatus: "confirmed",
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
      notes: data.notes,
    });

    for (const item of data.items) {
      await ProductService.decrementStock(item.productId, item.quantity);
    }

    if (data.couponCode) {
      await CouponService.incrementUsage(data.couponCode);
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to verify payment" } },
      { status: 400 }
    );
  }
}
