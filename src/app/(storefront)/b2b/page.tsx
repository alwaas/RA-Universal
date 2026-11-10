"use client";

import React, { useState } from "react";
import { CheckCircle, Truck, Package, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function B2BPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    gstin: "",
    phone: "",
    email: "",
    productInterest: "both",
    estimatedVolume: "50-100",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate lead submission for demo
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-accent-gold">
          Direct Loom Consignment & Bulk Trade
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900">
          B2B Wholesale & Custom Weaving
        </h1>
        <p className="text-xs sm:text-base text-neutral-600 max-w-2xl mx-auto">
          Partner with our weaver clusters across West Bengal, Odisha, and Madhya Pradesh. Authentic handloom products with competitive wholesale tiers and reliable pan-India dispatch.
        </p>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-neutral-300 rounded-[8px] space-y-2.5">
          <Package className="w-6 h-6 text-brand-primary" />
          <h3 className="font-serif text-base font-bold text-neutral-900">
            Low MOQ Tiers
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Minimum order quantities starting as low as 25 to 50 pieces. Ideal for regional boutiques and corporate gifting.
          </p>
        </div>

        <div className="bg-white p-6 border border-neutral-300 rounded-[8px] space-y-2.5">
          <Truck className="w-6 h-6 text-brand-primary" />
          <h3 className="font-serif text-base font-bold text-neutral-900">
            Pan-India Logistics
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Consignment shipping with tracked road and air cargo partners directly to your warehouse or retail outlet.
          </p>
        </div>

        <div className="bg-white p-6 border border-neutral-300 rounded-[8px] space-y-2.5">
          <Shield className="w-6 h-6 text-brand-primary" />
          <h3 className="font-serif text-base font-bold text-neutral-900">
            Custom Dyeing & Tags
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Custom natural dye palettes and private brand label stitching for large volume orders (100+ pcs).
          </p>
        </div>
      </div>

      {/* Lead Form Card */}
      <div className="bg-white p-6 sm:p-10 border border-neutral-300 rounded-[12px] shadow-sm max-w-2xl mx-auto">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 bg-semantic-success/10 text-semantic-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-neutral-900">
              Bulk Enquiry Received!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
              Thank you, <strong>{formData.fullName}</strong>. Our wholesale sales desk will contact you within 24 hours on <strong>{formData.phone}</strong> with wholesale rates and fabric swatch samples.
            </p>
            <div className="pt-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    fullName: "",
                    businessName: "",
                    gstin: "",
                    phone: "",
                    email: "",
                    productInterest: "both",
                    estimatedVolume: "50-100",
                    message: "",
                  });
                }}
              >
                Submit Another Enquiry
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-neutral-100 pb-3 mb-4">
              <h2 className="font-serif text-xl font-bold text-neutral-900">
                Request a Wholesale Price Quotation
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Fill out the form below or chat directly with our trade desk on WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Ramesh Chandra"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <Input
                label="Business / Boutique Name"
                placeholder="e.g. Chandra Ethnic Wear"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="WhatsApp Phone Number"
                required
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. ramesh@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GSTIN (Optional)"
                placeholder="15-digit GSTIN (if registered)"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Product Line Interest
                </label>
                <select
                  value={formData.productInterest}
                  onChange={(e) => setFormData({ ...formData, productInterest: e.target.value as any })}
                  className="w-full h-11 px-3 text-sm bg-white border border-neutral-300 rounded-[6px] text-neutral-900 focus:outline-none focus:border-brand-primary"
                >
                  <option value="both">Both Gamchas & Dupattas</option>
                  <option value="gamchas">Men&apos;s Cotton Gamchas</option>
                  <option value="scarves_dupattas">Women&apos;s Scarves & Dupattas</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Estimated Order Volume
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["50-100", "100-500", "500+"].map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setFormData({ ...formData, estimatedVolume: vol as any })}
                    className={`h-10 text-xs font-semibold rounded-[6px] border transition-colors ${
                      formData.estimatedVolume === vol
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {vol} pieces
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Order Requirements & Message
              </label>
              <textarea
                rows={3}
                required
                placeholder="Mention specific weaves, colors, delivery timeline, or corporate branding requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 text-sm bg-white border border-neutral-300 rounded-[6px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="flex-1"
              >
                Submit Wholesale Enquiry
              </Button>

              <a
                href="https://wa.me/919876543210?text=Namaste%2C%20I%20am%20interested%20in%20B2B%20wholesale%20supply%20of%20handloom%20gamchas%20and%20dupattas."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-semantic-whatsapp hover:opacity-95 text-white font-bold text-sm rounded-[6px] transition-opacity"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Trade Desk WhatsApp</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
