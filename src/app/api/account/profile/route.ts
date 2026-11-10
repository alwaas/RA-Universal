import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthSession, assertResourceOwnership } from "@/lib/auth/rbac";
import { AuthService } from "@/lib/services/auth.service";

const profileUpdateSchema = z.object({
  targetUserId: z.string().optional(),
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().or(z.literal("")),
  addressStreet: z.string().max(255).optional(),
  addressCity: z.string().max(100).optional(),
  addressState: z.string().max(100).optional(),
  addressPincode: z
    .string()
    .regex(/^\d{6}$/, "Must be a valid 6-digit Indian PIN code")
    .optional()
    .or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAuthSession(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userProfile = await AuthService.getUserById(authResult.user.userId);
  if (!userProfile) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User profile record not found.",
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { user: userProfile },
  });
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuthSession(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    const targetUserId = validatedData.targetUserId || authResult.user.userId;

    // Enforce resource ownership: Customer can only update their own profile; Admin can update any
    const ownershipError = assertResourceOwnership(authResult.user, targetUserId);
    if (ownershipError) {
      return ownershipError;
    }

    const updatedUser = await AuthService.updateUserProfile(targetUserId, {
      fullName: validatedData.fullName,
      email: validatedData.email || undefined,
      addressStreet: validatedData.addressStreet,
      addressCity: validatedData.addressCity,
      addressState: validatedData.addressState,
      addressPincode: validatedData.addressPincode || undefined,
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "User account could not be found to apply updates.",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid profile update data format.",
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
          code: "INTERNAL_ERROR",
          message: err.message || "Failed to update user profile.",
        },
      },
      { status: 500 }
    );
  }
}

