/**
 * Demo Seed — Handloom demo catalogue for development and staging.
 *
 * Seeds:
 *  1. Production master data (admin, tags, welcome offer) via runProductionSeed
 *  2. 8 handloom demo products with images, colors, and tag mappings
 *
 * ⚠️  NEVER run in production unless SEED_DEMO_DATA=true is explicitly set.
 *     Demo product data should not be in a live catalogue.
 */
import { db } from "./index";
import {
  products,
  productImages,
  productColors,
  productTags,
  productTagMappings,
} from "./schema";
import { eq } from "drizzle-orm";
import { runProductionSeed } from "./seed-prod";

interface DemoColor {
  name: string;
  hexCode: string;
  imageUrl?: string;
  inStock?: boolean;
}

interface DemoImage {
  imageUrl: string;
  altText: string;
  colorName?: string;
  isPrimary: boolean;
  displayOrder?: number;
}

interface DemoProduct {
  title: string;
  slug: string;
  description: string;
  category: "gamchas" | "scarves_dupattas";
  fabric: string;
  mrp: number;
  sellingPrice: number;
  stockCount: number;
  status: "active" | "inactive";
  tagSlug?: string;
  colors: DemoColor[];
  images: DemoImage[];
}

const demoProducts: DemoProduct[] = [
  // ── GAMCHAS ───────────────────────────────────────────────────────────────
  {
    title: "Classic Bengal Cotton Gamcha - Heritage Red Check",
    slug: "classic-bengal-cotton-gamcha-red",
    description:
      "Traditional Bengali check handloom gamcha woven with 100% pure desi cotton. Exceptional water absorption, rapid drying, and durable double-stitched borders.",
    category: "gamchas",
    fabric: "100% Pure Bengal Weave Cotton",
    mrp: 399,
    sellingPrice: 199,
    stockCount: 25,
    status: "active",
    tagSlug: "best-selling",
    colors: [
      {
        name: "Traditional Red",
        hexCode: "#DC2626",
        imageUrl:
          "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Forest Green",
        hexCode: "#15803D",
        imageUrl:
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Indigo Blue",
        hexCode: "#1D4ED8",
        imageUrl:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
      },
    ],
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&auto=format&fit=crop&q=80",
        altText: "Traditional Red Check Gamcha - Front View",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
        altText: "Forest Green Check Gamcha Variant",
        isPrimary: false,
        displayOrder: 1,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
        altText: "Indigo Blue Check Gamcha Variant",
        isPrimary: false,
        displayOrder: 2,
      },
    ],
  },
  {
    title: "Sambalpuri Handloom Cotton Gamcha",
    slug: "sambalpuri-handloom-cotton-gamcha",
    description:
      "Authentic Sambalpuri weave gamcha from Odisha. Features traditional ikat-inspired border pattern with vibrant dual-tone checks.",
    category: "gamchas",
    fabric: "Handloom Sambalpuri Cotton",
    mrp: 449,
    sellingPrice: 249,
    stockCount: 2,
    status: "active",
    tagSlug: "only-2-3-left",
    colors: [
      {
        name: "Saffron & White",
        hexCode: "#F97316",
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Maroon & Cream",
        hexCode: "#881337",
        imageUrl:
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
      },
    ],
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
        altText: "Sambalpuri Gamcha - Saffron & White",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
        altText: "Sambalpuri Gamcha - Maroon & Cream",
        isPrimary: false,
        displayOrder: 1,
      },
    ],
  },
  {
    title: "Assam Phulam Gamosa Cotton",
    slug: "assam-phulam-gamosa-cotton",
    description:
      "Sacred Assamese gamosa with traditional phulam (floral) border in red and white. Used in Bihu festivals and as a mark of respect.",
    category: "gamchas",
    fabric: "Pure Assam Handloom Cotton",
    mrp: 599,
    sellingPrice: 399,
    stockCount: 12,
    status: "active",
    tagSlug: "best-selling",
    colors: [
      {
        name: "Classic Red & White",
        hexCode: "#DC2626",
        imageUrl:
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
      },
    ],
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
        altText: "Assam Phulam Gamosa - Red & White Border",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
        altText: "Assam Phulam Gamosa - Detail View",
        isPrimary: false,
        displayOrder: 1,
      },
    ],
  },
  {
    title: "Hand-Dyed Indigo Check Gamcha",
    slug: "hand-dyed-indigo-check-gamcha",
    description:
      "Naturally hand-dyed indigo check gamcha using traditional resist-dyeing. Each piece is unique with organic color variation.",
    category: "gamchas",
    fabric: "Khadi Cotton with Natural Indigo Dye",
    mrp: 549,
    sellingPrice: 349,
    stockCount: 0,
    status: "active",
    tagSlug: "out-of-stock",
    colors: [
      {
        name: "Natural Indigo",
        hexCode: "#312E81",
        inStock: false,
        imageUrl:
          "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Deep Teal",
        hexCode: "#134E4A",
        inStock: false,
        imageUrl:
          "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80",
      },
    ],
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
        altText: "Hand-Dyed Indigo Check Gamcha",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80",
        altText: "Deep Teal Check Variant",
        isPrimary: false,
        displayOrder: 1,
      },
    ],
  },
  // ── SCARVES / DUPATTAS ────────────────────────────────────────────────────
  {
    title: "Chanderi Silk Golden Zari Dupatta",
    slug: "chanderi-silk-golden-zari-dupatta",
    description:
      "Luxurious Chanderi silk dupatta with intricate golden zari border woven on handlooms in Madhya Pradesh. Perfect for weddings and festive occasions.",
    category: "scarves_dupattas",
    fabric: "Chanderi Silk with Zari Thread",
    mrp: 1499,
    sellingPrice: 999,
    stockCount: 8,
    status: "active",
    tagSlug: "sale",
    colors: [
      {
        name: "Royal Ivory",
        hexCode: "#F5F5DC",
        imageUrl:
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Deep Magenta",
        hexCode: "#9D174D",
        imageUrl:
          "https://images.unsplash.com/photo-1619029682309-7e51d2a53519?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Peacock Blue",
        hexCode: "#0E7490",
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
      },
    ],
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
        altText: "Chanderi Silk Dupatta - Royal Ivory with Zari",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1619029682309-7e51d2a53519?w=800&auto=format&fit=crop&q=80",
        altText: "Chanderi Silk Dupatta - Deep Magenta",
        isPrimary: false,
        displayOrder: 1,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
        altText: "Chanderi Silk Dupatta - Peacock Blue",
        isPrimary: false,
        displayOrder: 2,
      },
    ],
  },
  {
    title: "Kalamkari Natural Dye Cotton Dupatta",
    slug: "kalamkari-natural-dye-cotton-dupatta",
    description:
      "Hand-painted Kalamkari cotton dupatta featuring traditional Andhra mythological motifs using vegetable dyes. Each piece is a wearable artwork.",
    category: "scarves_dupattas",
    fabric: "100% Natural Cotton with Vegetable Dye",
    mrp: 899,
    sellingPrice: 649,
    stockCount: 15,
    status: "active",
    tagSlug: "best-selling",
    colors: [
      {
        name: "Earthy Ochre",
        hexCode: "#B45309",
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Rust Red",
        hexCode: "#9A3412",
        imageUrl:
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      },
    ],
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
        altText: "Kalamkari Cotton Dupatta - Earthy Ochre",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
        altText: "Kalamkari Cotton Dupatta - Rust Red",
        isPrimary: false,
        displayOrder: 1,
      },
    ],
  },
  {
    title: "Amritsari Phulkari Embroidered Dupatta",
    slug: "amritsari-phulkari-embroidered-dupatta",
    description:
      "Vibrant Phulkari embroidered dupatta from Punjab with dense floral embroidery on georgette base. A treasured tradition of Punjabi craftsmanship.",
    category: "scarves_dupattas",
    fabric: "Georgette with Phulkari Silk Thread Embroidery",
    mrp: 1299,
    sellingPrice: 899,
    stockCount: 6,
    status: "active",
    tagSlug: "sale",
    colors: [
      {
        name: "Bright Fuchsia",
        hexCode: "#DB2777",
        imageUrl:
          "https://images.unsplash.com/photo-1619029682309-7e51d2a53519?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Canary Yellow",
        hexCode: "#CA8A04",
        imageUrl:
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Royal Purple",
        hexCode: "#7E22CE",
        imageUrl:
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
      },
    ],
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1619029682309-7e51d2a53519?w=800&auto=format&fit=crop&q=80",
        altText: "Phulkari Dupatta - Bright Fuchsia",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
        altText: "Phulkari Dupatta - Canary Yellow",
        isPrimary: false,
        displayOrder: 1,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
        altText: "Phulkari Dupatta - Royal Purple",
        isPrimary: false,
        displayOrder: 2,
      },
    ],
  },
  {
    title: "Bandhani Tie-Dye Jaipuri Georgette Dupatta",
    slug: "bandhani-tie-dye-jaipuri-georgette-dupatta",
    description:
      "Classic Rajasthani Bandhani (tie-dye) dupatta on lightweight georgette. Features thousands of tiny dot patterns created by master artisans of Jaipur.",
    category: "scarves_dupattas",
    fabric: "Georgette with Bandhani Hand Tie-Dye",
    mrp: 1099,
    sellingPrice: 749,
    stockCount: 10,
    status: "active",
    tagSlug: "best-selling",
    colors: [
      {
        name: "Desert Sunset",
        hexCode: "#EA580C",
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Ocean Teal",
        hexCode: "#0F766E",
        imageUrl:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
      },
      {
        name: "Pomegranate Red",
        hexCode: "#B91C1C",
        imageUrl:
          "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&auto=format&fit=crop&q=80",
      },
    ],
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
        altText: "Bandhani Georgette Dupatta - Desert Sunset",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
        altText: "Bandhani Georgette Dupatta - Ocean Teal",
        isPrimary: false,
        displayOrder: 1,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&auto=format&fit=crop&q=80",
        altText: "Bandhani Georgette Dupatta - Pomegranate Red",
        isPrimary: false,
        displayOrder: 2,
      },
    ],
  },
];

