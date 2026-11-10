import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/rbac";
import { AuthService } from "@/lib/services/auth.service";

const rotatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_JSON", message: "Request body must be valid JSON" },
      },
      { status: 400 }
    );
  }

  const parsed = rotatePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 }
    );
  }

  try {
    const { currentPassword, newPassword } = parsed.data;
    await AuthService.rotatePassword(
      auth.user.userId,
      currentPassword,
      newPassword
    );
    return NextResponse.json({ success: true, data: { status: "ok" } });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update password";
    console.error("[Admin Password] Rotation failed:", message);
    return NextResponse.json(
      {
        success: false,
        error: { code: "PASSWORD_ROTATION_FAILED", message },
      },
      { status: 400 }
    );
  }
}
