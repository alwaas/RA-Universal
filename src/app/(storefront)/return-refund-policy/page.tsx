import React from "react";
import type { Metadata } from "next";
import { RefreshCcw, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Refund Policy | RA Heritage Weaves",
  description: "7-day hassle-free replacement and refund guidelines for RA Heritage Weaves.",
};

export default function ReturnRefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-accent-gold">
          Customer Protection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">
          Return, Replacement & Refund Policy
        </h1>
        <p className="text-xs text-neutral-500 mt-2">
          Transparent 7-Day Doorstep Replacement Guarantee.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong className="font-bold text-emerald-950">7-Day Doorstep Replacement Policy:</strong> If your handloom scarf, dupatta, or gamcha arrives damaged in transit, with defective stitching, or significantly different from description, we will arrange a free reverse pickup and courier a fresh replacement.
        </div>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-sm text-neutral-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">1. Eligibility Criteria for Returns</h2>
          <p>To qualify for a replacement or return:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The request must be initiated within <strong>7 days</strong> of delivery receipt.</li>
            <li>The item must be in its original, unworn, unwashed, and undamaged condition.</li>
            <li>Original woven tags, brand packaging, and artisanal care labels must remain attached.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">2. How to Initiate a Return / Replacement</h2>
          <p>
            You can initiate a return or replacement through any of the following channels:
          </p>
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs space-y-2">
            <p><strong>Option 1 (Fastest): WhatsApp Support</strong> — Message our support helpline at +91 98765 43210 with your Order Number (e.g. RA-ORD-XXXXXX) and a photo of the item.</p>
            <p><strong>Option 2: Email</strong> — Write to <a href="mailto:support@rauniversal.in" className="text-accent-gold underline">support@rauniversal.in</a> with subject &quot;Return Request - [Order Number]&quot;.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">3. Reverse Courier Pickup</h2>
          <p>
            Once approved, our logistics partner will initiate a doorstep reverse pickup within 24 to 48 hours. Please pack the item securely in its original delivery bag.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">4. Refund Processing & Timelines</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Prepaid Orders (Razorpay / UPI / Cards / Netbanking):</strong> Refunds are credited directly back to the original payment source within <strong>5 to 7 working banking days</strong> after our inspection.</li>
            <li><strong>Cash on Delivery (COD) Orders:</strong> Our customer support team will provide a secure link to enter your bank account number and IFSC or UPI VPA for direct NEFT/IMPS transfer within <strong>3 to 5 business days</strong>.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
