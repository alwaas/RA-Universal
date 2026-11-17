import { eq, desc } from "drizzle-orm";
import { db, isDatabaseAlive } from "@/db";
import { coupons } from "@/db/schema";
import { PersistentStore } from "@/lib/storage/persistentStore";
import type { Coupon } from "@/types";

const COUPONS_STORAGE_KEY = "coupons.json";

const defaultCoupons: Coupon[] = [
  {
    id: "cpn-welcome10",
    code: "WELCOME10",
    title: "10% Off First Handloom Order",
    description: "Get 10% instant discount on your first artisanal purchase above ₹999",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 999,
    maxDiscountAmount: 500,
    usageLimit: 1000,
    usedCount: 42,
    isActive: true,
    expiresAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cpn-festive500",
    code: "FESTIVE500",
    title: "Flat ₹500 Off Premium Silk Collection",
    description: "Save ₹500 on all orders above ₹2,999 across Handcrafted Scarves and Dupattas",
    discountType: "flat",
    discountValue: 500,
    minOrderAmount: 2999,
    maxDiscountAmount: 500,
    usageLimit: 500,
    usedCount: 78,
    isActive: true,
    expiresAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cpn-gamcha100",
    code: "GAMCHA100",
    title: "₹100 Off Cotton Gamchas Bundle",
    description: "Instant ₹100 discount on cotton gamcha bundles over ₹799",
    discountType: "flat",
    discountValue: 100,
    minOrderAmount: 799,
    maxDiscountAmount: 100,
    usageLimit: 300,
    usedCount: 19,
    isActive: true,
    expiresAt: null,
    createdAt: new Date().toISOString(),
  },
];

export class CouponService {
  private static async getStore(): Promise<Coupon[]> {
    const list = PersistentStore.read<Coupon[]>(COUPONS_STORAGE_KEY, defaultCoupons);
    if (!list || list.length === 0) {
      PersistentStore.write(COUPONS_STORAGE_KEY, defaultCoupons);
      return defaultCoupons;
    }
    return list;
  }

  private static async saveStore(list: Coupon[]): Promise<void> {
    PersistentStore.write(COUPONS_STORAGE_KEY, list);
  }

  static async getAll(): Promise<Coupon[]> {
    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
        return rows.map((r) => ({
          id: r.id,
          code: r.code,
          title: r.title,
          description: r.description || undefined,
          discountType: r.discountType as "percentage" | "flat",
          discountValue: Number(r.discountValue),
          minOrderAmount: Number(r.minOrderAmount),
          maxDiscountAmount: r.maxDiscountAmount ? Number(r.maxDiscountAmount) : null,
          usageLimit: r.usageLimit ?? null,
          usedCount: r.usedCount,
          isActive: r.isActive,
          expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
          createdAt: r.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("[CouponService] DB read failed, falling back to local file:", err);
      }
    }
    return this.getStore();
  }

  static async getActive(): Promise<Coupon[]> {
    const all = await this.getAll();
    const now = new Date();
    return all.filter((c) => {
      if (!c.isActive) return false;
      if (c.usageLimit && c.usedCount >= c.usageLimit) return false;
      if (c.expiresAt && new Date(c.expiresAt) < now) return false;
      return true;
    });
  }

  static async validate(code: string, orderTotal: number): Promise<{
    valid: boolean;
    discountAmount: number;
    finalTotal: number;
    coupon?: Coupon;
    message?: string;
  }> {
    const normalized = (code || "").trim().toUpperCase();
    if (!normalized) {
      return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: "Please enter a valid coupon code." };
    }

    const all = await this.getAll();
    const coupon = all.find((c) => c.code.toUpperCase() === normalized);

    if (!coupon) {
      return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: `Coupon "${normalized}" is invalid or does not exist.` };
    }

    if (!coupon.isActive) {
      return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: `Coupon "${normalized}" has been deactivated.` };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: `Coupon "${normalized}" has reached its maximum redemptions.` };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: `Coupon "${normalized}" has expired.` };
    }

    if (orderTotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        finalTotal: orderTotal,
        message: `Minimum cart value of ₹${coupon.minOrderAmount} required to apply this coupon.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = Math.round((orderTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, orderTotal);
    const finalTotal = Math.max(0, orderTotal - discount);

    return {
      valid: true,
      discountAmount: discount,
      finalTotal,
      coupon,
      message: `Coupon "${coupon.code}" applied successfully! You saved ₹${discount}.`,
    };
  }

  static async incrementUsage(code: string): Promise<void> {
    const list = await this.getStore();
    const idx = list.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
    if (idx !== -1) {
      list[idx].usedCount += 1;
      await this.saveStore(list);
    }
  }

  static async create(payload: Omit<Coupon, "id" | "usedCount" | "createdAt">): Promise<Coupon> {
    const newCoupon: Coupon = {
      ...payload,
      id: `cpn-${Date.now()}`,
      code: payload.code.toUpperCase().trim(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        await db.insert(coupons).values({
          id: newCoupon.id,
          code: newCoupon.code,
          title: newCoupon.title,
          description: newCoupon.description,
          discountType: newCoupon.discountType,
          discountValue: String(newCoupon.discountValue),
          minOrderAmount: String(newCoupon.minOrderAmount),
          maxDiscountAmount: newCoupon.maxDiscountAmount ? String(newCoupon.maxDiscountAmount) : null,
          usageLimit: newCoupon.usageLimit,
          usedCount: 0,
          isActive: newCoupon.isActive,
          expiresAt: newCoupon.expiresAt ? new Date(newCoupon.expiresAt) : null,
        });
      } catch (err) {
        console.warn("[CouponService] DB insert failed:", err);
      }
    }

    const list = await this.getStore();
    list.unshift(newCoupon);
    await this.saveStore(list);
    return newCoupon;
  }

  static async update(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    const list = await this.getStore();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    list[idx] = { ...list[idx], ...updates, code: updates.code ? updates.code.toUpperCase().trim() : list[idx].code };
    await this.saveStore(list);

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        await db.update(coupons).set({
          title: list[idx].title,
          code: list[idx].code,
          description: list[idx].description,
          discountType: list[idx].discountType,
          discountValue: String(list[idx].discountValue),
          minOrderAmount: String(list[idx].minOrderAmount),
          maxDiscountAmount: list[idx].maxDiscountAmount ? String(list[idx].maxDiscountAmount) : null,
          usageLimit: list[idx].usageLimit,
          isActive: list[idx].isActive,
          expiresAt: list[idx].expiresAt ? new Date(list[idx].expiresAt) : null,
        }).where(eq(coupons.id, id));
      } catch (err) {
        console.warn("[CouponService] DB update failed:", err);
      }
    }
    return list[idx];
  }

  static async delete(id: string): Promise<boolean> {
    const list = await this.getStore();
    const filtered = list.filter((c) => c.id !== id);
    await this.saveStore(filtered);

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        await db.delete(coupons).where(eq(coupons.id, id));
      } catch (err) {
        console.warn("[CouponService] DB delete failed:", err);
      }
    }
    return true;
  }
}
