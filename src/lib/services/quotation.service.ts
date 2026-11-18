import { PersistentStore } from "@/lib/storage/persistentStore";
import type { Quotation, QuotationItem, QuotationStatus } from "@/types";

const STORAGE_KEY = "quotations.json";

export interface CreateQuotationInput {
  enquiryId?: string | null;
  customerName: string;
  businessName?: string | null;
  gstin?: string | null;
  phone: string;
  email?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPincode?: string | null;
  items: QuotationItem[];
  gstPercent?: number;
  shippingCost?: number;
  validDays?: number;
  terms?: string;
  adminNotes?: string | null;
}

const seedQuotations: Quotation[] = [
  {
    id: "qt-1001",
    quoteNumber: "RA-QT-260101",
    enquiryId: "enq-01",
    customerName: "Ramesh Chandra",
    businessName: "Chandra Ethnic Boutique",
    gstin: "09AABCC1234D1Z8",
    phone: "9876543210",
    email: "ramesh@chandraboutique.com",
    shippingAddress: "12, Aminabad High Street",
    shippingCity: "Lucknow",
    shippingState: "Uttar Pradesh",
    shippingPincode: "226018",
    items: [
      {
        productId: "prod-04",
        sku: "RA-DUP-004",
        title: "Chanderi Silk Golden Zari Border Women's Dupatta",
        colorName: "Royal Magenta",
        quantity: 50,
        unitPrice: 699,
        totalAmount: 34950,
      },
      {
        productId: "prod-01",
        sku: "RA-GAM-001",
        title: "Classic Bengal Cotton Gamcha - Heritage Red Check",
        colorName: "Traditional Red",
        quantity: 100,
        unitPrice: 149,
        totalAmount: 14900,
      },
    ],
    subtotal: 49850,
    gstPercent: 5,
    gstAmount: 2493,
    shippingCost: 800,
    totalAmount: 53143,
    validUntil: new Date(Date.now() + 15 * 86400 * 1000).toISOString(),
    terms: "50% advance for loom reservation, 50% prior to dispatch. Surface cargo delivery via Delhivery Express.",
    status: "sent",
    adminNotes: "Client requested delivery within 14 days for Diwali trade.",
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
  {
    id: "qt-1002",
    quoteNumber: "RA-QT-260102",
    enquiryId: "enq-02",
    customerName: "Meenakshi Sundaram",
    businessName: "Dakshin Weaves & Crafts",
    gstin: "33AABCM9876E1Z4",
    phone: "9840123456",
    email: "procurement@dakshinweaves.com",
    shippingAddress: "45, Pondy Bazaar, T. Nagar",
    shippingCity: "Chennai",
    shippingState: "Tamil Nadu",
    shippingPincode: "600017",
    items: [
      {
        productId: "prod-02",
        sku: "RA-GAM-002",
        title: "Sambalpuri Handloom Pure Cotton Men's Gamcha",
        colorName: "Maroon & Black",
        quantity: 60,
        unitPrice: 219,
        totalAmount: 13140,
      },
      {
        productId: "prod-05",
        sku: "RA-DUP-005",
        title: "Kalamkari Handblock Printed Pure Cotton Dupatta",
        colorName: "Indigo Floral",
        quantity: 40,
        unitPrice: 429,
        totalAmount: 17160,
      },
    ],
    subtotal: 30300,
    gstPercent: 5,
    gstAmount: 1515,
    shippingCost: 650,
    totalAmount: 32465,
    validUntil: new Date(Date.now() + 12 * 86400 * 1000).toISOString(),
    terms: "Full payment via RTGS before consignment dispatch. GST input tax invoice issued.",
    status: "accepted",
    adminNotes: "Sample swatch set delivered and approved by client.",
    createdAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
  },
];

function getStoredQuotations(): Quotation[] {
  const fromDisk = PersistentStore.readJson<Quotation[]>(STORAGE_KEY);
  if (fromDisk && Array.isArray(fromDisk) && fromDisk.length > 0) {
    return fromDisk;
  }
  PersistentStore.writeJson(STORAGE_KEY, seedQuotations);
  return seedQuotations;
}

function saveStoredQuotations(quotes: Quotation[]): void {
  PersistentStore.writeJson(STORAGE_KEY, quotes);
}

export class QuotationService {
  static generateQuoteNumber(): string {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.floor(100 + Math.random() * 900);
    return `RA-QT-${dateStr}-${random}`;
  }

  static async getAll(): Promise<Quotation[]> {
    const list = getStoredQuotations();
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async getById(id: string): Promise<Quotation | null> {
    const list = getStoredQuotations();
    return list.find((q) => q.id === id) || null;
  }

  static async getByNumber(quoteNumber: string): Promise<Quotation | null> {
    const list = getStoredQuotations();
    const clean = quoteNumber.toUpperCase().trim();
    return list.find((q) => q.quoteNumber.toUpperCase() === clean) || null;
  }

  static async create(input: CreateQuotationInput): Promise<Quotation> {
    const quoteNumber = this.generateQuoteNumber();
    const subtotal = input.items.reduce((sum, item) => sum + (Number(item.totalAmount) || item.unitPrice * item.quantity), 0);
    const gstPercent = input.gstPercent ?? 5;
    const gstAmount = Math.round((subtotal * (gstPercent / 100)) * 100) / 100;
    const shippingCost = Number(input.shippingCost) || 0;
    const totalAmount = Math.round(subtotal + gstAmount + shippingCost);
    const validDays = input.validDays ?? 15;
    const validUntil = new Date(Date.now() + validDays * 86400 * 1000).toISOString();

    const newQuote: Quotation = {
      id: `qt-${Date.now()}`,
      quoteNumber,
      enquiryId: input.enquiryId || null,
      customerName: input.customerName.trim(),
      businessName: input.businessName?.trim() || null,
      gstin: input.gstin?.trim() || null,
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      shippingAddress: input.shippingAddress?.trim() || null,
      shippingCity: input.shippingCity?.trim() || null,
      shippingState: input.shippingState?.trim() || null,
      shippingPincode: input.shippingPincode?.trim() || null,
      items: input.items.map((i) => ({
        productId: i.productId,
        sku: i.sku || "RA-SKU",
        title: i.title,
        colorName: i.colorName || null,
        quantity: Number(i.quantity) || 1,
        unitPrice: Number(i.unitPrice) || 0,
        totalAmount: (Number(i.quantity) || 1) * (Number(i.unitPrice) || 0),
      })),
      subtotal,
      gstPercent,
      gstAmount,
      shippingCost,
      totalAmount,
      validUntil,
      terms:
        input.terms ||
        "50% advance upon loom booking, 50% prior to dispatch. Delivery time 10-14 working days. Freight extra at actuals.",
      status: "draft",
      adminNotes: input.adminNotes?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = getStoredQuotations();
    saveStoredQuotations([newQuote, ...current]);
    return newQuote;
  }

  static async updateStatus(
    id: string,
    status: QuotationStatus,
    adminNotes?: string
  ): Promise<Quotation | null> {
    const list = getStoredQuotations();
    const idx = list.findIndex((q) => q.id === id);
    if (idx === -1) return null;

    const updated: Quotation = {
      ...list[idx],
      status,
      adminNotes: adminNotes !== undefined ? adminNotes : list[idx].adminNotes,
      updatedAt: new Date().toISOString(),
    };

    list[idx] = updated;
    saveStoredQuotations(list);
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const list = getStoredQuotations();
    const filtered = list.filter((q) => q.id !== id);
    if (filtered.length === list.length) return false;
    saveStoredQuotations(filtered);
    return true;
  }
}

