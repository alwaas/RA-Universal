import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Editorial Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-accent-gold">
          Our Heritage & Mission
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900 leading-tight">
          Preserving the Timeless Weave of India
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
          Born from a passion to honor rural artisan traditions, RA Universal brings pure handspun textiles directly from traditional wooden pit looms into everyday modern life.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-10 space-y-6 text-sm text-neutral-700 leading-relaxed">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
          The Humble Gamcha & The Royal Dupatta
        </h2>
        <p>
          In India, fabric is not simply apparel—it is cultural memory, climate wisdom, and generational art. For centuries, the <strong>traditional cotton Gamcha</strong> has been the unsung hero of the Indian subcontinent: lightweight, naturally absorbent, rapid-drying, and perfectly adapted to humid monsoons and tropical summers.
        </p>
        <p>
          Alongside it stands the <strong>Dupatta</strong>—a canvas of poetic needlework and master weaving. From the delicate gossamer silk of Chanderi to the vegetable block prints of Machilipatnam Kalamkari and the spirited needlework of Amritsari Phulkari, each piece reflects weeks of meticulous handcrafting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
          <div className="p-4 bg-brand-secondary rounded-[6px] text-center space-y-1">
            <Sparkles className="w-5 h-5 text-accent-gold mx-auto" />
            <h3 className="font-serif font-bold text-neutral-900">100% Natural Weaves</h3>
            <p className="text-xs text-neutral-500">Pure desi cotton, khadi, and natural tussar/chanderi silk.</p>
          </div>
          <div className="p-4 bg-brand-secondary rounded-[6px] text-center space-y-1">
            <Heart className="w-5 h-5 text-semantic-error mx-auto" />
            <h3 className="font-serif font-bold text-neutral-900">Artisan Fair Wage</h3>
            <p className="text-xs text-neutral-500">Eliminating exploitative middlemen to empower weaver families.</p>
          </div>
          <div className="p-4 bg-brand-secondary rounded-[6px] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-brand-primary mx-auto" />
            <h3 className="font-serif font-bold text-neutral-900">Authentic Heritage</h3>
            <p className="text-xs text-neutral-500">Traditional motifs passed down through artisan lineages.</p>
          </div>
        </div>

        <p>
          By connecting conscious consumers directly with weaving clusters, we ensure that these ancient craft traditions remain economically vibrant for future generations.
        </p>
      </div>

      {/* CTA Box */}
      <div className="bg-brand-primary text-white p-8 rounded-[12px] text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">
          Experience the Texture of Pure Handloom
        </h2>
        <p className="text-xs sm:text-sm text-neutral-200 max-w-lg mx-auto">
          Explore our everyday Men&apos;s cotton gamchas and festive Women&apos;s dupattas. Every purchase directly sustains a master weaver.
        </p>
        <div className="pt-2">
          <Link href="/shop">
            <Button variant="buynow" size="lg" className="inline-flex items-center gap-2">
              <span>Browse Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
