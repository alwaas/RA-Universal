import React from "react";
import { formatINR, calculateDiscount } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface PriceDisplayProps {
  mrp: number;
  sellingPrice: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  mrp,
  sellingPrice,
  size = "md",
  className,
}) => {
  const discount = calculateDiscount(mrp, sellingPrice);

  const sizeClasses = {
    sm: {
      selling: "text-sm font-bold text-neutral-900",
      mrp: "text-xs text-neutral-500 line-through",
      discount: "text-xs font-semibold text-semantic-success",
    },
    md: {
      selling: "text-base sm:text-lg font-bold text-neutral-900",
      mrp: "text-xs sm:text-sm text-neutral-500 line-through",
      discount: "text-xs sm:text-sm font-bold text-semantic-success",
    },
    lg: {
      selling: "text-2xl font-bold text-neutral-900",
      mrp: "text-base text-neutral-500 line-through",
      discount: "text-sm font-bold text-semantic-success",
    },
  };

  return (
    <div className={cn("flex items-baseline flex-wrap gap-1.5", className)}>
      <span className={sizeClasses[size].selling}>
        {formatINR(sellingPrice)}
      </span>
      {mrp > sellingPrice && (
        <>
          <span className={sizeClasses[size].mrp}>
            {formatINR(mrp)}
          </span>
          {discount > 0 && (
            <span className={sizeClasses[size].discount}>
              ({discount}% OFF)
            </span>
          )}
        </>
      )}
    </div>
  );
};
