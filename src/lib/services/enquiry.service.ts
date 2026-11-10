import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
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
}

export class EnquiryService {
  /**
   * Persists a new customer or B2B enquiry into the database.
   */
  static async createEnquiry(input: EnquiryCreateInput): Promise<StoredEnquiryRecord> {
    if (db) {
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

      if (!record) {
        throw new Error("Failed to record enquiry.");
      }

      return {
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
      };
    }

    // Demo fallback record
    return {
      id: `enq-${Date.now()}`,
      type: input.type,
      fullName: input.fullName,
      businessName: input.businessName,
      gstin: input.gstin,
      phone: input.phone,
      email: input.email,
      estimatedVolume: input.estimatedVolume,
      message: input.message,
      status: "new",
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves all inquiries for the admin dashboard.
   */
  static async getEnquiries(): Promise<StoredEnquiryRecord[]> {
    if (db) {
      const list = await db.query.enquiries.findMany({
        orderBy: [desc(enquiries.createdAt)],
      });

      return list.map((item) => ({
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
      }));
    }

    return [];
  }
}
