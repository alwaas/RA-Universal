import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { getSessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { user, token } = await AuthService.login(
      validatedData.identifier,
      validatedData.password
    );

    const response = NextResponse.json({
      success: true,
      data: { user },
    });

    // Set secure HttpOnly session cookie (SameSite=Lax, Secure in prod, 7-day maxAge)
    const cookieOptions = getSessionCookieOptions();
    response.cookies.set({
      ...cookieOptions,
      value: token,
    });

    return response;
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid login credentials format",
            details: err.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: err.message || "Invalid phone/email or password",
        },
      },
      { status: 401 }
    );
  }
}
