import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/rbac";
import { CouponService } from "@/lib/services/coupon.service";

export const dynamic = "force-dynamic";

const createCouponSchema = z.object({
  code: z.string().min(2).max(50),
  title: z.string().min(3).max(150),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "flat"]).default("percentage"),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().nonnegative().default(0),
  maxDiscountAmount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const list = await CouponService.getAll();
    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to fetch coupons" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = createCouponSchema.parse(body);

    const coupon = await CouponService.create({
      code: validated.code,
      title: validated.title,
      description: validated.description,
      discountType: validated.discountType,
      discountValue: validated.discountValue,
      minOrderAmount: validated.minOrderAmount,
      maxDiscountAmount: validated.maxDiscountAmount,
      usageLimit: validated.usageLimit,
      isActive: validated.isActive,
      expiresAt: validated.expiresAt,
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to create coupon" } },
      { status: 400 }
    );
  }
}
