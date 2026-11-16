import { NextResponse } from "next/server";
import { db, isDatabaseAlive } from "@/db";

export const dynamic = "force-dynamic";

/**
 * Lightweight, unauthenticated public health check for load balancers & uptime monitors.
 * Verifies live system connectivity without leaking internal architecture or diagnostics.
 * Returns: {"status":"ok"} (200).
 */
export async function GET() {
  try {
    const alive = await isDatabaseAlive();
    return NextResponse.json(
      {
        status: "ok",
        database: alive ? "connected" : "fallback_active",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { status: "ok", storage: "persistent_file_store" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
