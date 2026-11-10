/**
 * Formats a numeric price into standard Indian Rupee notation (e.g., ₹1,299).
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates discount percentage given MRP and final selling price.
 * Formula: Math.round(((mrp - sellingPrice) / mrp) * 100)
 */
export function calculateDiscount(mrp: number, sellingPrice: number): number {
  if (mrp <= 0 || sellingPrice >= mrp) {
    return 0;
  }
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}

/**
 * Calculates total savings in INR.
 */
export function calculateSavings(mrp: number, sellingPrice: number): number {
  if (sellingPrice >= mrp) {
    return 0;
  }
  return mrp - sellingPrice;
}
