"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ShoppingBag, Plus, Minus, MessageCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { BuyNowInterceptModal } from "./BuyNowInterceptModal";

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalCount,
    getTotalMrp,
    getTotalSellingPrice,
    getTotalSavings,
  } = useCartStore();

  const [showInterceptModal, setShowInterceptModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

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

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />

        {/* Drawer Panel */}
        <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-primary" />
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                Shopping Bag ({totalCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              aria-label="Close cart drawer"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          {items.length > 0 && (
            <div className="bg-brand-secondary p-3 border-b border-neutral-200">
              <div className="text-xs font-medium text-neutral-800 mb-1.5 flex justify-between">
                <span>
                  {remainingForFreeDelivery === 0 ? (
                    <span className="text-semantic-success font-bold">
                      🎉 Congratulations! You have unlocked FREE Delivery!
                    </span>
                  ) : (
                    <>
                      Add <strong className="text-brand-primary">{formatINR(remainingForFreeDelivery)}</strong> more for <strong>FREE Delivery</strong>
                    </>
                  )}
                </span>
                <span className="font-bold text-neutral-600">{deliveryProgress}%</span>
              </div>
              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-semantic-success h-full transition-all duration-300"
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-base font-bold text-neutral-900">
                  Your bag is empty
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Explore our handloom scarves, dupattas, and pure cotton gamchas to start shopping.
                </p>
                <div className="pt-2">
                  <Button onClick={closeCart} variant="primary" size="md">
                    Start Shopping
                  </Button>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 pb-3 border-b border-neutral-100 last:border-none"
                >
                  <div className="relative w-16 h-20 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-neutral-900 line-clamp-1">
                        {item.title}
                      </h4>
                      {item.colorName && (
                        <p className="text-neutral-500 text-[11px] mt-0.5">
                          Color: <span className="text-neutral-800">{item.colorName}</span>
                        </p>
                      )}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-neutral-900">
                          {formatINR(item.sellingPrice)}
                        </span>
                        {item.mrp > item.sellingPrice && (
                          <span className="line-through text-neutral-400">
                            {formatINR(item.mrp)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-300 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          className="p-1 hover:bg-neutral-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-neutral-600" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          className="p-1 hover:bg-neutral-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-neutral-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        className="text-neutral-400 hover:text-semantic-error transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Summary */}
          {items.length > 0 && (
            <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-700">
                <div className="flex justify-between">
                  <span>Total MRP:</span>
                  <span>{formatINR(totalMrp)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-semantic-success font-semibold">
                    <span>Handloom Savings:</span>
                    <span>- {formatINR(totalSavings)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span>
                    {remainingForFreeDelivery === 0 ? (
                      <span className="text-semantic-success font-semibold">FREE</span>
                    ) : (
                      "₹50"
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1.5 border-t border-neutral-200">
                  <span>Payable Amount:</span>
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
                <span>Confirm Order via WhatsApp</span>
              </Button>

              <p className="text-center text-[10px] text-neutral-500">
                Instant order confirmation with direct artisan weaver support.
              </p>
            </div>
          )}
        </div>
      </div>

      <BuyNowInterceptModal
        isOpen={showInterceptModal}
        onClose={() => setShowInterceptModal(false)}
        items={orderItems}
      />
    </>
  );
};
