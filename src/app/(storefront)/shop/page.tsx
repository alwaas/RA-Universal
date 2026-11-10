"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types";
import { SlidersHorizontal, RefreshCcw, AlertCircle, ShoppingBag } from "lucide-react";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/products?limit=50");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setError(data.error?.message || "Failed to load catalogue. Database service may be undergoing maintenance.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to connect to catalogue service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== "all" && p.category !== selectedCategory) {
          return false;
        }
        if (selectedBadge !== "all" && p.badge?.slug !== selectedBadge) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.sellingPrice - b.sellingPrice;
        if (sortBy === "price-high") return b.sellingPrice - a.sellingPrice;
        if (sortBy === "discount") return b.discountPercentage - a.discountPercentage;
        return 0; // 'featured' or default
      });
  }, [products, selectedCategory, selectedBadge, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedBadge("all");
    setSortBy("featured");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Breadcrumb */}
      <div className="mb-6 pb-4 border-b border-neutral-200">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900">
          Handloom Collection
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Showing {filteredProducts.length} authentic handwoven apparel items
        </p>
      </div>

      {/* Filter and Sorting Controls Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-[8px] border border-neutral-300/80 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-700 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              selectedCategory === "all"
                ? "bg-brand-primary text-white border-brand-primary font-semibold"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("scarves_dupattas")}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              selectedCategory === "scarves_dupattas"
                ? "bg-brand-primary text-white border-brand-primary font-semibold"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
            }`}
          >
            Women&apos;s Dupattas & Scarves
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("gamchas")}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              selectedCategory === "gamchas"
                ? "bg-brand-primary text-white border-brand-primary font-semibold"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
            }`}
          >
            Men&apos;s Gamchas
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="font-semibold text-neutral-700 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 px-2.5 bg-white border border-neutral-300 rounded-[6px] text-xs font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
          >
            <option value="featured">Featured Weaves</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-[6px] p-3 space-y-3 animate-pulse">
              <div className="aspect-[3/4] bg-neutral-200 rounded" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
              <div className="h-8 bg-neutral-200 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* 2. Error State / Maintenance Mode */}
      {!isLoading && error && (
        <div className="py-12 px-4 text-center max-w-lg mx-auto bg-red-50 border border-red-200 rounded-[8px] space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="font-serif text-lg font-bold text-neutral-900">
            Catalogue Temporarily Unavailable
          </h2>
          <p className="text-xs text-neutral-600">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadProducts}
            className="mt-2 inline-flex items-center gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !error && filteredProducts.length === 0 && (
        <div className="py-16 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto" />
          <p className="text-neutral-600 text-sm font-semibold">
            No handloom products found matching your active filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </Button>
        </div>
      )}

      {/* 4. Success State: Strict 2 columns on mobile, 4 columns on desktop */}
      {!isLoading && !error && filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
