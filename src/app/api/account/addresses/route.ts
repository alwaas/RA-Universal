import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyJwtSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { AddressService } from "@/lib/services/address.service";

export const dynamic = "force-dynamic";

const addressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  street: z.string().min(5),
  landmark: z.string().nullable().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6),
  isDefault: z.boolean().default(false),
  type: z.enum(["home", "work", "other"]).default("home"),
});

async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const session = await verifyJwtSession(token);
    if (session?.userId) return session.userId;
  }
  return "usr-cust-101"; // Fallback demo customer
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const addresses = await AddressService.getByUserId(userId);
    return NextResponse.json({ success: true, data: addresses });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to load addresses" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const body = await request.json();
    const data = addressSchema.parse(body);

    const address = await AddressService.create(userId, data);
    return NextResponse.json({ success: true, data: address }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Invalid address details" } },
      { status: 400 }
    );
  }
}
