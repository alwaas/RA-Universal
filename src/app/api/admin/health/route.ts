import { NextResponse, type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { requireAdminSession } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  const startTime = Date.now();
  let dbStatus = "not_configured";
  let dbLatencyMs: number | null = null;

  if (db) {
    try {
      const t = Date.now();
      await db.execute(sql`SELECT 1`);
      dbLatencyMs = Date.now() - t;
      dbStatus = "connected";
    } catch (err) {
      console.error("[Admin Health] DB probe failed:", err);
      dbStatus = "unreachable";
    }
  }

  const isHealthy =
    dbStatus === "connected" || dbStatus === "not_configured";

  return NextResponse.json(
    {
      success: true,
      data: {
        status: isHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        environment: process.env.NODE_ENV ?? "development",
        diagnostics: {
          database: { status: dbStatus, latencyMs: dbLatencyMs },
          storage: {
            isCloudinaryConfigured: Boolean(
              process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET
            ),
          },
          memoryUsageMb: Math.round(
            process.memoryUsage().rss / (1024 * 1024)
          ),
          responseTimeMs: Date.now() - startTime,
        },
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
