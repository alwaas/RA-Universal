import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { isDemoFallbackAllowed } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

/**
 * Lightweight, unauthenticated public health check for load balancers & uptime monitors.
 * Verifies live database connectivity without leaking internal architecture or diagnostics.
 * Returns: {"status":"ok"} (200) or {"status":"error"} (503).
 */
export async function GET() {
  try {
    if (!db) {
      if (!isDemoFallbackAllowed()) {
        return NextResponse.json({ status: "error" }, { status: 503 });
      }
      return NextResponse.json({ status: "ok" });
    }

    // Actively verify PostgreSQL query execution
    await db.execute(sql`SELECT 1`);

    return NextResponse.json(
      { status: "ok" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("[Health Check Probe Failure]:", err);
    return NextResponse.json(
      { status: "error" },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
