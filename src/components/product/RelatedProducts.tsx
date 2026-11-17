"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product, ProductCategory } from "@/types";

interface RelatedProductsProps {
  currentCategory: ProductCategory;
  currentProductId: string;
}

export function RelatedProducts({
  currentCategory,
  currentProductId,
}: RelatedProductsProps) {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRelated() {
      try {
        const res = await fetch(`/api/products?category=${currentCategory}&limit=5`);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.data) ? json.data : [];
          setRelated(items.filter((p: Product) => p.id !== currentProductId).slice(0, 4));
        }
      } catch (err) {
        console.warn("Failed to load related products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRelated();
  }, [currentCategory, currentProductId]);

  if (!loading && related.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-accent-gold">
              Artisanal Curation
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5">
              You May Also Love
            </h2>
          </div>
          <Link
            href={`/shop?category=${currentCategory}`}
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            Explore All &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
