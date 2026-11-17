"use client";

import React from "react";
import { X, Printer, ShieldCheck, Download } from "lucide-react";
import { formatINR } from "@/lib/formatters";
import type { Order } from "@/types";

interface TaxInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaxInvoiceModal({ order, isOpen, onClose }: TaxInvoiceModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  // 5% GST on handloom textiles under ₹1,000 (2.5% CGST + 2.5% SGST)
  const gstRate = 5;
  const taxableBase = Math.round((order.totalAmount / (1 + gstRate / 100)) * 100) / 100;
  const totalTax = Math.round((order.totalAmount - taxableBase) * 100) / 100;
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = cgst;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-neutral-300 my-8 overflow-hidden print:m-0 print:border-none print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-neutral-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-gold" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Official Tax Invoice / Bill of Supply
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-gold text-neutral-900 text-xs font-bold hover:bg-accent-gold/90 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close invoice"
              className="p-1 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 space-y-6 text-neutral-800 text-xs print:p-6" id="printable-tax-invoice">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-neutral-300 pb-5">
            <div>
              <h1 className="font-serif text-2xl font-bold text-neutral-900">
                RA HERITAGE WEAVES
              </h1>
              <p className="text-[11px] text-neutral-600 mt-1">
                Handcrafted Handloom Textiles Cluster, Chowk, Varanasi, UP - 221001
              </p>
              <p className="text-[11px] text-neutral-600">
                <strong>GSTIN:</strong> 09AAAAA0000A1Z5 | <strong>PAN:</strong> AAAAA0000A
              </p>
              <p className="text-[11px] text-neutral-600">
                Email: care@rauniversal.in | Helpline: +91 93351 59036
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-neutral-100 rounded text-[11px] font-bold text-neutral-800 uppercase tracking-widest border border-neutral-200">
                TAX INVOICE
              </span>
              <p className="text-xs font-mono font-bold text-neutral-900 mt-2">
                Invoice No: {order.orderNumber}
              </p>
              <p className="text-[11px] text-neutral-500">
                Date:{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-[11px] text-neutral-500">
                Place of Supply: {order.shippingState || "Uttar Pradesh"} (State Code: 09)
              </p>
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 bg-neutral-50/70 p-4 rounded-lg border border-neutral-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Billed & Shipped To:
              </span>
              <h3 className="font-bold text-neutral-900 text-xs mt-0.5">
                {order.customerName}
              </h3>
              <p className="text-neutral-600 mt-0.5">{order.shippingAddress}</p>
              <p className="text-neutral-600">
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
              </p>
              <p className="text-neutral-600 mt-1 font-mono">
                Phone: +91 {order.customerPhone}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Dispatch & Payment Details:
              </span>
              <p className="mt-0.5">
                <strong>Payment Mode:</strong>{" "}
                <span className="uppercase">{order.paymentGateway || "Razorpay / COD"}</span>
              </p>
              <p>
                <strong>Payment Status:</strong>{" "}
                <span className="uppercase text-emerald-700 font-bold">
                  {order.paymentStatus}
                </span>
              </p>
              {order.trackingNumber && (
                <p className="mt-1">
                  <strong>Courier:</strong> {order.trackingCourier || "Speed Post"}
                  <br />
                  <strong>AWB No:</strong> {order.trackingNumber}
                </p>
              )}
            </div>
          </div>

          {/* Table of Items */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-neutral-200 text-xs">
              <thead className="bg-neutral-100 text-neutral-800 font-bold">
                <tr>
                  <th className="p-2.5 border border-neutral-200">#</th>
                  <th className="p-2.5 border border-neutral-200">Item Description</th>
                  <th className="p-2.5 border border-neutral-200">HSN</th>
                  <th className="p-2.5 border border-neutral-200 text-center">Qty</th>
                  <th className="p-2.5 border border-neutral-200 text-right">Unit Rate</th>
                  <th className="p-2.5 border border-neutral-200 text-right">Taxable Val</th>
                  <th className="p-2.5 border border-neutral-200 text-right">GST (5%)</th>
                  <th className="p-2.5 border border-neutral-200 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item, idx) => {
                  const hsn = (item.title || "").toLowerCase().includes("gamcha")
                    ? "6304"
                    : "6214";
                  const itemTotal = item.sellingPrice * item.quantity;
                  const itemBase = Math.round((itemTotal / 1.05) * 100) / 100;
                  const itemTax = Math.round((itemTotal - itemBase) * 100) / 100;

                  return (
                    <tr key={`${item.productId}-${idx}`}>
                      <td className="p-2.5 border border-neutral-200">{idx + 1}</td>
                      <td className="p-2.5 border border-neutral-200 font-medium text-neutral-900">
                        {item.title}
                        {item.colorName && (
                          <span className="block text-[10px] text-neutral-500">
                            Color: {item.colorName}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 border border-neutral-200 font-mono text-[11px]">
                        {hsn}
                      </td>
                      <td className="p-2.5 border border-neutral-200 text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="p-2.5 border border-neutral-200 text-right font-mono">
                        {formatINR(item.sellingPrice)}
                      </td>
                      <td className="p-2.5 border border-neutral-200 text-right font-mono">
                        {formatINR(itemBase)}
                      </td>
                      <td className="p-2.5 border border-neutral-200 text-right font-mono">
                        {formatINR(itemTax)}
                      </td>
                      <td className="p-2.5 border border-neutral-200 text-right font-bold font-mono">
                        {formatINR(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax Summary & Grand Total */}
          <div className="flex justify-between items-start gap-6 pt-2">
            <div className="space-y-1 text-[11px] text-neutral-500 max-w-sm">
              <p>• Whether tax is payable on reverse charge basis: <strong>No</strong></p>
              <p>• Certified that the particulars given above are true and correct.</p>
              <p>• Goods once sold are covered under our 7-day doorstep replacement policy.</p>
            </div>

            <div className="w-64 space-y-1.5 text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div className="flex justify-between">
                <span>Taxable Amount:</span>
                <span className="font-mono">{formatINR(taxableBase)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>CGST (2.5%):</span>
                <span className="font-mono">{formatINR(cgst)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>SGST (2.5%):</span>
                <span className="font-mono">{formatINR(sgst)}</span>
              </div>
              {order.couponDiscount ? (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon ({order.couponCode}):</span>
                  <span className="font-mono">- {formatINR(order.couponDiscount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-mono">
                  {order.shippingFee && order.shippingFee > 0 ? formatINR(order.shippingFee) : "FREE"}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-300">
                <span>Grand Total:</span>
                <span className="font-mono">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="flex justify-between items-end pt-8 border-t border-neutral-200">
            <div className="text-[11px] text-neutral-500">
              <p className="font-bold text-neutral-800">Thank you for supporting handloom artisans!</p>
              <p>This is a computer-generated tax invoice and requires no physical seal.</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-neutral-800 text-xs">For RA HERITAGE WEAVES</p>
              <div className="h-10 flex items-center justify-end">
                <span className="font-serif italic text-accent-gold text-sm">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
