import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth/rbac";
import { productCreateSchema } from "@/lib/validation/product.schema";
import { ProductService } from "@/lib/services/product.service";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    // Admin sees all products (both active and inactive)
    const result = await ProductService.getProducts({ limit: 100 });
    return NextResponse.json({
      success: true,
      data: result.products,
      meta: { total: result.total },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ADMIN_PRODUCTS_FETCH_FAILED",
          message: err.message || "Failed to load products for administration",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const validatedData = productCreateSchema.parse(body);

    const createdProduct = await ProductService.createProduct(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: createdProduct,
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
            message: "Invalid product information",
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
          code: "PRODUCT_CREATION_FAILED",
          message: err.message || "Failed to create new product",
        },
      },
      { status: 500 }
    );
  }
}
