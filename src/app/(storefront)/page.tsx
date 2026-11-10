import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductService } from "@/lib/services/product.service";
import type { Product } from "@/types";

export default async function HomePage() {
  let trendingProducts: Product[] = [];
  let loadError: string | null = null;

  try {
    const result = await ProductService.getProducts({ limit: 8, status: "active" });
    trendingProducts = result.products.slice(0, 8);
  } catch (err: any) {
    loadError = err?.message || "Storefront catalogue is temporarily in maintenance mode.";
  }

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative bg-neutral-900 text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pure Handloom Indian Heritage</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Handwoven Grace & Everyday Comfort
          </h1>

          <p className="text-sm sm:text-lg text-neutral-300 max-w-2xl mx-auto">
            Discover lightweight, 100% pure cotton Men&apos;s Gamchas and graceful handspun Women&apos;s Dupattas & Scarves directly from regional weaver looms.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop?category=scarves_dupattas"
              className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-[6px] shadow-sm transition-colors"
            >
              Shop Women&apos;s Dupattas
            </Link>
            <Link
              href="/shop?category=gamchas"
              className="px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-900 text-sm font-semibold rounded-[6px] shadow-sm transition-colors"
            >
              Shop Men&apos;s Gamchas
            </Link>
          </div>
        </div>
      </section>

      {/* Category Splitter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/shop?category=scarves_dupattas"
            className="group relative bg-white border border-neutral-300 rounded-[8px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-card-hover transition-all"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
                Festive & Everyday Elegance
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-900 group-hover:text-brand-primary transition-colors">
                Women&apos;s Scarves & Dupattas
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-sm">
                Chanderi silk-cotton, authentic Kalamkari prints, and vibrant Amritsari Phulkari needlework.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-brand-primary">
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/shop?category=gamchas"
            className="group relative bg-white border border-neutral-300 rounded-[8px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-card-hover transition-all"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
                100% Breathable Weaves
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-900 group-hover:text-brand-primary transition-colors">
                Men&apos;s Traditional Gamchas
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-sm">
                Bengal cotton checks, Sambalpuri Ikat borders, and Assam Phulam Gamosas for superior sweat absorption.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-brand-primary">
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Trending & Best Sellers (Amazon/Flipkart Card Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-2 border-b border-neutral-200">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Trending & Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Handloom pieces loved by our customers across India
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-primary hover:underline mt-2 sm:mt-0"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Responsive Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
        {loadError && trendingProducts.length === 0 ? (
          <div className="py-12 px-4 text-center bg-neutral-100 rounded-[8px] border border-neutral-300">
            <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-700">Catalogue Updating</p>
            <p className="text-xs text-neutral-500 mt-1">{loadError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* B2B Wholesale Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-[12px] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-gold">
              For Boutiques, Retailers & Corporates
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              B2B Bulk Supply & Custom Weaving
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300">
              Direct loom rates, low Minimum Order Quantities (MOQ from 25 pcs), custom dyeing, and pan-India dispatch.
            </p>
          </div>

          <Link
            href="/b2b"
            className="px-6 py-3.5 bg-accent-gold hover:bg-amber-600 text-neutral-950 font-bold text-sm rounded-[6px] transition-colors whitespace-nowrap shadow-md"
          >
            Request Wholesale Quote
          </Link>
        </div>
      </section>
    </div>
  );
}
