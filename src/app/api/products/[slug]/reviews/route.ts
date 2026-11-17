import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ProductService } from "@/lib/services/product.service";
import { ReviewService } from "@/lib/services/review.service";

export const dynamic = "force-dynamic";

const createReviewSchema = z.object({
  customerName: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional(),
  comment: z.string().min(5).max(1000),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await ProductService.getProductBySlug(params.slug);
    if (!product) {
      return NextResponse.json(
        { success: false, error: { message: "Product not found" } },
        { status: 404 }
      );
    }

    const reviews = await ReviewService.getByProductId(product.id);
    return NextResponse.json({ success: true, data: reviews });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Failed to load reviews" } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await ProductService.getProductBySlug(params.slug);
    if (!product) {
      return NextResponse.json(
        { success: false, error: { message: "Product not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = createReviewSchema.parse(body);

    const newReview = await ReviewService.create({
      productId: product.id,
      customerName: data.customerName,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      isVerifiedPurchase: true,
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Invalid review submission" } },
      { status: 400 }
    );
  }
}
