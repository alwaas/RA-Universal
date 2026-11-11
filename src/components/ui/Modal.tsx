"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-[96vw] sm:max-w-[92vw]",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className,
  size = "lg",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex min-h-screen items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[3px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full bg-white rounded-[12px] sm:rounded-[16px] shadow-2xl transition-all border border-neutral-200 flex flex-col max-h-[94vh] sm:max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95 duration-200",
          sizeClasses[size],
          className
        )}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 bg-white sticky top-0 z-20 flex-shrink-0">
          <div className="pr-3">
            {title && (
              <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-neutral-900 leading-snug">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5 focus:outline-none">
          {children}
        </div>
      </div>
    </div>
  );
};
