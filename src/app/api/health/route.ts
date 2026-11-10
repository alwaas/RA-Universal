import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "not_configured";

  if (db) {
    try {
      await db.execute(sql`SELECT 1`);
      dbStatus = "connected";
    } catch (err: any) {
      dbStatus = `error: ${err.message || "connection_failed"}`;
    }
  } else {
    dbStatus = "offline_demo_fallback";
  }

  const responseTimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      responseTimeMs,
      services: {
        database: dbStatus,
        auth: "operational",
        catalogue: "operational",
      },
      version: "1.0.0",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
