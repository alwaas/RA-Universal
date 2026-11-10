import { NextResponse } from "next/server";
import { OfferService } from "@/lib/services/offer.service";

export async function GET() {
  try {
    const activeOffer = await OfferService.getActiveOffer();

    return NextResponse.json({
      success: true,
      data: activeOffer,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "OFFER_FETCH_FAILED",
          message: err.message || "Failed to load active promotional offer",
        },
      },
      { status: 500 }
    );
  }
}
