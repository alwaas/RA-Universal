import * as bcrypt from "bcryptjs";
import { db } from "./index";
import {
  users,
  productTags,
  offers,
  products,
  productImages,
  productColors,
  productTagMappings,
} from "./schema";
import seedProductsData from "../data/seedProducts.json";

export async function runSeed() {
  if (!db) {
    console.log("No DATABASE_URL configured or database connection offline. Skipping database seeding.");
    return;
  }

  console.log("Starting database seeding for RA Heritage Weaves...");

  try {
    // 1. Seed Admin User
    const adminPhone = process.env.ADMIN_DEFAULT_PHONE || "9999999999";
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "SuperSecureAdminPassword2026!";
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await db
      .insert(users)
      .values({
        fullName: "Store Administrator",
        phone: adminPhone,
        email: "admin@ra-heritage.in",
        passwordHash,
        role: "admin",
      })
      .onConflictDoNothing();

    console.log(`Admin user verified: ${adminPhone}`);

    // 2. Seed Tags
    const defaultBadges = [
      { name: "Best Selling", slug: "best-selling", badgeColor: "yellow" as const },
      { name: "Only 2-3 Left", slug: "only-2-3-left", badgeColor: "orange" as const },
      { name: "Sale", slug: "sale", badgeColor: "red" as const },
      { name: "Out of Stock", slug: "out-of-stock", badgeColor: "gray" as const },
    ];

    const insertedTags: Record<string, string> = {};

    for (const tag of defaultBadges) {
      const [record] = await db
        .insert(productTags)
        .values({
          name: tag.name,
          slug: tag.slug,
          badgeColor: tag.badgeColor,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: productTags.slug,
          set: { badgeColor: tag.badgeColor },
        })
        .returning();

      if (record) {
        insertedTags[record.slug] = record.id;
      }
    }

    console.log("Product corner badges seeded.");

    // 3. Seed Promotional Offer
    await db
      .insert(offers)
      .values({
        title: "First Order Free Delivery Across India",
        description:
          "Experience the pure comfort of traditional handloom scarves, dupattas, and gamchas with zero delivery charges.",
        couponCode: "FIRSTFREE",
        bannerImageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
        isPopupActive: true,
      })
      .onConflictDoNothing();

    console.log("Welcome offer popup seeded.");

    // 4. Seed Products
    for (const item of seedProductsData) {
      const [productRecord] = await db
        .insert(products)
        .values({
          title: item.title,
          slug: item.slug,
          description: item.description,
          category: item.category as any,
          fabric: item.fabric,
          mrp: item.mrp.toString(),
          sellingPrice: item.sellingPrice.toString(),
          status: item.status as any,
          stockCount: item.stockCount,
        })
        .onConflictDoUpdate({
          target: products.slug,
          set: {
            title: item.title,
            description: item.description,
            sellingPrice: item.sellingPrice.toString(),
            stockCount: item.stockCount,
          },
        })
        .returning();

      if (productRecord) {
        // Insert Image
        if (item.images && item.images.length > 0) {
          for (const img of item.images) {
            await db.insert(productImages).values({
              productId: productRecord.id,
              imageUrl: img.imageUrl,
              altText: img.altText || item.title,
              isPrimary: Boolean(img.isPrimary),
              displayOrder: 0,
            });
          }
        }

        // Insert Colors
        if (item.colors && item.colors.length > 0) {
          for (const color of item.colors) {
            await db.insert(productColors).values({
              productId: productRecord.id,
              name: color.name,
              hexCode: color.hexCode,
              inStock: true,
            });
          }
        }

        // Insert Tag Mapping
        if (item.badge && insertedTags[item.badge.slug]) {
          await db
            .insert(productTagMappings)
            .values({
              productId: productRecord.id,
              tagId: insertedTags[item.badge.slug]!,
            })
            .onConflictDoNothing();
        }
      }
    }

    console.log(`Seeded ${seedProductsData.length} handloom products with images, colors, and badges successfully.`);
    console.log("Database seeding completed.");
  } catch (error) {
    console.error("Error running database seed:", error);
  }
}

// Auto-run if executed directly via tsx
if (require.main === module) {
  runSeed().then(() => process.exit(0));
}
