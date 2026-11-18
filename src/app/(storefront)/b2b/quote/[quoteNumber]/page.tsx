"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Building2,
  Truck,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/store/useToastStore";
import { formatINR } from "@/lib/formatters";
import type { Quotation } from "@/types";

export default function WholesaleQuotePage({
  params,
}: {
  params: { quoteNumber: string };
}) {
  const [quote, setQuote] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    async function loadQuote() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quotations/${params.quoteNumber}`);
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setQuote(data.data);
        } else {
          setError(data.error?.message || "Quotation not found or link has expired.");
        }
      } catch {
        setError("Network error loading wholesale quotation.");
      } finally {
        setLoading(false);
      }
    }
    loadQuote();
  }, [params.quoteNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleAccept = async () => {
    if (!quote) return;
    try {
      setIsAccepting(true);
      const res = await fetch(`/api/quotations/${params.quoteNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQuote(data.data);
        toast.success("Quotation accepted! Our sales desk will initiate loom production.");
      } else {
        toast.error("Failed to update quotation acceptance.");
      }
    } catch {
      toast.error("Network error submitting acceptance.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 space-y-3">
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-500 font-medium">Retrieving official wholesale quotation...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-neutral-900">
          Quotation Not Found
        </h1>
        <p className="text-xs text-neutral-600 leading-relaxed">
          {error || "The requested quotation link may be invalid or has been archived."}
        </p>
        <div className="pt-2">
          <Link href="/b2b">
            <Button variant="primary" size="sm">
              Request New Wholesale Quote
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(quote.validUntil).getTime() < Date.now();
  const formattedCreated = new Date(quote.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedValidUntil = new Date(quote.validUntil).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const whatsappConfirmLink = `https://wa.me/917388553867?text=${encodeURIComponent(
    `Namaste RA Heritage Trade Desk,\nRegarding Wholesale Quotation #${quote.quoteNumber} for ₹${quote.totalAmount}.\n` +
      `Business: ${quote.businessName || quote.customerName}\n` +
      `Status: I confirm acceptance of this quotation. Please share RTGS bank details and advance invoice.`
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 print:p-0 print:max-w-none">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="bg-white border border-neutral-300 rounded-[8px] p-4 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Link
            href="/b2b"
            className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wholesale Hub</span>
          </Link>
          <span className="text-neutral-300">|</span>
          <span className="text-xs font-mono font-bold text-neutral-900">
            #{quote.quoteNumber}
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              quote.status === "accepted"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : quote.status === "rejected"
                ? "bg-red-100 text-red-800 border border-red-300"
                : isExpired
                ? "bg-neutral-100 text-neutral-600 border border-neutral-300"
                : "bg-blue-100 text-blue-800 border border-blue-300"
            }`}
          >
            {isExpired && quote.status === "sent" ? "Expired" : quote.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quote.status !== "accepted" && !isExpired && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAccept}
              isLoading={isAccepting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Quotation</span>
            </Button>
          )}

          <a
            href={whatsappConfirmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-semantic-whatsapp hover:opacity-95 text-white font-semibold text-xs rounded-[6px] transition-opacity"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Confirm on WhatsApp</span>
          </a>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </Button>
        </div>
      </div>

      {/* Printable Proforma Document Sheet */}
      <div className="bg-white text-black p-6 sm:p-10 rounded-[10px] shadow-md border border-neutral-300 font-sans text-xs leading-normal print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Header */}
        <div className="border-b-2 border-neutral-900 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-accent-gold block">
              Direct Weaver Consignment
            </span>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
              RA HERITAGE WEAVES
            </h1>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              Wholesale Handloom Apparel & Fabric Manufacturing
            </p>
            <p className="text-[10px] text-neutral-500">
              Handloom Complex, Chowk, Varanasi, Uttar Pradesh - 221001, India
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-neutral-900 text-white font-mono font-bold text-xs uppercase tracking-wider">
              PROFORMA INVOICE / QUOTATION
            </span>
            <p className="text-[11px] font-mono font-bold text-neutral-900 mt-1.5">
              #{quote.quoteNumber}
            </p>
            <p className="text-[10px] text-neutral-500">
              Date: {formattedCreated}
            </p>
            <p className="text-[10px] text-amber-800 font-semibold">
              Valid Till: {formattedValidUntil}
            </p>
          </div>
        </div>

        {/* Company & Client Details Grid */}
        <div className="grid grid-cols-2 gap-6 py-5 border-b border-neutral-200">
          <div>
            <h3 className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider mb-1.5">
              SUPPLIER DETAILS:
            </h3>
            <p className="font-bold text-neutral-900">RA Heritage Weaves Pvt. Ltd.</p>
            <p className="text-neutral-600">GSTIN: 09AAAFR1234A1Z5</p>
            <p className="text-neutral-600">PAN: AAAFR1234A</p>
            <p className="text-neutral-600">Phone: +91 7388553867</p>
            <p className="text-neutral-600">Email: sales@raheritage.com</p>
          </div>

          <div className="text-right sm:text-left sm:pl-6 border-l border-neutral-200">
            <h3 className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider mb-1.5">
              PROSPECTIVE BUYER / CONVOYEE:
            </h3>
            <p className="font-bold text-neutral-900">
              {quote.businessName ? `${quote.businessName}` : quote.customerName}
            </p>
            {quote.businessName && (
              <p className="text-neutral-700">Attn: {quote.customerName}</p>
            )}
            {quote.gstin && (
              <p className="text-neutral-700 font-mono text-[11px]">
                GSTIN: {quote.gstin}
              </p>
            )}
            <p className="text-neutral-600">Phone: +91 {quote.phone}</p>
            {quote.email && <p className="text-neutral-600">Email: {quote.email}</p>}
            <p className="text-neutral-600">
              {quote.shippingAddress || "Consignment Dispatch as per PO"}
              {quote.shippingCity ? `, ${quote.shippingCity}` : ""}
              {quote.shippingState ? `, ${quote.shippingState}` : ""}
              {quote.shippingPincode ? ` - ${quote.shippingPincode}` : ""}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 border-y border-neutral-300 text-neutral-800 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Item Description & Weave Specs</th>
                <th className="py-2.5 px-3 w-28">SKU</th>
                <th className="py-2.5 px-3 text-center w-16">Qty (Pcs)</th>
                <th className="py-2.5 px-3 text-right w-24">Unit Rate</th>
                <th className="py-2.5 px-3 text-right w-28">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {quote.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-3 text-neutral-500 font-mono">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-neutral-900">{item.title}</p>
                    {item.colorName && (
                      <span className="text-[11px] text-neutral-500">
                        Color / Shade: {item.colorName}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-700 text-[11px]">
                    {item.sku}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-neutral-900">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-neutral-800">
                    {formatINR(item.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                    {formatINR(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations & Totals Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-3 border-t-2 border-neutral-300">
          <div className="space-y-2 max-w-sm">
            <h4 className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider">
              COMMERCIAL TERMS & SUPPLY PROTOCOL:
            </h4>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              {quote.terms}
            </p>
            <div className="bg-neutral-50 p-2.5 border border-neutral-200 rounded text-[10px] text-neutral-600 space-y-0.5">
              <p className="font-bold text-neutral-800">RTGS / NEFT Settlement Bank:</p>
              <p>Account Name: RA HERITAGE WEAVES PVT LTD</p>
              <p>Bank: State Bank of India | Branch: Chowk, Varanasi</p>
              <p>Account No: 398201948210 | IFSC: SBIN0001234</p>
            </div>
          </div>

          <div className="w-full sm:w-72 space-y-1.5 text-xs bg-neutral-50/80 p-4 border border-neutral-200 rounded-[6px]">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal (Excl. Tax):</span>
              <span className="font-mono font-semibold text-neutral-900">
                {formatINR(quote.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>GST ({quote.gstPercent}% Handloom):</span>
              <span className="font-mono font-semibold text-neutral-900">
                {formatINR(quote.gstAmount)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600 pb-2 border-b border-neutral-200">
              <span>Insured Cargo Freight:</span>
              <span className="font-mono font-semibold text-neutral-900">
                {quote.shippingCost > 0 ? formatINR(quote.shippingCost) : "Included"}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1">
              <span>Total Proforma Value:</span>
              <span className="font-mono text-base text-brand-primary">
                {formatINR(quote.totalAmount)}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 text-right pt-0.5">
              Inclusive of GST input credit breakdown.
            </p>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="pt-8 mt-6 border-t border-neutral-300 flex justify-between items-end text-[10px] text-neutral-500">
          <div>
            <p>Computer-generated legal proforma quotation issued by RA Heritage Weaves.</p>
            <p>Subject to Varanasi Jurisdiction. Valid until {formattedValidUntil}.</p>
          </div>
          <div className="text-right">
            <div className="h-10 border-b border-neutral-400 w-44 mb-1" />
            <p className="font-bold text-neutral-800">Authorized Loom Signatory</p>
            <p>RA Heritage Weaves Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

