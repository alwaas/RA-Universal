import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken } from "@/lib/auth/session";
import type { SignupInput } from "@/lib/validation/auth.schema";
import type { SessionUser } from "@/types";

export interface UserProfileResponse extends SessionUser {
  addressStreet?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPincode?: string | null;
  createdAt?: string;
}

// In-memory user store for graceful offline demo execution
interface StoredUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: "customer" | "admin";
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPincode?: string;
  createdAt: string;
}

const inMemoryUsers: Map<string, StoredUser> = new Map();

export class AuthService {
  /**
   * Hashes a plaintext password with bcrypt salt round 12.
   */
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Compares plaintext password against stored hash.
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Registers a new customer account.
   */
  static async registerCustomer(input: SignupInput): Promise<{ user: SessionUser; token: string }> {
    const passwordHash = await this.hashPassword(input.password);

    if (db) {
      // Check for duplicate phone or email
      const existing = await db.query.users.findFirst({
        where: or(
          eq(users.phone, input.phone),
          input.email ? eq(users.email, input.email) : undefined
        ),
      });

      if (existing) {
        throw new Error("A user with this phone number or email is already registered.");
      }

      const [created] = await db
        .insert(users)
        .values({
          fullName: input.fullName,
          phone: input.phone,
          email: input.email || null,
          passwordHash,
          role: "customer",
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create customer account.");
      }

      const sessionUser: SessionUser = {
        userId: created.id,
        role: created.role as SessionUser["role"],
        fullName: created.fullName,
        phone: created.phone,
        email: created.email || undefined,
      };

      const token = await createSessionToken(sessionUser);
      return { user: sessionUser, token };
    }

    // Demo in-memory fallback
    for (const u of Array.from(inMemoryUsers.values())) {
      if (u.phone === input.phone || (input.email && u.email === input.email)) {
        throw new Error("A user with this phone number or email is already registered.");
      }
    }

    const newId = `user-${Date.now()}`;
    const newStoredUser: StoredUser = {
      id: newId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email || undefined,
      passwordHash,
      role: "customer",
      createdAt: new Date().toISOString(),
    };
    inMemoryUsers.set(newId, newStoredUser);

    const sessionUser: SessionUser = {
      userId: newId,
      role: "customer",
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
    };

    const token = await createSessionToken(sessionUser);
    return { user: sessionUser, token };
  }

  /**
   * Validates customer or admin credentials.
   */
  static async login(identifier: string, password: string): Promise<{ user: SessionUser; token: string }> {
    const adminPhone = process.env.ADMIN_DEFAULT_PHONE || "9999999999";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@rauniversal.in";
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "SuperSecureAdminPassword2026!";

    // 1. Check default administrative credentials (phone or email)
    if (
      (identifier === adminPhone || identifier === adminEmail) &&
      password === adminPassword
    ) {
      const adminUser: SessionUser = {
        userId: "admin-root-default-id",
        role: "admin",
        fullName: "Store Administrator",
        phone: adminPhone,
        email: adminEmail,
      };
      const token = await createSessionToken(adminUser);
      return { user: adminUser, token };
    }

    // 2. Check Database if available
    if (db) {
      const user = await db.query.users.findFirst({
        where: or(eq(users.phone, identifier), eq(users.email, identifier)),
      });

      if (!user) {
        throw new Error("Invalid credentials. Please verify your phone/email and password.");
      }

      const isValid = await this.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        throw new Error("Invalid credentials. Please verify your phone/email and password.");
      }

      const sessionUser: SessionUser = {
        userId: user.id,
        role: user.role as SessionUser["role"],
        fullName: user.fullName,
        phone: user.phone,
        email: user.email || undefined,
      };

      const token = await createSessionToken(sessionUser);
      return { user: sessionUser, token };
    }

    // 3. Check Demo In-Memory Users
    for (const u of Array.from(inMemoryUsers.values())) {
      if (u.phone === identifier || (u.email && u.email === identifier)) {
        const isValid = await this.verifyPassword(password, u.passwordHash);
        if (!isValid) {
          throw new Error("Invalid credentials. Please verify your phone/email and password.");
        }
        const sessionUser: SessionUser = {
          userId: u.id,
          role: u.role,
          fullName: u.fullName,
          phone: u.phone,
          email: u.email,
        };
        const token = await createSessionToken(sessionUser);
        return { user: sessionUser, token };
      }
    }

    throw new Error("Invalid credentials. Please verify your phone/email and password.");
  }

