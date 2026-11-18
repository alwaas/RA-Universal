import { eq, desc, or, sql } from "drizzle-orm";
import { db, isDatabaseAlive } from "@/db";
import { orders } from "@/db/schema";
import { PersistentStore } from "@/lib/storage/persistentStore";
import { ProductService } from "@/lib/services/product.service";
import type { Order, OrderStatus, PaymentStatus, PaymentGateway, OrderItem } from "@/types";

const STORAGE_KEY = "orders.json";

export interface CreateOrderInput {
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingPincode: string;
  totalAmount: number;
  mrpTotal?: number;
  savingsTotal?: number;
  shippingFee?: number;
  couponCode?: string | null;
  couponDiscount?: number;
  paymentGateway?: PaymentGateway;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  items: OrderItem[];
  notes?: string | null;
}

// In-memory demo store for orders during offline/demo execution
const inMemoryOrders: Order[] = [
  {
    id: "ord-demo-1001",
    orderNumber: "RA-ORD-910241",
    userId: null,
    customerName: "Ananya Mukherjee",
    customerPhone: "9830123456",
    customerEmail: "ananya.m@example.com",
    shippingAddress: "Flat 4B, Shantiniketan Enclave, Gariahat",
    shippingCity: "Kolkata",
    shippingState: "West Bengal",
    shippingPincode: "700019",
    totalAmount: 1198,
    mrpTotal: 2398,
    savingsTotal: 1200,
    orderStatus: "confirmed",
    paymentStatus: "paid",
    items: [
      {
        productId: "prod-04",
        sku: "RA-DUP-004",
        title: "Chanderi Silk Golden Zari Border Women's Dupatta",
        colorName: "Royal Magenta",
        quantity: 1,
        sellingPrice: 899,
        mrp: 1799,
        imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
      },
      {
        productId: "prod-01",
        sku: "RA-GAM-001",
        title: "Classic Bengal Cotton Gamcha - Heritage Red Check",
        colorName: "Traditional Red",
        quantity: 1,
        sellingPrice: 199,
        mrp: 399,
        imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
      },
    ],
    notes: "Please pack for gift delivery",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "ord-demo-1002",
    orderNumber: "RA-ORD-910242",
    userId: null,
    customerName: "Vikramaditya Roy",
    customerPhone: "9820543210",
    customerEmail: "vikram.roy@example.com",
    shippingAddress: "House 12, Indiranagar 2nd Stage",
    shippingCity: "Bengaluru",
    shippingState: "Karnataka",
    shippingPincode: "560038",
    totalAmount: 558,
    mrpTotal: 998,
    savingsTotal: 440,
    orderStatus: "pending",
    paymentStatus: "pending_whatsapp",
    items: [
      {
        productId: "prod-02",
        sku: "RA-GAM-002",
        title: "Sambalpuri Handloom Pure Cotton Men's Gamcha",
        colorName: "Maroon & Black",
        quantity: 2,
        sellingPrice: 279,
        mrp: 499,
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
      },
    ],
    notes: "WhatsApp confirmation awaited",
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: "ord-demo-1003",
    orderNumber: "RA-ORD-910243",
    userId: null,
    customerName: "Pooja Deshmukh",
    customerPhone: "9765432109",
    customerEmail: "pooja.d@example.com",
    shippingAddress: "Sector 14, Vashi",
    shippingCity: "Navi Mumbai",
    shippingState: "Maharashtra",
    shippingPincode: "400703",
    totalAmount: 1099,
    mrpTotal: 1999,
    savingsTotal: 900,
    orderStatus: "shipped",
    paymentStatus: "paid",
    items: [
      {
        productId: "prod-06",
        sku: "RA-DUP-006",
        title: "Amritsari Phulkari Embroidered Festive Dupatta",
        colorName: "Festive Red",
        quantity: 1,
        sellingPrice: 1099,
        mrp: 1999,
        imageUrl: "https://images.unsplash.com/photo-1610030469668-93510cb67655?w=800",
      },
    ],
    notes: "Courier dispatched via Express Handloom Cargo",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

function normalizeOrder(raw: any): Order {
  let shippingAddressStr = "";
  let cityStr = raw.shippingCity || "";
  let stateStr = raw.shippingState || "India";
  let pincodeStr = raw.shippingPincode || "";

  if (typeof raw.shippingAddress === "object" && raw.shippingAddress !== null) {
    shippingAddressStr =
      raw.shippingAddress.street ||
      raw.shippingAddress.address ||
      Object.values(raw.shippingAddress).filter((v) => typeof v === "string").join(", ");
    if (!cityStr && raw.shippingAddress.city) cityStr = String(raw.shippingAddress.city);
    if ((!stateStr || stateStr === "India") && raw.shippingAddress.state) stateStr = String(raw.shippingAddress.state);
    if (!pincodeStr && raw.shippingAddress.pincode) pincodeStr = String(raw.shippingAddress.pincode);
  } else {
    shippingAddressStr = String(raw.shippingAddress || "");
  }

  return {
    id: String(raw.id || `ord-${Date.now()}`),
    orderNumber: String(raw.orderNumber || OrderService.generateOrderNumber()),
    userId: raw.userId || null,
    customerName: String(raw.customerName || "Customer"),
    customerPhone: String(raw.customerPhone || ""),
    customerEmail: raw.customerEmail ? String(raw.customerEmail) : null,
    shippingAddress: shippingAddressStr,
    shippingCity: cityStr,
    shippingState: stateStr,
    shippingPincode: pincodeStr,
    totalAmount: Number(raw.totalAmount || 0),
    mrpTotal: Number(raw.mrpTotal || raw.totalAmount || 0),
    savingsTotal: Number(raw.savingsTotal || 0),
    shippingFee: Number(raw.shippingFee || 0),
    couponCode: raw.couponCode ? String(raw.couponCode) : null,
    couponDiscount: Number(raw.couponDiscount || 0),
    paymentGateway: (raw.paymentGateway as PaymentGateway) || (raw.paymentStatus === "cod" ? "cod" : "razorpay"),
    razorpayOrderId: raw.razorpayOrderId ? String(raw.razorpayOrderId) : null,
    razorpayPaymentId: raw.razorpayPaymentId ? String(raw.razorpayPaymentId) : null,
    razorpaySignature: raw.razorpaySignature ? String(raw.razorpaySignature) : null,
    trackingCourier: raw.trackingCourier ? String(raw.trackingCourier) : null,
    trackingNumber: raw.trackingNumber ? String(raw.trackingNumber) : null,
    orderStatus: (raw.orderStatus as OrderStatus) || "pending",
    paymentStatus: (raw.paymentStatus as PaymentStatus) || (raw.paymentGateway === "cod" ? "cod" : "pending"),
    items: Array.isArray(raw.items) ? raw.items : Array.isArray(raw.itemsJson) ? raw.itemsJson : [],
    notes: raw.notes ? String(raw.notes) : null,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function getStoredOrders(): Order[] {
  const fromDisk = PersistentStore.readJson<any[]>(STORAGE_KEY);
  if (fromDisk && Array.isArray(fromDisk) && fromDisk.length > 0) {
    return fromDisk.map(normalizeOrder);
  }
  PersistentStore.writeJson(STORAGE_KEY, inMemoryOrders.map(normalizeOrder));
  return inMemoryOrders.map(normalizeOrder);
}

function saveStoredOrders(ords: Order[]): void {
  PersistentStore.writeJson(STORAGE_KEY, ords.map(normalizeOrder));
}

export class OrderService {
  /**
   * Generates a customer-facing Amazon-style order number.
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(10 + Math.random() * 90);
    return `RA-ORD-${timestamp}${random}`;
  }

  /**
   * Creates a new order record.
   */
  static async createOrder(input: CreateOrderInput): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    const mrpTotal = input.mrpTotal ?? input.items.reduce((acc, i) => acc + (i.mrp || i.sellingPrice) * i.quantity, 0);
    const savingsTotal = input.savingsTotal ?? Math.max(0, mrpTotal - input.totalAmount);
    const shippingFee = input.shippingFee ?? 0;
    const couponDiscount = input.couponDiscount ?? 0;
    const paymentGateway = input.paymentGateway || (input.paymentStatus === "cod" ? "cod" : "razorpay");
    const orderStatus = input.orderStatus || "pending";
    const paymentStatus = input.paymentStatus || (paymentGateway === "cod" ? "cod" : "pending");

    let addressStr = "";
    let cityStr = input.shippingCity || "";
    let stateStr = input.shippingState || "India";
    let pincodeStr = input.shippingPincode || "";

    if (typeof (input as any).shippingAddress === "object" && (input as any).shippingAddress !== null) {
      const addrObj = (input as any).shippingAddress;
      addressStr = addrObj.street || addrObj.address || Object.values(addrObj).filter((v) => typeof v === "string").join(", ");
      if (!cityStr && addrObj.city) cityStr = String(addrObj.city);
      if ((!stateStr || stateStr === "India") && addrObj.state) stateStr = String(addrObj.state);
      if (!pincodeStr && addrObj.pincode) pincodeStr = String(addrObj.pincode);
    } else {
      addressStr = String(input.shippingAddress || "");
    }

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        const [created] = await db
          .insert(orders)
          .values({
            orderNumber,
            userId: input.userId || null,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            customerEmail: input.customerEmail || null,
            shippingAddress: addressStr,
            shippingCity: cityStr,
            shippingState: stateStr,
            shippingPincode: pincodeStr,
            totalAmount: input.totalAmount.toString(),
            mrpTotal: mrpTotal.toString(),
            savingsTotal: savingsTotal.toString(),
            shippingFee: shippingFee.toString(),
            couponCode: input.couponCode || null,
            couponDiscount: couponDiscount.toString(),
            paymentGateway,
            razorpayOrderId: input.razorpayOrderId || null,
            razorpayPaymentId: input.razorpayPaymentId || null,
            razorpaySignature: input.razorpaySignature || null,
            orderStatus,
            paymentStatus,
            itemsJson: input.items,
            notes: input.notes || null,
          })
          .returning();

        if (created) {
          const ord: Order = normalizeOrder({
            id: created.id,
            orderNumber: created.orderNumber,
            userId: created.userId,
            customerName: created.customerName,
            customerPhone: created.customerPhone,
            customerEmail: created.customerEmail,
            shippingAddress: created.shippingAddress,
            shippingCity: created.shippingCity,
            shippingState: created.shippingState,
            shippingPincode: created.shippingPincode,
            totalAmount: Number(created.totalAmount),
            mrpTotal: Number(created.mrpTotal),
            savingsTotal: Number(created.savingsTotal),
            shippingFee: Number(created.shippingFee),
            couponCode: created.couponCode,
            couponDiscount: Number(created.couponDiscount),
            paymentGateway: created.paymentGateway as PaymentGateway,
            razorpayOrderId: created.razorpayOrderId,
            razorpayPaymentId: created.razorpayPaymentId,
            razorpaySignature: created.razorpaySignature,
            trackingCourier: created.trackingCourier,
            trackingNumber: created.trackingNumber,
            orderStatus: created.orderStatus as OrderStatus,
            paymentStatus: created.paymentStatus as PaymentStatus,
            items: (created.itemsJson as OrderItem[]) || [],
            notes: created.notes,
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
          });

          const current = getStoredOrders();
          saveStoredOrders([ord, ...current.filter((o) => o.id !== ord.id)]);
          // Decrement inventory stock
          ProductService.decrementStock(input.items).catch(() => {});
          return ord;
        }
      } catch (err) {
        console.warn("[OrderService] DB insert failed, using persistent storage:", err);
      }
    }

    const newOrder: Order = normalizeOrder({
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: input.userId || null,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || null,
      shippingAddress: addressStr,
      shippingCity: cityStr,
      shippingState: stateStr,
      shippingPincode: pincodeStr,
      totalAmount: input.totalAmount,
      mrpTotal,
      savingsTotal,
      shippingFee,
      couponCode: input.couponCode || null,
      couponDiscount,
      paymentGateway,
      razorpayOrderId: input.razorpayOrderId || null,
      razorpayPaymentId: input.razorpayPaymentId || null,
      razorpaySignature: input.razorpaySignature || null,
      orderStatus,
      paymentStatus,
      items: input.items,
      notes: input.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const current = getStoredOrders();
    saveStoredOrders([newOrder, ...current.filter((o) => o.id !== newOrder.id)]);
    // Decrement inventory stock
    ProductService.decrementStock(input.items).catch(() => {});
    return newOrder;
  }

  /**
   * Retrieves all orders for administrative tracking.
   */
  static async getOrders(): Promise<Order[]> {
    const fileList = getStoredOrders();
    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        const raw = await db.query.orders.findMany({
          orderBy: [desc(orders.createdAt)],
        });

        if (raw && raw.length > 0) {
          const dbOrders: Order[] = raw.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            userId: o.userId,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            customerEmail: o.customerEmail,
            shippingAddress: o.shippingAddress,
            shippingCity: o.shippingCity,
            shippingState: o.shippingState,
            shippingPincode: o.shippingPincode,
            totalAmount: Number(o.totalAmount),
            mrpTotal: Number(o.mrpTotal),
            savingsTotal: Number(o.savingsTotal),
            orderStatus: o.orderStatus as OrderStatus,
            paymentStatus: o.paymentStatus as PaymentStatus,
            items: (o.itemsJson as OrderItem[]) || [],
            notes: o.notes,
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
          }));

          const map = new Map<string, Order>();
          for (const ord of fileList) {
            map.set(ord.id, ord);
          }
          for (const ord of dbOrders) {
            map.set(ord.id, ord);
          }
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      } catch (err) {
        console.warn("[OrderService] DB fetch failed, using persistent storage:", err);
      }
    }

    return fileList;
  }

  /**
   * Retrieves orders belonging to a specific customer (by userId, phone, or email).
   */
  static async getOrdersForCustomer({
    userId,
    phone,
    email,
  }: {
    userId?: string;
    phone?: string;
    email?: string;
  }): Promise<Order[]> {
    const cleanPhone = phone?.replace(/[^0-9]/g, "").slice(-10);

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        const conditions = [];
        if (userId) conditions.push(eq(orders.userId, userId));
        if (cleanPhone) conditions.push(sql`${orders.customerPhone} LIKE ${`%${cleanPhone}`}`);
        if (email) conditions.push(eq(orders.customerEmail, email));

        if (conditions.length > 0) {
          const raw = await db.query.orders.findMany({
            where: or(...conditions),
            orderBy: [desc(orders.createdAt)],
          });

          if (raw && raw.length > 0) {
            return raw.map((o) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              userId: o.userId,
              customerName: o.customerName,
              customerPhone: o.customerPhone,
              customerEmail: o.customerEmail,
              shippingAddress: o.shippingAddress,
              shippingCity: o.shippingCity,
              shippingState: o.shippingState,
              shippingPincode: o.shippingPincode,
              totalAmount: Number(o.totalAmount),
              mrpTotal: Number(o.mrpTotal),
              savingsTotal: Number(o.savingsTotal),
              orderStatus: o.orderStatus as OrderStatus,
              paymentStatus: o.paymentStatus as PaymentStatus,
              items: (o.itemsJson as OrderItem[]) || [],
              notes: o.notes,
              createdAt: o.createdAt.toISOString(),
              updatedAt: o.updatedAt.toISOString(),
            }));
          }
        }
      } catch (err) {
        console.warn("[OrderService] DB getOrdersForCustomer failed, using persistent storage:", err);
      }
    }

    // Resilient fallback
    return getStoredOrders().filter((o) => {
      if (userId && o.userId === userId) return true;
      if (cleanPhone) {
        const oPhone = o.customerPhone.replace(/[^0-9]/g, "").slice(-10);
        if (oPhone === cleanPhone) return true;
      }
      if (email && o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase()) {
        return true;
      }
      return false;
    });
  }

  /**
   * Updates an order's status, payment status, or courier tracking info.
   */
  static async updateOrderStatus(
    orderId: string,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus,
    trackingCourier?: string,
    trackingNumber?: string
  ): Promise<boolean> {
    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        const updateData: any = { updatedAt: new Date() };
        if (status) updateData.orderStatus = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (trackingCourier !== undefined) updateData.trackingCourier = trackingCourier;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

        await db.update(orders).set(updateData).where(eq(orders.id, orderId));
      } catch (err) {
        console.warn("[OrderService] DB status update failed:", err);
      }
    }

    const current = getStoredOrders();
    const order = current.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      if (status) order.orderStatus = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (trackingCourier !== undefined) order.trackingCourier = trackingCourier;
      if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
      order.updatedAt = new Date().toISOString();
      saveStoredOrders(current);
      return true;
    }

    return false;
  }
}
