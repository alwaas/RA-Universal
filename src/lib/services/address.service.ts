import { eq, and } from "drizzle-orm";
import { db, isDatabaseAlive } from "@/db";
import { userAddresses } from "@/db/schema";
import { PersistentStore } from "@/lib/storage/persistentStore";
import type { UserAddress } from "@/types";

const ADDRESSES_STORAGE_KEY = "addresses.json";

const defaultAddresses: UserAddress[] = [
  {
    id: "addr-demo-1",
    userId: "usr-cust-101",
    name: "Ananya Mukherjee",
    phone: "9830123456",
    street: "Flat 4B, Shantiniketan Enclave, Gariahat",
    landmark: "Near Triangular Park",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700019",
    isDefault: true,
    type: "home",
    createdAt: new Date().toISOString(),
  },
];

export class AddressService {
  private static async getStore(): Promise<UserAddress[]> {
    return PersistentStore.read<UserAddress[]>(ADDRESSES_STORAGE_KEY, defaultAddresses);
  }

  private static async saveStore(list: UserAddress[]): Promise<void> {
    PersistentStore.write(ADDRESSES_STORAGE_KEY, list);
  }

  static async getByUserId(userId: string): Promise<UserAddress[]> {
    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        const rows = await db
          .select()
          .from(userAddresses)
          .where(eq(userAddresses.userId, userId));
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          name: r.name,
          phone: r.phone,
          street: r.street,
          landmark: r.landmark,
          city: r.city,
          state: r.state,
          pincode: r.pincode,
          isDefault: r.isDefault,
          type: r.type as "home" | "work" | "other",
          createdAt: r.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("[AddressService] DB read failed:", err);
      }
    }
    const store = await this.getStore();
    return store.filter((a) => a.userId === userId);
  }

  static async create(
    userId: string,
    data: Omit<UserAddress, "id" | "userId" | "createdAt">
  ): Promise<UserAddress> {
    const list = await this.getStore();

    if (data.isDefault) {
      list.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const newAddress: UserAddress = {
      ...data,
      id: `addr-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    list.push(newAddress);
    await this.saveStore(list);

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        if (data.isDefault) {
          await db
            .update(userAddresses)
            .set({ isDefault: false })
            .where(eq(userAddresses.userId, userId));
        }
        await db.insert(userAddresses).values({
          id: newAddress.id,
          userId,
          name: data.name,
          phone: data.phone,
          street: data.street,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          isDefault: data.isDefault,
          type: data.type,
        });
      } catch (err) {
        console.warn("[AddressService] DB insert failed:", err);
      }
    }

    return newAddress;
  }

  static async update(
    id: string,
    userId: string,
    data: Partial<Omit<UserAddress, "id" | "userId" | "createdAt">>
  ): Promise<UserAddress | null> {
    const list = await this.getStore();
    const idx = list.findIndex((a) => a.id === id && a.userId === userId);
    if (idx === -1) return null;

    if (data.isDefault) {
      list.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    list[idx] = { ...list[idx], ...data };
    await this.saveStore(list);

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        if (data.isDefault) {
          await db
            .update(userAddresses)
            .set({ isDefault: false })
            .where(eq(userAddresses.userId, userId));
        }
        await db
          .update(userAddresses)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)));
      } catch (err) {
        console.warn("[AddressService] DB update failed:", err);
      }
    }

    return list[idx];
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const list = await this.getStore();
    const filtered = list.filter((a) => !(a.id === id && a.userId === userId));
    await this.saveStore(filtered);

    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        await db
          .delete(userAddresses)
          .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)));
      } catch (err) {
        console.warn("[AddressService] DB delete failed:", err);
      }
    }

    return true;
  }
}
