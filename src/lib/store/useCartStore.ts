"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, selectedColorName?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed Values
  getTotalCount: () => number;
  getTotalMrp: () => number;
  getTotalSellingPrice: () => number;
  getTotalSavings: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, selectedColorName) => {
        set((state) => {
          const primaryImage =
            product.images.find((img) => img.isPrimary)?.imageUrl ||
            product.images[0]?.imageUrl ||
            "";

          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === product.id &&
              item.colorName === (selectedColorName || "")
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingIndex];
            if (currentItem) {
              updatedItems[existingIndex] = {
                ...currentItem,
                quantity: currentItem.quantity + 1,
              };
            }
            return { items: updatedItems, isOpen: true };
          }

          const newItem: CartItem = {
            id: `${product.id}-${selectedColorName || "default"}-${Date.now()}`,
            productId: product.id,
            sku: product.sku || `RA-${product.category === "gamchas" ? "GAM" : "DUP"}-${product.id.slice(0, 5).toUpperCase()}`,
            title: product.title,
            slug: product.slug,
            imageUrl: primaryImage,
            colorName: selectedColorName,
            mrp: product.mrp,
            sellingPrice: product.sellingPrice,
            quantity: 1,
          };

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, delta) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id === itemId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalMrp: () => {
        return get().items.reduce(
          (sum, item) => sum + item.mrp * item.quantity,
          0
        );
      },

      getTotalSellingPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.sellingPrice * item.quantity,
          0
        );
      },

      getTotalSavings: () => {
        const mrp = get().getTotalMrp();
        const selling = get().getTotalSellingPrice();
        return mrp > selling ? mrp - selling : 0;
      },
    }),
    {
      name: "__ra_store_cart_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
