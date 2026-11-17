import { NextResponse, type NextRequest } from "next/server";
import { ReturnsService } from "@/lib/services/returns.service";
import { requireAdminSession } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber");

    if (orderNumber) {
      const returns = await ReturnsService.getByOrderNumber(orderNumber);
      return NextResponse.json({ success: true, data: returns });
    }

    const auth = await requireAdminSession(req);
    if (auth instanceof NextResponse) return auth;

    const allReturns = await ReturnsService.getAll();
    return NextResponse.json({ success: true, data: allReturns });
  } catch (error) {
    console.error("[ReturnsAPI] Failed to get returns:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to retrieve return requests" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, customerName, customerPhone, reason, resolution, comments, imageUrl } = body;

    if (!orderNumber || !customerName || !customerPhone || !reason || !resolution) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required return details." } },
        { status: 400 }
      );
    }

    const returnRequest = await ReturnsService.create({
      orderNumber,
      customerName,
      customerPhone,
      reason,
      resolution,
      comments: comments || "",
      imageUrl: imageUrl || undefined,
    });

    return NextResponse.json({ success: true, data: returnRequest }, { status: 201 });
  } catch (error) {
    console.error("[ReturnsAPI] Failed to create return request:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to initiate return request" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminSession(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: { message: "Return ID and new status are required." } },
        { status: 400 }
      );
    }

    const updated = await ReturnsService.updateStatus(id, status, adminNotes);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Return request not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id, status, adminNotes } });
  } catch (error) {
    console.error("[ReturnsAPI] Failed to update return request:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update return request" } },
      { status: 500 }
    );
  }
}
