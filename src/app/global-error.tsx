"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global uncaught error in root layout:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-[12px] p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900">
              Critical Application Error
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              A critical error occurred while rendering the root application layout.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-[6px] transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
