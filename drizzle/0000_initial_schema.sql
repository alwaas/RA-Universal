-- ============================================================================
-- RA-UNIVERSAL: INITIAL PRODUCTION SCHEMA MIGRATION (0000_initial_schema.sql)
-- Generated per TECH_SPEC.md Section 5
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE "user_role" AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "product_category" AS ENUM ('scarves_dupattas', 'gamchas');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "product_status" AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "badge_color_enum" AS ENUM ('red', 'yellow', 'orange', 'gray', 'green');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enquiry_type" AS ENUM ('b2b', 'whatsapp_order', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enquiry_status" AS ENUM ('new', 'contacted', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "full_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(191) UNIQUE,
    "phone" VARCHAR(20) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'customer',
    "address_street" TEXT,
    "address_city" VARCHAR(100),
    "address_state" VARCHAR(100),
    "address_pincode" VARCHAR(10),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS "products" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "category" "product_category" NOT NULL,
    "fabric" VARCHAR(120) NOT NULL,
    "mrp" NUMERIC(10, 2) NOT NULL,
    "selling_price" NUMERIC(10, 2) NOT NULL,
    "status" "product_status" NOT NULL DEFAULT 'active',
    "stock_count" INT NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Product Images Table
CREATE TABLE IF NOT EXISTS "product_images" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "image_url" TEXT NOT NULL,
    "alt_text" VARCHAR(255),
    "display_order" INT NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Product Colors Table
CREATE TABLE IF NOT EXISTS "product_colors" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "name" VARCHAR(50) NOT NULL,
    "hex_code" VARCHAR(10) NOT NULL,
    "in_stock" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Product Tags Table
CREATE TABLE IF NOT EXISTS "product_tags" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(50) NOT NULL UNIQUE,
    "slug" VARCHAR(50) NOT NULL UNIQUE,
    "badge_color" "badge_color_enum" NOT NULL DEFAULT 'red',
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Product Tag Mappings Table
CREATE TABLE IF NOT EXISTS "product_tag_mappings" (
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "tag_id" UUID NOT NULL REFERENCES "product_tags"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY ("product_id", "tag_id")
);

-- 8. Offers Table
CREATE TABLE IF NOT EXISTS "offers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "coupon_code" VARCHAR(50) NOT NULL,
    "banner_image_url" TEXT,
    "is_popup_active" BOOLEAN NOT NULL DEFAULT FALSE,
    "valid_from" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "valid_until" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. Carts Table
CREATE TABLE IF NOT EXISTS "carts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
    "session_id" VARCHAR(100) UNIQUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. Cart Items Table
CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "cart_id" UUID NOT NULL REFERENCES "carts"("id") ON DELETE CASCADE,
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
    "color_id" UUID REFERENCES "product_colors"("id") ON DELETE SET NULL,
    "quantity" INT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. Enquiries Table
CREATE TABLE IF NOT EXISTS "enquiries" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "type" "enquiry_type" NOT NULL DEFAULT 'b2b',
    "full_name" VARCHAR(120) NOT NULL,
    "business_name" VARCHAR(150),
    "gstin" VARCHAR(20),
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(191),
    "product_id" UUID REFERENCES "products"("id") ON DELETE SET NULL,
    "items_summary" TEXT,
    "estimated_volume" VARCHAR(50),
    "message" TEXT NOT NULL,
    "status" "enquiry_status" NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users"("phone");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_products_category_status" ON "products"("category", "status");
CREATE INDEX IF NOT EXISTS "idx_products_slug" ON "products"("slug");
CREATE INDEX IF NOT EXISTS "idx_products_price" ON "products"("selling_price");
CREATE INDEX IF NOT EXISTS "idx_product_images_product_primary" ON "product_images"("product_id", "is_primary");
CREATE INDEX IF NOT EXISTS "idx_product_colors_product" ON "product_colors"("product_id");
CREATE INDEX IF NOT EXISTS "idx_offers_active" ON "offers"("is_popup_active");
CREATE INDEX IF NOT EXISTS "idx_carts_session" ON "carts"("session_id");
CREATE INDEX IF NOT EXISTS "idx_carts_user" ON "carts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_cart_items_cart" ON "cart_items"("cart_id");
CREATE INDEX IF NOT EXISTS "idx_enquiries_type_status" ON "enquiries"("type", "status");
