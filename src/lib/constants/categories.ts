import type { ProductCategory } from "@/types";

export interface CategoryDefinition {
  id: ProductCategory;
  name: string;
  shortName: string;
  slug: string;
  tagline: string;
  description: string;
  subcategories: string[];
  commonFabrics: string[];
  defaultMoq: number;
  bannerImage: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "mens_gamcha",
    name: "Men's Gamcha",
    shortName: "Gamchas",
    slug: "mens-gamcha",
    tagline: "100% Pure Hand-Spun Cotton Daily & Traditional Gamchas",
    description: "Highly absorbent, quick-drying Bengal, Odisha Sambalpuri, and Assam Phulam Gamosas woven on traditional shuttle looms.",
    subcategories: ["Bengal Cotton Gamcha", "Sambalpuri Ikat Gamcha", "Assamese Phulam Gamosa", "South Indian Thundu", "Check Weave Towel"],
    commonFabrics: ["100% Breathable Cotton", "Hand-Spun Khadi Cotton", "Mulmul Cotton", "Mercerized Cotton"],
    defaultMoq: 50,
    bannerImage: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=1200",
  },
  {
    id: "womens_dupatta",
    name: "Women's Dupatta",
    shortName: "Dupattas",
    slug: "womens-dupatta",
    tagline: "Graceful Handcrafted Dupattas with Authentic Zari & Needlework",
    description: "Banarasi silk brocade, Chanderi zari borders, vibrant Kalamkari block prints, and airy Mulmul dupattas for festive and everyday elegance.",
    subcategories: ["Banarasi Silk Dupatta", "Chanderi Zari Dupatta", "Kalamkari Handblock Dupatta", "Phulkari Embroidered Dupatta", "Kota Doria Dupatta"],
    commonFabrics: ["Pure Chanderi Silk-Cotton", "Varanasi Katan Silk", "Mulmul Cotton", "Tussar Silk", "Organza"],
    defaultMoq: 25,
    bannerImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200",
  },
  {
    id: "scarves",
    name: "Scarves",
    shortName: "Scarves",
    slug: "scarves",
    tagline: "Modern Artisanal Scarves for Everyday Fashion & Boutique Retail",
    description: "Floral prints, intricate Jacquard weaves, luxury satin wraps, and geometric modern designs for effortless styling.",
    subcategories: ["Floral Print Scarves", "Jacquard Woven Scarves", "Luxury Satin Scarves", "Geometric & Abstract Scarves", "Lightweight Casual Wraps"],
    commonFabrics: ["Modal Silk", "Pure Cotton Satin", "Viscose Jacquard", "Linen-Cotton Blend", "Crepe"],
    defaultMoq: 50,
    bannerImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200",
  },
  {
    id: "stoles",
    name: "Stoles",
    shortName: "Stoles",
    slug: "stoles",
    tagline: "Warm & Lightweight Year-Round Handloom Stoles",
    description: "Handcrafted unisex stoles featuring delicate woven borders, fine tassels, and soothing natural dyes for workwear and evening warmth.",
    subcategories: ["Wool-Blend Winter Stoles", "Linen Summer Stoles", "Pashmina-Style Fine Wraps", "Embroidered Border Stoles", "Tussar Silk Stoles"],
    commonFabrics: ["Fine Merino Wool Blend", "Pure Handloom Linen", "Modal Pashmina", "Ahimsa Silk"],
    defaultMoq: 30,
    bannerImage: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=1200",
  },
  {
    id: "lungi",
    name: "Lungi & Traditional Bottoms",
    shortName: "Lungis",
    slug: "lungi",
    tagline: "Authentic Comfort Woven Cotton Lungis & Mundus",
    description: "Durable yarn-dyed checks, classic Kerala kasavu borders, and traditional South Indian temple border lungis woven for breezy durability.",
    subcategories: ["Classic Check Woven Lungi", "Kerala Kasavu Border Mundu", "Printed Cotton Lungi", "Double Mundu / Dhoti", "Kaili Weave Lungi"],
    commonFabrics: ["100% Combed Cotton", "Heavy-Twist Handloom Yarn", "Mercerized Khadi"],
    defaultMoq: 50,
    bannerImage: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1200",
  },
  {
    id: "textile_fabrics",
    name: "Textile Fabrics & Running Yardage",
    shortName: "Fabrics",
    slug: "textile-fabrics",
    tagline: "Wholesale Running Fabric by the Metre for Designers & Manufacturers",
    description: "High-grade loom-state and processed yardage in cotton, silk, linen, and handloom blends suitable for garment stitching and interior decor.",
    subcategories: ["Mulmul Cotton Fabric", "Kalamkari Yardage", "Chanderi Silk Fabric", "Ikat Handloom Fabric", "Raw Silk & Khadi Yardage"],
    commonFabrics: ["60s Count Fine Mulmul", "Hand-Spun Khadi", "Pure Silk Brocade", "Linen 80s Count"],
    defaultMoq: 100, // 100 metres
    bannerImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200",
  },
  {
    id: "handloom_products",
    name: "Handloom Heritage Products",
    shortName: "Handloom",
    slug: "handloom-products",
    tagline: "Geographical Indication (GI) & Master Weaver Creations",
    description: "Exclusive GI-tagged textiles directly preserving generational weaving traditions from master artisan looms across India.",
    subcategories: ["Banarasi Handloom Brocade", "Patan Patola / Ikat", "Baluchari & Jamdani", "Chanderi Extra Weft", "Maheshwari Handloom"],
    commonFabrics: ["Zari-Embedded Katan Silk", "Pure Mulberry Silk", "Fine Cotton Jamdani"],
    defaultMoq: 10,
    bannerImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200",
  },
  {
    id: "other_textiles",
    name: "Other Textile Products",
    shortName: "Other Textiles",
    slug: "other-textiles",
    tagline: "Handcrafted Table Linen, Kitchen Towels & Artisan Accessories",
    description: "Complementary textile crafts including hand-blocked cushion covers, cotton dining runners, placemats, and woven accessories.",
    subcategories: ["Handloom Table Runners", "Cotton Kitchen Towels", "Block-Printed Cushion Covers", "Fabric Tote Bags", "Napkin Sets"],
    commonFabrics: ["Heavy Canvas Cotton", "Woven Slub Linen", "Natural Dyed Cotton"],
    defaultMoq: 50,
    bannerImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200",
  },
];

