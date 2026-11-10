import { NextResponse, type NextRequest } from "next/server";
import { signupSchema } from "@/lib/validation/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { getSessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const { user, token } = await AuthService.registerCustomer(validatedData);

    const response = NextResponse.json(
      {
        success: true,
        data: { user },
      },
      { status: 201 }
    );

    // Set secure HttpOnly session cookie
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
            message: "Invalid registration data format",
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
          code: "REGISTRATION_FAILED",
          message: err.message || "Failed to register customer account",
        },
      },
      { status: 400 }
    );
  }
}
