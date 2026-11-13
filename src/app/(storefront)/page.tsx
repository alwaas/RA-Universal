import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Heart, Feather, ShoppingBag } from "lucide-react";
import { ProductService } from "@/lib/services/product.service";
import { InteractiveHomeShowcase } from "@/components/home/InteractiveHomeShowcase";
import type { Product } from "@/types";

export default async function HomePage() {
  let trendingProducts: Product[] = [];
  let loadError: string | null = null;

  try {
    const result = await ProductService.getProducts({ limit: 12, status: "active" });
    trendingProducts = result.products;
  } catch (err: any) {
    loadError = err?.message || "Storefront catalogue is temporarily in maintenance mode.";
  }

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative bg-neutral-900 text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Soft Golden Glow Background Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pure Handloom Indian Heritage &bull; Direct From Weaver Looms</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Handwoven Grace &amp; Everyday Comfort
          </h1>

          <p className="text-sm sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal">
            Discover lightweight, 100% pure cotton Men&apos;s Gamchas and graceful handspun Women&apos;s Dupattas &amp; Scarves crafted by regional artisan clusters in Varanasi, Bengal, and Odisha.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
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

          {/* Quick Hero Highlights */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-gold" />
              <span>Handloom Mark Authentic</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Feather className="w-4 h-4 text-emerald-400" />
              <span>Zero Synthetic Polyester</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-400" />
              <span>Fair Weaver Wages</span>
            </span>
          </div>
        </div>
      </section>

      {/* Category Splitter Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/shop?category=scarves_dupattas"
            className="group relative bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-card-hover transition-all"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
                Festive &amp; Everyday Elegance
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-900 group-hover:text-brand-primary transition-colors">
                Women&apos;s Scarves &amp; Dupattas
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-sm">
                Chanderi silk-cotton with zari borders, authentic Kalamkari prints, and vibrant Amritsari Phulkari needlework.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-brand-primary">
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/shop?category=gamchas"
            className="group relative bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-card-hover transition-all"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
                100% Breathable Natural Weaves
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

      {/* Interactive Home Showcase (Regional Explorer, Filtered Products, Fabric Comparison, Testimonials, FAQ) */}
      <InteractiveHomeShowcase products={trendingProducts} />
    </div>
  );
}