/**
 * Normalizes legacy category slugs to current standard identifiers
 */
export function normalizeCategory(cat?: string | null): ProductCategory {
  if (!cat) return "mens_gamcha";
  const lower = cat.toLowerCase().trim();
  if (lower === "gamchas" || lower === "gamcha" || lower === "mens_gamcha" || lower === "mens-gamcha") {
    return "mens_gamcha";
  }
  if (lower === "scarves_dupattas" || lower === "dupattas" || lower === "dupatta" || lower === "womens_dupatta" || lower === "womens-dupatta") {
    return "womens_dupatta";
  }
  if (lower === "scarves" || lower === "scarf") {
    return "scarves";
  }
  if (lower === "stoles" || lower === "stole") {
    return "stoles";
  }
  if (lower === "lungi" || lower === "lungis" || lower === "mundu") {
    return "lungi";
  }
  if (lower === "textile_fabrics" || lower === "textile-fabrics" || lower === "fabrics" || lower === "fabric") {
    return "textile_fabrics";
  }
  if (lower === "handloom_products" || lower === "handloom-products" || lower === "handloom") {
    return "handloom_products";
  }
  if (lower === "other_textiles" || lower === "other-textiles" || lower === "home") {
    return "other_textiles";
  }
  return (lower as ProductCategory) || "mens_gamcha";
}

export function getCategoryDefinition(cat: string): CategoryDefinition {
  const normalized = normalizeCategory(cat);
  const found = CATEGORIES.find((c) => c.id === normalized);
  return found || CATEGORIES[0];
}
