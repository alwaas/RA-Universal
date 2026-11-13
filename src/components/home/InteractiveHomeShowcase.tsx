"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Heart,
  Award,
  ArrowRight,
  ChevronDown,
  Star,
  Feather,
  HelpCircle,
  Check,
  X,
  Compass,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { BuyNowInterceptModal } from "@/components/cart/BuyNowInterceptModal";
import type { Product } from "@/types";
import type { WhatsAppOrderItem } from "@/lib/whatsapp";

export interface InteractiveHomeShowcaseProps {
  products: Product[];
}

interface RegionInfo {
  id: string;
  name: string;
  state: string;
  tagline: string;
  description: string;
  weaveFeatures: string[];
  imageUrl: string;
  categoryFilter?: "scarves_dupattas" | "gamchas";
}

const REGIONS: RegionInfo[] = [
  {
    id: "chanderi",
    name: "Chanderi Weaves",
    state: "Madhya Pradesh",
    tagline: "Sheer Luxury with Royal Gold Zari Borders",
    description:
      "Originating in the historic Vedic town of Chanderi, these lightweight scarves and dupattas harmoniously blend mulberry silk warp with pure cotton weft, finished with authentic zari craftsmanship.",
    weaveFeatures: [
      "Signature sheer feather-light drape",
      "Traditional floral bootis & zari borders",
      "Natural cooling silk-cotton composition",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    categoryFilter: "scarves_dupattas",
  },
  {
    id: "bengal",
    name: "Bengal Handloom Cotton",
    state: "West Bengal",
    tagline: "Unmatched Everyday Sweat Absorption & Breathability",
    description:
      "Woven on traditional pit-looms by master weavers in Phulia and Shantipur, Bengal cotton gamchas feature breathable coarse yarn specially spun to absorb sweat instantly in tropical heat.",
    weaveFeatures: [
      "100% pure organic cotton yarn",
      "Traditional heritage woven check patterns",
      "Quick-drying open weave matrix",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800",
    categoryFilter: "gamchas",
  },
  {
    id: "phulkari",
    name: "Amritsari Phulkari",
    state: "Punjab",
    tagline: "Vibrant Floral Silk Thread Embroidery",
    description:
      "Literally translating to 'Flower Craft', Phulkari is a centuries-old needlework technique where untwisted floss silk yarn (Pat) is hand-embroidered onto coarse khaddar or modal cotton.",
    weaveFeatures: [
      "Intricate hand-embroidered geometric motifs",
      "High-contrast festive color palette",
      "Heirloom-grade durable needlecraft",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
    categoryFilter: "scarves_dupattas",
  },
  {
    id: "sambalpuri",
    name: "Sambalpuri Bandha Ikat",
    state: "Odisha",
    tagline: "Masterful Tie-Dye Precision on Pure Cotton",
    description:
      "Known for its sacred geometric 'Bandhakala' tie-and-dye weave, Sambalpuri handloom gamchas and scarves feature symbolic motifs like conch shells and fish woven with time-honored precision.",
    weaveFeatures: [
      "Double-sided vibrant dye penetration",
      "Distinctive temple & geometric borders",
      "Sturdy long-staple handloom cotton",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800",
    categoryFilter: "gamchas",
  },
  {
    id: "kalamkari",
    name: "Machilipatnam Kalamkari",
    state: "Andhra Pradesh",
    tagline: "Ancient Natural Vegetable Dye Block Printing",
    description:
      "Crafted using carved teakwood blocks and organic botanical extracts (indigo, madder, turmeric), Kalamkari dupattas represent an unbroken 3,000-year-old Indian textile legacy.",
    weaveFeatures: [
      "100% natural earth & botanical pigments",
      "Hypoallergenic skin-friendly finish",
      "Eco-conscious artisan blockcraft",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
    categoryFilter: "scarves_dupattas",
  },
];

const FAQS = [
  {
    question: "How do I place an order and how does the WhatsApp checkout work?",
    answer:
      "Simply click 'Buy Now' on any product or click 'Proceed to WhatsApp' in your cart. A pre-filled WhatsApp message containing your selected items, SKU IDs, colors, and order total will automatically load. Our customer team will confirm stock and dispatch details directly via WhatsApp.",
  },
  {
    question: "Are your gamchas made from 100% pure cotton?",
    answer:
      "Yes, absolutely. Every gamcha in our catalogue is handwoven using 100% breathable natural cotton yarn without any synthetic polyester blend. They are designed for superior sweat absorption, comfort in tropical heat, and skin-friendly everyday wear.",
  },
  {
    question: "How should I wash and care for Chanderi and Phulkari dupattas?",
    answer:
      "For Chanderi silk-cotton and delicate Phulkari embroidery, dry clean is recommended for the first wash to preserve the sheen of zari and floss silk. Subsequent washes can be done with cold water and mild detergent. Do not wring or bleach.",
  },
  {
    question: "How does live order tracking work on the website?",
    answer:
      "When you create an account, you can access your personal Profile page at any time. Your order status (Pending, Confirmed, Shipped, Delivered) syncs in real-time, accompanied by instant toast alerts whenever the status changes.",
  },
  {
    question: "Do you accept wholesale, corporate, or bulk wedding orders?",
    answer:
      "Yes! We regularly fulfill bulk orders for Indian weddings, religious ceremonies, and corporate gifting. Please visit our B2B Wholesale page or message us directly on WhatsApp for customized bulk pricing and weaver direct dispatch.",
  },
];

export const InteractiveHomeShowcase: React.FC<InteractiveHomeShowcaseProps> = ({
  products,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo>(REGIONS[0]);
  const [activeTab, setActiveTab] = useState<"all" | "scarves_dupattas" | "gamchas">(
    "all"
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Buy now modal state
  const [buyNowItems, setBuyNowItems] = useState<WhatsAppOrderItem[]>([]);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);

  const handleBuyNowClick = (product: Product, selectedColorName?: string) => {
    setBuyNowItems([
      {
        productId: product.id,
        sku: product.sku,
        title: product.title,
        color: selectedColorName,
        quantity: 1,
        price: product.sellingPrice,
      },
    ]);
    setIsBuyNowOpen(true);
  };

  // Filter products for showcase
  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return true;
    return p.category === activeTab;
  });

  return (
    <div className="space-y-16">
      {/* 1. Cultural Trust Ribbon */}
      <section className="bg-neutral-100 border-y border-neutral-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="flex flex-col items-center space-y-1.5 p-2">
              <Award className="w-6 h-6 text-accent-gold" />
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                100% Handloom Certified
              </h4>
              <p className="text-[11px] text-neutral-600">
                Authentic pit-loom weave traditions
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1.5 p-2">
              <Feather className="w-6 h-6 text-emerald-600" />
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                Zero Synthetic Polyester
              </h4>
              <p className="text-[11px] text-neutral-600">
                Skin-friendly natural cotton &amp; silk
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1.5 p-2">
              <Truck className="w-6 h-6 text-brand-primary" />
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                Pan-India Express Dispatch
              </h4>
              <p className="text-[11px] text-neutral-600">
                Carefully inspected &amp; dispatched
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1.5 p-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                Direct Weaver Empowerment
              </h4>
              <p className="text-[11px] text-neutral-600">
                Fair ethical wages for Indian artisans
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive "Weaves of India" Regional Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-gold">
            <Compass className="w-4 h-4" />
            <span>Interactive Heritage Atlas</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900">
            Weaves of India: Regional Artisan Clusters
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Select an artisan region below to explore the distinctive textile techniques, historical heritage, and living loom traditions.
          </p>
        </div>

        {/* Region Selector Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {REGIONS.map((region) => {
            const isSelected = selectedRegion.id === region.id;
            return (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
                  isSelected
                    ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
                }`}
              >
                {region.name} ({region.state})
              </button>
            );
          })}
        </div>

        {/* Selected Region Showcase Card */}
        <div className="mt-4 bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 relative h-64 sm:h-80 w-full rounded-[8px] overflow-hidden bg-neutral-100">
            <Image
              src={selectedRegion.imageUrl}
              alt={selectedRegion.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
              {selectedRegion.state}
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
              {selectedRegion.state} &bull; Heritage Cluster
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              {selectedRegion.name}
            </h3>
            <p className="text-sm font-medium text-brand-primary">
              {selectedRegion.tagline}
            </p>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {selectedRegion.description}
            </p>

            <div className="space-y-2 pt-2 border-t border-neutral-200">
              <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                Weaving Characteristics:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                {selectedRegion.weaveFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Link
                href={`/shop?${selectedRegion.categoryFilter ? `category=${selectedRegion.categoryFilter}` : ""}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold rounded-[6px] shadow-sm transition-colors"
              >
                <span>Explore {selectedRegion.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Filterable Featured Weaves Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-gold">
              <Sparkles className="w-4 h-4" />
              <span>Curated Catalogue</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Featured Handloom Weaves
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeTab === "all"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              All Weaves
            </button>
            <button
              onClick={() => setActiveTab("scarves_dupattas")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeTab === "scarves_dupattas"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              Women&apos;s Dupattas
            </button>
            <button
              onClick={() => setActiveTab("gamchas")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeTab === "gamchas"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              Men&apos;s Gamchas
            </button>
          </div>
        </div>

        {/* Product Cards Grid: Strictly 2 columns on mobile, 4 on desktop */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuyNowClick={handleBuyNowClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-neutral-300 rounded-[12px] p-6">
            <p className="text-sm text-neutral-600">
              No products found for this category currently.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold rounded-[6px] shadow-sm transition-colors"
          >
            <span>View Full Handloom Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. Handloom vs Powerloom Comparison Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-50 border border-neutral-300 rounded-[12px] p-6 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
              Artisan Transparency
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Authentic Handloom vs Commercial Powerloom
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Why investing in authentic handwoven weaves offers superior skin comfort and preserves living artisan traditions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-300 bg-white">
                  <th className="py-3 px-4 font-bold text-neutral-900">Feature</th>
                  <th className="py-3 px-4 font-bold text-brand-primary bg-amber-50/50">
                    RA Universal Handloom
                  </th>
                  <th className="py-3 px-4 font-bold text-neutral-600">
                    Mass-Market Powerloom
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    Fabric Composition
                  </td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium bg-amber-50/20 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>100% Breathable Cotton &amp; Natural Silk</span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    Often blended with cheap synthetic polyester
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    Sweat Absorption &amp; Comfort
                  </td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium bg-amber-50/20 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Instant moisture absorption; skin breathes freely</span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    Traps heat and causes friction in tropical summers
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    Yarn Character &amp; Drape
                  </td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium bg-amber-50/20 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Soft living texture; gets softer with every wash</span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    Rigid industrial finish prone to pilling
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    Artisan &amp; Fair Wage Impact
                  </td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium bg-amber-50/20 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Direct financial sustenance for Indian weavers</span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    Factory profits with zero artisan compensation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
            Voices of Heritage
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Cherished by Handloom Lovers Across India
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-neutral-300 rounded-[12px] p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-accent-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-neutral-700 italic">
              &quot;The Bengal cotton gamchas are truly authentic. The open weave absorbs sweat like nothing else in the Kolkata heat. Ordering via WhatsApp was effortless.&quot;
            </p>
            <div className="pt-2 border-t border-neutral-200">
              <h4 className="text-xs font-bold text-neutral-900">Subhashish Banerjee</h4>
              <p className="text-[11px] text-neutral-500">Verified Buyer &bull; Kolkata</p>
            </div>
          </div>

          <div className="bg-white border border-neutral-300 rounded-[12px] p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-accent-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-neutral-700 italic">
              &quot;Ordered the Chanderi Silk Zari dupatta for Diwali. The golden border has an exquisite royal shine without feeling heavy at all. Highly recommended!&quot;
            </p>
            <div className="pt-2 border-t border-neutral-200">
              <h4 className="text-xs font-bold text-neutral-900">Pooja Sharma</h4>
              <p className="text-[11px] text-neutral-500">Verified Buyer &bull; New Delhi</p>
            </div>
          </div>

          <div className="bg-white border border-neutral-300 rounded-[12px] p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-accent-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-neutral-700 italic">
              &quot;We ordered 40 Sambalpuri cotton gamchas for a family ceremony in Bengaluru. The packaging and dispatch were on time, and quality was outstanding.&quot;
            </p>
            <div className="pt-2 border-t border-neutral-200">
              <h4 className="text-xs font-bold text-neutral-900">Raghavendra Rao</h4>
              <p className="text-[11px] text-neutral-500">Verified Buyer &bull; Bengaluru</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-gold">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-neutral-300 rounded-[8px] overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-neutral-900 hover:text-brand-primary"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Buy Now Intercept Modal */}
      <BuyNowInterceptModal
        isOpen={isBuyNowOpen}
        onClose={() => setIsBuyNowOpen(false)}
        items={buyNowItems}
      />
    </div>
  );
};

export default InteractiveHomeShowcase;

