import React from "react";
import Link from "next/link";
import { Compass, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-[12px] p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-gold">
            Error 404 • Page Not Found
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Weave Lost in Transit
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
            The handloom apparel or page you are searching for might have moved, been renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Collection</span>
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full flex items-center justify-center gap-1.5">
              <span>Return Home</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
