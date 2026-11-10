import React from "react";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Truck, RefreshCcw, HeartHandshake } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-12 pb-8 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Markers Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-800">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-accent-gold flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">100% Handloom</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Authentic natural weaves directly from regional artisans.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-6 h-6 text-accent-gold flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Pan-India Delivery</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Free shipping across India on orders above ₹799.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <HeartHandshake className="w-6 h-6 text-accent-gold flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Direct Weaver Pay</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Fair wages supporting rural Indian handloom communities.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="w-6 h-6 text-semantic-whatsapp flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">WhatsApp Support</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Instant personalized order tracking and sizing assistance.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div>
            <span className="font-serif text-xl font-bold text-white tracking-tight">
              RA Heritage Weaves
            </span>
            <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
              Celebrating India&apos;s rich textile heritage. Bringing breathable Men&apos;s Gamchas and graceful Women&apos;s Dupattas & Scarves directly from the loom to your wardrobe.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Collections
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop?category=gamchas" className="hover:text-white transition-colors">
                  Men&apos;s Cotton Gamchas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=scarves_dupattas" className="hover:text-white transition-colors">
                  Women&apos;s Dupattas & Scarves
                </Link>
              </li>
              <li>
                <Link href="/shop?badge=best-selling" className="hover:text-white transition-colors">
                  Best Selling Weaves
                </Link>
              </li>
              <li>
                <Link href="/shop?badge=sale" className="hover:text-white transition-colors">
                  Festival Deals & Offers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Company & Wholesale
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Brand
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="hover:text-white transition-colors">
                  B2B Bulk Wholesale
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors">
                  Admin Portal Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Customer Support
            </h5>
            <p className="text-xs text-neutral-400 mb-3">
              Need assistance with product selection, wholesale inquiries, or custom orders?
            </p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-semantic-whatsapp text-white text-xs font-bold rounded hover:opacity-95 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} RA Heritage Weaves. Handcrafted in India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
