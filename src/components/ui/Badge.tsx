import React from "react";
import { cn } from "@/lib/utils";
import type { BadgeColor } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  color = "red",
  children,
  ...props
}) => {
  const colorStyles: Record<BadgeColor, string> = {
    red: "bg-semantic-error text-white",
    yellow: "bg-accent-gold text-white",
    orange: "bg-semantic-warning text-white",
    gray: "bg-neutral-700 text-white",
    green: "bg-semantic-success text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-[3px]",
        colorStyles[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
