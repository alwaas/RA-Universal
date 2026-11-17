import { eq, desc, and } from "drizzle-orm";
import { db, isDatabaseAlive } from "@/db";
import { productReviews } from "@/db/schema";
import { PersistentStore } from "@/lib/storage/persistentStore";
import type { ProductReview } from "@/types";

const REVIEWS_STORAGE_KEY = "reviews.json";

const defaultReviews: ProductReview[] = [
  {
    id: "rev-1",
    productId: "prod-scarf-01",
    userId: "usr-cust-101",
    customerName: "Ananya Mukherjee",
    rating: 5,
    title: "Mesmerizing Silk Sheen & Soft Drape",
    comment: "The pure Mulberry silk texture is sublime. The zari border has an exquisite gold sheen that looks regal when draped over traditional kurtas or evening sarees. Highly recommended!",
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "rev-2",
    productId: "prod-scarf-01",
    userId: "usr-cust-103",
    customerName: "Pooja Deshmukh",
    rating: 5,
    title: "Authentic handloom craftsmanship",
    comment: "Received in pristine condition with lovely handloom packaging. Soft against sensitive skin and color does not bleed on dry cleaning.",
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "rev-3",
    productId: "prod-gamcha-01",
    userId: "usr-cust-104",
    customerName: "Rajeshwari Verma",
    rating: 5,
    title: "Extra absorbent, purely organic cotton",
    comment: "Generous full-body length and very absorbent. Washed thrice and the red check weave got even softer without losing its vibrant dye.",
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export class ReviewService {
  private static async getStore(): Promise<ProductReview[]> {
    return PersistentStore.read<ProductReview[]>(REVIEWS_STORAGE_KEY, defaultReviews);
  }

  private static async saveStore(list: ProductReview[]): Promise<void> {
    PersistentStore.write(REVIEWS_STORAGE_KEY, list);
  }

  static async getByProductId(productId: string): Promise<ProductReview[]> {
    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        const rows = await db
          .select()
          .from(productReviews)
          .where(and(eq(productReviews.productId, productId), eq(productReviews.isApproved, true)))
          .orderBy(desc(productReviews.createdAt));

        return rows.map((r) => ({
          id: r.id,
          productId: r.productId,
          userId: r.userId,
          customerName: r.customerName,
          rating: r.rating,
          title: r.title || undefined,
          comment: r.comment,
          isVerifiedPurchase: r.isVerifiedPurchase,
          isApproved: r.isApproved,
          createdAt: r.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("[ReviewService] DB read failed:", err);
      }
    }
    const store = await this.getStore();
    return store.filter((r) => r.productId === productId && r.isApproved);
  }

  static async create(payload: {
    productId: string;
    userId?: string;
    customerName: string;
    rating: number;
    title?: string;
    comment: string;
    isVerifiedPurchase?: boolean;
  }): Promise<ProductReview> {
    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: payload.productId,
      userId: payload.userId || null,
      customerName: payload.customerName.trim(),
      rating: Math.max(1, Math.min(5, Math.round(payload.rating))),
      title: payload.title?.trim() || undefined,
      comment: payload.comment.trim(),
      isVerifiedPurchase: payload.isVerifiedPurchase ?? true,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };

    const list = await this.getStore();
    list.unshift(newReview);
    await this.saveStore(list);

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        await db.insert(productReviews).values({
          id: newReview.id,
          productId: newReview.productId,
          userId: newReview.userId,
          customerName: newReview.customerName,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
          isVerifiedPurchase: newReview.isVerifiedPurchase,
          isApproved: newReview.isApproved,
        });
      } catch (err) {
        console.warn("[ReviewService] DB insert failed:", err);
      }
    }

    return newReview;
  }
}
