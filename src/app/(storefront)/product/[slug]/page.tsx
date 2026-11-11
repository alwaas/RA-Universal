"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Truck,
  HeartHandshake,
  MessageCircle,
  ZoomIn,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { ColorSelector } from "@/components/product/ColorSelector";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/useCartStore";
import { toast } from "@/lib/store/useToastStore";
import { BuyNowInterceptModal } from "@/components/cart/BuyNowInterceptModal";
import type { Product, ProductColor } from "@/types";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active displayed image & color selection
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeImageUrl, setActiveImageUrl] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(undefined);
  const [showInterceptModal, setShowInterceptModal] = useState(false);

  // Zoom state for desktop & mobile
  const [isZooming, setIsZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  // Dynamic Multi-Angle Photo Gallery (prioritizes photos matching the selected color)
  const galleryImages: Product["images"] = useMemo(() => {
    if (!product || product.images.length === 0) {
      return [
        {
          id: "primary-photo",
          imageUrl: activeImageUrl,
          altText: product?.title || "Product photo",
          isPrimary: true,
          displayOrder: 0,
        },
      ];
    }

    if (!selectedColor) return product.images;

    // Photos specifically tagged with this color variant
    const colorSpecific = product.images.filter(
      (img) => img.colorName && img.colorName.toLowerCase() === selectedColor.name.toLowerCase()
    );

    if (colorSpecific.length > 0) {
      // Color-specific angles + general photos (without color tag)
      const generalPhotos = product.images.filter((img) => !img.colorName);
      return [...colorSpecific, ...generalPhotos];
    }

    // Fallback if no colorName tag: if color has imageUrl, bring that photo to the front
    if (selectedColor.imageUrl) {
      const match = product.images.find((img) => img.imageUrl === selectedColor.imageUrl);
      if (match) {
        const others = product.images.filter((img) => img.imageUrl !== selectedColor.imageUrl);
        return [match, ...others];
      }
    }

    return product.images;
  }, [product, selectedColor, activeImageUrl]);

  // Fetch product from API to support dynamic database & maintenance checks
  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/products/${params.slug}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success && data.data) {
          const prod: Product = data.data;
          setProduct(prod);

          const primaryIdx = prod.images.findIndex((img) => img.isPrimary);
          const initialIdx = primaryIdx >= 0 ? primaryIdx : 0;
          setActiveImageIndex(initialIdx);

          const defaultImg =
            prod.colors[0]?.imageUrl ||
            prod.images[initialIdx]?.imageUrl ||
            prod.images[0]?.imageUrl ||
            "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800";
          setActiveImageUrl(defaultImg);

          setSelectedColor(prod.colors[0]);
        } else {
          setError(data.error?.message || "Product not found or unavailable");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Failed to load product details from server.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [params.slug]);

  // Color selection triggers dynamic image switch (Requirement 14 & Multi-Angle Photos)
  const handleSelectColor = (color: ProductColor) => {
    setSelectedColor(color);

    if (product) {
      // Find the first image associated with this color variant
      const matchingColorImg = product.images.find(
        (img) => img.colorName && img.colorName.toLowerCase() === color.name.toLowerCase()
      );

      const targetUrl = matchingColorImg?.imageUrl || color.imageUrl || product.images[0]?.imageUrl;

      if (targetUrl) {
        setActiveImageUrl(targetUrl);
        const idx = product.images.findIndex((img) => img.imageUrl === targetUrl);
        setActiveImageIndex(idx >= 0 ? idx : 0);
      }
    }
  };

  // Thumbnail click in gallery
  const handleSelectThumbnail = (index: number, url: string) => {
    setActiveImageIndex(index);
    setActiveImageUrl(url);
  };

  // Desktop Mouse Move Magnifier Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
  };

  // 1. Loading State (Pulse Skeletons)
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-20 bg-neutral-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="flex-1 aspect-[3/4] bg-neutral-200 rounded-[8px] animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-neutral-200 rounded animate-pulse" />
            <div className="h-10 w-1/2 bg-neutral-200 rounded animate-pulse" />
            <div className="h-20 w-full bg-neutral-200 rounded animate-pulse" />
            <div className="h-12 w-full bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State / Maintenance Mode
  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-neutral-900">
          Product Temporarily Unavailable
        </h1>
        <p className="text-sm text-neutral-600 max-w-md mx-auto">
          {error || "The requested handloom item could not be found or the catalogue service is undergoing maintenance."}
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/shop"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-[6px] transition-colors"
          >
            Return to Collection
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockCount <= 0 || product.badge?.slug === "out-of-stock";
  const activeImageObj = galleryImages.find((img) => img.imageUrl === activeImageUrl) || galleryImages[activeImageIndex] || galleryImages[0];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedColor?.name);
    toast.success(`Added "${product.title}" to cart!`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    setShowInterceptModal(true);
  };

  const orderItem = [
    {
      productId: product.id,
      sku: product.sku,
      title: product.title,
      color: selectedColor?.name,
      quantity: 1,
      price: product.sellingPrice,
      mrp: product.mrp,
      imageUrl: activeImageUrl,
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
        {/* ================================================================== */}
        {/* LEFT: MEESHO/MYNTRA MULTI-PHOTO GALLERY & MAGNIFIER (Req 13 & 14) */}
        {/* ================================================================== */}
        <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 select-none">
          {/* Vertical/Horizontal Thumbnails Strip (Meesho/Myntra style) */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[520px] pb-2 md:pb-0 no-scrollbar">
            {galleryImages.map((img, idx) => {
              const isSelected = activeImageUrl === img.imageUrl || (activeImageIndex === idx && !selectedColor?.imageUrl);
              return (
                <button
                  key={img.id || `${img.imageUrl}-${idx}`}
                  type="button"
                  onClick={() => handleSelectThumbnail(idx, img.imageUrl)}
                  onMouseEnter={() => handleSelectThumbnail(idx, img.imageUrl)}
                  className={`relative w-14 h-18 sm:w-16 sm:h-20 flex-shrink-0 aspect-[3/4] rounded-[6px] overflow-hidden border-2 transition-all ${
                    isSelected
                      ? "border-brand-primary ring-2 ring-brand-primary/25 shadow-sm"
                      : "border-neutral-200 hover:border-neutral-400 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.altText || `${product.title} photo ${idx + 1}`}
                    fill
                    unoptimized={img.imageUrl.startsWith("data:") || img.imageUrl.startsWith("/uploads/")}
                    sizes="80px"
                    className="object-cover object-center"
                  />
                </button>
              );
            })}
          </div>

          {/* Main Hero Photo Container with Desktop Magnifier Lens & Touch Zoom */}
          <div
            ref={imageContainerRef}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsMobileModalOpen(true)}
            className="relative flex-1 aspect-[3/4] bg-neutral-100 rounded-[8px] overflow-hidden border border-neutral-300 cursor-crosshair group shadow-sm"
          >
            {/* Corner Badge */}
            {product.badge && (
              <div className="absolute top-3 left-0 z-10 pointer-events-none">
                <Badge color={product.badge.badgeColor} className="rounded-l-none pl-3 pr-2.5 py-1 text-xs">
                  {product.badge.name}
                </Badge>
              </div>
            )}

            {/* Base Image */}
            <Image
              src={activeImageUrl}
              alt={product.title}
              fill
              priority
              unoptimized={activeImageUrl.startsWith("data:") || activeImageUrl.startsWith("/uploads/")}
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover object-center transition-transform duration-200 ${
                isZooming ? "scale-105" : "scale-100"
              }`}
            />

            {/* Desktop Cursor Magnifier Overlay (Meesho/Myntra Weave Inspector) */}
            {isZooming && (
              <div
                className="hidden md:block absolute inset-0 pointer-events-none bg-no-repeat z-20"
                style={{
                  backgroundImage: `url(${activeImageUrl})`,
                  backgroundPosition: `${zoomCoords.x}% ${zoomCoords.y}%`,
                  backgroundSize: "240%",
                }}
              />
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center z-30 pointer-events-none">
                <span className="bg-neutral-900 text-white text-sm font-bold px-4 py-1.5 rounded">
                  OUT OF STOCK
                </span>
              </div>
            )}

            {/* Active Angle / Color Pill Indicator */}
            {activeImageObj?.altText && (
              <div className="absolute bottom-3 left-3 z-30 pointer-events-none bg-neutral-900/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide">
                <span>{activeImageObj.altText}</span>
                {activeImageObj.colorName && (
                  <span className="text-amber-300 ml-1.5 font-semibold">({activeImageObj.colorName})</span>
                )}
              </div>
            )}

            {/* Visual Magnifier Prompt */}
            <div className="absolute bottom-3 right-3 z-30 pointer-events-none bg-neutral-900/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-3 h-3" />
              <span className="hidden md:inline">Hover to inspect handloom weave</span>
              <span className="md:hidden">Tap to enlarge</span>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT: PRODUCT DETAILS & BUY NOW INTERCEPT FLOW */}
        {/* ================================================================== */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
                {product.category === "gamchas" ? "Men's Cotton Gamcha" : "Women's Dupatta & Scarf"}
              </span>
              {product.sku && (
                <span className="text-xs font-mono font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300/80 px-2.5 py-0.5 rounded">
                  Product ID: {product.sku}
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug">
              {product.title}
            </h1>

            {/* Pricing */}
            <div className="py-2.5 border-y border-neutral-200">
              <PriceDisplay
                mrp={product.mrp}
                sellingPrice={product.sellingPrice}
                size="lg"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Inclusive of all taxes. Free shipping on orders above ₹799 across India.
              </p>
            </div>

            {/* Dynamic Color Swatches (Synchronized with Gallery Photos - Req 14) */}
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
                onSelectColor={handleSelectColor}
              />
              <p className="text-[11px] text-neutral-500 italic">
                Tip: Click any color swatch to dynamically switch the displayed product photo.
              </p>
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

      {/* FULLSCREEN TOUCH ZOOM MODAL FOR MOBILE & TABLET (Req 13) */}
      {isMobileModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-950/95 flex flex-col justify-between p-4"
        >
          <div className="flex items-center justify-between text-white pb-3 border-b border-neutral-800">
            <span className="text-xs font-semibold tracking-wide">
              {product.title} ({activeImageIndex + 1}/{galleryImages.length})
            </span>
            <button
              onClick={() => setIsMobileModalOpen(false)}
              className="p-1.5 text-neutral-300 hover:text-white"
              aria-label="Close enlarged view"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 w-full max-h-[75vh] my-auto">
            <Image
              src={activeImageUrl}
              alt={product.title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Bottom Thumbnails Strip in Mobile Modal */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
            {galleryImages.map((img, idx) => (
              <button
                key={`modal-${img.id || idx}`}
                onClick={() => handleSelectThumbnail(idx, img.imageUrl)}
                className={`relative w-12 h-16 rounded overflow-hidden border-2 flex-shrink-0 ${
                  activeImageUrl === img.imageUrl
                    ? "border-accent-gold"
                    : "border-neutral-700 opacity-60"
                }`}
              >
                <Image src={img.imageUrl} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Intercept Modal */}
      <BuyNowInterceptModal
        isOpen={showInterceptModal}
        onClose={() => setShowInterceptModal(false)}
        items={orderItem}
      />
    </div>
  );
}
