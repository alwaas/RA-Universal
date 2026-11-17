"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  Layers,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/store/useToastStore";
import type { AnalyticsReport } from "@/types";

export function AdminReportsTab() {
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } else {
        toast.error("Failed to load business analytics.");
      }
    } catch {
      toast.error("Network error while loading analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-white p-8 rounded-[8px] border border-neutral-300 space-y-4 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-neutral-100 rounded-lg" />
          <div className="h-24 bg-neutral-100 rounded-lg" />
          <div className="h-24 bg-neutral-100 rounded-lg" />
          <div className="h-24 bg-neutral-100 rounded-lg" />
        </div>
        <div className="h-64 bg-neutral-100 rounded-lg" />
      </div>
    );
  }

  const maxDailyAmount = data?.dailyRevenue?.length
    ? Math.max(...data.dailyRevenue.map((d) => d.amount), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-neutral-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <span>Sales, Revenue & Inventory Analytics</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time business performance metrics computed across all customer orders and inventory levels.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Gross Revenue
          </span>
          <p className="text-xl font-bold text-neutral-900 font-mono">
            {formatINR(data?.totalRevenue || 0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
            <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
            Total Orders
          </span>
          <p className="text-xl font-bold text-neutral-900">
            {data?.totalOrders || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            Avg Order Value
          </span>
          <p className="text-xl font-bold text-neutral-900 font-mono">
            {formatINR(data?.averageOrderValue || 0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Fulfilled
          </span>
          <p className="text-xl font-bold text-emerald-600">
            {data?.completedOrders || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
          <p className="text-xl font-bold text-amber-600">
            {data?.pendingOrders || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled
          </span>
          <p className="text-xl font-bold text-rose-600">
            {data?.cancelledOrders || 0}
          </p>
        </div>
      </div>

      {/* Daily Revenue Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue 7-Day Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-[8px] border border-neutral-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-neutral-900">
              7-Day Sales Trend & Daily Turnover
            </h3>
            <span className="text-xs text-neutral-400">Past 7 Days</span>
          </div>

          <div className="h-52 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-neutral-200">
            {data?.dailyRevenue?.map((day) => {
              const heightPercent = Math.max(8, Math.round((day.amount / maxDailyAmount) * 100));
              const dateObj = new Date(day.date);
              const label = isNaN(dateObj.getTime())
                ? day.date
                : dateObj.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[10px] rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 shadow">
                    {formatINR(day.amount)} ({day.count} orders)
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-brand-primary/80 group-hover:bg-brand-primary rounded-t transition-all"
                  />
                  <span className="text-[10px] text-neutral-500 text-center truncate max-w-full">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
            <span>Bar heights proportional to daily gross billing</span>
            <span className="font-mono font-medium text-neutral-700">
              Peak: {formatINR(maxDailyAmount)}
            </span>
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white p-5 rounded-[8px] border border-neutral-300 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-accent-gold" />
            <span>Category Revenue Share</span>
          </h3>

          <div className="space-y-3">
            {data?.categoryBreakdown?.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-800 capitalize">
                    {cat.category === "gamcha" ? "Men's Gamchas" : "Women's Dupattas"}
                  </span>
                  <span className="font-mono font-medium text-neutral-700">
                    {formatINR(cat.revenue)} ({cat.count} units)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        data.totalRevenue > 0
                          ? Math.round((cat.revenue / data.totalRevenue) * 100)
                          : 50
                      }%`,
                    }}
                    className="h-full bg-accent-gold rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 leading-relaxed">
              Real-time product demand breakdown between men&apos;s traditional gamchas and women&apos;s handcrafted dupatta weaves.
            </p>
          </div>
        </div>
      </div>

      {/* Low-Stock Inventory Warnings */}
      <div className="bg-white border border-neutral-300 rounded-[8px] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-amber-50/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif text-sm font-bold text-neutral-900">
              Low-Stock & Out-of-Stock Alert Matrix ({data?.lowStockProducts?.length || 0})
            </h3>
          </div>
          <span className="text-[11px] text-amber-800 font-medium">
            Requires Weaver Reorder
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4">Product & SKU</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Selling Price</th>
                <th className="py-2.5 px-4">Remaining Stock</th>
                <th className="py-2.5 px-4">Urgency Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {!data?.lowStockProducts || data.lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="font-semibold text-neutral-700">Healthy Inventory</p>
                    <p className="text-[11px] text-neutral-500">
                      All products currently have sufficient stock levels (&gt; 5 units).
                    </p>
                  </td>
                </tr>
              ) : (
                data.lowStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-neutral-900">{p.title}</p>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {p.sku || "RA-SKU"}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {p.category === "gamchas" ? "Men's Gamcha" : "Women's Dupatta"}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {formatINR(p.sellingPrice)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-bold text-sm ${
                          p.stockCount <= 0
                            ? "text-rose-600"
                            : p.stockCount <= 3
                            ? "text-amber-600"
                            : "text-neutral-800"
                        }`}
                      >
                        {p.stockCount} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.stockCount <= 0 ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[10px] border border-rose-300">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px] border border-amber-300">
                          Low Stock - Restock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
