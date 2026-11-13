import fs from "fs";
import path from "path";

/**
 * Resilient Atomic File Persistence Store
 * Provides persistent local state for products, orders, customers, enquiries, and offers
 * across hot-reloads, server restarts, and offline environments.
 */
export class PersistentStore {
  private static baseDir: string = (() => {
    try {
      const localDir = path.join(process.cwd(), ".data");
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      return localDir;
    } catch {
      // Fallback for restricted serverless environments
      const tempDir = path.join("/tmp", "ra_universal_data");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      return tempDir;
    }
  })();

  private static getFilePath(filename: string): string {
    return path.join(this.baseDir, filename);
  }

  /**
   * Reads and parses JSON data from disk.
   */
  static readJson<T>(filename: string): T | null {
    try {
      const filePath = this.getFilePath(filename);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      if (!raw || !raw.trim()) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[PersistentStore] Failed reading ${filename}:`, err);
      return null;
    }
  }

  /**
   * Safely writes JSON data to disk atomically.
   */
  static writeJson<T>(filename: string, data: T): void {
    try {
      const filePath = this.getFilePath(filename);
      const tempPath = `${filePath}.tmp.${Date.now()}`;
      const serialized = JSON.stringify(data, null, 2);

      fs.writeFileSync(tempPath, serialized, "utf-8");
      fs.renameSync(tempPath, filePath);
    } catch {
      // Fallback direct write if atomic rename fails on some Windows/cloud filesystems
      try {
        const filePath = this.getFilePath(filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      } catch (innerErr) {
        console.warn(`[PersistentStore] Failed writing ${filename}:`, innerErr);
      }
    }
  }
}
