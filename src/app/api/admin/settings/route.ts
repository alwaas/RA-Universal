import { NextResponse, type NextRequest } from "next/server";
import { SettingsService } from "@/lib/services/settings.service";
import { requireAdminSession } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[SettingsAPI] Failed to get settings:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to retrieve store settings" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminSession(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const updated = await SettingsService.updateSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[SettingsAPI] Failed to update settings:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update store settings" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PATCH(req);
}
