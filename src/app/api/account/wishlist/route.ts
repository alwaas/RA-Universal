import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyJwtSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { WishlistService } from "@/lib/services/wishlist.service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  productId: z.string().min(1),
});

async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const session = await verifyJwtSession(token);
    if (session?.userId) return session.userId;
  }
  return "usr-cust-101";
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const productIds = await WishlistService.getByUserId(userId);
    return NextResponse.json({ success: true, data: productIds });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to load wishlist" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const body = await request.json();
    const { productId } = bodySchema.parse(body);

    await WishlistService.add(userId, productId);
    const updated = await WishlistService.getByUserId(userId);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to add to wishlist" } },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const body = await request.json();
    const { productId } = bodySchema.parse(body);

    await WishlistService.remove(userId, productId);
    const updated = await WishlistService.getByUserId(userId);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to remove from wishlist" } },
      { status: 400 }
    );
  }
}
