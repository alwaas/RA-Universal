"use client";

import React, { useState, useMemo } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import demoProductsData from "@/data/seedProducts.json";
import type { Product, ProductCategory } from "@/types";
import { SlidersHorizontal, RefreshCcw } from "lucide-react";

const allProducts = demoProductsData as unknown as Product[];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  const filteredProducts = useMemo(() => {
    return allProducts
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
  }, [selectedCategory, selectedBadge, sortBy]);

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
            className="h-9 px-2.5 bg-white border border-neutral-300 rounded-[6px] text-xs sm:text-sm font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="featured">Featured / Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-neutral-300 rounded-[12px] p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-lg font-bold text-neutral-900">
            No matching handloom products found
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
            We couldn&apos;t find any items matching your selected criteria. Try resetting your filters.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="md" onClick={resetFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
