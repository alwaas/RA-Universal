import { z } from "zod";

export const enquiryCreateSchema = z.object({
  type: z.enum(["b2b", "whatsapp_order", "general"]).default("b2b"),
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(120),
  businessName: z.string().max(150).optional().or(z.literal("")),
  gstin: z.string().max(20).optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  productId: z.string().uuid("Invalid product ID").optional().nullable(),
  itemsSummary: z.string().optional(),
  estimatedVolume: z.enum(["50-100", "100-500", "500+"]).optional(),
  message: z.string().min(2, "Message or requirements must be provided"),
});

export type EnquiryCreateInput = z.infer<typeof enquiryCreateSchema>;
