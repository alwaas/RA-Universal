import { NextResponse, type NextRequest } from "next/server";
import { requireAuthSession } from "@/lib/auth/rbac";

export async function GET(request: NextRequest) {
  const authResult = await requireAuthSession(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return NextResponse.json({
    success: true,
    data: { user: authResult.user },
  });
}
