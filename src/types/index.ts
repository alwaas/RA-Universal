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
  sku?: string;
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
  sku?: string;
  title: string;
  slug: string;
  imageUrl: string;
  colorName?: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending_whatsapp" | "paid" | "cod";

export interface OrderItem {
  productId: string;
  sku?: string;
  title: string;
  colorName?: string;
  quantity: number;
  sellingPrice: number;
  mrp: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  totalAmount: number;
  mrpTotal: number;
  savingsTotal: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPincode?: string | null;
  createdAt: string;
  ordersCount?: number;
  totalSpent?: number;
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
