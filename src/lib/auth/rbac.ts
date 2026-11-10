import { type NextRequest, NextResponse } from "next/server";
import { verifyJwtSession, SESSION_COOKIE_NAME } from "./session";
import type { SessionUser } from "@/types";

/**
 * Enforces server-side authentication and admin authorization.
 * Returns the verified SessionUser or returns a 401/403 NextResponse error.
 */
export async function requireAdminSession(
  request: NextRequest
): Promise<{ user: SessionUser } | NextResponse> {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required. Please log in as an administrator.",
        },
      },
      { status: 401 }
    );
  }

  const user = await verifyJwtSession(cookieValue);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Your session has expired. Please log in again.",
        },
      },
      { status: 401 }
    );
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Forbidden. Administrative access role is required for this operation.",
        },
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Validates any active customer or admin session.
 */
export async function requireAuthSession(
  request: NextRequest
): Promise<{ user: SessionUser } | NextResponse> {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Please sign in to access your customer account.",
        },
      },
      { status: 401 }
    );
  }

  const user = await verifyJwtSession(cookieValue);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Your session has expired. Please sign in again.",
        },
      },
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Checks if the authenticated user is the owner of the resource or has administrative role.
 *
 * @param sessionUser - The authenticated identity from JWT.
 * @param resourceOwnerId - The user ID linked to the record/cart/resource.
 * @returns boolean - true if permitted, false otherwise.
 */
export function requireResourceOwnership(
  sessionUser: SessionUser,
  resourceOwnerId: string
): boolean {
  if (sessionUser.role === "admin") {
    return true;
  }
  return sessionUser.userId === resourceOwnerId;
}

/**
 * Asserts resource ownership and returns a standardized 403 NextResponse if denied.
 */
export function assertResourceOwnership(
  sessionUser: SessionUser,
  resourceOwnerId: string
): NextResponse | null {
  if (!requireResourceOwnership(sessionUser, resourceOwnerId)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Forbidden. You do not have permission to access or modify this resource.",
        },
      },
      { status: 403 }
    );
  }
  return null;
}