export async function runDemoSeed(): Promise<void> {
  if (!db) {
    throw new Error(
      "DATABASE_URL is required for demo seed. Set it in .env.local."
    );
  }

  // 1. Run production seed first (admin, tags, offer)
  await runProductionSeed();

  // 2. Fetch all tags for slug → id mapping
  const allTags = await db.select().from(productTags);
  const tagBySlug = new Map(allTags.map((t) => [t.slug, t.id]));

  console.log("\nSeeding demo catalogue products...");

  // 3. Insert each demo product in a transaction
  for (const demo of demoProducts) {
    await db.transaction(async (tx) => {
      // Check if slug already exists (idempotent)
      const existing = await tx
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, demo.slug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ⚠ Skipping "${demo.slug}" — already exists`);
        return;
      }

      const [product] = await tx
        .insert(products)
        .values({
          title: demo.title,
          slug: demo.slug,
          description: demo.description,
          category: demo.category,
          fabric: demo.fabric,
          mrp: demo.mrp.toString(),
          sellingPrice: demo.sellingPrice.toString(),
          status: demo.status,
          stockCount: demo.stockCount,
        })
        .returning();

      if (!product) throw new Error(`Failed to insert product: ${demo.slug}`);

      // Insert images
      await tx.insert(productImages).values(
        demo.images.map((img) => ({
          productId: product.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          colorName: img.colorName || null,
          displayOrder: img.displayOrder ?? 0,
          isPrimary: img.isPrimary,
        }))
      );

      // Insert colors
      await tx.insert(productColors).values(
        demo.colors.map((c) => ({
          productId: product.id,
          name: c.name,
          hexCode: c.hexCode,
          imageUrl: c.imageUrl ?? null,
          inStock: c.inStock ?? true,
        }))
      );

      // Insert tag mapping
      if (demo.tagSlug) {
        const tagId = tagBySlug.get(demo.tagSlug);
        if (tagId) {
          await tx.insert(productTagMappings).values({
            productId: product.id,
            tagId,
          });
        }
      }

      console.log(`  ✓ Seeded: ${demo.title}`);
    });
  }

  console.log("\nDemo seed completed successfully. 8 products loaded.");
}

// Allow direct invocation: ts-node src/db/seed-demo.ts
if (require.main === module) {
  runDemoSeed()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ Demo seed failed:", message);
      process.exit(1);
    });
}
