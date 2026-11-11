import { eq, and, desc, asc, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  products,
  productImages,
  productColors,
  productTags,
  productTagMappings,
} from "@/db/schema";
import type { ProductCreateInput, ProductUpdateInput } from "@/lib/validation/product.schema";
import type { Product, ProductCategory } from "@/types";
import seedProductsData from "@/data/seedProducts.json";

export interface ProductQueryFilters {
  category?: ProductCategory;
  status?: "active" | "inactive";
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "discount_desc" | "newest";
  page?: number;
  limit?: number;
}

// In-memory product state for consistent demo CRUD operations when PostgreSQL is offline
const inMemoryProducts: Product[] = JSON.parse(JSON.stringify(seedProductsData));

/**
 * Checks whether fallback to in-memory demo catalogue is permitted.
 * By default, fallback is allowed so local environments, previews, and testing can
 * smoothly view the authentic handloom catalogue even when a local PostgreSQL server is not running.
 * Fallback is only blocked when ENABLE_DEMO_FALLBACK="false" is explicitly set in production.
 */
export function isDemoFallbackAllowed(): boolean {
  if (process.env.ENABLE_DEMO_FALLBACK === "false") {
    return false;
  }
  return true;
}

export class ProductService {
  /**
   * Generates a URL-friendly slug from title.
   */
  static slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  /**
   * Retrieves products with relations, filtering, and sorting.
   */
  static async getProducts(filters: ProductQueryFilters = {}): Promise<{ products: Product[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    if (db) {
      try {
        const conditions = [];

        if (filters.status) {
          conditions.push(eq(products.status, filters.status));
        } else {
          // Default to active for storefront
          conditions.push(eq(products.status, "active"));
        }

        if (filters.category) {
          conditions.push(eq(products.category, filters.category));
        }

        if (filters.minPrice !== undefined) {
          conditions.push(sql`${products.sellingPrice} >= ${filters.minPrice}`);
        }

        if (filters.maxPrice !== undefined) {
          conditions.push(sql`${products.sellingPrice} <= ${filters.maxPrice}`);
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        let orderByClause = desc(products.createdAt);
        if (filters.sort === "price_asc") orderByClause = asc(products.sellingPrice);
        if (filters.sort === "price_desc") orderByClause = desc(products.sellingPrice);
        if (filters.sort === "discount_desc") {
          orderByClause = desc(sql`(${products.mrp} - ${products.sellingPrice}) / ${products.mrp}`);
        }

        const rawProducts = await db.query.products.findMany({
          where: whereClause,
          orderBy: [orderByClause],
          limit,
          offset,
          with: {
            images: {
              orderBy: [asc(productImages.displayOrder)],
            },
            colors: true,
            tagMappings: {
              with: {
                tag: true,
              },
            },
          },
        });

        const formatted: Product[] = rawProducts.map((p) => {
          const mrpNum = Number(p.mrp);
          const sellingNum = Number(p.sellingPrice);
          const discountPercentage =
            mrpNum > sellingNum ? Math.round(((mrpNum - sellingNum) / mrpNum) * 100) : 0;

          const primaryTag = p.tagMappings[0]?.tag;

          return {
            id: p.id,
            sku: p.sku || `RA-${p.category === "gamchas" ? "GAM" : "DUP"}-${p.id.slice(0, 5).toUpperCase()}`,
            title: p.title,
            slug: p.slug,
            description: p.description,
            category: p.category as Product["category"],
            fabric: p.fabric,
            mrp: mrpNum,
            sellingPrice: sellingNum,
            discountPercentage,
            status: p.status as Product["status"],
            stockCount: p.stockCount,
            images: p.images.map((img) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              altText: img.altText || undefined,
              colorName: img.colorName || undefined,
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder,
            })),
            colors: p.colors.map((c) => ({
              id: c.id,
              name: c.name,
              hexCode: c.hexCode,
              imageUrl: c.imageUrl || undefined,
              inStock: c.inStock,
            })),
            badge: primaryTag
              ? {
                  id: primaryTag.id,
                  name: primaryTag.name,
                  slug: primaryTag.slug,
                  badgeColor: primaryTag.badgeColor as any,
                }
              : null,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
        });

        return { products: formatted, total: formatted.length };
      } catch (err: any) {
        console.warn("Database query failed:", err?.message || err);
        if (!isDemoFallbackAllowed()) {
          throw new Error("DATABASE_UNAVAILABLE: Storefront database is currently offline or unreachable.");
        }
      }
    }

    // Graceful fallback to in-memory catalogue only when allowed
    if (!isDemoFallbackAllowed()) {
      throw new Error("DATABASE_UNAVAILABLE: Production database connection is offline. Storefront is in maintenance mode.");
    }
    let items = [...inMemoryProducts];
    if (filters.status) {
      items = items.filter((p) => p.status === filters.status);
    }
    if (filters.category) {
      items = items.filter((p) => p.category === filters.category);
    }
    if (filters.minPrice !== undefined) {
      items = items.filter((p) => p.sellingPrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      items = items.filter((p) => p.sellingPrice <= filters.maxPrice!);
    }

    if (filters.sort === "price_asc") {
      items.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (filters.sort === "price_desc") {
      items.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (filters.sort === "discount_desc") {
      items.sort((a, b) => b.discountPercentage - a.discountPercentage);
    }

    return { products: items, total: items.length };
  }

  /**
   * Retrieves single product by slug.
   */
  static async getProductBySlug(slug: string): Promise<Product | null> {
    if (db) {
      try {
        const p = await db.query.products.findFirst({
          where: eq(products.slug, slug),
          with: {
            images: {
              orderBy: [asc(productImages.displayOrder)],
            },
            colors: true,
            tagMappings: {
              with: {
                tag: true,
              },
            },
          },
        });

        if (p) {
          const mrpNum = Number(p.mrp);
          const sellingNum = Number(p.sellingPrice);
          const discountPercentage =
            mrpNum > sellingNum ? Math.round(((mrpNum - sellingNum) / mrpNum) * 100) : 0;
          const primaryTag = p.tagMappings[0]?.tag;

          return {
            id: p.id,
            sku: p.sku || `RA-${p.category === "gamchas" ? "GAM" : "DUP"}-${p.id.slice(0, 5).toUpperCase()}`,
            title: p.title,
            slug: p.slug,
            description: p.description,
            category: p.category as Product["category"],
            fabric: p.fabric,
            mrp: mrpNum,
            sellingPrice: sellingNum,
            discountPercentage,
            status: p.status as Product["status"],
            stockCount: p.stockCount,
            images: p.images.map((img) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              altText: img.altText || undefined,
              colorName: img.colorName || undefined,
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder,
            })),
            colors: p.colors.map((c) => ({
              id: c.id,
              name: c.name,
              hexCode: c.hexCode,
              imageUrl: c.imageUrl || undefined,
              inStock: c.inStock,
            })),
            badge: primaryTag
              ? {
                  id: primaryTag.id,
                  name: primaryTag.name,
                  slug: primaryTag.slug,
                  badgeColor: primaryTag.badgeColor as any,
                }
              : null,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
        }
      } catch (err: any) {
        console.warn("Database lookup by slug failed:", err?.message || err);
        if (!isDemoFallbackAllowed()) {
          throw new Error("DATABASE_UNAVAILABLE: Storefront database is currently offline or unreachable.");
        }
      }
    }

    if (!isDemoFallbackAllowed()) {
      return null;
    }

    const fallback = inMemoryProducts.find((p) => p.slug === slug);
    return fallback || null;
  }

  /**
   * Creates a new product with images and color variants in a transaction.
   */
  static async createProduct(input: ProductCreateInput): Promise<Product> {
    const slug = input.slug || this.slugify(input.title) + "-" + Math.random().toString(36).substring(2, 6);

    if (db) {
      return await db.transaction(async (tx) => {
        const generatedSku =
          input.sku || `RA-${input.category === "gamchas" ? "GAM" : "DUP"}-${Date.now().toString().slice(-5)}`;
        const [newProduct] = await tx
          .insert(products)
          .values({
            title: input.title,
            slug,
            sku: generatedSku,
            description: input.description,
            category: input.category,
            fabric: input.fabric,
            mrp: input.mrp.toString(),
            sellingPrice: input.sellingPrice.toString(),
            status: input.status || "active",
            stockCount: input.stockCount || 10,
          })
          .returning();

        if (!newProduct) {
          throw new Error("Failed to insert product record.");
        }

        // Insert Images
        if (input.images && input.images.length > 0) {
          await tx.insert(productImages).values(
            input.images.map((img, idx) => ({
              productId: newProduct.id,
              imageUrl: img.imageUrl,
              altText: img.altText || input.title,
              colorName: img.colorName || null,
              displayOrder: img.displayOrder ?? idx,
              isPrimary: img.isPrimary ?? idx === 0,
            }))
          );
        }

        // Insert Colors
        if (input.colors && input.colors.length > 0) {
          await tx.insert(productColors).values(
            input.colors.map((c) => ({
              productId: newProduct.id,
              name: c.name,
              hexCode: c.hexCode,
              imageUrl: c.imageUrl || null,
              inStock: c.inStock ?? true,
            }))
          );
        }

        // Insert Tag Mapping
        if (input.tagId) {
          await tx.insert(productTagMappings).values({
            productId: newProduct.id,
            tagId: input.tagId,
          });
        }

        const created = await this.getProductBySlug(newProduct.slug);
        if (!created) throw new Error("Product created but could not be re-queried.");
        return created;
      });
    }

    if (!isDemoFallbackAllowed()) {
      throw new Error("DATABASE_UNAVAILABLE: Cannot create product without active database connection in production.");
    }

    // In-memory demo fallback
    const mrp = Number(input.mrp);
    const sellingPrice = Number(input.sellingPrice);
    const discountPercentage = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: input.sku || `RA-${input.category === "gamchas" ? "GAM" : "DUP"}-${Date.now().toString().slice(-5)}`,
      title: input.title,
      slug,
      description: input.description,
      category: input.category,
      fabric: input.fabric,
      mrp,
      sellingPrice,
      discountPercentage,
      status: input.status || "active",
      stockCount: input.stockCount || 10,
      images: input.images.map((img, i) => ({
        id: `img-${Date.now()}-${i}`,
        imageUrl: img.imageUrl,
        altText: img.altText,
        colorName: img.colorName || null,
        isPrimary: img.isPrimary || i === 0,
        displayOrder: img.displayOrder ?? i,
      })),
      colors: input.colors.map((c, i) => ({
        id: `col-${Date.now()}-${i}`,
        name: c.name,
        hexCode: c.hexCode,
        imageUrl: c.imageUrl || null,
        inStock: c.inStock ?? true,
      })),
      badge: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryProducts.unshift(newProd);
    return newProd;
  }

  /**
   * Updates an existing product.
   */
  static async updateProduct(id: string, input: ProductUpdateInput): Promise<boolean> {
    if (db) {
      return await db.transaction(async (tx) => {
        const updateData: any = {};
        if (input.sku) updateData.sku = input.sku;
        if (input.title) updateData.title = input.title;
        if (input.slug) updateData.slug = input.slug;
        if (input.description) updateData.description = input.description;
        if (input.category) updateData.category = input.category;
        if (input.fabric) updateData.fabric = input.fabric;
        if (input.mrp) updateData.mrp = input.mrp.toString();
        if (input.sellingPrice) updateData.sellingPrice = input.sellingPrice.toString();
        if (input.status) updateData.status = input.status;
        if (input.stockCount !== undefined) updateData.stockCount = input.stockCount;
        updateData.updatedAt = new Date();

        await tx.update(products).set(updateData).where(eq(products.id, id));

        // Update Images if provided
        if (input.images && input.images.length > 0) {
          await tx.delete(productImages).where(eq(productImages.productId, id));
          await tx.insert(productImages).values(
            input.images.map((img, idx) => ({
              productId: id,
              imageUrl: img.imageUrl,
              altText: img.altText,
              colorName: img.colorName || null,
              displayOrder: img.displayOrder ?? idx,
              isPrimary: img.isPrimary ?? idx === 0,
            }))
          );
        }

        // Update Colors if provided
        if (input.colors && input.colors.length > 0) {
          await tx.delete(productColors).where(eq(productColors.productId, id));
          await tx.insert(productColors).values(
            input.colors.map((c) => ({
              productId: id,
              name: c.name,
              hexCode: c.hexCode,
              imageUrl: c.imageUrl || null,
              inStock: c.inStock ?? true,
            }))
          );
        }

        return true;
      });
    }

    if (!isDemoFallbackAllowed()) {
      throw new Error("DATABASE_UNAVAILABLE: Cannot update product without active database connection in production.");
    }

    // Update in-memory fallback
    const idx = inMemoryProducts.findIndex((p) => p.id === id);
    if (idx > -1) {
      const existing = inMemoryProducts[idx];
      if (input.sku) existing.sku = input.sku;
      if (input.title) existing.title = input.title;
      if (input.description) existing.description = input.description;
      if (input.category) existing.category = input.category;
      if (input.fabric) existing.fabric = input.fabric;
      if (input.mrp !== undefined) existing.mrp = Number(input.mrp);
      if (input.sellingPrice !== undefined) existing.sellingPrice = Number(input.sellingPrice);
      if (input.status) existing.status = input.status;
      if (input.stockCount !== undefined) existing.stockCount = input.stockCount;
      if (existing.mrp && existing.sellingPrice) {
        existing.discountPercentage =
          existing.mrp > existing.sellingPrice
            ? Math.round(((existing.mrp - existing.sellingPrice) / existing.mrp) * 100)
            : 0;
      }
      if (input.images && input.images.length > 0) {
        existing.images = input.images.map((img, i) => ({
          id: `img-${Date.now()}-${i}`,
          imageUrl: img.imageUrl,
          altText: img.altText,
          colorName: img.colorName || null,
          isPrimary: img.isPrimary || i === 0,
          displayOrder: img.displayOrder ?? i,
        }));
      }
      if (input.colors && input.colors.length > 0) {
        existing.colors = input.colors.map((c, i) => ({
          id: `col-${Date.now()}-${i}`,
          name: c.name,
          hexCode: c.hexCode,
          imageUrl: c.imageUrl || null,
          inStock: c.inStock ?? true,
        }));
      }
      existing.updatedAt = new Date().toISOString();
    }
    return true;
  }

  /**
   * Deletes a product by ID.
   */
  static async deleteProduct(id: string): Promise<boolean> {
    if (db) {
      await db.delete(products).where(eq(products.id, id));
      return true;
    }

    if (!isDemoFallbackAllowed()) {
      throw new Error("DATABASE_UNAVAILABLE: Cannot delete product without active database connection in production.");
    }

    const idx = inMemoryProducts.findIndex((p) => p.id === id);
    if (idx > -1) {
      inMemoryProducts.splice(idx, 1);
    }
    return true;
  }
}
