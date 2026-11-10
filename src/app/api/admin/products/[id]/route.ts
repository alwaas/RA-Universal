import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth/rbac";
import { productUpdateSchema } from "@/lib/validation/product.schema";
import { ProductService } from "@/lib/services/product.service";

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
    const validatedData = productUpdateSchema.parse(body);

    await ProductService.updateProduct(params.id, validatedData);

    return NextResponse.json({
      success: true,
      data: { message: "Product updated successfully" },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid product update data",
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
          code: "PRODUCT_UPDATE_FAILED",
          message: err.message || "Failed to update product",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    await ProductService.deleteProduct(params.id);

    return NextResponse.json({
      success: true,
      data: { message: "Product deleted successfully" },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_DELETE_FAILED",
          message: err.message || "Failed to delete product",
        },
      },
      { status: 500 }
    );
  }
}
