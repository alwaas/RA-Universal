import { NextResponse, type NextRequest } from "next/server";
import { enquiryCreateSchema } from "@/lib/validation/enquiry.schema";
import { EnquiryService } from "@/lib/services/enquiry.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = enquiryCreateSchema.parse(body);

    const record = await EnquiryService.createEnquiry(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: {
          enquiryId: record.id,
          message:
            record.type === "b2b"
              ? "Your wholesale enquiry has been received. Our sales desk will contact you within 24 hours."
              : "Order intent recorded. Connecting with weaver desk.",
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid enquiry submission data",
            details: err.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ENQUIRY_SUBMISSION_FAILED",
          message: err.message || "Failed to submit enquiry",
        },
      },
      { status: 500 }
    );
  }
}
