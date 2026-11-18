"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Truck,
  Package,
  MessageCircle,
  Shield,
  Building2,
  Percent,
  Layers,
  ArrowRight,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CATEGORIES } from "@/lib/constants/categories";

function B2BPageContent() {
  const searchParams = useSearchParams();
  const initialSku = searchParams.get("sku") || "";
  const initialTitle = searchParams.get("title") || "";
  const initialCategory = searchParams.get("cat") || "all";

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    gstin: "",
    phone: "",
    email: "",
    tradeType: "retail_boutique",
    productInterest: initialCategory || "all",
    estimatedVolume: "50-100",
    message: initialTitle
      ? `Wholesale quotation request for: ${initialTitle} (SKU: ${initialSku}). Need volume pricing, sample availability, and delivery lead time.`
      : "",
  });

  useEffect(() => {
    if (initialTitle) {
      setFormData((prev) => ({
        ...prev,
        message: prev.message || `Wholesale quotation request for: ${initialTitle} (SKU: ${initialSku}). Need volume pricing, sample availability, and delivery lead time.`,
        productInterest: initialCategory || prev.productInterest,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTitle, initialSku, initialCategory]);

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "b2b",
          fullName: formData.fullName,
          businessName: formData.businessName || undefined,
          gstin: formData.gstin || undefined,
          phone: formData.phone,
          email: formData.email || undefined,
          estimatedVolume: formData.estimatedVolume,
          message:
            formData.message ||
            `Wholesale inquiry for ${formData.productInterest} [Trade: ${formData.tradeType}] (Volume: ${formData.estimatedVolume} pcs).`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error?.message || "Failed to submit wholesale enquiry. Please verify details.");
      }
    } catch {
      setErrorMessage("Network error connecting to sales server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappInquiryText = encodeURIComponent(
    `Namaste RA Heritage Trade Desk,\nI am interested in B2B wholesale supply.\n` +
      `Business: ${formData.businessName || "My Business"}\n` +
      `Contact: ${formData.fullName || "Buyer"}\n` +
      `Product Line: ${formData.productInterest}\n` +
      (initialSku ? `Inquired SKU: ${initialSku} (${initialTitle})\n` : "") +
      `Estimated Volume: ${formData.estimatedVolume} pieces\nPlease share your wholesale rate card and sample policy.`
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-accent-gold inline-flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          <span>Direct Loom Consignment & Bulk Trade</span>
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900">
          B2B Wholesale & Custom Handloom Production
        </h1>
        <p className="text-xs sm:text-base text-neutral-600 max-w-2xl mx-auto">
          Partner directly with artisan weaver clusters across Varanasi, Bengal, Odisha, and Chanderi. Competitive wholesale price tiers, GST input credit invoices, and reliable pan-India cargo dispatch.
        </p>
      </div>

      {/* Target Inquired Product Banner if came from PDP */}
      {initialTitle && (
        <div className="bg-amber-50 border border-amber-300 rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-amber-800 font-bold uppercase text-[10px] tracking-wider block">
              Inquired Product
            </span>
            <p className="font-bold text-neutral-900 text-sm">{initialTitle}</p>
            {initialSku && (
              <span className="font-mono text-neutral-600 text-[11px]">SKU: {initialSku}</span>
            )}
          </div>
          <span className="px-3 py-1 bg-amber-200/80 text-amber-900 rounded font-semibold text-xs whitespace-nowrap self-start sm:self-auto">
            Trade Quote Form Pre-filled
          </span>
        </div>
      )}

      {/* Wholesale Tier Discount Structure Table */}
      <div className="bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
              Wholesale Volume Discount Structure
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Transparent volume tiers across all 8 textile categories with verified GST input tax credit.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full self-start sm:self-auto">
            Low MOQ: 25 Pieces
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-neutral-200 rounded-[8px] p-4 text-center space-y-2 bg-neutral-50/50">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Tier 1: Starter Batch</span>
            <p className="text-2xl font-bold text-neutral-900 font-mono">25 – 49 Pcs</p>
            <div className="inline-block bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded">
              15% Wholesale Margin
            </div>
            <p className="text-[11px] text-neutral-500">
              Assorted color swatches permitted. Ideal for boutique trial launches.
            </p>
          </div>

          <div className="border border-neutral-200 rounded-[8px] p-4 text-center space-y-2 bg-neutral-50/50">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Tier 2: Trade Standard</span>
            <p className="text-2xl font-bold text-neutral-900 font-mono">50 – 99 Pcs</p>
            <div className="inline-block bg-blue-100 text-blue-800 font-bold text-xs px-2.5 py-0.5 rounded">
              22% Wholesale Margin
            </div>
            <p className="text-[11px] text-neutral-500">
              Free priority door delivery and physical sample swatch cards included.
            </p>
          </div>

          <div className="border border-amber-300 rounded-[8px] p-4 text-center space-y-2 bg-amber-50/60 shadow-xs">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Tier 3: Enterprise Bulk</span>
            <p className="text-2xl font-bold text-neutral-900 font-mono">100+ Pcs</p>
            <div className="inline-block bg-amber-200 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded">
              30% – 35% Wholesale Margin
            </div>
            <p className="text-[11px] text-neutral-600">
              Custom weave patterns, private brand label stitching, and dedicated loom booking.
            </p>
          </div>
        </div>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-neutral-300 rounded-[8px] space-y-2">
          <Package className="w-5 h-5 text-brand-primary" />
          <h3 className="font-serif text-sm font-bold text-neutral-900">
            Flexible Mix & Match
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Combine multiple colors and designs within one category to satisfy MOQ thresholds.
          </p>
        </div>

        <div className="bg-white p-5 border border-neutral-300 rounded-[8px] space-y-2">
          <Truck className="w-5 h-5 text-brand-primary" />
          <h3 className="font-serif text-sm font-bold text-neutral-900">
            Pan-India Cargo
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Air and road logistics partners with insured surface dispatch directly to your warehouse.
          </p>
        </div>

        <div className="bg-white p-5 border border-neutral-300 rounded-[8px] space-y-2">
          <FileText className="w-5 h-5 text-brand-primary" />
          <h3 className="font-serif text-sm font-bold text-neutral-900">
            GST Input Invoices
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            100% compliant Amazon-style tax invoices enabling full B2B GST input tax credit claim.
          </p>
        </div>

        <div className="bg-white p-5 border border-neutral-300 rounded-[8px] space-y-2">
          <BadgeCheck className="w-5 h-5 text-brand-primary" />
          <h3 className="font-serif text-sm font-bold text-neutral-900">
            Handloom Mark
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Every shipment accompanied by artisan certificate confirming natural fiber authenticity.
          </p>
        </div>
      </div>

      {/* Lead Form Card */}
      <div className="bg-white p-6 sm:p-10 border border-neutral-300 rounded-[12px] shadow-sm max-w-3xl mx-auto">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 bg-semantic-success/10 text-semantic-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-neutral-900">
              Wholesale Trade Enquiry Received!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
              Thank you, <strong>{formData.fullName}</strong>. Our wholesale sales desk will contact you within 24 hours on <strong>{formData.phone}</strong> with our official wholesale rate card, fabric swatch samples, and proforma quote.
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
                    tradeType: "retail_boutique",
                    productInterest: "all",
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
                Fill in your business details below or chat directly with our trade desk on WhatsApp.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-[6px]">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                required
                placeholder="e.g. Ramesh Chandra"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <Input
                label="Business / Enterprise Name *"
                required
                placeholder="e.g. Chandra Ethnic Handlooms"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="WhatsApp Phone Number *"
                required
                placeholder="e.g. 9830123456"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Business Email Address"
                type="email"
                placeholder="e.g. purchase@chandrahandlooms.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GSTIN (For 5% Tax Credit)"
                placeholder="15-digit GSTIN (e.g. 09AAAFR1234A1Z5)"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Business / Trade Profile *
                </label>
                <select
                  value={formData.tradeType}
                  onChange={(e) => setFormData({ ...formData, tradeType: e.target.value })}
                  className="w-full h-11 px-3 text-xs bg-white border border-neutral-300 rounded-[6px] text-neutral-900 focus:outline-none focus:border-brand-primary"
                >
                  <option value="retail_boutique">Retail Boutique / Ethnic Store</option>
                  <option value="corporate_gifting">Corporate & Festive Gifting</option>
                  <option value="online_reseller">E-Commerce Brand / Online Reseller</option>
                  <option value="wholesaler_distributor">Regional Wholesaler / Distributor</option>
                  <option value="designer_studio">Fashion Designer / Tailoring House</option>
                  <option value="exporter">Textile Exporter / Buying House</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Target Product Line *
                </label>
                <select
                  value={formData.productInterest}
                  onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                  className="w-full h-11 px-3 text-xs bg-white border border-neutral-300 rounded-[6px] text-neutral-900 focus:outline-none focus:border-brand-primary"
                >
                  <option value="all">Full Catalogue (Multi-Category)</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Expected Order Volume (Pieces) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["25-49", "50-99", "100+"].map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setFormData({ ...formData, estimatedVolume: vol })}
                      className={`h-11 text-xs font-semibold rounded-[6px] border transition-colors ${
                        formData.estimatedVolume === vol
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      {vol} pcs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Specific Customization or Weaving Requirements
              </label>
              <textarea
                rows={3}
                required
                placeholder="Mention specific weaves, colors, delivery timeline, private labelling, or custom design requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 text-xs bg-white border border-neutral-300 rounded-[6px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="flex-1 text-sm font-bold bg-brand-primary text-white"
              >
                Submit Wholesale Quote Request
              </Button>

              <a
                href={`https://wa.me/917388553867?text=${whatsappInquiryText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-semantic-whatsapp hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-[6px] transition-opacity"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Trade Desk WhatsApp</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function B2BPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <B2BPageContent />
    </Suspense>
  );
}
