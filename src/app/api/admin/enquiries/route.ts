import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth/rbac";
import { EnquiryService } from "@/lib/services/enquiry.service";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const list = await EnquiryService.getEnquiries();

    return NextResponse.json({
      success: true,
      data: list,
      meta: { total: list.length },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ENQUIRIES_FETCH_FAILED",
          message: err.message || "Failed to retrieve customer inquiries",
        },
      },
      { status: 500 }
    );
  }
}