  /**
   * Retrieves user profile details without sensitive password hashes.
   */
  static async getUserById(userId: string): Promise<UserProfileResponse | null> {
    if (userId === "admin-root-default-id") {
      return {
        userId: "admin-root-default-id",
        role: "admin",
        fullName: "Store Administrator",
        phone: process.env.ADMIN_DEFAULT_PHONE || "9999999999",
        email: process.env.ADMIN_EMAIL || "admin@rauniversal.in",
      };
    }

    if (db) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) return null;

      return {
        userId: user.id,
        role: user.role as SessionUser["role"],
        fullName: user.fullName,
        phone: user.phone,
        email: user.email || undefined,
        addressStreet: user.addressStreet,
        addressCity: user.addressCity,
        addressState: user.addressState,
        addressPincode: user.addressPincode,
        createdAt: user.createdAt.toISOString(),
      };
    }

    const inMem = inMemoryUsers.get(userId);
    if (inMem) {
      return {
        userId: inMem.id,
        role: inMem.role,
        fullName: inMem.fullName,
        phone: inMem.phone,
        email: inMem.email,
        addressStreet: inMem.addressStreet,
        addressCity: inMem.addressCity,
        addressState: inMem.addressState,
        addressPincode: inMem.addressPincode,
        createdAt: inMem.createdAt,
      };
    }

    return null;
  }

  /**
   * Updates customer profile details (address and name).
   */
  static async updateUserProfile(
    userId: string,
    data: {
      fullName?: string;
      email?: string;
      addressStreet?: string;
      addressCity?: string;
      addressState?: string;
      addressPincode?: string;
    }
  ): Promise<UserProfileResponse | null> {
    if (db) {
      const [updated] = await db
        .update(users)
        .set({
          ...(data.fullName ? { fullName: data.fullName } : {}),
          ...(data.email !== undefined ? { email: data.email || null } : {}),
          ...(data.addressStreet !== undefined ? { addressStreet: data.addressStreet } : {}),
          ...(data.addressCity !== undefined ? { addressCity: data.addressCity } : {}),
          ...(data.addressState !== undefined ? { addressState: data.addressState } : {}),
          ...(data.addressPincode !== undefined ? { addressPincode: data.addressPincode } : {}),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updated) return null;

      return {
        userId: updated.id,
        role: updated.role as SessionUser["role"],
        fullName: updated.fullName,
        phone: updated.phone,
        email: updated.email || undefined,
        addressStreet: updated.addressStreet,
        addressCity: updated.addressCity,
        addressState: updated.addressState,
        addressPincode: updated.addressPincode,
        createdAt: updated.createdAt.toISOString(),
      };
    }

    const inMem = inMemoryUsers.get(userId);
    if (inMem) {
      if (data.fullName) inMem.fullName = data.fullName;
      if (data.email !== undefined) inMem.email = data.email;
      if (data.addressStreet !== undefined) inMem.addressStreet = data.addressStreet;
      if (data.addressCity !== undefined) inMem.addressCity = data.addressCity;
      if (data.addressState !== undefined) inMem.addressState = data.addressState;
      if (data.addressPincode !== undefined) inMem.addressPincode = data.addressPincode;
      inMemoryUsers.set(userId, inMem);

      return {
        userId: inMem.id,
        role: inMem.role,
        fullName: inMem.fullName,
        phone: inMem.phone,
        email: inMem.email,
        addressStreet: inMem.addressStreet,
        addressCity: inMem.addressCity,
        addressState: inMem.addressState,
        addressPincode: inMem.addressPincode,
        createdAt: inMem.createdAt,
      };
    }

    return null;
  }
}
