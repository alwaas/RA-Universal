"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, type ToastType } from "@/lib/store/useToastStore";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />,
};

const styles: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
  error: "bg-red-50 border-red-200 text-red-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-[8px] border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 ${styles[t.type]}`}
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5">{icons[t.type]}</span>
            <p className="text-xs sm:text-sm font-medium leading-snug break-words">
              {t.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss toast"
            className="p-1 -mr-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
