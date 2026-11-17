"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/lib/store/useToastStore";

export default function ReturnsPortalPage() {
  const [formData, setFormData] = useState({
    orderNumber: "",
    customerName: "",
    customerPhone: "",
    reason: "damaged_in_transit",
    resolution: "replacement",
    comments: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    orderNumber: string;
    resolution: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderNumber.trim() || !formData.customerName.trim() || !formData.customerPhone.trim()) {
      toast.error("Please enter Order Number, Name, and Phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmittedTicket({
          id: json.data.id,
          orderNumber: json.data.orderNumber,
          resolution: json.data.resolution,
        });
        toast.success("Return/Replacement request registered successfully!");
      } else {
        toast.error(json?.error?.message || "Failed to register return request.");
      }
    } catch {
      toast.error("Network error while submitting request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-accent-gold/40 rounded-full text-xs font-semibold text-brand-primary">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
            <span>100% Handloom Trust Guarantee</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">
            7-Day Doorstep Returns & Replacements
          </h1>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            If your handloom piece has any weave defect or transit issue, request a hassle-free doorstep reverse pickup within 7 days of delivery.
          </p>
        </div>

        {/* Success Confirmation Card */}
        {submittedTicket ? (
          <div className="bg-white rounded-[12px] border border-emerald-200 p-8 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Ticket Initiated
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-900">
                Doorstep Pickup Arranged
              </h2>
              <p className="text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
                Your request <span className="font-mono font-bold text-neutral-900">#{submittedTicket.id}</span> for order{" "}
                <span className="font-mono font-bold text-neutral-900">#{submittedTicket.orderNumber}</span> has been logged.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-[8px] border border-neutral-200 text-xs text-neutral-600 text-left space-y-2">
              <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-primary" />
                <span>Next Steps for Doorstep Pickup:</span>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                <li>Keep the item in its original bag with fold-tags intact.</li>
                <li>Our courier partner will arrive for reverse pickup within 24–48 hours.</li>
                <li>
                  Upon pickup verification, your requested <strong>{submittedTicket.resolution}</strong> will be processed immediately.
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/shop">
                <Button variant="primary" size="md" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/tracking">
                <Button variant="outline" size="md" className="w-full sm:w-auto">
                  Track Delivery
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Return Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[12px] border border-neutral-300 p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                  Order Number *
                </label>
                <Input
                  required
                  placeholder="e.g. RA-ORD-38156151"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                  Customer Full Name *
                </label>
                <Input
                  required
                  placeholder="Your full name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                  Phone Number *
                </label>
                <Input
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                  Preferred Resolution *
                </label>
                <select
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-white border border-neutral-300 rounded-[6px] font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
                >
                  <option value="replacement">Fresh Replacement (Free Exchange)</option>
                  <option value="refund">100% Refund (UPI / Bank)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                Reason for Return / Exchange *
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-neutral-300 rounded-[6px] font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
              >
                <option value="damaged_in_transit">Damaged in Transit / Torn Packaging</option>
                <option value="defective_weave">Handloom Weave Flaw / Thread Snag</option>
                <option value="incorrect_item_sent">Received Wrong Color or Product</option>
                <option value="color_mismatch">Color Differs Significantly From Photo</option>
                <option value="other">Other Concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                Details & Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Please describe the issue with your piece to assist our weavers..."
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="w-full p-3 text-xs bg-white border border-neutral-300 rounded-[6px] focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                Photo Proof Link (Optional)
              </label>
              <Input
                placeholder="Image URL or drive link showing damage"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              <span>Submit Return Request</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
