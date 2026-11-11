"use client";

import React from "react";
import { Printer, X, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/types";

interface AmazonInvoiceProps {
  orders: Order[];
  onClose: () => void;
}

// Convert numbers into Indian English words
function numberToWords(amount: number): string {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (amount === 0) return "Zero Rupees Only";

  const num = Math.round(amount);

  function convertChunk(n: number): string {
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + " ";
    }
    return str.trim();
  }

  let result = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  if (crore > 0) result += convertChunk(crore) + " Crore ";
  if (lakh > 0) result += convertChunk(lakh) + " Lakh ";
  if (thousand > 0) result += convertChunk(thousand) + " Thousand ";
  if (remainder > 0) result += convertChunk(remainder);

  return `INR ${result.trim()} Only`;
}

export const AmazonInvoice: React.FC<AmazonInvoiceProps> = ({ orders, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!orders || orders.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-start items-center overflow-y-auto p-2 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="w-full max-w-4xl bg-white rounded-t-lg shadow-md border-b border-neutral-200 p-4 flex items-center justify-between sticky top-0 z-10 print:hidden mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <span>Amazon-Style Tax Invoice Preview</span>
            <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
              {orders.length} {orders.length === 1 ? "Bill" : "Bills"} Selected
            </span>
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Formatted to standard A4 tax invoice dimensions with auto page breaks for batch printing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF ({orders.length})</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-1 text-neutral-700"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="printable-invoice-container w-full max-w-4xl space-y-8 print:space-y-0 print:w-full print:max-w-none">
        {orders.map((order, orderIdx) => {
          const invoiceNumber = `IN-${order.orderNumber.replace(/[^0-9]/g, "").slice(-8) || order.id.slice(0, 8)}`;
          const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          // Tax breakdown (5% GST for Handloom Apparel)
          const totalTaxable = Math.round((order.totalAmount / 1.05) * 100) / 100;
          const totalGst = Math.round((order.totalAmount - totalTaxable) * 100) / 100;
          const cgst = Math.round((totalGst / 2) * 100) / 100;
          const sgst = totalGst - cgst;

          return (
            <div
              key={order.id || orderIdx}
              className="amazon-invoice-sheet bg-white text-black p-6 sm:p-8 rounded-lg shadow-lg border border-neutral-300 font-sans text-xs leading-tight print:shadow-none print:border-none print:p-0 print:m-0 print:w-full"
              style={{
                minHeight: "297mm",
                boxSizing: "border-box",
                pageBreakAfter: "always",
                breakAfter: "page",
              }}
            >
              {/* Header */}
              <div className="border-b-2 border-neutral-800 pb-3 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-neutral-900 font-serif">
                    RA HERITAGE WEAVES
                  </h1>
                  <p className="text-[11px] font-semibold text-neutral-600 mt-0.5 uppercase tracking-wider">
                    Tax Invoice / Bill of Supply / Cash Memorandum
                  </p>
                  <p className="text-[10px] text-neutral-500">(Original for Recipient)</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 border border-neutral-800 font-mono font-bold text-[11px] uppercase">
                    A4 TAX INVOICE
                  </span>
                  <p className="text-[10px] text-neutral-500 mt-1">GST Compliant Invoice</p>
                </div>
              </div>

              {/* Seller and Buyer Columns */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-neutral-300">
                {/* Left: Sold By */}
                <div>
                  <h3 className="font-bold text-neutral-900 uppercase text-[11px] mb-1">Sold By:</h3>
                  <p className="font-semibold text-neutral-800">RA Heritage Weaves Pvt. Ltd.</p>
                  <p className="text-neutral-600">Handloom Artisan Complex, Chowk</p>
                  <p className="text-neutral-600">Varanasi, Uttar Pradesh - 221001, IN</p>
                  <p className="mt-1 text-neutral-800 font-medium">
                    <span className="font-bold">PAN No:</span> AAAFR1234A
                  </p>
                  <p className="text-neutral-800 font-medium">
                    <span className="font-bold">GST Registration No:</span> 09AAAFR1234A1Z5
                  </p>
                </div>

                {/* Right: Billing & Shipping Address */}
                <div className="text-right">
                  <h3 className="font-bold text-neutral-900 uppercase text-[11px] mb-1">
                    Billing & Shipping Address:
                  </h3>
                  <p className="font-bold text-neutral-900">{order.customerName}</p>
                  <p className="text-neutral-700">{order.shippingAddress}</p>
                  <p className="text-neutral-700">
                    {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                  </p>
                  <p className="text-neutral-800 mt-0.5">
                    <span className="font-semibold">Phone:</span> +91 {order.customerPhone}
                  </p>
                  {order.customerEmail && (
                    <p className="text-neutral-600">
                      <span className="font-semibold">Email:</span> {order.customerEmail}
                    </p>
                  )}
                  <p className="text-neutral-500 text-[10px] mt-1">
                    State/UT Code: {order.shippingState?.toLowerCase().includes("bengal") ? "19" : order.shippingState?.toLowerCase().includes("maharashtra") ? "27" : "09"}
                  </p>
                </div>
              </div>

              {/* Order Meta Bar */}
              <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-neutral-100/80 border-b border-neutral-300 text-[11px]">
                <div>
                  <span className="text-neutral-500 block text-[10px]">Order Number:</span>
                  <span className="font-mono font-bold text-neutral-900">#{order.orderNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Order Date:</span>
                  <span className="font-medium text-neutral-800">{invoiceDate}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Invoice Number:</span>
                  <span className="font-mono font-bold text-neutral-900">{invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Payment Mode:</span>
                  <span className="font-bold text-neutral-900 uppercase">
                    {order.paymentStatus === "paid" ? "Prepaid" : "Direct / COD"}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="my-4 overflow-x-auto">
                <table className="w-full text-left border-collapse border border-neutral-300">
                  <thead>
                    <tr className="bg-neutral-100 text-[10px] uppercase font-bold text-neutral-700 border-b border-neutral-300">
                      <th className="p-2 border-r border-neutral-300 text-center w-8">Sl</th>
                      <th className="p-2 border-r border-neutral-300">Description</th>
                      <th className="p-2 border-r border-neutral-300 w-24">Item SKU / ID</th>
                      <th className="p-2 border-r border-neutral-300 text-center w-16">HSN</th>
                      <th className="p-2 border-r border-neutral-300 text-center w-12">Qty</th>
                      <th className="p-2 border-r border-neutral-300 text-right w-20">Gross (₹)</th>
                      <th className="p-2 border-r border-neutral-300 text-right w-16">Disc (₹)</th>
                      <th className="p-2 border-r border-neutral-300 text-right w-20">Taxable</th>
                      <th className="p-2 border-r border-neutral-300 text-center w-16">GST (5%)</th>
                      <th className="p-2 text-right w-20">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] divide-y divide-neutral-200">
                    {order.items.map((item, idx) => {
                      const itemMrp = item.mrp || item.sellingPrice;
                      const lineDiscount = Math.max(0, (itemMrp - item.sellingPrice) * item.quantity);
                      const lineTotal = item.sellingPrice * item.quantity;
                      const lineTaxable = Math.round((lineTotal / 1.05) * 100) / 100;
                      const lineGst = Math.round((lineTotal - lineTaxable) * 100) / 100;
                      const hsn = item.sku?.startsWith("RA-GAM") ? "5208" : "6214";

                      return (
                        <tr key={idx} className="hover:bg-neutral-50/50">
                          <td className="p-2 border-r border-neutral-300 text-center text-neutral-500 font-mono">
                            {idx + 1}
                          </td>
                          <td className="p-2 border-r border-neutral-300">
                            <p className="font-semibold text-neutral-900">{item.title}</p>
                            {item.colorName && (
                              <p className="text-[10px] text-neutral-600">Color: {item.colorName}</p>
                            )}
                          </td>
                          <td className="p-2 border-r border-neutral-300 font-mono font-bold text-neutral-800">
                            {item.sku || "RA-SKU-VAR"}
                          </td>
                          <td className="p-2 border-r border-neutral-300 text-center font-mono text-neutral-600">
                            {hsn}
                          </td>
                          <td className="p-2 border-r border-neutral-300 text-center font-bold text-neutral-900">
                            {item.quantity}
                          </td>
                          <td className="p-2 border-r border-neutral-300 text-right text-neutral-600">
                            {(itemMrp * item.quantity).toFixed(2)}
                          </td>
                          <td className="p-2 border-r border-neutral-300 text-right text-neutral-500">
                            {lineDiscount.toFixed(2)}
                          </td>
                          <td className="p-2 border-r border-neutral-300 text-right text-neutral-800 font-mono">
                            {lineTaxable.toFixed(2)}
                          </td>
                          <td className="p-2 border-r border-neutral-300 text-center font-mono text-neutral-600">
                            {lineGst.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-bold text-neutral-900 font-mono">
                            {lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tax & Grand Totals Summary Grid */}
              <div className="grid grid-cols-2 gap-4 border border-neutral-300 p-3 bg-neutral-50/50 my-2">
                <div>
                  <h4 className="font-bold text-neutral-800 text-[10px] uppercase mb-1">
                    Amount in Words:
                  </h4>
                  <p className="font-bold text-neutral-900 italic text-[11px]">
                    {numberToWords(order.totalAmount)}
                  </p>

                  <div className="mt-3 text-[10px] text-neutral-600 space-y-0.5">
                    <p>Whether tax is payable under reverse charge: <span className="font-semibold text-neutral-800">No</span></p>
                    <p>Place of Supply: <span className="font-semibold text-neutral-800">{order.shippingState || "Uttar Pradesh"}</span></p>
                    <p>Declaration: Artisanal handloom goods woven by traditional craft clusters under Handloom Mark standard.</p>
                  </div>
                </div>

                <div className="border-l border-neutral-300 pl-4 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-neutral-600">
                    <span>Total Taxable Value:</span>
                    <span className="font-mono">₹{totalTaxable.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>CGST (2.5%):</span>
                    <span className="font-mono">₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>SGST / UTGST (2.5%):</span>
                    <span className="font-mono">₹{sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping / Delivery Charges:</span>
                    <span className="font-semibold text-green-700 uppercase text-[10px]">FREE</span>
                  </div>
                  <div className="border-t-2 border-neutral-800 pt-1.5 flex justify-between text-sm font-bold text-neutral-900">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer & Signature */}
              <div className="pt-6 mt-4 border-t border-neutral-200 flex justify-between items-end text-[10px] text-neutral-500">
                <div>
                  <p className="font-semibold text-neutral-700">Customer Support: support@rauniversal.in | +91 7388553867</p>
                  <p className="mt-0.5">This is a computer-generated tax invoice and requires no physical seal.</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-dashed border-neutral-400 w-44 mb-1"></div>
                  <p className="font-bold text-neutral-800">Authorized Signatory</p>
                  <p className="text-[9px] text-neutral-500">RA Heritage Weaves Pvt. Ltd.</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Print CSS Rules */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          .printable-invoice-container,
          .printable-invoice-container * {
            visibility: visible;
          }
          .printable-invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .amazon-invoice-sheet {
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: 1px solid #333 !important;
            margin-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
