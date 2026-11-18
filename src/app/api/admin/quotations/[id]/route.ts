import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/rbac";
import { QuotationService } from "@/lib/services/quotation.service";
import type { QuotationStatus } from "@/types";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updated = await QuotationService.updateStatus(
      params.id,
      validated.status as QuotationStatus,
      validated.adminNotes
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Quotation not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to update quotation" } },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const success = await QuotationService.delete(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: { message: "Quotation not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Quotation deleted" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to delete quotation" } },
      { status: 500 }
    );
  }
}

