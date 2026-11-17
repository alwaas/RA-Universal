"use client";

import { create } from "zustand";

interface WishlistState {
  wishlistIds: string[];
  isLoaded: boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loadWishlist: () => void;
}

const LOCAL_STORAGE_KEY = "ra_heritage_wishlist_ids";

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: [],
  isLoaded: false,

  loadWishlist: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          set({ wishlistIds: parsed, isLoaded: true });
          return;
        }
      }
    } catch {}
    set({ wishlistIds: [], isLoaded: true });
  },

  isInWishlist: (productId: string) => {
    return get().wishlistIds.includes(productId);
  },

  toggleWishlist: async (productId: string) => {
    const current = get().wishlistIds;
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];

    set({ wishlistIds: updated });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    try {
      fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(() => {});
    } catch {}

    return !exists;
  },

  removeItem: async (productId: string) => {
    const current = get().wishlistIds;
    if (!current.includes(productId)) return;
    const updated = current.filter((id) => id !== productId);

    set({ wishlistIds: updated });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    try {
      fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(() => {});
    } catch {}
  },
}));
