import React from "react";
import type { Metadata } from "next";
import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | RA Heritage Weaves",
  description: "Pan-India delivery schedules, shipping charges, and tracking guidelines for RA Heritage Weaves.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-accent-gold">
          Logistics & Fulfillment
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-neutral-500 mt-2">
          Direct artisan dispatch with pan-India courier coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
          <Truck className="w-6 h-6 text-accent-gold mx-auto mb-2" />
          <h3 className="font-serif font-bold text-neutral-900 text-sm">Free Delivery</h3>
          <p className="text-xs text-neutral-600 mt-1">On all prepaid & COD orders above ₹499 across India.</p>
        </div>
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
          <Clock className="w-6 h-6 text-accent-gold mx-auto mb-2" />
          <h3 className="font-serif font-bold text-neutral-900 text-sm">Fast Dispatch</h3>
          <p className="text-xs text-neutral-600 mt-1">Orders packed and dispatched within 24 to 48 business hours.</p>
        </div>
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
          <ShieldCheck className="w-6 h-6 text-accent-gold mx-auto mb-2" />
          <h3 className="font-serif font-bold text-neutral-900 text-sm">Secure Transit</h3>
          <p className="text-xs text-neutral-600 mt-1">Tamper-evident packaging with real-time SMS & AWB tracking.</p>
        </div>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-sm text-neutral-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">1. Pan-India Delivery Timelines</h2>
          <p>
            We partner with India&apos;s leading logistics networks including <strong>BlueDart, Delhivery, DTDC, and India Post Speed Post</strong> to ensure safe and prompt delivery to over 27,000+ PIN codes.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left border border-neutral-200 rounded-lg">
              <thead className="bg-neutral-100 font-semibold text-neutral-800">
                <tr>
                  <th className="p-3 border-b">Destination Region</th>
                  <th className="p-3 border-b">Standard Courier Transit Time</th>
                  <th className="p-3 border-b">Delivery Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="p-3 font-medium">Metro Cities (Delhi NCR, Mumbai, Kolkata, Bengaluru, Chennai, Hyderabad)</td>
                  <td className="p-3">2 – 4 Working Days</td>
                  <td className="p-3 text-emerald-700 font-semibold">FREE (over ₹499) / ₹49</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Tier 2 & Tier 3 Regional Cities</td>
                  <td className="p-3">4 – 6 Working Days</td>
                  <td className="p-3 text-emerald-700 font-semibold">FREE (over ₹499) / ₹49</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">North East, Jammu & Kashmir, Island Territories</td>
                  <td className="p-3">6 – 8 Working Days</td>
                  <td className="p-3 text-emerald-700 font-semibold">FREE (over ₹499) / ₹49</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">2. Cash on Delivery (COD) Terms</h2>
          <p>
            Cash on Delivery is available for orders up to ₹5,000 across serviceable PIN codes. Please ensure someone is available at the delivery address with exact cash or UPI QR payment option upon arrival of the delivery agent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-neutral-900">3. Live Consignment Tracking</h2>
          <p>
            As soon as your parcel is scanned at the hub, you will receive an automatic dispatch notification containing your Courier Partner name and Air Waybill (AWB) number. You can track your shipment anytime through our Customer Portal or directly on the courier partner&apos;s portal.
          </p>
        </section>
      </div>
    </div>
  );
}
