import { NextResponse, type NextRequest } from "next/server";
import { verifyJwtSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return NextResponse.json({
      success: true,
      data: { user: null },
    });
  }

  const user = await verifyJwtSession(cookieValue);

  if (!user) {
    return NextResponse.json({
      success: true,
      data: { user: null },
    });
  }

  return NextResponse.json({
    success: true,
    data: { user },
  });
}
