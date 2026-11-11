import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth/rbac";
import { AuthService } from "@/lib/services/auth.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const customers = await AuthService.getCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CUSTOMERS_FETCH_FAILED",
          message: err.message || "Failed to fetch customer directory",
        },
      },
      { status: 500 }
    );
  }
}
