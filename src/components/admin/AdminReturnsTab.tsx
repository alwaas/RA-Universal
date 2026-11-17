"use client";

import React, { useEffect, useState } from "react";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  RefreshCw,
  Phone,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/store/useToastStore";
import type { ReturnRequest, ReturnStatus } from "@/types";

export function AdminReturnsTab() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/returns");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setReturns(json.data);
        }
      } else {
        toast.error("Failed to load return requests.");
      }
    } catch {
      toast.error("Network error while loading return requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: ReturnStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setReturns((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        toast.success(`Return status updated to "${newStatus.replace("_", " ")}"`);
      } else {
        toast.error(json?.error?.message || "Failed to update return status.");
      }
    } catch {
      toast.error("Network error updating return.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReturns = returns.filter((r) => {
    if (!r) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrder = (r.orderNumber || "").toLowerCase().includes(q);
      const matchName = (r.customerName || "").toLowerCase().includes(q);
      const matchPhone = (r.customerPhone || "").includes(q);
      const matchReason = (r.reason || "").toLowerCase().includes(q);
      return matchOrder || matchName || matchPhone || matchReason;
    }
    return true;
  });

  const statusBadges: Record<ReturnStatus, { label: string; className: string }> = {
    pending: { label: "Pending Review", className: "bg-amber-100 text-amber-800 border-amber-300" },
    approved: { label: "Approved", className: "bg-blue-100 text-blue-800 border-blue-300" },
    pickup_scheduled: { label: "Pickup Arranged", className: "bg-purple-100 text-purple-800 border-purple-300" },
    refunded: { label: "Refunded / Replaced", className: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-300" },
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-neutral-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand-primary" />
            <span>7-Day Doorstep Returns & Replacements</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Process customer return and exchange tickets, arrange reverse courier pickups, and authorize refunds.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchReturns}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Tickets</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-neutral-300 rounded-[8px] overflow-hidden shadow-sm">
        {/* Filter bar */}
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by order #, phone, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-neutral-300 rounded-[6px] focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-neutral-300 rounded-[6px] font-medium text-neutral-800 focus:outline-none focus:border-brand-primary w-full sm:w-auto"
            >
              <option value="all">All Ticket Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="pickup_scheduled">Pickup Arranged</option>
              <option value="refunded">Refunded / Done</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket ID & Date</th>
                <th className="py-3 px-4">Order # & Customer</th>
                <th className="py-3 px-4">Reason & Resolution</th>
                <th className="py-3 px-4">Comments / Evidence</th>
                <th className="py-3 px-4">Status & Action</th>
                <th className="py-3 px-4 text-right">Customer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading return tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <CheckCircle2 className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">No return requests found</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Customer return or replacement submissions will appear here for one-click reverse pickup.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((item) => {
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A";

                  const badge = statusBadges[item.status] || {
                    label: item.status,
                    className: "bg-neutral-100 text-neutral-800 border-neutral-300",
                  };

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-neutral-900 block">
                          #{item.id}
                        </span>
                        <span className="text-[10px] text-neutral-500">{dateStr}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-brand-primary block">
                          #{item.orderNumber}
                        </span>
                        <p className="font-bold text-neutral-900 mt-0.5">{item.customerName}</p>
                        <p className="text-[11px] text-neutral-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>+91 {item.customerPhone}</span>
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900 block capitalize">
                          {item.reason.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                          {item.resolution}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-[11px] text-neutral-600 line-clamp-2">
                          {item.comments || "No remarks provided"}
                        </p>
                        {item.imageUrl && (
                          <a
                            href={item.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium"
                          >
                            <span>View Photo Proof</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={item.status}
                          disabled={updatingId === item.id}
                          onChange={(e) =>
                            handleUpdateStatus(item.id, e.target.value as ReturnStatus)
                          }
                          className={`h-7 px-2 text-xs font-semibold rounded border capitalize focus:outline-none ${badge.className}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="pickup_scheduled">Pickup Scheduled</option>
                          <option value="refunded">Refunded / Replaced</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <a
                          href={`https://wa.me/91${(item.customerPhone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Namaste ${item.customerName},\nRegarding your return/exchange request #${item.id} for order #${item.orderNumber}.\nOur dispatch team is arranging reverse pickup for your handloom item.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-[4px] transition-colors"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
