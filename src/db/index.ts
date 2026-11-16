import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

/**
 * Global cache for the database client and circuit-breaker status
 */
declare global {
  // eslint-disable-next-line no-var
  var __dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;
  // eslint-disable-next-line no-var
  var __dbHealthy: boolean | undefined;
  // eslint-disable-next-line no-var
  var __dbLastChecked: number | undefined;
}

function getDatabaseClient() {
  if (!connectionString) {
    return null;
  }

  if (!global.__dbInstance) {
    const client = postgres(connectionString, {
      prepare: false,
      connect_timeout: 1, // Fast 1 second connect timeout
      idle_timeout: 15,
      max: 10,
      onnotice: () => {}, // Suppress noisy postgres notices
    });
    global.__dbInstance = drizzle(client, { schema });
  }

  return global.__dbInstance;
}

export const db = getDatabaseClient();
export type Database = typeof db;
export { schema };

/**
 * High-speed Circuit Breaker for Database Availability
 * Returns true if PostgreSQL is reachable and authenticated.
 * Caches the result for 60 seconds to prevent query blocking and repetitive log spam on invalid credentials or offline ports.
 */
export async function isDatabaseAlive(): Promise<boolean> {
  if (!db || !connectionString) return false;

  const now = Date.now();
  if (
    global.__dbHealthy !== undefined &&
    global.__dbLastChecked !== undefined &&
    now - global.__dbLastChecked < 60000 // 60s cache
  ) {
    return global.__dbHealthy;
  }

  try {
    const probe = (async () => {
      try {
        await db.execute(sql`SELECT 1`);
        return true;
      } catch {
        return false;
      }
    })();

    const timeout = new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), 1200)
    );

    const isAlive = await Promise.race([probe, timeout]);
    global.__dbHealthy = isAlive;
    global.__dbLastChecked = now;
    return isAlive;
  } catch {
    global.__dbHealthy = false;
    global.__dbLastChecked = now;
    return false;
  }
}

/**
 * Resets the circuit breaker cache so health probes run freshly.
 */
export function resetDatabaseHealthCache(): void {
  global.__dbHealthy = undefined;
  global.__dbLastChecked = undefined;
}
