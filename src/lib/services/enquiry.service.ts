import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { PersistentStore } from "@/lib/storage/persistentStore";
import type { EnquiryCreateInput } from "@/lib/validation/enquiry.schema";

export interface StoredEnquiryRecord {
  id: string;
  type: "b2b" | "whatsapp_order" | "general";
  fullName: string;
  businessName?: string | null;
  gstin?: string | null;
  phone: string;
  email?: string | null;
  estimatedVolume?: string | null;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = "enquiries.json";

const defaultEnquiries: StoredEnquiryRecord[] = [
  {
    id: "enq-demo-1001",
    type: "b2b",
    fullName: "Virendra Singhania",
    businessName: "Singhania Handlooms & Textiles Pvt Ltd",
    gstin: "07AAAAA0000A1Z5",
    phone: "9811223344",
    email: "virendra@singhaniatextiles.com",
    estimatedVolume: "500 - 1000 pieces (Varanasi Silk Dupattas)",
    message: "Seeking wholesale procurement catalog with bulk discounts for Diwali retail distribution in North India.",
    status: "new",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "enq-demo-1002",
    type: "b2b",
    fullName: "Priyanka Kulkarni",
    businessName: "Sanskriti Ethnic Boutique",
    gstin: "27BBBPS1234F1Z2",
    phone: "9766554433",
    email: "orders@sanskrithaboutique.in",
    estimatedVolume: "200 pieces (Bengal Cotton & Sambalpuri Gamchas)",
    message: "Need assorted color lots of pure handloom gamchas for our stores in Pune and Mumbai.",
    status: "contacted",
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
];

function getStoredEnquiries(): StoredEnquiryRecord[] {
  const fromDisk = PersistentStore.readJson<StoredEnquiryRecord[]>(STORAGE_KEY);
  if (fromDisk && Array.isArray(fromDisk) && fromDisk.length > 0) {
    return fromDisk;
  }
  // Initialize default
  PersistentStore.writeJson(STORAGE_KEY, defaultEnquiries);
  return [...defaultEnquiries];
}

function saveStoredEnquiries(records: StoredEnquiryRecord[]): void {
  PersistentStore.writeJson(STORAGE_KEY, records);
}

export class EnquiryService {
  /**
   * Persists a new customer or B2B enquiry with instant disk and DB persistence.
   */
  static async createEnquiry(input: EnquiryCreateInput): Promise<StoredEnquiryRecord> {
    const timestamp = new Date().toISOString();
    let createdRecord: StoredEnquiryRecord = {
      id: `enq-${Date.now()}`,
      type: input.type,
      fullName: input.fullName,
      businessName: input.businessName || null,
      gstin: input.gstin || null,
      phone: input.phone,
      email: input.email || null,
      estimatedVolume: input.estimatedVolume || null,
      message: input.message,
      status: "new",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (db) {
      try {
        const [record] = await db
          .insert(enquiries)
          .values({
            type: input.type,
            fullName: input.fullName,
            businessName: input.businessName || null,
            gstin: input.gstin || null,
            phone: input.phone,
            email: input.email || null,
            productId: input.productId || null,
            itemsSummary: input.itemsSummary || null,
            estimatedVolume: input.estimatedVolume || null,
            message: input.message,
            status: "new",
          })
          .returning();

        if (record) {
          createdRecord = {
            id: record.id,
            type: record.type as StoredEnquiryRecord["type"],
            fullName: record.fullName,
            businessName: record.businessName,
            gstin: record.gstin,
            phone: record.phone,
            email: record.email,
            estimatedVolume: record.estimatedVolume,
            message: record.message,
            status: record.status as StoredEnquiryRecord["status"],
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.createdAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn("[EnquiryService] DB insert failed, persisting to file storage:", err);
      }
    }

    // Always persist to resilient local storage
    const current = getStoredEnquiries();
    const updated = [createdRecord, ...current.filter((e) => e.id !== createdRecord.id)];
    saveStoredEnquiries(updated);

    return createdRecord;
  }

  /**
   * Retrieves all inquiries for the admin dashboard (real-time).
   */
  static async getEnquiries(): Promise<StoredEnquiryRecord[]> {
    const fileList = getStoredEnquiries();
    if (db) {
      try {
        const list = await db.query.enquiries.findMany({
          orderBy: [desc(enquiries.createdAt)],
        });

        if (list && list.length > 0) {
          const dbItems: StoredEnquiryRecord[] = list.map((item) => ({
            id: item.id,
            type: item.type as StoredEnquiryRecord["type"],
            fullName: item.fullName,
            businessName: item.businessName,
            gstin: item.gstin,
            phone: item.phone,
            email: item.email,
            estimatedVolume: item.estimatedVolume,
            message: item.message,
            status: item.status as StoredEnquiryRecord["status"],
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.createdAt.toISOString(),
          }));

          const map = new Map<string, StoredEnquiryRecord>();
          for (const item of fileList) {
            map.set(item.id, item);
          }
          for (const item of dbItems) {
            map.set(item.id, item);
          }
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      } catch (err) {
        console.warn("[EnquiryService] DB fetch failed, falling back to persistent storage:", err);
      }
    }

    return fileList;
  }

  /**
   * Updates an enquiry status (new, contacted, closed).
   */
  static async updateEnquiryStatus(
    id: string,
    status: "new" | "contacted" | "closed"
  ): Promise<boolean> {
    if (db) {
      try {
        await db
          .update(enquiries)
          .set({ status })
          .where(eq(enquiries.id, id));
      } catch (err) {
        console.warn("[EnquiryService] DB update status failed:", err);
      }
    }

    const current = getStoredEnquiries();
    const target = current.find((e) => e.id === id);
    if (target) {
      target.status = status;
      target.updatedAt = new Date().toISOString();
      saveStoredEnquiries(current);
      return true;
    }

    return false;
  }

  /**
   * Deletes an enquiry record.
   */
  static async deleteEnquiry(id: string): Promise<boolean> {
    if (db) {
      try {
        await db.delete(enquiries).where(eq(enquiries.id, id));
      } catch (err) {
        console.warn("[EnquiryService] DB delete enquiry failed:", err);
      }
    }

    const current = getStoredEnquiries();
    const filtered = current.filter((e) => e.id !== id);
    saveStoredEnquiries(filtered);
    return true;
  }
}
