"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { ColorSelector } from "./ColorSelector";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { toast } from "@/lib/store/useToastStore";
import type { Product, ProductColor } from "@/types";

export interface ProductCardProps {
  product: Product;
  onBuyNowClick?: (product: Product, selectedColorName?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onBuyNowClick,
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    product.colors[0]
  );
  const [isMounted, setIsMounted] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist, loadWishlist, isLoaded } = useWishlistStore();

  useEffect(() => {
    setIsMounted(true);
    if (!isLoaded) loadWishlist();
  }, [isLoaded, loadWishlist]);

  const inWishlist = isMounted && isInWishlist(product.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = await toggleWishlist(product.id);
    if (added) {
      toast.success(`Saved "${product.title}" to Wishlist!`);
    } else {
      toast.info(`Removed "${product.title}" from Wishlist`);
    }
  };

  const isOutOfStock =
    product.stockCount <= 0 || product.badge?.slug === "out-of-stock";

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800";

  const [activeImage, setActiveImage] = useState<string>(
    product.colors[0]?.imageUrl || primaryImage
  );

  const handleSelectColor = (color: ProductColor) => {
    setSelectedColor(color);
    if (color.imageUrl) {
      setActiveImage(color.imageUrl);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, selectedColor?.name);
    toast.success(`Added "${product.title}" to cart!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onBuyNowClick) {
      onBuyNowClick(product, selectedColor?.name);
    } else {
      addItem(product, selectedColor?.name);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white border border-neutral-300/80 rounded-[6px] overflow-hidden transition-all duration-200 hover:shadow-card-hover">
      {/* Pinned Corner Badge */}
      {product.badge && (
        <div className="absolute top-2 left-0 z-10 pointer-events-none">
          <Badge color={product.badge.badgeColor} className="rounded-l-none pl-2.5 pr-2 py-0.5">
            {product.badge.name}
          </Badge>
        </div>
      )}

      {/* Wishlist Button (Top Right) */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
        className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
          inWishlist
            ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
            : "bg-white/85 text-neutral-600 hover:text-rose-600 hover:bg-white border border-neutral-200/60"
        }`}
      >
        <Heart
          className={`w-4 h-4 transition-transform ${
            inWishlist ? "fill-rose-500 text-rose-500 scale-110" : ""
          }`}
        />
      </button>

      {/* Product Image Link */}
      <Link href={`/product/${product.slug}`} className="block relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden">
        <Image
          src={activeImage}
          alt={product.title}
          fill
          unoptimized={activeImage.startsWith("data:") || activeImage.startsWith("/uploads/")}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
            <span className="bg-neutral-900/90 text-white text-xs font-bold px-3 py-1 rounded">
              OUT OF STOCK
            </span>
          </div>
        )}
      </Link>

      {/* Product Details Block */}
      <div className="flex flex-col flex-1 p-3 sm:p-3.5 justify-between">
        <div>
          {/* Color Swatches */}
          <div className="mb-2 min-h-[20px]">
            <ColorSelector
              colors={product.colors}
              selectedColorId={selectedColor?.id}
              onSelectColor={handleSelectColor}
            />
          </div>

          {/* Product Title (Strict 2-line truncated) */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3
              title={product.title}
              className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-2 h-9 sm:h-10 leading-snug hover:text-brand-primary transition-colors"
            >
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center justify-between gap-1 mt-1">
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200/60">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                4.8
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">Verified</span>
            </div>
            {product.sku && (
              <span className="text-[10px] font-mono text-neutral-400">
                #{product.sku.slice(-6)}
              </span>
            )}
          </div>

          {/* Pricing Block */}
          <div className="mt-2.5">
            <PriceDisplay
              mrp={product.mrp}
              sellingPrice={product.sellingPrice}
              size="md"
            />
          </div>
        </div>

        {/* Dual Actions (Add to Cart / Buy Now) */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 pt-2 border-t border-neutral-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="w-full text-xs font-medium"
          >
            Add to Cart
          </Button>

          <Button
            type="button"
            variant="buynow"
            size="sm"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className="w-full text-xs font-bold"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};
