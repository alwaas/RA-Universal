import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | RA Heritage Weaves",
  description: "Privacy and data protection policy for RA Heritage Weaves customers and B2B partners.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-accent-gold">
          Legal & Compliance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-neutral-500 mt-2">
          Effective Date: January 1, 2026 | Last Updated: November 2026
        </p>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-sm text-neutral-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">1. Introduction</h2>
          <p>
            RA Heritage Weaves (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy and personal data of our customers, website visitors, and wholesale partners. This Privacy Policy details how we collect, process, disclose, and safeguard your information in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and applicable Indian data protection regulations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Personal Contact Information:</strong> Name, delivery address, billing address, phone number, and email address collected during checkout or account registration.</li>
            <li><strong>Transactional Data:</strong> Order history, purchased items, coupon redemptions, and delivery timeline timestamps.</li>
            <li><strong>Payment Information:</strong> All payment transactions (UPI, Credit/Debit cards, Netbanking) are processed directly by RBI-authorized payment aggregators (e.g., Razorpay). We do not store raw card CVVs or netbanking passwords on our servers.</li>
            <li><strong>Wholesale & B2B Data:</strong> Business name, GSTIN, required order volume, and commercial correspondence.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">3. How We Use Your Data</h2>
          <p>We process your data strictly for legitimate operational purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Processing, packing, dispatching, and tracking your handloom apparel orders.</li>
            <li>Providing WhatsApp and SMS delivery status updates and order confirmations.</li>
            <li>Responding to customer support questions, replacement requests, and B2B quotation inquiries.</li>
            <li>Detecting and preventing fraudulent transactions or unauthorized access.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">4. Data Sharing & Third Parties</h2>
          <p>
            We do not sell, rent, or trade your personal data. We disclose necessary information exclusively to trusted service partners under strict confidentiality agreements:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Logistics Partners:</strong> BlueDart, Delhivery, DTDC, and India Post for physical doorstep delivery.</li>
            <li><strong>Payment Aggregators:</strong> Razorpay for PCI-DSS compliant payment processing.</li>
            <li><strong>Legal & Regulatory Authorities:</strong> Only when mandated under valid Indian judicial orders or tax compliance laws.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">5. Data Security & Storage</h2>
          <p>
            We employ industry-standard encryption protocols (TLS/SSL 256-bit) for all client-server communications. Database credentials and sensitive secrets are kept isolated and encrypted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">6. Grievance Officer</h2>
          <p>
            In compliance with the Information Technology Act 2000 and consumer protection guidelines, our designated Grievance Officer details are as follows:
          </p>
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs space-y-1">
            <p><strong>Officer Name:</strong> Grievance Redressal Officer</p>
            <p><strong>Designation:</strong> Head of Operations & Consumer Trust</p>
            <p><strong>Email:</strong> grievance@rauniversal.in / care@rauniversal.in</p>
            <p><strong>Registered Address:</strong> Handloom Artisan Hub, Varanasi / Kolkata, India</p>
          </div>
        </section>
      </div>
    </div>
  );
}
