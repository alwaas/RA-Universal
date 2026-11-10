import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth/rbac";
import { OfferService } from "@/lib/services/offer.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const isActive = Boolean(body.isPopupActive);

    await OfferService.setPopupActive(params.id, isActive);

    return NextResponse.json({
      success: true,
      data: { message: `Offer popup ${isActive ? "activated" : "deactivated"} successfully` },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "OFFER_UPDATE_FAILED",
          message: err.message || "Failed to update offer popup status",
        },
      },
      { status: 500 }
    );
  }
}
