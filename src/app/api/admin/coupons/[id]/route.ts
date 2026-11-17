import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/rbac";
import { CouponService } from "@/lib/services/coupon.service";

export const dynamic = "force-dynamic";

const updateCouponSchema = z.object({
  code: z.string().min(2).max(50).optional(),
  title: z.string().min(3).max(150).optional(),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "flat"]).optional(),
  discountValue: z.number().positive().optional(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = updateCouponSchema.parse(body);

    const updated = await CouponService.update(params.id, validated);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Coupon not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to update coupon" } },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await CouponService.delete(params.id);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to delete coupon" } },
      { status: 500 }
    );
  }
}
