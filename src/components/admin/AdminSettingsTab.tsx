"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, ShieldCheck, Truck, Percent, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/lib/store/useToastStore";
import type { StoreSettings } from "@/types";

export function AdminSettingsTab() {
  const [settings, setSettings] = useState<StoreSettings>({
    freeShippingThreshold: 499,
    shippingFee: 49,
    gstRate: 5,
    gstin: "09AAAAA0000A1Z5",
    storeName: "RA Heritage Weaves",
    storePhone: "+91 93351 59036",
    storeEmail: "care@rauniversal.in",
    whatsappNumber: "919876543210",
    storeAddress: "Handloom Heritage Cluster, Chowk, Varanasi, Uttar Pradesh - 221001",
    announcementText: "✨ Handcrafted Pure Silk Dupattas & Bengal Cotton Gamchas | FREE Pan-India Shipping above ₹499!",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSettings(json.data);
          }
        }
      } catch (err) {
        console.warn("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSettings(json.data);
        toast.success("Store & Logistics settings saved successfully!");
      } else {
        toast.error(json?.error?.message || "Failed to save settings.");
      }
    } catch {
      toast.error("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-white rounded-lg border border-neutral-200 animate-pulse" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-serif text-xl font-bold text-neutral-900">
          Store & Logistics Configuration
        </h2>
        <p className="text-xs text-neutral-500">
          Set delivery fee thresholds, GST invoicing rates, and customer support contacts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6 shadow-xs">
        {/* Logistics & Shipping Thresholds */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Truck className="w-4 h-4 text-accent-gold" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Shipping & Courier Policies
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Free Delivery Cart Threshold (₹ INR) *
              </label>
              <Input
                type="number"
                min={0}
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                }
                required
              />
              <span className="text-[10px] text-neutral-400">
                Orders with subtotal at or above this amount receive FREE Pan-India delivery.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Standard Courier Delivery Fee (₹ INR) *
              </label>
              <Input
                type="number"
                min={0}
                value={settings.shippingFee}
                onChange={(e) =>
                  setSettings({ ...settings, shippingFee: Number(e.target.value) })
                }
                required
              />
              <span className="text-[10px] text-neutral-400">
                Applied when subtotal is below the free shipping threshold.
              </span>
            </div>
          </div>
        </div>

        {/* GST & Tax Compliance */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Percent className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              GSTIN & Tax Invoicing Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                GSTIN Number (15-character Indian format) *
              </label>
              <Input
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Default Handloom Apparel GST Rate (%) *
              </label>
              <Input
                type="number"
                min={0}
                max={28}
                value={settings.gstRate}
                onChange={(e) => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                required
              />
              <span className="text-[10px] text-neutral-400">
                Standard Indian apparel rate is 5% for items &le; ₹1,000.
              </span>
            </div>
          </div>
        </div>

        {/* Store & Customer Support Contacts */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Store className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Store Information & Support
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Store Name *</label>
              <Input
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Support Email *</label>
              <Input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Support Telephone Number *
              </label>
              <Input
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                WhatsApp Hotline (with 91 country prefix) *
              </label>
              <Input
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-neutral-700 mb-1">
              Registered Physical Store Address (for Tax Invoices) *
            </label>
            <textarea
              rows={2}
              value={settings.storeAddress}
              onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
              className="w-full p-2.5 border border-neutral-300 rounded-[6px] focus:ring-1 focus:ring-accent-gold outline-none"
              required
            />
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-neutral-700 mb-1">
              Storefront Top Announcement Bar Ticker *
            </label>
            <Input
              value={settings.announcementText}
              onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-neutral-200">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={saving}
            className="flex items-center gap-2 font-semibold text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Store Configuration"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
