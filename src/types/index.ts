export type ProductCategory = "scarves_dupattas" | "gamchas";

export type ProductStatus = "active" | "inactive";

export type BadgeColor = "red" | "yellow" | "orange" | "gray" | "green";

export type UserRole = "customer" | "admin";

export interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  imageUrl?: string | null;
  inStock?: boolean;
}

export interface ProductBadge {
  id: string;
  name: string;
  slug: string;
  badgeColor: BadgeColor;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  colorName?: string | null;
  isPrimary: boolean;
  displayOrder?: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ProductCategory;
  fabric: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  status: ProductStatus;
  stockCount: number;
  images: ProductImage[];
  colors: ProductColor[];
  badge?: ProductBadge | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  imageUrl: string;
  colorName?: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
}

export interface SessionUser {
  userId: string;
  role: UserRole;
  fullName: string;
  phone: string;
  email?: string;
}

export interface B2BEnquiryPayload {
  fullName: string;
  businessName?: string;
  gstin?: string;
  phone: string;
  email?: string;
  productInterest: "scarves_dupattas" | "gamchas" | "both";
  estimatedVolume: "50-100" | "100-500" | "500+";
  message: string;
}
