"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client-side error to telemetry/monitoring in production
    console.error("Application runtime error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-[12px] p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-semantic-error rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-semantic-error">
            System Notice
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred while loading this page. Our team has been notified. Please try refreshing.
          </p>
        </div>

        {error.digest && (
          <p className="text-[11px] font-mono text-neutral-400 bg-neutral-100 py-1 px-2 rounded max-w-xs mx-auto truncate">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              className="w-full flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
