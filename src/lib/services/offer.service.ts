import { eq } from "drizzle-orm";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { PersistentStore } from "@/lib/storage/persistentStore";

export interface OfferData {
  id: string;
  title: string;
  description: string;
  couponCode: string;
  bannerImageUrl?: string | null;
  isPopupActive: boolean;
}

const STORAGE_KEY = "offers.json";

const defaultOffer: OfferData = {
  id: "offer-firstfree",
  title: "First Order Free Delivery Across India",
  description: "Experience the pure comfort of traditional handloom scarves, dupattas, and gamchas with zero delivery charges.",
  couponCode: "FIRSTFREE",
  bannerImageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
  isPopupActive: true,
};

function getStoredOffer(): OfferData {
  const fromDisk = PersistentStore.readJson<OfferData>(STORAGE_KEY);
  if (fromDisk && fromDisk.id) {
    return fromDisk;
  }
  PersistentStore.writeJson(STORAGE_KEY, defaultOffer);
  return { ...defaultOffer };
}

function saveStoredOffer(data: OfferData): void {
  PersistentStore.writeJson(STORAGE_KEY, data);
}

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
          const loaded: OfferData = {
            id: active.id,
            title: active.title,
            description: active.description,
            couponCode: active.couponCode,
            bannerImageUrl: active.bannerImageUrl,
            isPopupActive: active.isPopupActive,
          };
          saveStoredOffer(loaded);
          return loaded;
        }
      } catch (err) {
        console.warn("[OfferService] Database lookup for offers failed:", err);
      }
    }

    return getStoredOffer();
  }

  /**
   * Toggles an offer active state. Enforces system rule: only one offer can be active popup at a time.
   */
  static async setPopupActive(offerId: string, isActive: boolean): Promise<boolean> {
    if (db) {
      try {
        await db.transaction(async (tx) => {
          if (isActive) {
            // Deactivate all others
            await tx.update(offers).set({ isPopupActive: false });
          }
          await tx.update(offers).set({ isPopupActive: isActive }).where(eq(offers.id, offerId));
        });
      } catch (err) {
        console.warn("[OfferService] DB update failed, falling back to persistent storage:", err);
      }
    }

    const current = getStoredOffer();
    current.isPopupActive = isActive;
    saveStoredOffer(current);
    return true;
  }
}
