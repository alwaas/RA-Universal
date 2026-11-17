import { NextResponse, type NextRequest } from "next/server";
import { ReportsService } from "@/lib/services/reports.service";
import { requireAdminSession } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminSession(req);
    if (auth instanceof NextResponse) return auth;

    const analytics = await ReportsService.getAnalytics();
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error("[ReportsAPI] Failed to fetch analytics:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to generate analytics report" } },
      { status: 500 }
    );
  }
}
