import { PersistentStore } from "@/lib/storage/persistentStore";
import type { ReturnRequest, ReturnStatus } from "@/types";

const RETURNS_STORAGE_KEY = "returns.json";

const defaultReturns: ReturnRequest[] = [
  {
    id: "ret-1001",
    orderNumber: "RA-ORD-910241",
    customerName: "Ananya Mukherjee",
    customerPhone: "9830123456",
    reason: "damaged_in_transit",
    resolution: "replacement",
    comments: "Outer parcel bag had a tear and the inner zari corner got slightly frayed. Requesting fresh replacement.",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
    status: "pickup_scheduled",
    adminNotes: "BlueDart reverse pickup arranged for Nov 18.",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export class ReturnsService {
  private static getStore(): ReturnRequest[] {
    return PersistentStore.read<ReturnRequest[]>(RETURNS_STORAGE_KEY, defaultReturns);
  }

  private static saveStore(list: ReturnRequest[]): void {
    PersistentStore.write(RETURNS_STORAGE_KEY, list);
  }

  static async getAll(): Promise<ReturnRequest[]> {
    return this.getStore();
  }

  static async getByOrderNumber(orderNumber: string): Promise<ReturnRequest[]> {
    const list = this.getStore();
    const cleanNum = orderNumber.trim().toUpperCase();
    return list.filter((r) => r.orderNumber.trim().toUpperCase() === cleanNum);
  }

  static async create(payload: Omit<ReturnRequest, "id" | "status" | "createdAt" | "updatedAt">): Promise<ReturnRequest> {
    const newRequest: ReturnRequest = {
      ...payload,
      id: `ret-${Date.now()}`,
      orderNumber: payload.orderNumber.trim().toUpperCase(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = this.getStore();
    list.unshift(newRequest);
    this.saveStore(list);
    return newRequest;
  }

  static async updateStatus(
    id: string,
    status: ReturnStatus,
    adminNotes?: string
  ): Promise<boolean> {
    const list = this.getStore();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    list[idx] = {
      ...list[idx],
      status,
      adminNotes: adminNotes ?? list[idx].adminNotes,
      updatedAt: new Date().toISOString(),
    };
    this.saveStore(list);
    return true;
  }
}
