"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Truck,
  Search,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";

interface TrackingDetails {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentGateway?: string;
  customerName: string;
  customerPhone: string;
  shippingCity: string;
  shippingState?: string;
  shippingPincode: string;
  totalAmount: number;
  items: Array<{
    title: string;
    sku?: string;
    colorName?: string;
    quantity: number;
    sellingPrice: number;
  }>;
  createdAt: string;
  updatedAt?: string;
  trackingCourier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

const STAGES = [
  { key: "pending", label: "Order Placed", desc: "Order details received in system" },
  { key: "confirmed", label: "Artisan Confirmed", desc: "Weave verified from cluster" },
  { key: "packed", label: "Quality Packed", desc: "Handloom inspected & boxed" },
  { key: "shipped", label: "In Transit", desc: "Handed to courier partner" },
  { key: "delivered", label: "Delivered", desc: "Safely received by customer" },
];

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";

  const [orderQuery, setOrderQuery] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<TrackingDetails | null>(null);

  const performLookup = async (orderNum: string) => {
    const clean = orderNum.trim();
    if (!clean) return;
    setLoading(true);
    setError(null);
    setTracking(null);

    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(clean)}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setTracking(json.data);
      } else {
        setError(json?.error?.message || `No consignment found for order "${clean}"`);
      }
    } catch {
      setError("Network connectivity issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      performLookup(initialOrder);
    }
  }, [initialOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderQuery);
  };

  const getStageIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return 0;
    if (s === "confirmed") return 1;
    if (s === "packed") return 2;
    if (s === "shipped") return 3;
    if (s === "delivered") return 4;
    return 0;
  };

  const currentStageIdx = tracking ? getStageIndex(tracking.orderStatus) : 0;

  return (
    <div className="min-h-screen bg-neutral-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-accent-gold/40 rounded-full text-xs font-semibold text-brand-primary">
            <Truck className="w-3.5 h-3.5 text-accent-gold" />
            <span>Pan-India Live Courier Tracking</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">
            Track Your Handloom Consignment
          </h1>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            Enter your RA Universal Order Number (sent via SMS / WhatsApp) to view live dispatch milestones.
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white p-3 rounded-[10px] shadow-sm border border-neutral-300 flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="e.g. RA-ORD-38156151 or RA-ORD-910241"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3 text-sm bg-neutral-50/70 border border-neutral-200 rounded-[6px] focus:outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading || !orderQuery.trim()}
            className="h-11 px-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Track Order</span>
          </Button>
        </form>

        {/* Error Notice */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-[8px] text-xs text-red-800 text-center space-y-1">
            <p className="font-semibold">{error}</p>
            <p className="text-red-600">
              Please double check the spelling of your order number or contact our WhatsApp concierge for manual verification.
            </p>
          </div>
        )}

        {/* Tracking Details View */}
        {tracking && (
          <div className="bg-white rounded-[12px] border border-neutral-300 shadow-sm overflow-hidden space-y-6">
            {/* Top Bar */}
            <div className="bg-neutral-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
                  Consignment Milestone
                </span>
                <h2 className="font-mono text-xl font-bold mt-0.5">
                  #{tracking.orderNumber}
                </h2>
                <p className="text-xs text-neutral-300 mt-1">
                  Placed on{" "}
                  {new Date(tracking.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-neutral-400 block">Total Paid Value</span>
                <span className="font-mono text-lg font-bold text-accent-gold">
                  {formatINR(tracking.totalAmount)}
                </span>
                <span className="text-[10px] text-emerald-400 block capitalize">
                  {tracking.paymentStatus} ({tracking.paymentGateway?.toUpperCase() || "COD"})
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 py-4">
              <h3 className="font-serif text-sm font-bold text-neutral-900 mb-6">
                Shipment Progression
              </h3>

              <div className="relative">
                {/* Connecting Bar */}
                <div className="absolute top-4 left-4 right-4 h-1 bg-neutral-200 -z-0">
                  <div
                    style={{
                      width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%`,
                    }}
                    className="h-full bg-brand-primary transition-all duration-500"
                  />
                </div>

                {/* Steps */}
                <div className="relative z-10 flex justify-between">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center max-w-[80px]">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                            isCompleted
                              ? "bg-brand-primary text-white"
                              : "bg-white text-neutral-400 border-2 border-neutral-300"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[11px] font-bold mt-2 leading-tight ${
                            isCurrent
                              ? "text-brand-primary"
                              : isCompleted
                              ? "text-neutral-900"
                              : "text-neutral-400"
                          }`}
                        >
                          {stage.label}
                        </span>
                        <span className="text-[9px] text-neutral-400 hidden sm:block mt-0.5">
                          {stage.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Courier Dispatch Card */}
            {tracking.trackingNumber && (
              <div className="mx-6 p-4 bg-emerald-50/60 border border-emerald-200 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                      Logistics Partner
                    </span>
                    <p className="font-bold text-neutral-900 text-sm">
                      {tracking.trackingCourier || "Express Courier"}
                    </p>
                    <p className="text-xs font-mono text-neutral-600">
                      AWB #{tracking.trackingNumber}
                    </p>
                  </div>
                </div>

                {tracking.trackingUrl && (
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[6px] text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
                  >
                    <span>Track on Courier Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Order Items & Destination */}
            <div className="p-6 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50/40">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Delivery Destination</span>
                </h4>
                <div className="bg-white p-3.5 rounded-[6px] border border-neutral-200 text-xs text-neutral-700 space-y-1">
                  <p className="font-bold text-neutral-900">{tracking.customerName}</p>
                  <p className="text-neutral-500">
                    {tracking.shippingCity}
                    {tracking.shippingState ? `, ${tracking.shippingState}` : ""} - {tracking.shippingPincode}
                  </p>
                  <p className="text-[11px] text-neutral-500 pt-1">
                    Phone: {tracking.customerPhone}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Artisanal Package Items</span>
                </h4>
                <div className="bg-white p-3.5 rounded-[6px] border border-neutral-200 divide-y divide-neutral-100 text-xs">
                  {tracking.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex justify-between">
                      <span className="text-neutral-800">
                        {item.title} {item.colorName ? `(${item.colorName})` : ""} × {item.quantity}
                      </span>
                      <span className="font-mono font-medium text-neutral-700">
                        {formatINR(item.sellingPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Support Footer */}
            <div className="p-4 bg-neutral-100/60 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-600 gap-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Need assistance? Chat with dispatch concierge</span>
              </span>
              <a
                href={`https://wa.me/919335159036?text=${encodeURIComponent(
                  `Namaste RA Universal, I need assistance with tracking order #${tracking.orderNumber}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>WhatsApp Helpline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 px-4 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}
