"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, User, Menu, X, Search } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openCart = useCartStore((state) => state.openCart);
  const totalCount = useCartStore((state) => state.getTotalCount());

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Hamburger & Desktop Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 text-neutral-700 hover:text-neutral-900 rounded-md"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">
              RA Heritage
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-neutral-700">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>
          <Link href="/shop" className="hover:text-brand-primary transition-colors">
            Collection
          </Link>
          <Link href="/b2b" className="hover:text-brand-primary transition-colors">
            B2B Wholesale
          </Link>
          <Link href="/about" className="hover:text-brand-primary transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-brand-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right: Actions (Search, Account, Cart) */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/shop"
            aria-label="Search collection"
            className="p-2 text-neutral-600 hover:text-brand-primary transition-colors rounded-full hover:bg-neutral-100"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link
            href="/account/login"
            aria-label="Customer Account"
            className="p-2 text-neutral-600 hover:text-brand-primary transition-colors rounded-full hover:bg-neutral-100"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Cart Trigger with Live Counter */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open shopping cart with ${totalCount} items`}
            className="relative p-2 text-neutral-700 hover:text-brand-primary transition-colors rounded-full hover:bg-neutral-100"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalCount > 9 ? "9+" : totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Flyout */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-800 hover:text-brand-primary py-1"
          >
            Home
          </Link>
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-800 hover:text-brand-primary py-1"
          >
            Shop Collection
          </Link>
          <Link
            href="/b2b"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-800 hover:text-brand-primary py-1"
          >
            B2B Bulk Wholesale
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-800 hover:text-brand-primary py-1"
          >
            About Us & Weavers
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-800 hover:text-brand-primary py-1"
          >
            Contact & WhatsApp
          </Link>
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <Link
              href="/account/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-brand-primary"
            >
              Sign In / Register
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-neutral-500 hover:text-neutral-800"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
