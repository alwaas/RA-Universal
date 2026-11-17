import { NextResponse, type NextRequest } from "next/server";
import { PaymentService } from "@/lib/services/payment.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ status: "invalid_signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`[Razorpay Webhook] Received event: ${event.event}`);

    // In a production server, update order payment status asynchronously here
    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
