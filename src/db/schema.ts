import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  pgEnum,
  primaryKey,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================
export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const productCategoryEnum = pgEnum("product_category", [
  "scarves_dupattas",
  "gamchas",
]);
export const productStatusEnum = pgEnum("product_status", ["active", "inactive"]);
export const badgeColorEnum = pgEnum("badge_color_enum", [
  "red",
  "yellow",
  "orange",
  "gray",
  "green",
]);
export const enquiryTypeEnum = pgEnum("enquiry_type", [
  "b2b",
  "whatsapp_order",
  "general",
]);
export const enquiryStatusEnum = pgEnum("enquiry_status", [
  "new",
  "contacted",
  "closed",
]);

// ============================================================================
// 1. USERS TABLE
// ============================================================================
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 191 }).unique(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: userRoleEnum("role").default("customer").notNull(),
    addressStreet: text("address_street"),
    addressCity: varchar("address_city", { length: 100 }),
    addressState: varchar("address_state", { length: 100 }),
    addressPincode: varchar("address_pincode", { length: 10 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    phoneIdx: index("idx_users_phone").on(table.phone),
    emailIdx: index("idx_users_email").on(table.email),
  })
);

// ============================================================================
// 2. PRODUCTS TABLE
// ============================================================================
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull(),
    category: productCategoryEnum("category").notNull(),
    fabric: varchar("fabric", { length: 120 }).notNull(),
    mrp: numeric("mrp", { precision: 10, scale: 2 }).notNull(),
    sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),
    status: productStatusEnum("status").default("active").notNull(),
    stockCount: integer("stock_count").default(10).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    categoryStatusIdx: index("idx_products_category_status").on(table.category, table.status),
    slugIdx: index("idx_products_slug").on(table.slug),
    priceIdx: index("idx_products_price").on(table.sellingPrice),
  })
);

// ============================================================================
// 3. PRODUCT IMAGES TABLE
// ============================================================================
export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    displayOrder: integer("display_order").default(0).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    productPrimaryIdx: index("idx_product_images_product_primary").on(table.productId, table.isPrimary),
  })
);

// ============================================================================
// 4. PRODUCT COLORS TABLE
// ============================================================================
export const productColors = pgTable(
  "product_colors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    hexCode: varchar("hex_code", { length: 10 }).notNull(),
    inStock: boolean("in_stock").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    productColorsIdx: index("idx_product_colors_product").on(table.productId),
  })
);

// ============================================================================
// 5. PRODUCT TAGS TABLE (Configurable Corner Badges)
// ============================================================================
export const productTags = pgTable(
  "product_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 50 }).notNull().unique(),
    slug: varchar("slug", { length: 50 }).notNull().unique(),
    badgeColor: badgeColorEnum("badge_color").default("red").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// ============================================================================
// 6. PRODUCT TAG MAPPINGS TABLE
// ============================================================================
export const productTagMappings = pgTable(
  "product_tag_mappings",
  {
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => productTags.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.tagId] }),
  })
);

// ============================================================================
// 7. PROMOTIONAL OFFERS TABLE (First-Load Popup)
// ============================================================================
export const offers = pgTable(
  "offers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 150 }).notNull(),
    description: text("description").notNull(),
    couponCode: varchar("coupon_code", { length: 50 }).notNull(),
    bannerImageUrl: text("banner_image_url"),
    isPopupActive: boolean("is_popup_active").default(false).notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }).defaultNow().notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    activeOffersIdx: index("idx_offers_active").on(table.isPopupActive),
  })
);

// ============================================================================
// 8. CARTS TABLE
// ============================================================================
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 100 }).unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("idx_carts_session").on(table.sessionId),
    userIdx: index("idx_carts_user").on(table.userId),
  })
);

// ============================================================================
// 9. CART ITEMS TABLE
// ============================================================================
export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .references(() => carts.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "restrict" })
      .notNull(),
    colorId: uuid("color_id").references(() => productColors.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    cartIdx: index("idx_cart_items_cart").on(table.cartId),
  })
);

// ============================================================================
// 10. ENQUIRIES TABLE (B2B Leads & WhatsApp Order Intent Logs)
// ============================================================================
export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: enquiryTypeEnum("type").default("b2b").notNull(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    businessName: varchar("business_name", { length: 150 }),
    gstin: varchar("gstin", { length: 20 }),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: varchar("email", { length: 191 }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    itemsSummary: text("items_summary"), // JSON stringified snapshot
    estimatedVolume: varchar("estimated_volume", { length: 50 }),
    message: text("message").notNull(),
    status: enquiryStatusEnum("status").default("new").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    enquiryTypeStatusIdx: index("idx_enquiries_type_status").on(table.type, table.status),
  })
);

// ============================================================================
// DRIZZLE RELATIONS DEFINITION
// ============================================================================
export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  colors: many(productColors),
  tagMappings: many(productTagMappings),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productColorsRelations = relations(productColors, ({ one }) => ({
  product: one(products, {
    fields: [productColors.productId],
    references: [products.id],
  }),
}));

export const productTagMappingsRelations = relations(productTagMappings, ({ one }) => ({
  product: one(products, {
    fields: [productTagMappings.productId],
    references: [products.id],
  }),
  tag: one(productTags, {
    fields: [productTagMappings.tagId],
    references: [productTags.id],
  }),
}));

export const productTagsRelations = relations(productTags, ({ many }) => ({
  tagMappings: many(productTagMappings),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  color: one(productColors, {
    fields: [cartItems.colorId],
    references: [productColors.id],
  }),
}));
