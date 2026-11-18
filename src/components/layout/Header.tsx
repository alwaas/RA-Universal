"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, User, Menu, X, Search, ShieldCheck, Heart, Truck, ChevronDown } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import type { SessionUser } from "@/types";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const openCart = useCartStore((state) => state.openCart);
  const totalCount = useCartStore((state) => state.getTotalCount());
  const wishlistIds = useWishlistStore((state) => state.wishlistIds);

  useEffect(() => {
    setIsMounted(true);
    useWishlistStore.getState().loadWishlist();
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data?.user) {
          setCurrentUser(data.data.user);
        }
      })
      .catch(() => {});
  }, []);

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
              RA Universal
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-neutral-700">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>

          {/* Collection with Dropdown */}
          <div className="relative group py-2">
            <Link
              href="/shop"
              className="hover:text-brand-primary transition-colors flex items-center gap-1"
            >
              <span>Collections</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
            </Link>

            <div className="absolute top-full left-0 w-72 bg-white border border-neutral-200 rounded-[8px] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 p-2 z-50 divide-y divide-neutral-100">
              <div className="pb-1.5 space-y-0.5">
                <Link
                  href="/shop?category=mens_gamcha"
                  className="block px-3 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded font-medium"
                >
                  Men&apos;s Gamcha (Bengal & Sambalpuri)
                </Link>
                <Link
                  href="/shop?category=womens_dupatta"
                  className="block px-3 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded font-medium"
                >
                  Women&apos;s Dupatta (Banarasi & Chanderi)
                </Link>
                <Link
                  href="/shop?category=scarves"
                  className="block px-3 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded font-medium"
                >
                  Scarves (Floral & Luxury Satin)
                </Link>
                <Link
                  href="/shop?category=stoles"
                  className="block px-3 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded font-medium"
                >
                  Stoles (Merino Wool & Linen)
                </Link>
                <Link
                  href="/shop?category=lungi"
                  className="block px-3 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded font-medium"
                >
                  Lungi & Traditional Bottoms
                </Link>
                <Link
                  href="/shop?category=textile_fabrics"
                  className="block px-3 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded font-medium"
                >
                  Textile Fabrics (Running Yardage)
                </Link>
                <Link
                  href="/shop?category=handloom_products"
                  className="block px-3 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded font-medium"
                >
                  Handloom Heritage Special
                </Link>
              </div>
              <div className="pt-1.5">
                <Link
                  href="/shop"
                  className="block px-3 py-1 text-xs font-bold text-brand-primary hover:underline"
                >
                  Explore All Collections &rarr;
                </Link>
              </div>
            </div>
          </div>

          <Link href="/b2b" className="hover:text-brand-primary transition-colors flex items-center gap-1.5">
            <span>B2B Wholesale</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">MOQ</span>
          </Link>
          <Link href="/tracking" className="hover:text-brand-primary transition-colors flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-accent-gold" />
            <span>Track Order</span>
          </Link>
          <Link href="/contact" className="hover:text-brand-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right: Actions (Search, Wishlist, Account, Cart) */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Link
            href="/shop"
            aria-label="Search collection"
            className="p-2 text-neutral-600 hover:text-brand-primary transition-colors rounded-full hover:bg-neutral-100"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Wishlist Icon */}
          <Link
            href="/account/wishlist"
            aria-label="View Wishlist"
            className="relative p-2 text-neutral-600 hover:text-rose-600 transition-colors rounded-full hover:bg-neutral-100"
            title="My Saved Wishlist"
          >
            <Heart className="w-5 h-5" />
            {isMounted && wishlistIds.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
              </span>
            )}
          </Link>

          {currentUser?.role === "admin" && (
            <Link
              href="/admin"
              aria-label="Admin Dashboard"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-neutral-900 text-accent-gold rounded-full hover:bg-neutral-800 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          <Link
            href={currentUser ? "/account/profile" : "/account/login"}
            aria-label={currentUser ? `Account: ${currentUser.fullName}` : "Customer Account"}
            className="p-2 text-neutral-600 hover:text-brand-primary transition-colors rounded-full hover:bg-neutral-100 relative group flex items-center"
            title={currentUser ? `Signed in as ${currentUser.fullName}` : "Sign In"}
          >
            <User className="w-5 h-5" />
            {currentUser && (
              <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </Link>

          {/* Cart Trigger with Live Counter */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open shopping cart with ${isMounted ? totalCount : 0} items`}
            className="relative p-2 text-neutral-700 hover:text-brand-primary transition-colors rounded-full hover:bg-neutral-100"
          >
            <ShoppingBag className="w-5 h-5" />
            {isMounted && totalCount > 0 && (
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
            href="/tracking"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-800 hover:text-brand-primary py-1 flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-accent-gold" />
            <span>Track Order Pipeline</span>
          </Link>
          <Link
            href="/account/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-800 hover:text-brand-primary py-1 flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>My Saved Wishlist ({wishlistIds.length})</span>
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-800 hover:text-brand-primary py-1"
          >
            Contact & WhatsApp
          </Link>
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            {currentUser ? (
              <Link
                href="/account/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-brand-primary flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Account ({currentUser.fullName.split(" ")[0]})</span>
              </Link>
            ) : (
              <Link
                href="/account/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-brand-primary"
              >
                Sign In / Register
              </Link>
            )}

            <Link
              href={currentUser?.role === "admin" ? "/admin" : "/admin/login"}
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
