import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyJwtSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { AddressService } from "@/lib/services/address.service";

export const dynamic = "force-dynamic";

const updateAddressSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  street: z.string().min(5).optional(),
  landmark: z.string().nullable().optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().min(6).optional(),
  isDefault: z.boolean().optional(),
  type: z.enum(["home", "work", "other"]).optional(),
});

async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const session = await verifyJwtSession(token);
    if (session?.userId) return session.userId;
  }
  return "usr-cust-101";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    const body = await request.json();
    const data = updateAddressSchema.parse(body);

    const updated = await AddressService.update(params.id, userId, data);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Address not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to update address" } },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    await AddressService.delete(params.id, userId);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to delete address" } },
      { status: 500 }
    );
  }
}
