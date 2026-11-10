import React from "react";
import Link from "next/link";
import { Package, Tag, Gift, MessageSquare, ArrowLeft, Shield } from "lucide-react";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-900 text-white flex-shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-gold" />
              <span className="font-serif text-lg font-bold tracking-tight text-white">
                RA Admin
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-primary text-white">
              DEMO
            </span>
          </div>

          <nav className="p-3 space-y-1 text-xs font-semibold text-neutral-300">
            <Link
              href="/admin?tab=products"
              className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <Package className="w-4 h-4 text-accent-gold" />
              <span>Products CRUD</span>
            </Link>

            <Link
              href="/admin?tab=tags"
              className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <Tag className="w-4 h-4 text-semantic-warning" />
              <span>Badges & Tags</span>
            </Link>

            <Link
              href="/admin?tab=offers"
              className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <Gift className="w-4 h-4 text-brand-primary" />
              <span>Offer Popups</span>
            </Link>

            <Link
              href="/admin?tab=enquiries"
              className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-semantic-whatsapp" />
              <span>B2B Enquiries</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Store</span>
          </Link>

          <AdminSignOutButton />
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
