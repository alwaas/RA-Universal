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

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "pending_whatsapp"
  | "paid"
  | "cod"
  | "failed"
  | "refunded";

export type PaymentGateway = "razorpay" | "cod" | "whatsapp";

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
  shippingFee?: number;
  couponCode?: string | null;
  couponDiscount?: number;
  paymentGateway?: PaymentGateway;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  trackingCourier?: string | null;
  trackingNumber?: string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: "home" | "work" | "other";
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string | null;
  customerName: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
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

export type ReturnReason =
  | "damaged_in_transit"
  | "defective_weave"
  | "wrong_item"
  | "color_variance"
  | "other";

export type ReturnResolution = "replacement" | "refund";

export type ReturnStatus =
  | "pending"
  | "approved"
  | "pickup_scheduled"
  | "refunded"
  | "rejected";

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  reason: ReturnReason;
  resolution: ReturnResolution;
  comments: string;
  imageUrl?: string | null;
  bankOrUpiDetails?: string | null;
  status: ReturnStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreSettings {
  freeShippingThreshold: number;
  shippingFee: number;
  gstRate: number; // e.g. 5%
  gstin: string;
  storeName: string;
  storePhone: string;
  storeEmail: string;
  whatsappNumber: string;
  storeAddress: string;
  announcementText: string;
}

export interface AnalyticsReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  dailyRevenue: { date: string; amount: number; count: number }[];
  weeklyRevenue: { week: string; amount: number; count: number }[];
  monthlyRevenue: { month: string; amount: number; count: number }[];
  categoryBreakdown: { category: string; count: number; revenue: number }[];
  lowStockProducts: Product[];
}
