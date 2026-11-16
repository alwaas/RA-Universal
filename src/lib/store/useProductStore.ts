"use client";

import { create } from "zustand";
import type { Product, ProductCategory } from "@/types";

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string;
  searchQuery: string;
  setProducts: (products: Product[]) => void;
  fetchProducts: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  removeProduct: (id: string) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  isLoading: false,
  error: null,
  selectedCategory: "all",
  searchQuery: "",

  setProducts: (products) => set({ products }),

  fetchProducts: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch("/api/products?limit=100");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        set({ products: data.data, isLoading: false });
      } else {
        set({ error: data.error?.message || "Failed to load products", isLoading: false });
      }
    } catch (err: any) {
      set({ error: err?.message || "Network error loading products", isLoading: false });
    }
  },

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  addProduct: (product) =>
    set((state) => ({ products: [product, ...state.products.filter((p) => p.id !== product.id)] })),

  updateProduct: (id, updated) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    })),

  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
}));

