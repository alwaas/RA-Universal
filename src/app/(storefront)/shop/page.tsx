"use client";

import React, { useState, useMemo, useEffect, Suspense, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, normalizeCategory, getCategoryDefinition } from "@/lib/constants/categories";
import { formatINR } from "@/lib/formatters";
import type { Product, ProductCategory } from "@/types";
import {
  SlidersHorizontal,
  Search,
  X,
  RefreshCcw,
  AlertCircle,
  ShoppingBag,
  Filter,
  Check,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 499 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { label: "Above ₹2,000", min: 2000, max: Infinity },
];

const POPULAR_FABRICS = [
  "All Fabrics",
  "Cotton",
  "Silk",
  "Linen",
  "Wool",
  "Modal",
  "Khadi",
];

const COLOR_SWATCHES = [
  { name: "All", hex: "#FFFFFF", border: true },
  { name: "Red", hex: "#DC2626" },
  { name: "Blue", hex: "#1D4ED8" },
  { name: "Green", hex: "#15803D" },
  { name: "Gold", hex: "#D97706" },
  { name: "Maroon", hex: "#800000" },
  { name: "White", hex: "#F8FAFC", border: true },
  { name: "Black", hex: "#1E293B" },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Sync
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(
    urlCategory ? normalizeCategory(urlCategory) : "all"
  );
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState("All Fabrics");
  const [selectedColor, setSelectedColor] = useState("All");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Mobile Filter Drawer
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Load products from API
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/products?limit=100");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setError(data.error?.message || "Failed to load catalogue from database.");
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

  // Update selectedCategory when URL search param changes
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(normalizeCategory(urlCategory));
    }
  }, [urlCategory]);

  // Click outside search autocomplete listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Auto-Suggestions
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return products
      .filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q) ||
          (p.originCluster || "").toLowerCase().includes(q)
        );
      })
      .slice(0, 5);
  }, [products, searchQuery]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    const activePriceRange = PRICE_RANGES[selectedPriceRangeIndex];

    return products
      .filter((p) => {
        // Category Filter
        if (selectedCategory !== "all") {
          const target = normalizeCategory(selectedCategory);
          const current = normalizeCategory(p.category);
          if (target !== current) return false;
        }

        // Keyword Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSku = (p.sku || "").toLowerCase().includes(q);
          const matchFabric = p.fabric.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchOrigin = (p.originCluster || "").toLowerCase().includes(q);
          if (!matchTitle && !matchSku && !matchFabric && !matchDesc && !matchOrigin) {
            return false;
          }
        }

        // Price Filter
        if (
          p.sellingPrice < activePriceRange.min ||
          p.sellingPrice > activePriceRange.max
        ) {
          return false;
        }

        // Fabric Filter
        if (selectedFabric !== "All Fabrics") {
          if (!p.fabric.toLowerCase().includes(selectedFabric.toLowerCase())) {
            return false;
          }
        }

        // Color Swatch Filter
        if (selectedColor !== "All") {
          const hasColor = p.colors.some((c) =>
            c.name.toLowerCase().includes(selectedColor.toLowerCase())
          );
          if (!hasColor) return false;
        }

        // In Stock Only Toggle
        if (inStockOnly && p.stockCount <= 0) {
          return false;
        }

        // Corner Badge Filter
        if (selectedBadge !== "all" && p.badge?.slug !== selectedBadge) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.sellingPrice - b.sellingPrice;
        if (sortBy === "price-high") return b.sellingPrice - a.sellingPrice;
        if (sortBy === "discount") return b.discountPercentage - a.discountPercentage;
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0; // 'featured'
      });
  }, [
    products,
    selectedCategory,
    searchQuery,
    selectedPriceRangeIndex,
    selectedFabric,
    selectedColor,
    inStockOnly,
    selectedBadge,
    sortBy,
  ]);

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedPriceRangeIndex(0);
    setSelectedFabric("All Fabrics");
    setSelectedColor("All");
    setInStockOnly(false);
    setSelectedBadge("all");
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery.trim() !== "" ||
    selectedPriceRangeIndex !== 0 ||
    selectedFabric !== "All Fabrics" ||
    selectedColor !== "All" ||
    inStockOnly ||
    selectedBadge !== "all";

  const activeCategoryMeta =
    selectedCategory !== "all" ? getCategoryDefinition(selectedCategory) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Page Header & Breadcrumb */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-accent-gold">
              Handloom Heritage Weaves
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900">
              {activeCategoryMeta ? activeCategoryMeta.name : "All Textile Collections"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl">
              {activeCategoryMeta
                ? activeCategoryMeta.description
                : "Explore authentic Men's Gamchas, Women's Dupattas, Scarves, Stoles, Lungis, and Running Fabrics handwoven by master artisan clusters."}
            </p>
          </div>

          <div className="text-xs text-neutral-500 font-medium">
            Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> of{" "}
            {products.length} verified products
          </div>
        </div>

        {/* Search Bar with Auto-Suggestions */}
        <div ref={searchContainerRef} className="mt-4 relative max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by weave, fabric (e.g. Mulmul, Chanderi), SKU, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full h-10 pl-10 pr-10 text-xs sm:text-sm bg-neutral-50/70 border border-neutral-300 rounded-[8px] focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute right-3 top-2.5 p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Auto-Suggestions Dropdown */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="absolute top-11 left-0 right-0 bg-white border border-neutral-200 rounded-[8px] shadow-lg z-30 overflow-hidden divide-y divide-neutral-100">
              <div className="px-3 py-1.5 bg-neutral-50 text-[11px] font-semibold text-neutral-500 flex items-center justify-between">
                <span>Quick Matching Weaves</span>
                <span className="text-[10px]">Press Enter to view all</span>
              </div>
              {searchSuggestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  onClick={() => setIsSearchFocused(false)}
                  className="flex items-center gap-3 p-2.5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-10 h-10 relative bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.images[0]?.imageUrl || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {item.fabric} &bull; <span className="font-mono">{item.sku}</span>
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-primary">
                    {formatINR(item.sellingPrice)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 8-Category Horizontal Navigation Pills */}
      <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 min-w-max">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedCategory === "all"
                ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
            }`}
          >
            All Collections ({products.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = products.filter(
              (p) => normalizeCategory(p.category) === cat.id
            ).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                    : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multidimensional Filters & Sorting Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-[8px] border border-neutral-300 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Price Range Filter */}
            <select
              value={selectedPriceRangeIndex}
              onChange={(e) => setSelectedPriceRangeIndex(Number(e.target.value))}
              aria-label="Filter by Price Range"
              className="h-8 px-2.5 bg-neutral-50 border border-neutral-300 rounded-[6px] font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
            >
              {PRICE_RANGES.map((pr, idx) => (
                <option key={idx} value={idx}>
                  {pr.label}
                </option>
              ))}
            </select>

            {/* Fabric Type Filter */}
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              aria-label="Filter by Fabric Type"
              className="h-8 px-2.5 bg-neutral-50 border border-neutral-300 rounded-[6px] font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
            >
              {POPULAR_FABRICS.map((fab) => (
                <option key={fab} value={fab}>
                  {fab}
                </option>
              ))}
            </select>

            {/* In Stock Toggle */}
            <label className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-neutral-50 border border-neutral-300 rounded-[6px] cursor-pointer text-neutral-700 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-neutral-300 text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
              />
              <span>In Stock Only</span>
            </label>

            {/* Mobile Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="md:hidden flex items-center gap-1 h-8 px-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-[6px] font-medium text-neutral-800"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>More Filters</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-semibold whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort product catalogue"
              className="h-8 px-2.5 bg-white border border-neutral-300 rounded-[6px] font-semibold text-neutral-800 focus:outline-none focus:border-brand-primary"
            >
              <option value="featured">Featured Weaves</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount (% OFF)</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Color Swatch Pills Row */}
        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-neutral-500 font-semibold">Color Family:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {COLOR_SWATCHES.map((swatch) => {
              const isSelected = selectedColor === swatch.name;
              return (
                <button
                  key={swatch.name}
                  type="button"
                  onClick={() => setSelectedColor(swatch.name)}
                  title={`Filter by ${swatch.name}`}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] transition-all ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white font-semibold"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {swatch.name !== "All" && (
                    <span
                      style={{ backgroundColor: swatch.hex }}
                      className={`w-2.5 h-2.5 rounded-full inline-block ${
                        swatch.border ? "border border-neutral-300" : ""
                      }`}
                    />
                  )}
                  <span>{swatch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-400 font-medium">Active:</span>

            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[11px] font-medium">
                <span>{getCategoryDefinition(selectedCategory).name}</span>
                <button
                  onClick={() => setSelectedCategory("all")}
                  aria-label="Remove category filter"
                  className="hover:text-amber-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded text-[11px] font-medium">
                <span>Search: &quot;{searchQuery}&quot;</span>
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear keyword search"
                  className="hover:text-blue-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPriceRangeIndex !== 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded text-[11px] font-medium">
                <span>{PRICE_RANGES[selectedPriceRangeIndex].label}</span>
                <button
                  onClick={() => setSelectedPriceRangeIndex(0)}
                  aria-label="Clear price filter"
                  className="hover:text-emerald-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedFabric !== "All Fabrics" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 rounded text-[11px] font-medium">
                <span>Fabric: {selectedFabric}</span>
                <button
                  onClick={() => setSelectedFabric("All Fabrics")}
                  aria-label="Clear fabric filter"
                  className="hover:text-purple-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedColor !== "All" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-900 border border-rose-200 rounded text-[11px] font-medium">
                <span>Color: {selectedColor}</span>
                <button
                  onClick={() => setSelectedColor("All")}
                  aria-label="Clear color filter"
                  className="hover:text-rose-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded text-[11px] font-medium">
                <span>In Stock Only</span>
                <button
                  onClick={() => setInStockOnly(false)}
                  aria-label="Clear in stock filter"
                  className="hover:text-neutral-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[11px] text-brand-primary font-bold hover:underline ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 1. Loading Skeleton */}
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

      {/* 2. Error State */}
      {!isLoading && error && (
        <div className="py-12 px-4 text-center max-w-lg mx-auto bg-red-50 border border-red-200 rounded-[8px] space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="font-serif text-lg font-bold text-neutral-900">
            Catalogue Temporarily Unavailable
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">{error}</p>
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
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-neutral-900">
              No matching handloom pieces found
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We couldn&apos;t find any textile items matching your active combination of filters. Try widening your price range or selecting another fabric type.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </Button>
        </div>
      )}

      {/* 4. Products Grid: Strictly 2 columns on mobile, 4 columns on desktop */}
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

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
