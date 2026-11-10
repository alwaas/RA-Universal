import { eq } from "drizzle-orm";
import { db } from "@/db";
import { offers } from "@/db/schema";

export interface OfferData {
  id: string;
  title: string;
  description: string;
  couponCode: string;
  bannerImageUrl?: string | null;
  isPopupActive: boolean;
}

const defaultOffer: OfferData = {
  id: "offer-firstfree",
  title: "First Order Free Delivery Across India",
  description: "Experience the pure comfort of traditional handloom scarves, dupattas, and gamchas with zero delivery charges.",
  couponCode: "FIRSTFREE",
  bannerImageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
  isPopupActive: true,
};

export class OfferService {
  /**
   * Retrieves the current active popup offer.
   */
  static async getActiveOffer(): Promise<OfferData | null> {
    if (db) {
      try {
        const active = await db.query.offers.findFirst({
          where: eq(offers.isPopupActive, true),
        });

        if (active) {
          return {
            id: active.id,
            title: active.title,
            description: active.description,
            couponCode: active.couponCode,
            bannerImageUrl: active.bannerImageUrl,
            isPopupActive: active.isPopupActive,
          };
        }
      } catch (err) {
        console.warn("Database lookup for offers failed:", err);
      }
    }

    return defaultOffer;
  }

  /**
   * Toggles an offer active state. Enforces system rule: only one offer can be active popup at a time.
   */
  static async setPopupActive(offerId: string, isActive: boolean): Promise<boolean> {
    if (db) {
      return await db.transaction(async (tx) => {
        if (isActive) {
          // Deactivate all others
          await tx.update(offers).set({ isPopupActive: false });
        }
        await tx.update(offers).set({ isPopupActive: isActive }).where(eq(offers.id, offerId));
        return true;
      });
    }

    defaultOffer.isPopupActive = isActive;
    return true;
  }
}
