import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import type { Order, OrderStatus, PaymentStatus, OrderItem } from "@/types";

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
        imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800",
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

    if (db) {
      try {
        const [created] = await db
          .insert(orders)
          .values({
            orderNumber,
            userId: input.userId || null,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            customerEmail: input.customerEmail || null,
            shippingAddress: input.shippingAddress,
            shippingCity: input.shippingCity,
            shippingState: input.shippingState || "India",
            shippingPincode: input.shippingPincode,
            totalAmount: input.totalAmount.toString(),
            mrpTotal: mrpTotal.toString(),
            savingsTotal: savingsTotal.toString(),
            orderStatus: "pending",
            paymentStatus: "pending_whatsapp",
            itemsJson: input.items,
            notes: input.notes || null,
          })
          .returning();

        if (created) {
          return {
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
            orderStatus: created.orderStatus as OrderStatus,
            paymentStatus: created.paymentStatus as PaymentStatus,
            items: (created.itemsJson as OrderItem[]) || [],
            notes: created.notes,
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn("[OrderService] DB insert failed, falling back to in-memory:", err);
      }
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: input.userId || null,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || null,
      shippingAddress: input.shippingAddress,
      shippingCity: input.shippingCity,
      shippingState: input.shippingState || "India",
      shippingPincode: input.shippingPincode,
      totalAmount: input.totalAmount,
      mrpTotal,
      savingsTotal,
      orderStatus: "pending",
      paymentStatus: "pending_whatsapp",
      items: input.items,
      notes: input.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryOrders.unshift(newOrder);
    return newOrder;
  }

  /**
   * Retrieves all orders for administrative tracking.
   */
  static async getOrders(): Promise<Order[]> {
    if (db) {
      try {
        const raw = await db.query.orders.findMany({
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
      } catch (err) {
        console.warn("[OrderService] DB fetch failed, using in-memory:", err);
      }
    }

    return [...inMemoryOrders];
  }

  /**
   * Updates an order's status or payment status.
   */
  static async updateOrderStatus(
    orderId: string,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus
  ): Promise<boolean> {
    if (db) {
      try {
        const updateData: any = { updatedAt: new Date() };
        if (status) updateData.orderStatus = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        await db.update(orders).set(updateData).where(eq(orders.id, orderId));
        return true;
      } catch (err) {
        console.warn("[OrderService] DB status update failed:", err);
      }
    }

    const order = inMemoryOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      if (status) order.orderStatus = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      order.updatedAt = new Date().toISOString();
      return true;
    }

    return false;
  }
}
