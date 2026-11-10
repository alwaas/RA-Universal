"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PriceDisplay } from "./PriceDisplay";
import { ColorSelector } from "./ColorSelector";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/useCartStore";
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

  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock =
    product.stockCount <= 0 || product.badge?.slug === "out-of-stock";

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, selectedColor?.name);
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
        <div className="absolute top-2 left-0 z-10">
          <Badge color={product.badge.badgeColor} className="rounded-l-none pl-2.5 pr-2 py-0.5">
            {product.badge.name}
          </Badge>
        </div>
      )}

      {/* Product Image Link */}
      <Link href={`/product/${product.slug}`} className="block relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden">
        <Image
          src={primaryImage}
          alt={product.title}
          fill
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
              onSelectColor={setSelectedColor}
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
