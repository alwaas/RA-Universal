import { NextResponse } from "next/server";
import { db, isDatabaseAlive } from "@/db";

const defaultBadges = [
  { id: "tag-best-seller", name: "Best Selling", slug: "best-selling", badgeColor: "yellow", isActive: true },
  { id: "tag-low-stock", name: "Only 2-3 Left", slug: "only-2-3-left", badgeColor: "orange", isActive: true },
  { id: "tag-sale", name: "Sale", slug: "sale", badgeColor: "red", isActive: true },
  { id: "tag-out-of-stock", name: "Out of Stock", slug: "out-of-stock", badgeColor: "gray", isActive: true },
];

export async function GET() {
  try {
    const alive = await isDatabaseAlive();
    if (alive && db) {
      try {
        const tags = await db.query.productTags.findMany();
        return NextResponse.json({
          success: true,
          data: tags.length > 0 ? tags : defaultBadges,
        });
      } catch (dbErr) {
        console.warn("[TagsRoute] DB query failed, using default badges:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: defaultBadges,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      data: defaultBadges,
    });
  }
}
