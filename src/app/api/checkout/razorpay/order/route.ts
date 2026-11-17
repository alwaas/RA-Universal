import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { PaymentService } from "@/lib/services/payment.service";

export const dynamic = "force-dynamic";

const createOrderSchema = z.object({
  amount: z.number().positive(),
  receipt: z.string().optional(),
  notes: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const receipt = data.receipt || `rcpt_${Date.now()}`;
    const order = await PaymentService.createRazorpayOrder({
      amount: data.amount,
      receipt,
      notes: data.notes,
    });

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "rzp_test_placeholder_key";

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        keyId,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to initiate Razorpay order" } },
      { status: 400 }
    );
  }
}
