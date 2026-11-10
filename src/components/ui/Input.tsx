"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, required, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-700 mb-1.5"
          >
            {label}
            {required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={cn(
            "w-full h-11 px-3.5 text-sm text-neutral-900 bg-white border border-neutral-300 rounded-[6px] placeholder:text-neutral-500 transition-colors focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:bg-neutral-100 disabled:cursor-not-allowed",
            error && "border-semantic-error focus:border-semantic-error focus:ring-semantic-error/10",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-semantic-error">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-neutral-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
