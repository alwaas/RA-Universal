"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ProductColor } from "@/types";

export interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColorId?: string;
  onSelectColor: (color: ProductColor) => void;
  className?: string;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColorId,
  onSelectColor,
  className,
}) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {colors.map((color) => {
        const isSelected = selectedColorId === color.id;
        return (
          <button
            key={color.id}
            type="button"
            title={color.name}
            aria-label={`Select ${color.name} color`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelectColor(color);
            }}
            className={cn(
              "w-4 h-4 rounded-full border border-neutral-300 transition-all focus:outline-none focus:ring-1 focus:ring-brand-primary",
              isSelected && "ring-2 ring-neutral-900 ring-offset-1 scale-110"
            )}
            style={{ backgroundColor: color.hexCode }}
          />
        );
      })}
    </div>
  );
};
