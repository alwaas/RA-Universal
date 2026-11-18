"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminErrorBoundary] Caught admin runtime error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white border border-red-200 rounded-[12px] p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
          <div className="w-10 h-10 bg-red-100 text-semantic-error rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-semantic-error block">
              Admin Section Notice
            </span>
            <h2 className="font-serif text-xl font-bold text-neutral-900">
              Admin Dashboard Encountered an Issue
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          The requested admin view could not complete rendering due to an unexpected client-side exception. Your changes and data remain safe on the server.
        </p>

        {error?.message && (
          <div className="bg-neutral-50 border border-neutral-300 rounded-[8px] p-3 text-left space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Error Details</span>
            <p className="text-xs font-mono text-red-600 font-semibold break-words">
              {error.message}
            </p>
            {error.stack && (
              <pre className="text-[10px] font-mono text-neutral-600 overflow-x-auto max-h-36 pt-2 border-t border-neutral-200 whitespace-pre-wrap">
                {error.stack.split("\n").slice(0, 6).join("\n")}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => reset()}
            className="flex items-center gap-1.5 bg-brand-primary text-white"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reload Tab</span>
          </Button>

          <Link href="/admin?tab=products">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Products Tab</span>
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Storefront</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

