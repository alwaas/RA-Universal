import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { ProductBadge as ProductBadgeType } from "@/types";

export interface ProductBadgeProps {
  badge: ProductBadgeType;
  className?: string;
}

export const ProductBadgeComponent: React.FC<ProductBadgeProps> = ({
  badge,
  className,
}) => {
  return (
    <div className={className}>
      <Badge color={badge.badgeColor}>
        {badge.name}
      </Badge>
    </div>
  );
};
