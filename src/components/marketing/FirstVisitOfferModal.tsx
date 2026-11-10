"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Gift, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const FirstVisitOfferModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if dismissed in current browser session
    const isDismissed = sessionStorage.getItem("__ra_offer_dismissed_v1");
    if (!isDismissed) {
      // Small 1.5s delay after page load for elegant entrance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("__ra_offer_dismissed_v1", "true");
    setIsOpen(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("FIRSTFREE");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/65 backdrop-blur-[2px] transition-opacity"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md bg-white rounded-[12px] shadow-modal p-6 text-center border border-neutral-200"
      >
        <button
          onClick={handleDismiss}
          aria-label="Close welcome offer popup"
          className="absolute top-3.5 right-3.5 p-1 text-neutral-400 hover:text-neutral-900 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gift Icon */}
        <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-3.5">
          <Gift className="w-6 h-6" />
        </div>

        <span className="text-xs font-bold text-accent-gold uppercase tracking-widest">
          Exclusive Welcome Gift
        </span>

        <h3 className="font-serif text-xl font-bold text-neutral-900 mt-1">
          First Order Free Delivery
        </h3>

        <p className="text-xs text-neutral-600 mt-1.5 max-w-xs mx-auto">
          Experience the pure comfort of traditional handloom scarves, dupattas, and gamchas with zero delivery charges.
        </p>

        {/* Coupon Box */}
        <div className="mt-4 p-3 bg-brand-secondary border-2 border-dashed border-brand-primary/30 rounded-[8px] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block text-left">
              Coupon Code
            </span>
            <span className="font-mono text-base font-bold text-brand-primary tracking-wider">
              FIRSTFREE
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors flex items-center gap-1.5 text-neutral-800"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-semantic-success" />
                <span>Copied!</span>
              </>
            ) : (
              <span>Copy Code</span>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <Link href="/shop" onClick={handleDismiss} className="block w-full">
            <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
              <span>Explore Handloom Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-neutral-500 hover:text-neutral-800 underline transition-colors pt-1"
          >
            No thanks, I will browse first
          </button>
        </div>
      </div>
    </div>
  );
};
