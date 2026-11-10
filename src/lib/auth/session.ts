import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/types";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_default_secure_secret_key_32chars!";
const key = new TextEncoder().encode(SECRET_KEY);

export const SESSION_COOKIE_NAME = "__ra_session";

export interface TokenPayload extends SessionUser {
  exp?: number;
}

/**
 * Creates and signs an encrypted stateless JWT.
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Verifies and decodes an active JWT.
 */
export async function verifyJwtSession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    return {
      userId: payload.userId as string,
      role: payload.role as SessionUser["role"],
      fullName: payload.fullName as string,
      phone: payload.phone as string,
      email: payload.email as string | undefined,
    };
  } catch {
    return null;
  }
}
