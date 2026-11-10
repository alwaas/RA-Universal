"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { UserProfileResponse } from "@/lib/services/auth.service";

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

          {/* Order History Placeholder (Strict PRD Compliance) */}
          <div className="bg-white border border-neutral-200 rounded-[12px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Package className="w-5 h-5 text-accent-gold" />
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                Order History & Tracking
              </h2>
            </div>

            <div className="p-5 bg-brand-secondary/40 border border-neutral-200 rounded-[8px] text-center space-y-2">
              <p className="font-semibold text-neutral-900 text-xs sm:text-sm">
                Direct WhatsApp Orders in Progress
              </p>
              <p className="text-xs text-neutral-600 max-w-lg mx-auto">
                During this phase, orders are placed and confirmed directly via WhatsApp Click-to-Chat.
                Your past automated checkout invoices and live courier tracking will populate here once automated gateway checkout is activated.
              </p>
              <div className="pt-2">
                <Link href="/contact" className="text-xs font-semibold text-brand-primary hover:underline">
                  Need help with an ongoing order? Contact Customer Support &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

