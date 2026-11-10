import { NextResponse, type NextRequest } from "next/server";
import { ProductService, type ProductQueryFilters } from "@/lib/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: ProductQueryFilters = {
      category: (searchParams.get("category") as any) || undefined,
      color: searchParams.get("color") || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      sort: (searchParams.get("sort") as any) || "newest",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 12,
      status: "active",
    };

    const result = await ProductService.getProducts(filters);

    return NextResponse.json({
      success: true,
      data: result.products,
      meta: {
        total: result.total,
        page: filters.page,
        limit: filters.limit,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CATALOGUE_FETCH_FAILED",
          message: err.message || "Failed to load product catalogue",
        },
      },
      { status: 500 }
    );
  }
}
