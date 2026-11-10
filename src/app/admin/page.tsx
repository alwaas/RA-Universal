"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Edit2, Trash2, Check, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/formatters";
import demoProductsData from "@/data/seedProducts.json";
import type { Product } from "@/types";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>(
    demoProductsData as unknown as Product[]
  );

  const toggleStatus = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Product Catalogue Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage your handloom products, configure corner badges, and adjust retail pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/shop" target="_blank" className="text-xs font-semibold text-brand-primary flex items-center gap-1 hover:underline">
            <span>View Live Shop</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button variant="primary" size="sm" className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Total Products</span>
          <p className="text-2xl font-bold text-neutral-900">{products.length}</p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Active on Shop</span>
          <p className="text-2xl font-bold text-semantic-success">
            {products.filter((p) => p.status === "active").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Men&apos;s Gamchas</span>
          <p className="text-2xl font-bold text-brand-primary">
            {products.filter((p) => p.category === "gamchas").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Women&apos;s Dupattas</span>
          <p className="text-2xl font-bold text-accent-gold">
            {products.filter((p) => p.category === "scarves_dupattas").length}
          </p>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-neutral-300 rounded-[8px] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="font-serif text-lg font-bold text-neutral-900">
            Catalogue Items ({products.length})
          </h2>
          <span className="text-xs text-neutral-500">
            Click toggle to show or hide items in public shop
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (MRP / Sale)</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Corner Badge</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={product.images[0]?.imageUrl || "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800"}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="font-semibold text-neutral-900 line-clamp-1">
                          {product.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">{product.fabric}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium capitalize">
                    {product.category === "gamchas" ? "Men's Gamcha" : "Women's Dupatta"}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-neutral-900">{formatINR(product.sellingPrice)}</span>{" "}
                    <span className="text-neutral-400 line-through text-[11px]">{formatINR(product.mrp)}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-semantic-success">
                      {product.discountPercentage}% OFF
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {product.badge ? (
                      <Badge color={product.badge.badgeColor}>
                        {product.badge.name}
                      </Badge>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-semibold">
                    {product.stockCount === 0 ? (
                      <span className="text-semantic-error">0 (Out of stock)</span>
                    ) : (
                      product.stockCount
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleStatus(product.id)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors ${
                        product.status === "active"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                      }`}
                    >
                      {product.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        title="Edit Product"
                        className="p-1.5 text-neutral-600 hover:text-brand-primary rounded hover:bg-neutral-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Product"
                        className="p-1.5 text-neutral-600 hover:text-semantic-error rounded hover:bg-neutral-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
