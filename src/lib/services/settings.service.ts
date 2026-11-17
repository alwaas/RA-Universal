import { PersistentStore } from "@/lib/storage/persistentStore";
import type { StoreSettings } from "@/types";

const SETTINGS_STORAGE_KEY = "settings.json";

const defaultSettings: StoreSettings = {
  freeShippingThreshold: 499,
  shippingFee: 49,
  gstRate: 5,
  gstin: "09AAAAA0000A1Z5",
  storeName: "RA Heritage Weaves",
  storePhone: "+91 93351 59036",
  storeEmail: "care@rauniversal.in",
  whatsappNumber: "919876543210",
  storeAddress: "Handloom Heritage Cluster, Chowk, Varanasi, Uttar Pradesh - 221001",
  announcementText: "✨ Handcrafted Pure Silk Dupattas & Bengal Cotton Gamchas | FREE Pan-India Shipping above ₹499!",
};

export class SettingsService {
  static async getSettings(): Promise<StoreSettings> {
    const existing = PersistentStore.readJson<StoreSettings>(SETTINGS_STORAGE_KEY);
    if (!existing) {
      PersistentStore.writeJson(SETTINGS_STORAGE_KEY, defaultSettings);
      return defaultSettings;
    }
    return { ...defaultSettings, ...existing };
  }

  static async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...updates };
    PersistentStore.writeJson(SETTINGS_STORAGE_KEY, updated);
    return updated;
  }
}
