import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

/**
 * Global cache for the database client connection in development to prevent connection exhaustion.
 */
declare global {
  // eslint-disable-next-line no-var
  var __dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function getDatabaseClient() {
  if (!connectionString) {
    return null;
  }

  if (process.env.NODE_ENV === "production") {
    const client = postgres(connectionString, { prepare: false });
    return drizzle(client, { schema });
  }

  if (!global.__dbInstance) {
    const client = postgres(connectionString, { prepare: false });
    global.__dbInstance = drizzle(client, { schema });
  }

  return global.__dbInstance;
}

export const db = getDatabaseClient();
export type Database = typeof db;
export { schema };
