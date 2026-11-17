"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { wishlistIds, removeItem, isLoaded } = useWishlistStore();
  const { addItem } = useCartStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setAllProducts(json.data);
          }
        }
      } catch (err) {
        console.warn("Failed to load products for wishlist:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const savedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-neutral-200 pb-5 mb-8">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            My Saved Wishlist
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Handpicked artisanal scarves, dupattas & gamchas saved for your upcoming orders.
        </p>
      </div>

      {loading || !isLoaded ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] bg-neutral-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : savedProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-neutral-50 rounded-2xl border border-neutral-200 max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-neutral-900">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 mb-6">
            Explore our heritage handloom weaves and click the heart icon on any product to save it here for later.
          </p>
          <Link href="/shop">
            <Button variant="primary" size="md" className="inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Collection</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {savedProducts.map((product) => {
            const primaryImage =
              product.images.find((img) => img.isPrimary)?.imageUrl ||
              product.images[0]?.imageUrl ||
              "/placeholder.png";

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeItem(product.id)}
                  aria-label={`Remove ${product.title} from wishlist`}
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-rose-600 transition-colors shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Image */}
                <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  <Image
                    src={primaryImage}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                      {product.badge.name}
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent-gold">
                      {product.category === "gamchas" ? "Pure Cotton Gamcha" : "Heritage Dupatta"}
                    </span>
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-serif font-bold text-neutral-900 text-xs sm:text-sm line-clamp-2 mt-0.5 hover:text-accent-gold transition-colors">
                        {product.title}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-bold text-neutral-900 text-sm sm:text-base">
                        ₹{product.sellingPrice.toLocaleString("en-IN")}
                      </span>
                      {product.mrp > product.sellingPrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{product.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                      {product.discountPercentage > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {product.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => addItem(product)}
                      disabled={product.stockCount <= 0}
                      className="w-full text-xs font-semibold py-2"
                    >
                      {product.stockCount <= 0 ? "Out of Stock" : "Move to Cart"}
                    </Button>
                    <Link
                      href={`/product/${product.slug}`}
                      className="block text-center text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
