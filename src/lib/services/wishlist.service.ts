import { eq, and } from "drizzle-orm";
import { db, isDatabaseAlive } from "@/db";
import { wishlists } from "@/db/schema";
import { PersistentStore } from "@/lib/storage/persistentStore";
import type { WishlistItem } from "@/types";

const WISHLISTS_STORAGE_KEY = "wishlists.json";

export class WishlistService {
  private static async getStore(): Promise<WishlistItem[]> {
    return PersistentStore.read<WishlistItem[]>(WISHLISTS_STORAGE_KEY, []);
  }

  private static async saveStore(list: WishlistItem[]): Promise<void> {
    PersistentStore.write(WISHLISTS_STORAGE_KEY, list);
  }

  static async getByUserId(userId: string): Promise<string[]> {
    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        const rows = await db
          .select({ productId: wishlists.productId })
          .from(wishlists)
          .where(eq(wishlists.userId, userId));
        return rows.map((r) => r.productId);
      } catch (err) {
        console.warn("[WishlistService] DB read failed:", err);
      }
    }
    const store = await this.getStore();
    return store.filter((w) => w.userId === userId).map((w) => w.productId);
  }

  static async add(userId: string, productId: string): Promise<void> {
    const store = await this.getStore();
    const exists = store.some((w) => w.userId === userId && w.productId === productId);
    if (!exists) {
      store.push({
        id: `wsh-${Date.now()}`,
        userId,
        productId,
        createdAt: new Date().toISOString(),
      });
      await this.saveStore(store);
    }

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        await db
          .insert(wishlists)
          .values({
            userId,
            productId,
          })
          .onConflictDoNothing();
      } catch (err) {
        console.warn("[WishlistService] DB insert failed:", err);
      }
    }
  }

  static async remove(userId: string, productId: string): Promise<void> {
    const store = await this.getStore();
    const filtered = store.filter((w) => !(w.userId === userId && w.productId === productId));
    await this.saveStore(filtered);

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        await db
          .delete(wishlists)
          .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
      } catch (err) {
        console.warn("[WishlistService] DB delete failed:", err);
      }
    }
  }
}
