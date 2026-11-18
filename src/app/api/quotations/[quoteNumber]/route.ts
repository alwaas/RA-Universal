import { NextResponse, type NextRequest } from "next/server";
import { QuotationService } from "@/lib/services/quotation.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { quoteNumber: string } }
) {
  try {
    const quote = await QuotationService.getByNumber(params.quoteNumber);
    if (!quote) {
      return NextResponse.json(
        { success: false, error: { message: "Quotation not found or expired" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: quote });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to fetch quotation" } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { quoteNumber: string } }
) {
  try {
    const quote = await QuotationService.getByNumber(params.quoteNumber);
    if (!quote) {
      return NextResponse.json(
        { success: false, error: { message: "Quotation not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const action = body.action; // "accept" | "reject"

    if (action === "accept") {
      const updated = await QuotationService.updateStatus(quote.id, "accepted", "Accepted by wholesale customer online");
      return NextResponse.json({ success: true, data: updated, message: "Quotation accepted successfully" });
    } else if (action === "reject") {
      const updated = await QuotationService.updateStatus(quote.id, "rejected", "Declined by wholesale customer");
      return NextResponse.json({ success: true, data: updated, message: "Quotation declined" });
    }

    return NextResponse.json(
      { success: false, error: { message: "Invalid action. Expected 'accept' or 'reject'." } },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to process quotation action" } },
      { status: 500 }
    );
  }
}

