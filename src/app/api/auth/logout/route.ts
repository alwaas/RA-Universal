import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    data: { message: "Successfully logged out" },
  });

  const cookieOptions = getSessionCookieOptions(0);
  response.cookies.set({
    ...cookieOptions,
    value: "",
    expires: new Date(0),
  });

  return response;
}
