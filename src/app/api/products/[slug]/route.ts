import { NextResponse, type NextRequest } from "next/server";
import { ProductService } from "@/lib/services/product.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await ProductService.getProductBySlug(params.slug);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Product with slug '${params.slug}' does not exist`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_FETCH_FAILED",
          message: err.message || "Failed to fetch product details",
        },
      },
      { status: 500 }
    );
  }
}
