import { z } from "zod";

export const productImageSchema = z.object({
  imageUrl: z.string().min(1, "Image URL or path is required"),
  altText: z.string().max(255).optional(),
  colorName: z.string().max(50).optional().nullable(),
  displayOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

export const productColorSchema = z.object({
  name: z.string().min(1, "Color name is required").max(50),
  hexCode: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Valid hexadecimal color required (e.g. #DC2626)"),
  imageUrl: z.string().min(1).optional().nullable(),
  inStock: z.boolean().default(true),
});

export const productBaseSchema = z.object({
  sku: z.string().max(50).optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  slug: z.string().min(3).max(255).optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["scarves_dupattas", "gamchas"]),
  fabric: z.string().min(2, "Fabric details required (e.g. 100% Khadi Cotton)"),
  mrp: z.coerce.number().positive("MRP must be greater than 0"),
  sellingPrice: z.coerce.number().positive("Selling price must be greater than 0"),
  status: z.enum(["active", "inactive"]).default("active"),
  stockCount: z.coerce.number().int().nonnegative("Stock count cannot be negative").default(10),
  tagId: z.string().uuid("Invalid tag ID").optional().nullable(),
  images: z
    .array(productImageSchema)
    .min(1, "At least one product image is required"),
  colors: z
    .array(productColorSchema)
    .min(1, "At least one color swatch is required"),
});

export const productCreateSchema = productBaseSchema.refine(
  (data) => data.sellingPrice <= data.mrp,
  {
    message: "Final selling price cannot exceed Maximum Retail Price (MRP)",
    path: ["sellingPrice"],
  }
);

export const productUpdateSchema = productBaseSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
