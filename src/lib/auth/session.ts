import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/types";

const SECRET_KEY =
  process.env.JWT_SECRET ||
  "ra_heritage_weaves_secure_jwt_secret_token_32chars_min";
const key = new TextEncoder().encode(SECRET_KEY);

export const SESSION_COOKIE_NAME = "__ra_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days rolling expiry

export interface TokenPayload extends SessionUser {
  exp?: number;
  iat?: number;
}

/**
 * Standard cookie configuration for HTTP-only session tokens.
 */
export function getSessionCookieOptions(maxAge: number = SESSION_MAX_AGE_SECONDS) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * Creates and signs an HMAC-SHA256 stateless JWT using jose.
 *
 * @param user - The verified user identity to embed into the token.
 * @param expiresIn - Token expiration window (defaults to '7d').
 */
export async function createSessionToken(
  user: SessionUser,
  expiresIn: string = "7d"
): Promise<string> {
  return await new SignJWT({
    userId: user.userId,
    role: user.role,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

/**
 * Verifies and decodes an active JWT.
 * Returns null if token is tampered, expired, or invalid.
 */
export async function verifyJwtSession(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    if (
      !payload.userId ||
      typeof payload.userId !== "string" ||
      !payload.role ||
      !payload.fullName ||
      !payload.phone
    ) {
      return null;
    }

    return {
      userId: payload.userId as string,
      role: payload.role as SessionUser["role"],
      fullName: payload.fullName as string,
      phone: payload.phone as string,
      email: payload.email as string | undefined,
    };
  } catch {
    // Gracefully catch expiration (JWTExpired) or signature mismatch (JWSSignatureVerificationFailed)
    return null;
  }
}
