"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Truck,
  Check,
  Printer,
  MessageCircle,
  Copy,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { AmazonInvoice } from "@/components/admin/AmazonInvoice";
import { toast } from "@/lib/store/useToastStore";
import { formatINR } from "@/lib/formatters";
import type { UserProfileResponse } from "@/lib/services/auth.service";
import type { Order, OrderStatus } from "@/types";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Address edit state
  const [addressData, setAddressData] = useState({
    fullName: "",
    email: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressPincode: "",
  });

  // Orders and live sync state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const prevStatusesRef = useRef<Record<string, OrderStatus>>({});
  const initialLoadDoneRef = useRef(false);

  const fetchCustomerOrders = useCallback(async (isPolling = false) => {
    try {
      const res = await fetch("/api/account/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const freshOrders: Order[] = data.data;

          // Check for live order status changes triggered by admin
          if (initialLoadDoneRef.current) {
            freshOrders.forEach((ord) => {
              const prev = prevStatusesRef.current[ord.id];
              if (prev && prev !== ord.orderStatus) {
                toast.success(
                  `🎉 Update on Order #${ord.orderNumber}: Status is now ${ord.orderStatus.toUpperCase()}!`,
                  6000
                );
              }
            });
          }

          const statusMap: Record<string, OrderStatus> = {};
          freshOrders.forEach((o) => {
            statusMap[o.id] = o.orderStatus;
          });
          prevStatusesRef.current = statusMap;
          initialLoadDoneRef.current = true;
          setOrders(freshOrders);
        }
      }
    } catch {
      // background polling silent
    } finally {
      if (!isPolling) setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerOrders(false);
    // Poll every 6 seconds for instant real-time synchronization with Admin Panel
    const pollInterval = setInterval(() => {
      fetchCustomerOrders(true);
    }, 6000);

    return () => clearInterval(pollInterval);
  }, [fetchCustomerOrders]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/account/profile");
        if (res.status === 401) {
          router.push("/account/login?error=expired&redirect=/account/profile");
          return;
        }
        const data = await res.json();
        if (data.success && data.data?.user) {
          setProfile(data.data.user);
          setAddressData({
            fullName: data.data.user.fullName || "",
            email: data.data.user.email || "",
            addressStreet: data.data.user.addressStreet || "",
            addressCity: data.data.user.addressCity || "",
            addressState: data.data.user.addressState || "",
            addressPincode: data.data.user.addressPincode || "",
          });
        }
      } catch {
        setStatusMessage({
          type: "error",
          text: "Unable to load customer profile. Please refresh or sign in again.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.data.user);
        setStatusMessage({
          type: "success",
          text: "Delivery profile and contact details updated successfully.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error?.message || "Failed to update profile details.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error occurred while updating profile.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/account/login");
      router.refresh();
    } catch {
      router.push("/account/login");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-1/3 animate-pulse" />
        <div className="h-48 bg-white border border-neutral-200 rounded-[12px] p-6 animate-pulse" />
        <div className="h-64 bg-white border border-neutral-200 rounded-[12px] p-6 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Customer Account
            </h1>
            <Badge color={profile?.role === "admin" ? "yellow" : "green"}>
              {profile?.role === "admin" ? "Administrator" : "Verified Customer"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Manage your delivery details, view active enquiries, and track handloom orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profile?.role === "admin" && (
            <Link href="/admin">
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-gold" />
                <span>Admin Portal</span>
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            className="flex items-center gap-1.5 text-neutral-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Status Feedback Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-[8px] flex items-start gap-3 text-xs sm:text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Details Snapshot */}
        <div className="bg-white border border-neutral-200 rounded-[12px] p-6 shadow-sm space-y-6 h-fit">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center font-serif text-xl font-bold">
              {profile?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="font-serif font-bold text-neutral-900 text-base">
                {profile?.fullName}
              </h2>
              <span className="text-xs text-neutral-500">
                Member ID: {profile?.userId.slice(0, 8)}...
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-neutral-700">
              <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span>+91 {profile?.phone}</span>
            </div>

            <div className="flex items-center gap-2.5 text-neutral-700">
              <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span>{profile?.email || "No email linked"}</span>
            </div>

            <div className="flex items-center gap-2.5 text-neutral-700">
              <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span>Joined: {new Date(profile?.createdAt || Date.now()).toLocaleDateString("en-IN")}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/shop" className="block">
              <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-1.5">
                <span>Browse Collection</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Profile Edit & Delivery Address */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-[12px] p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <MapPin className="w-5 h-5 text-brand-primary" />
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                Delivery Address & Contact Preferences
              </h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  value={addressData.fullName}
                  onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                />

                <Input
                  label="Email Address (Optional)"
                  type="email"
                  value={addressData.email}
                  placeholder="name@example.com"
                  onChange={(e) => setAddressData({ ...addressData, email: e.target.value })}
                />
              </div>

              <Input
                label="Street Address / House No. / Landmark"
                placeholder="e.g. 142/B, Handloom Lane, Near Weaver's Colony"
                value={addressData.addressStreet}
                onChange={(e) => setAddressData({ ...addressData, addressStreet: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="e.g. Varanasi"
                  value={addressData.addressCity}
                  onChange={(e) => setAddressData({ ...addressData, addressCity: e.target.value })}
                />

                <Input
                  label="State"
                  placeholder="e.g. Uttar Pradesh"
                  value={addressData.addressState}
                  onChange={(e) => setAddressData({ ...addressData, addressState: e.target.value })}
                />

                <Input
                  label="Pincode (6 digits)"
                  placeholder="e.g. 221001"
                  maxLength={6}
                  value={addressData.addressPincode}
                  onChange={(e) => setAddressData({ ...addressData, addressPincode: e.target.value })}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
                  Save Address & Profile
                </Button>
              </div>
            </form>
          </div>

          {/* Order History & Live Parcel Tracking */}
          <div className="bg-white border border-neutral-200 rounded-[12px] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-accent-gold" />
                <h2 className="font-serif text-lg font-bold text-neutral-900">
                  Your Orders & Live Parcel Tracking
                </h2>
              </div>
              <button
                type="button"
                onClick={() => fetchCustomerOrders(false)}
                className="text-xs text-neutral-500 hover:text-brand-primary flex items-center gap-1 transition-colors"
                title="Refresh order statuses"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Live Sync</span>
              </button>
            </div>

            {isLoadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-neutral-200 rounded-[8px] p-4 space-y-3 animate-pulse">
                    <div className="h-4 bg-neutral-200 rounded w-1/3" />
                    <div className="h-16 bg-neutral-100 rounded" />
                    <div className="h-8 bg-neutral-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-[8px] text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto" />
                <p className="font-semibold text-neutral-800 text-sm">
                  No orders placed yet with this account
                </p>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  When you confirm orders on the storefront or WhatsApp using your phone number (+91 {profile?.phone}), your orders and live parcel updates will appear here automatically.
                </p>
                <div className="pt-2">
                  <Link href="/shop">
                    <Button variant="primary" size="sm">
                      Explore Authentic Handloom Weaves &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  // Step calculation
                  const isCancelled = order.orderStatus === "cancelled";
                  const stepIndex =
                    order.orderStatus === "delivered"
                      ? 4
                      : order.orderStatus === "shipped"
                      ? 3
                      : order.orderStatus === "confirmed"
                      ? 2
                      : 1;

                  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
                    pending: { label: "Order Placed & Awaiting Weaver Confirmation", bg: "bg-amber-100", text: "text-amber-900 border-amber-300" },
                    confirmed: { label: "Confirmed by Handloom Weavers", bg: "bg-blue-100", text: "text-blue-900 border-blue-300" },
                    shipped: { label: "Handloom Parcel Dispatched & In Transit", bg: "bg-purple-100", text: "text-purple-900 border-purple-300" },
                    delivered: { label: "Delivered Successfully", bg: "bg-emerald-100", text: "text-emerald-900 border-emerald-300" },
                    cancelled: { label: "Order Cancelled", bg: "bg-red-100", text: "text-red-900 border-red-300" },
                  };

                  const currentBadge = statusBadges[order.orderStatus] || statusBadges.pending;

                  return (
                    <div
                      key={order.id}
                      className="border border-neutral-300/80 rounded-[10px] p-4 sm:p-5 bg-white shadow-sm space-y-4 hover:border-neutral-400 transition-colors"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-neutral-900">
                              #{order.orderNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(order.orderNumber);
                                toast.info(`Copied #${order.orderNumber} to clipboard!`);
                              }}
                              className="text-neutral-400 hover:text-neutral-700"
                              title="Copy Order ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[11px] text-neutral-500">Placed on {formattedDate}</span>
                        </div>

                        <div>
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${currentBadge.bg} ${currentBadge.text}`}
                          >
                            {currentBadge.label}
                          </span>
                        </div>
                      </div>

                      {/* 4-Step Visual Progress Tracker */}
                      {!isCancelled ? (
                        <div className="py-2">
                          <div className="relative flex items-center justify-between max-w-xl mx-auto">
                            {/* Track Background Line */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-neutral-200 z-0" />
                            {/* Track Active Line */}
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-primary transition-all duration-500 z-0"
                              style={{ width: `${((stepIndex - 1) / 3) * 100}%` }}
                            />

                            {/* Steps */}
                            {[
                              { label: "Placed", desc: "Order Logged" },
                              { label: "Confirmed", desc: "Loom Allocated" },
                              { label: "Dispatched", desc: "In Transit" },
                              { label: "Delivered", desc: "Received" },
                            ].map((s, idx) => {
                              const stepNum = idx + 1;
                              const isCompleted = stepIndex >= stepNum;
                              const isCurrent = stepIndex === stepNum;

                              return (
                                <div key={idx} className="relative z-10 flex flex-col items-center">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                      isCompleted
                                        ? "bg-brand-primary text-white shadow"
                                        : "bg-white border-2 border-neutral-300 text-neutral-400"
                                    } ${isCurrent ? "ring-4 ring-brand-primary/20 scale-110" : ""}`}
                                  >
                                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
                                  </div>
                                  <span
                                    className={`text-[11px] font-bold mt-1.5 ${
                                      isCompleted ? "text-neutral-900" : "text-neutral-400"
                                    }`}
                                  >
                                    {s.label}
                                  </span>
                                  <span className="text-[9px] text-neutral-500 hidden sm:inline">
                                    {s.desc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-[6px] text-xs text-red-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span>This order was cancelled. Please contact support if you need assistance.</span>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="space-y-2 pt-1 border-t border-neutral-100">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 text-xs p-2 bg-neutral-50/60 rounded-[6px]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-11 bg-neutral-200 rounded overflow-hidden relative flex-shrink-0">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-500">
                                    RA
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-neutral-900 line-clamp-1">{item.title}</p>
                                <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                                  {item.sku && (
                                    <span className="font-mono font-bold bg-neutral-200 text-neutral-800 px-1 py-0.2 rounded">
                                      {item.sku}
                                    </span>
                                  )}
                                  {item.colorName && <span>Color: {item.colorName}</span>}
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                            </div>

                            <span className="font-mono font-bold text-neutral-900 whitespace-nowrap">
                              {formatINR(item.sellingPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Action CTAs */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
                        <div>
                          <span className="text-neutral-500 text-[11px] block">Delivery Location:</span>
                          <span className="text-neutral-800 font-medium">
                            {order.shippingAddress}, {order.shippingCity} - {order.shippingPincode}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right sm:mr-3">
                            <span className="text-neutral-500 text-[10px] block uppercase font-bold">Total Paid / Value:</span>
                            <span className="font-mono font-bold text-sm text-neutral-900">
                              {formatINR(order.totalAmount)}
                            </span>
                          </div>

                          {/* Amazon Bill CTA */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="flex items-center gap-1.5 text-xs text-neutral-800 bg-white hover:bg-neutral-50 border-neutral-300"
                            title="Download / View Amazon-format Tax Invoice PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Tax Invoice</span>
                          </Button>

                          {/* WhatsApp Support CTA */}
                          <a
                            href={`https://wa.me/917388553867?text=${encodeURIComponent(
                              `Namaste RA Heritage, I need assistance regarding my order #${order.orderNumber} placed by ${order.customerName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-[6px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Help</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Amazon Invoice Modal */}
      {selectedInvoiceOrder && (
        <AmazonInvoice
          orders={[selectedInvoiceOrder]}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}

