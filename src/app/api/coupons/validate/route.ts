import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CouponService } from "@/lib/services/coupon.service";

export const dynamic = "force-dynamic";

const validateSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().nonnegative(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal } = validateSchema.parse(body);

    const result = await CouponService.validate(code, orderTotal);
    return NextResponse.json({
      success: result.valid,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Invalid coupon validation request" } },
      { status: 400 }
    );
  }
}
