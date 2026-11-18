"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Printer,
  Copy,
  MessageCircle,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  Check,
  X,
  Search,
  Building2,
  Calendar,
  AlertCircle,
  Send,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { toast } from "@/lib/store/useToastStore";
import { formatINR } from "@/lib/formatters";
import type { Quotation, QuotationItem, QuotationStatus, Product } from "@/types";

export function AdminQuotationsTab() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Quotation Form state
  const [form, setForm] = useState({
    customerName: "",
    businessName: "",
    gstin: "",
    phone: "",
    email: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "Uttar Pradesh",
    shippingPincode: "",
    validDays: 15,
    shippingCost: 500,
    gstPercent: 5,
    terms: "50% advance for loom reservation, 50% prior to dispatch. Delivery within 10-14 days. Freight extra at actuals.",
    adminNotes: "",
    items: [
      {
        sku: "RA-DUP-004",
        title: "Chanderi Silk Golden Zari Border Women's Dupatta",
        colorName: "Royal Magenta",
        quantity: 50,
        unitPrice: 699,
      },
    ] as { sku: string; title: string; colorName?: string; quantity: number; unitPrice: number }[],
  });

  const fetchQuotations = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch("/api/admin/quotations");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setQuotations(data.data);
      }
    } catch {
      if (!silent) toast.error("Failed to load quotations");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch {
      console.warn("Failed to fetch products for quotation selector");
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchProducts();
  }, []);

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          sku: products[0]?.sku || "RA-SKU",
          title: products[0]?.title || "Handloom Product",
          colorName: products[0]?.colors[0]?.name || "Standard",
          quantity: 25,
          unitPrice: Math.round((products[0]?.sellingPrice || 500) * 0.8),
        },
      ],
    });
  };

  const handleRemoveItem = (idx: number) => {
    if (form.items.length <= 1) {
      toast.warning("Quotation must have at least one line item.");
      return;
    }
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== idx),
    });
  };

  const handleItemChange = (
    idx: number,
    field: "sku" | "title" | "colorName" | "quantity" | "unitPrice",
    val: any
  ) => {
    const updated = [...form.items];
    updated[idx] = { ...updated[idx], [field]: val };
    setForm({ ...form, items: updated });
  };

  const handleSelectProduct = (idx: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...form.items];
    updated[idx] = {
      ...updated[idx],
      sku: prod.sku || "RA-SKU",
      title: prod.title,
      colorName: prod.colors[0]?.name || "Standard",
      unitPrice: Math.round(prod.sellingPrice * 0.8),
    };
    setForm({ ...form, items: updated });
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.phone.trim()) {
      toast.error("Buyer name and phone number are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Quotation #${data.data.quoteNumber} generated!`);
        setIsCreateModalOpen(false);
        fetchQuotations(true);
      } else {
        toast.error(data.error?.message || "Failed to create quotation");
      }
    } catch {
      toast.error("Network error creating quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: QuotationStatus) => {
    try {
      const res = await fetch(`/api/admin/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Quotation marked as ${newStatus.toUpperCase()}`);
        setQuotations((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
        );
      }
    } catch {
      toast.error("Failed to update quotation status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wholesale quotation?")) return;
    try {
      const res = await fetch(`/api/admin/quotations/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Quotation deleted");
        setQuotations((prev) => prev.filter((q) => q.id !== id));
      }
    } catch {
      toast.error("Failed to delete quotation");
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase().trim();
      const matchNum = q.quoteNumber.toLowerCase().includes(s);
      const matchName = q.customerName.toLowerCase().includes(s);
      const matchBiz = (q.businessName || "").toLowerCase().includes(s);
      const matchPhone = q.phone.includes(s);
      return matchNum || matchName || matchBiz || matchPhone;
    }
    return true;
  });

  const totalPipeline = quotations.reduce((sum, q) => sum + q.totalAmount, 0);
  const acceptedTotal = quotations
    .filter((q) => q.status === "accepted")
    .reduce((sum, q) => sum + q.totalAmount, 0);

  const statusBadgeClasses: Record<QuotationStatus, string> = {
    draft: "bg-neutral-100 text-neutral-800 border-neutral-300",
    sent: "bg-blue-100 text-blue-800 border-blue-300",
    accepted: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
    rejected: "bg-red-100 text-red-800 border-red-300",
    expired: "bg-amber-100 text-amber-800 border-amber-300",
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase">
            Total Quotations
          </span>
          <p className="text-2xl font-bold text-neutral-900">{quotations.length}</p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase">
            Total Pipeline Value
          </span>
          <p className="text-2xl font-bold text-neutral-900 font-mono">
            {formatINR(totalPipeline)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase">
            Accepted / Confirmed
          </span>
          <p className="text-2xl font-bold text-emerald-600 font-mono">
            {formatINR(acceptedTotal)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase">
            Conversion Rate
          </span>
          <p className="text-2xl font-bold text-indigo-600 font-mono">
            {quotations.length > 0
              ? `${Math.round(
                  (quotations.filter((q) => q.status === "accepted").length /
                    quotations.length) *
                    100
                )}%`
              : "0%"}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-neutral-300 rounded-[8px] overflow-hidden shadow-sm">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-neutral-900">
              B2B Wholesale Quotations & Proforma Invoices ({filteredQuotes.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Issue formal A4 tax proforma quotations with volume pricing and track buyer acceptance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search quote #, business, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-neutral-300 rounded-[6px] focus:outline-none focus:border-brand-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-neutral-300 rounded-[6px] font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 bg-brand-primary text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Create Proforma Quote</span>
            </Button>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Quote # & Date</th>
                <th className="py-3 px-4">Wholesale Buyer</th>
                <th className="py-3 px-4">Items & Volume</th>
                <th className="py-3 px-4">Total Amount (GST Incl)</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading wholesale quotations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">No wholesale quotations found</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Click &quot;Create Proforma Quote&quot; or generate one directly from a B2B enquiry.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => {
                  const isExpired = new Date(quote.validUntil).getTime() < Date.now();
                  const totalPcs = quote.items.reduce((sum, i) => sum + i.quantity, 0);
                  const publicUrl = `/b2b/quote/${quote.quoteNumber}`;

                  const waShareLink = `https://wa.me/91${quote.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Namaste ${quote.customerName},\nHere is your official RA Heritage Weaves Wholesale Quotation #${quote.quoteNumber} for ₹${quote.totalAmount} (${totalPcs} pieces).\n` +
                      `You can view and accept your quotation online here: ${typeof window !== "undefined" ? window.location.origin : ""}${publicUrl}\n` +
                      `Valid till ${new Date(quote.validUntil).toLocaleDateString("en-IN")}.`
                  )}`;

                  return (
                    <tr key={quote.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-neutral-900 text-xs block">
                          #{quote.quoteNumber}
                        </span>
                        <span className="text-[11px] text-neutral-500 block mt-0.5">
                          {new Date(quote.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-neutral-900">{quote.businessName || quote.customerName}</p>
                        {quote.businessName && (
                          <span className="text-[11px] text-neutral-600 block">Attn: {quote.customerName}</span>
                        )}
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          +91 {quote.phone} {quote.gstin ? `| GST: ${quote.gstin}` : ""}
                        </p>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          {quote.items.map((item, idx) => (
                            <p key={idx} className="text-[11px] text-neutral-800 truncate">
                              <span className="font-mono font-semibold">{item.sku}</span>: {item.title} ×{" "}
                              <strong>{item.quantity}</strong> ({formatINR(item.unitPrice)})
                            </p>
                          ))}
                          <span className="text-[10px] text-brand-primary font-bold block pt-0.5">
                            Total Volume: {totalPcs} pieces
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-sm text-neutral-900 block">
                          {formatINR(quote.totalAmount)}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">
                          Subtotal: {formatINR(quote.subtotal)} + GST ({quote.gstPercent}%): {formatINR(quote.gstAmount)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-neutral-700 block">
                          {new Date(quote.validUntil).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {isExpired && quote.status === "sent" && (
                          <span className="text-[10px] text-red-600 font-bold block">Expired</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={quote.status}
                          onChange={(e) => handleUpdateStatus(quote.id, e.target.value as QuotationStatus)}
                          className={`h-7 px-2 text-xs font-semibold rounded border capitalize focus:outline-none ${
                            statusBadgeClasses[quote.status] || "bg-neutral-100 text-neutral-800 border-neutral-300"
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="expired">Expired</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Proforma Online */}
                          <Link
                            href={publicUrl}
                            target="_blank"
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-300 rounded-[4px] transition-colors"
                            title="Open A4 Proforma Invoice Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* WhatsApp Share */}
                          <a
                            href={waShareLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-[4px] transition-colors"
                            title="Send Proforma to Client via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Copy Link */}
                          <button
                            type="button"
                            onClick={() => {
                              const full = `${window.location.origin}${publicUrl}`;
                              navigator.clipboard.writeText(full);
                              toast.success("Public quote link copied to clipboard!");
                            }}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-[4px]"
                            title="Copy Quote Link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Quote */}
                          <button
                            type="button"
                            onClick={() => handleDelete(quote.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-[4px]"
                            title="Delete Quotation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE QUOTATION MODAL */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create B2B Wholesale Proforma Quotation"
          subtitle="Generate an official GST compliant proforma quotation for bulk trade clients"
          size="3xl"
        >
          <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
            {/* Buyer Details */}
            <div className="bg-neutral-50 p-3.5 border border-neutral-200 rounded-[6px] space-y-3">
              <span className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider block">
                Buyer Contact & Tax Info
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Person Name *"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
                <Input
                  label="Business / Enterprise Name"
                  placeholder="e.g. Chandra Ethnic Boutique"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="WhatsApp Phone Number *"
                  required
                  placeholder="e.g. 9830123456"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  label="GSTIN (15-Digit)"
                  placeholder="e.g. 09AAAFR1234A1Z5"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Delivery Address"
                  placeholder="Street / Warehouse Address"
                  value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                />
                <Input
                  label="City"
                  placeholder="e.g. Varanasi"
                  value={form.shippingCity}
                  onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                />
                <Input
                  label="Pincode"
                  placeholder="e.g. 221001"
                  value={form.shippingPincode}
                  onChange={(e) => setForm({ ...form, shippingPincode: e.target.value })}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider">
                  Line Items & Wholesale Pricing
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </Button>
              </div>

              {form.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-50 p-3 border border-neutral-200 rounded-[6px] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                      Select Catalogue Product
                    </label>
                    <select
                      onChange={(e) => handleSelectProduct(idx, e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-neutral-300 rounded bg-white"
                    >
                      <option value="">Select from catalogue...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (MRP: ₹{p.mrp})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                      Item Title
                    </label>
                    <input
                      type="text"
                      required
                      value={item.title}
                      onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-neutral-300 rounded bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                      Qty (Pcs)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                      className="w-full h-8 px-2 text-xs border border-neutral-300 rounded bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                      Unit Rate (₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                      className="w-full h-8 px-2 text-xs border border-neutral-300 rounded bg-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Commercial Terms & Pricing Adjustments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  GST Rate (%)
                </label>
                <select
                  value={form.gstPercent}
                  onChange={(e) => setForm({ ...form, gstPercent: Number(e.target.value) })}
                  className="w-full h-9 px-2 text-xs border border-neutral-300 rounded bg-white"
                >
                  <option value={5}>5% (Handloom & Textiles Standard)</option>
                  <option value={12}>12% (Ready-to-Wear Apparel &gt; ₹1000)</option>
                  <option value={0}>0% (Exempted)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Freight / Cargo Shipping (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.shippingCost}
                  onChange={(e) => setForm({ ...form, shippingCost: Number(e.target.value) })}
                  className="w-full h-9 px-2 text-xs border border-neutral-300 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Validity Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={form.validDays}
                  onChange={(e) => setForm({ ...form, validDays: Number(e.target.value) })}
                  className="w-full h-9 px-2 text-xs border border-neutral-300 rounded bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Commercial Terms & Conditions
              </label>
              <textarea
                rows={2}
                value={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.value })}
                className="w-full p-2 text-xs border border-neutral-300 rounded bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="bg-brand-primary text-white"
              >
                Generate & Save Proforma Quote
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

