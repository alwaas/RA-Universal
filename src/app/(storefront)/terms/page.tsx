import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | RA Heritage Weaves",
  description: "Terms of service and purchase conditions for RA Heritage Weaves.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-accent-gold">
          Legal Agreement
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-neutral-500 mt-2">
          Effective Date: January 1, 2026 | Last Updated: November 2026
        </p>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-sm text-neutral-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">1. Agreement to Terms</h2>
          <p>
            By accessing or ordering from RA Heritage Weaves (&quot;Website&quot;), you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you disagree with any portion of these terms, please refrain from using our online catalogue or placing orders.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">2. Handcrafted & Handloom Characteristics</h2>
          <p>
            Our scarves, dupattas, and gamchas are created by traditional Indian weavers using manual pit-looms, frame-looms, and natural dyes. Subtle irregularities in weave texture, yarn slubs, border motifs, or dye shades are hallmarks of genuine handloom craftsmanship and should not be categorized as manufacturing defects.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">3. Pricing, GST & Payment Gateways</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>All prices listed on our website are in Indian Rupees (₹ INR) and include applicable Goods and Services Tax (GST).</li>
            <li>We reserve the right to revise catalog prices or discontinue promotional coupon codes at our discretion without prior notice.</li>
            <li>Online transactions are processed via RBI-compliant payment aggregators. In case of payment gateway timeouts where funds are debited without order confirmation, refunds are automatically initiated within 48-72 banking hours.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">4. Order Placement & Cancellation</h2>
          <p>
            Orders can be cancelled free of charge before the package transitions to the &quot;Packed&quot; or &quot;Shipped&quot; stage in our dispatch pipeline. Once a consignment tracking number (AWB) is assigned and handed over to our courier partners, cancellation is no longer possible and the standard 7-day return policy applies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">5. Wholesale & B2B Orders</h2>
          <p>
            Wholesale bulk quotations, custom motif weaving, and large commercial consignments (&gt;50 pieces) are governed by distinct purchase orders and trade contracts executed directly between our corporate entity and the buyer.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">6. Governing Law & Jurisdiction</h2>
          <p>
            These Terms shall be interpreted and governed in accordance with the laws of India. Any legal disputes arising out of your purchase shall be subject to the exclusive jurisdiction of the competent courts in Uttar Pradesh / West Bengal, India.
          </p>
        </section>
      </div>
    </div>
  );
}
