import { NextResponse } from "next/server";
import { CouponService } from "@/lib/services/coupon.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const active = await CouponService.getActive();
    return NextResponse.json({ success: true, data: active });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to fetch active coupons" } },
      { status: 500 }
    );
  }
}
