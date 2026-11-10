"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, Plus, Minus, MessageCircle, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { BuyNowInterceptModal } from "@/components/cart/BuyNowInterceptModal";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalCount,
    getTotalMrp,
    getTotalSellingPrice,
    getTotalSavings,
  } = useCartStore();

  const [showInterceptModal, setShowInterceptModal] = useState(false);

  const totalCount = getTotalCount();
  const totalMrp = getTotalMrp();
  const totalSellingPrice = getTotalSellingPrice();
  const totalSavings = getTotalSavings();

  const FREE_DELIVERY_THRESHOLD = 799;
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - totalSellingPrice);
  const deliveryProgress = Math.min(
    100,
    Math.round((totalSellingPrice / FREE_DELIVERY_THRESHOLD) * 100)
  );

  const orderItems = items.map((i) => ({
    title: i.title,
    color: i.colorName,
    quantity: i.quantity,
    price: i.sellingPrice,
  }));

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto">
          Explore our collection of authentic Men&apos;s cotton gamchas and handcrafted Women&apos;s dupattas.
        </p>
        <div className="pt-2">
          <Link href="/shop">
            <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mb-6 pb-3 border-b border-neutral-200">
        Shopping Bag ({totalCount} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Shipping Alert */}
          <div className="bg-brand-secondary p-4 border border-neutral-300 rounded-[8px] space-y-2">
            <div className="text-xs font-semibold text-neutral-800 flex justify-between">
              <span>
                {remainingForFreeDelivery === 0 ? (
                  <span className="text-semantic-success font-bold">
                    🎉 You have qualified for FREE Pan-India Delivery!
                  </span>
                ) : (
                  <>
                    Add <strong className="text-brand-primary">{formatINR(remainingForFreeDelivery)}</strong> more to get <strong>FREE Delivery</strong>
                  </>
                )}
              </span>
              <span>{deliveryProgress}%</span>
            </div>
            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-semantic-success h-full transition-all duration-300"
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="bg-white border border-neutral-300 rounded-[8px] divide-y divide-neutral-200 overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex gap-4 items-center">
                <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="font-semibold text-sm sm:text-base text-neutral-900 truncate hover:text-brand-primary">
                      {item.title}
                    </h3>
                  </Link>

                  {item.colorName && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Color: <span className="font-medium text-neutral-800">{item.colorName}</span>
                    </p>
                  )}

                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-base font-bold text-neutral-900">
                      {formatINR(item.sellingPrice)}
                    </span>
                    {item.mrp > item.sellingPrice && (
                      <span className="text-xs line-through text-neutral-400">
                        {formatINR(item.mrp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-neutral-300 rounded">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                        className="p-1.5 hover:bg-neutral-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-neutral-700" />
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                        className="p-1.5 hover:bg-neutral-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-neutral-700" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-semantic-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-sm font-bold text-neutral-900">
                    {formatINR(item.sellingPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="space-y-4">
          <div className="bg-white border border-neutral-300 rounded-[8px] p-5 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-neutral-900 pb-2 border-b border-neutral-200">
              Order Summary
            </h2>

            <div className="space-y-2 text-xs sm:text-sm text-neutral-700">
              <div className="flex justify-between">
                <span>Total MRP:</span>
                <span>{formatINR(totalMrp)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-semantic-success font-semibold">
                  <span>Discount Savings:</span>
                  <span>- {formatINR(totalSavings)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span>
                  {remainingForFreeDelivery === 0 ? (
                    <span className="text-semantic-success font-bold">FREE</span>
                  ) : (
                    "₹50"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Payable:</span>
                <span>
                  {formatINR(
                    totalSellingPrice + (remainingForFreeDelivery === 0 ? 0 : 50)
                  )}
                </span>
              </div>
            </div>

            <Button
              variant="whatsapp"
              size="lg"
              onClick={() => setShowInterceptModal(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Confirm Order on WhatsApp</span>
            </Button>

            <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-800">Direct Handloom Dispatch</p>
              <p>Online payment gateways will be live soon. Currently accepting WhatsApp confirmation with UPI or Bank Transfer.</p>
            </div>
          </div>
        </div>
      </div>

      <BuyNowInterceptModal
        isOpen={showInterceptModal}
        onClose={() => setShowInterceptModal(false)}
        items={orderItems}
      />
    </div>
  );
}
