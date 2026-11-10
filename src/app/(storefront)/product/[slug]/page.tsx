"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ShieldCheck, Truck, RefreshCcw, HeartHandshake, MessageCircle } from "lucide-react";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { ColorSelector } from "@/components/product/ColorSelector";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/useCartStore";
import { BuyNowInterceptModal } from "@/components/cart/BuyNowInterceptModal";
import demoProductsData from "@/data/seedProducts.json";
import type { Product, ProductColor } from "@/types";

const demoProducts = demoProductsData as unknown as Product[];

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = demoProducts.find((p) => p.slug === params.slug);

  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    product?.colors[0]
  );
  const [showInterceptModal, setShowInterceptModal] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  if (!product) {
    return notFound();
  }

  const isOutOfStock =
    product.stockCount <= 0 || product.badge?.slug === "out-of-stock";

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedColor?.name);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    setShowInterceptModal(true);
  };

  const orderItem = [
    {
      title: product.title,
      color: selectedColor?.name,
      quantity: 1,
      price: product.sellingPrice,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Link */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-brand-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Collection</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Product Image Box */}
        <div className="relative aspect-[3/4] bg-neutral-100 rounded-[8px] overflow-hidden border border-neutral-300">
          {product.badge && (
            <div className="absolute top-3 left-0 z-10">
              <Badge color={product.badge.badgeColor} className="rounded-l-none pl-3 pr-2.5 py-1 text-xs">
                {product.badge.name}
              </Badge>
            </div>
          )}

          <Image
            src={primaryImage}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
              <span className="bg-neutral-900 text-white text-sm font-bold px-4 py-1.5 rounded">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* Right: Product Details & CTAs */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
              {product.category === "gamchas" ? "Men's Cotton Gamcha" : "Women's Dupatta & Scarf"}
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug">
              {product.title}
            </h1>

            {/* Pricing */}
            <div className="py-2 border-y border-neutral-200">
              <PriceDisplay
                mrp={product.mrp}
                sellingPrice={product.sellingPrice}
                size="lg"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Inclusive of all taxes. Free shipping on orders above ₹799 across India.
              </p>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                <span>Color Variant:</span>
                <span className="text-brand-primary font-bold">
                  {selectedColor?.name || "Standard"}
                </span>
              </div>
              <ColorSelector
                colors={product.colors}
                selectedColorId={selectedColor?.id}
                onSelectColor={setSelectedColor}
              />
            </div>

            {/* Fabric & Narrative */}
            <div className="space-y-2 text-xs sm:text-sm text-neutral-700 leading-relaxed pt-2">
              <p><strong>Fabric Composition:</strong> {product.fabric}</p>
              <p className="text-neutral-600">{product.description}</p>
            </div>

            {/* Trust Markers */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-gold flex-shrink-0" />
                <span>100% Handloom Weave</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent-gold flex-shrink-0" />
                <span>Pan-India Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-accent-gold flex-shrink-0" />
                <span>Direct Artisan Pay</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-semantic-whatsapp flex-shrink-0" />
                <span>WhatsApp Assistance</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="w-full text-sm font-semibold"
              >
                Add to Cart
              </Button>

              <Button
                variant="buynow"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full text-sm font-bold shadow-sm"
              >
                Buy Now
              </Button>
            </div>

            <p className="text-center text-[11px] text-neutral-500">
              ⚡ Orders are fulfilled directly via WhatsApp or phone confirmation with weaver dispatch.
            </p>
          </div>
        </div>
      </div>

      <BuyNowInterceptModal
        isOpen={showInterceptModal}
        onClose={() => setShowInterceptModal(false)}
        items={orderItem}
      />
    </div>
  );
}
