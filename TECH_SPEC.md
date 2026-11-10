# Technical Architecture & System Specification (TECH_SPEC.md)

## Project: Demo E-Commerce Platform for Ethnic Apparel (Scarves, Dupattas & Gamchas)
**Document Version:** 2.0.0  
**Target Market:** India (D2C & B2B)  
**Author:** Senior Full-Stack Software Architect  
**Source of Truth:** [PRD.md](file:///d:/Projects/RA-Universal/PRD.md) & [DESIGN.md](file:///d:/Projects/RA-Universal/DESIGN.md)  
**Status:** Approved for Implementation  

---

## 1. Recommended Tech Stack & Architectural Rationale

To deliver a fast, reliable, low-maintenance e-commerce demo that seamlessly evolves into a high-scale production store without architectural rewrites, the system uses a cohesive, modern TypeScript stack with zero microservice overhead.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CORE TECHNOLOGY STACK                            │
│                                                                             │
│  [ Framework ]     Next.js 14/15 (App Router, Server Components & Actions)  │
│  [ Language ]      TypeScript 5.x (Strict Type Safety end-to-end)           │
│  [ Styling ]       Tailwind CSS (Zero-runtime, 8pt Grid, Custom Tokens)     │
│  [ Database ]      PostgreSQL (Managed via Neon Serverless or Supabase)     │
│  [ ORM ]           Drizzle ORM (Zero-overhead, Type-safe SQL Dialect)       │
│  [ Auth ]          Jose / Iron-Session (Encrypted Stateless HttpOnly JWT)    │
│  [ Validation ]    Zod (Shared validation across Client, API, and DB)       │
│  [ State/Cart ]    Zustand with LocalStorage Sync (Instant 0ms Cart UI)     │
│  [ Media/Storage ] Cloudinary / Supabase Storage (or Validated Image URLs)  │
│  [ Deployment ]    Vercel (Edge Network + Serverless Functions)             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Rationale for Selections:
1. **Next.js App Router (React Server Components + Server Actions):**
   - Public catalogue pages (`/`, `/shop`, `/product/[slug]`) render on the server with Incremental Static Regeneration (ISR). This guarantees instantaneous First Contentful Paint (FCP < 1.5s) on Indian 4G/5G mobile connections and delivers crawlable metadata.
   - Server Actions handle form mutations (Cart, B2B Leads, Admin CRUD) eliminating API boilerplate while maintaining rigorous server-side execution.
2. **PostgreSQL on Neon Serverless / Supabase:**
   - Provides true relational integrity for multi-color variants, product images, tags, and cart line items.
   - Instant branching, automated daily backups, and a generous free tier ideal for demo environments.
3. **Drizzle ORM over Prisma:**
   - Extremely lightweight footprint with zero binary engine overhead (unlike Prisma's Rust query engine), drastically reducing serverless cold start times from ~1200ms to < 50ms.
4. **Encrypted Stateless HttpOnly Cookies (`jose`):**
   - Eliminates external auth infrastructure dependencies (such as heavy third-party providers). All authentication and role checks (`customer` vs `admin`) occur inside Next.js edge/node runtime with cryptographically signed tokens.
5. **No Microservices / Single Monolith:**
   - Eliminates network serialization latency, distributed transaction complexity, and multi-service deployment pipelines. A single repository houses storefront, API, and admin portal.

---

## 2. Frontend & Backend Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS FULL-STACK RUNTIME                         │
├──────────────────────────────────────┬──────────────────────────────────────┤
│           FRONTEND LAYER             │            BACKEND LAYER             │
│                                      │                                      │
│  [ React Server Components (RSC) ]   │  [ Server Actions & API Handlers ]   │
│  • Catalogue Grid & Banners (SSR)    │  • Product / Tag / Offer CRUD        │
│  • B2B & Heritage Static Content     │  • B2B Lead Processor                │
│  • Zero JS sent to client for reads  │  • Session & RBAC Gatekeeper         │
│                  ▲                   │                  ▲                   │
│                  │ (props)           │                  │ (server calls)    │
│  [ Client Components (Islands) ]     │  [ Service & DAL Layer ]             │
│  • Amazon-style Card Interactions    │  • ProductService (Cached queries)   │
│  • Slide-Over Cart Drawer (Zustand)  │  • AuthService (Password hash/verify)│
│  • First-Visit Offer Popup Modal     │  • CartService (DB reconciliation)   │
│  • WhatsApp Intent Trigger           │                  ▲                   │
│  • Admin CRUD Modal & Filters        │                  │ (type-safe SQL)   │
└──────────────────┬───────────────────┴──────────────────┼───────────────────┘
                   │                                      │
                   ▼                                      ▼
       [ Browser Storage / Local ]           [ Drizzle ORM Client ]
       • LocalStorage (__ra_cart_v1)                      │
       • SessionStorage (Popup dismissed)                 ▼
                                             [ PostgreSQL Database ]
                                             (Neon / Supabase Serverless)
```

### Architectural Principles:
- **Server-First by Default:** Page wrappers, catalogue queries, and product metadata are rendered on the server. Client components (`"use client"`) are strictly isolated to interactive leaf nodes (Add to Cart button, Swatch selector, Cart Drawer, Modal popups).
- **Zero Client Trust:** All prices, discount percentages, stock checks, and permissions are re-verified on the server during cart updates and checkout intents.
- **WhatsApp Checkout Protocol:** Because automated payment gateways are deferred to Phase 2, checkout actions trigger a secure server-side lead recording followed by launching a pre-formatted WhatsApp Click-to-Chat intent (`wa.me`).

---

## 3. Project Folder Structure

A standardized, scalable directory structure following Next.js App Router conventions:

```
ra-universal/
├── .env.example
├── .env.local
├── drizzle.config.ts
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── app/                                # Next.js App Router
│   │   ├── (storefront)/                   # Public Storefront Route Group
│   │   │   ├── layout.tsx                  # Global Header, Footer, Announcement Bar
│   │   │   ├── page.tsx                    # Home Page (Hero, Categories, Best Sellers)
│   │   │   ├── shop/
│   │   │   │   └── page.tsx                # Shop / Collection Grid with Filters
│   │   │   ├── product/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx            # Product Detail Page
│   │   │   ├── b2b/
│   │   │   │   └── page.tsx                # B2B Wholesale Portal & Lead Form
│   │   │   ├── about/
│   │   │   │   └── page.tsx                # Brand Story & Weaver Empowerment
│   │   │   ├── contact/
│   │   │   │   └── page.tsx                # Contact Form & Direct WhatsApp
│   │   │   ├── cart/
│   │   │   │   └── page.tsx                # Dedicated Cart Page (Fallback for Drawer)
│   │   │   └── account/
│   │   │       ├── login/page.tsx          # Customer Login
│   │   │       ├── signup/page.tsx         # Customer Registration
│   │   │       └── profile/page.tsx        # Profile & Order History Placeholder
│   │   │
│   │   ├── admin/                          # Isolated Admin Management Portal
│   │   │   ├── layout.tsx                  # Admin Shell (Sidebar, Header, Auth Guard)
│   │   │   ├── login/page.tsx              # Admin Login Form
│   │   │   ├── page.tsx                    # Dashboard Overview (KPIs, Quick Links)
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                # Product List with Filter, Search & Table
│   │   │   │   ├── new/page.tsx            # Create Product Form
│   │   │   │   └── [id]/edit/page.tsx      # Edit Product Form
│   │   │   ├── offers/
│   │   │   │   └── page.tsx                # First-Load Offer Popup Manager
│   │   │   ├── tags/
│   │   │   │   └── page.tsx                # Product Corner Badge Manager
│   │   │   └── enquiries/
│   │   │       └── page.tsx                # B2B & WhatsApp Order Leads Table
│   │   │
│   │   └── api/                            # REST Endpoints (for client & integrations)
│   │       ├── auth/
│   │       │   ├── signup/route.ts
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       ├── products/
│   │       │   ├── route.ts                # GET (Filter/Search)
│   │       │   └── [slug]/route.ts         # GET Single
│   │       ├── offers/
│   │       │   └── active/route.ts         # GET Active Popup Offer
│   │       ├── tags/
│   │       │   └── route.ts                # GET Public Tags
│   │       ├── cart/
│   │       │   ├── route.ts                # GET Cart Items
│   │       │   ├── items/route.ts          # POST/PUT/DELETE Cart Item
│   │       │   └── sync/route.ts           # POST Sync LocalStorage Cart to DB
│   │       ├── enquiries/
│   │       │   └── route.ts                # POST B2B / WhatsApp Order Intent Lead
│   │       └── admin/
│   │           ├── products/
│   │           │   ├── route.ts            # GET/POST
│   │           │   └── [id]/route.ts       # PUT/DELETE
│   │           ├── offers/
│   │           │   └── [id]/route.ts       # PUT Toggle
│   │           └── tags/
│   │               └── [id]/route.ts       # PUT/DELETE
│   │
│   ├── components/                         # Modular UI Component Library
│   │   ├── layout/
│   │   │   ├── AnnouncementBar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNavigationDrawer.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx             # Amazon/Flipkart-Style Product Card
│   │   │   ├── ProductBadge.tsx            # Corner Badge Tag Component
│   │   │   ├── PriceDisplay.tsx            # Selling Price, MRP Strikethrough, % Off
│   │   │   ├── ColorSelector.tsx           # Circular Color Swatches
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductGridSkeleton.tsx     # Loading Skeleton
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx              # Slide-Over Cart Flyout
│   │   │   ├── CartItemRow.tsx
│   │   │   ├── FreeDeliveryProgress.tsx    # ₹799 Free Delivery Progress Bar
│   │   │   └── BuyNowInterceptModal.tsx    # WhatsApp Order Transition Modal
│   │   ├── marketing/
│   │   │   └── FirstVisitOfferModal.tsx    # Dismissible Welcome Promo Popup
│   │   ├── forms/
│   │   │   ├── B2BEnquiryForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── ProductDataTable.tsx
│   │   │   └── ProductForm.tsx             # Multi-color & image upload inputs
│   │   └── ui/                             # Base Primitives (Radix/Tailwind)
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       └── Switch.tsx
│   │
│   ├── db/                                 # Database Connection & Schema
│   │   ├── index.ts                        # Drizzle DB Instance
│   │   ├── schema.ts                       # Drizzle Relational Schema Definitions
│   │   └── seed.ts                         # Demo Seed Script (12 Handloom Products)
│   │
│   ├── lib/                                # Core Utilities & Business Logic
│   │   ├── auth/
│   │   │   ├── session.ts                  # JWT Signing, Encryption & Cookie Handling
│   │   │   └── rbac.ts                     # Role Authorization Guard Helpers
│   │   ├── store/
│   │   │   └── useCartStore.ts             # Zustand Cart Store with LocalStorage Sync
│   │   ├── whatsapp.ts                     # WhatsApp Click-to-Chat Link Generator
│   │   ├── formatters.ts                   # INR Currency (₹) & Discount Formatter
│   │   └── validation/                     # Zod Validation Schemas
│   │       ├── auth.schema.ts
│   │       ├── product.schema.ts
│   │       ├── enquiry.schema.ts
│   │       └── cart.schema.ts
│   │
│   ├── middleware.ts                       # Next.js Route Guard Middleware (/admin/*)
│   └── types/                              # Shared TypeScript Interfaces
│       └── index.ts
```

---

## 4. End-to-End Data Flow Architecture

### 4.1 Catalogue Browsing Flow (SSR + ISR)
```
[User Browser]
      │
      ▼ HTTP GET /shop?category=gamchas
[Next.js Server Runtime]
      │
      ├─► [Check Route Cache (ISR)]
      │         │
      │         ├─► (Cache Hit) ──► Stream Pre-rendered HTML + RSC Payload
      │         │
      │         └─► (Cache Miss / Stale)
      │                   │
      │                   ▼
      │             [Drizzle ORM Query]
      │             SELECT p.*, pi.image_url, pc.hex_code, pt.name as badge_name
      │             FROM products p
      │             LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      │             LEFT JOIN product_colors pc ON pc.product_id = p.id
      │             LEFT JOIN product_tag_mappings ptm ON ptm.product_id = p.id
      │             LEFT JOIN product_tags pt ON pt.id = ptm.tag_id
      │             WHERE p.status = 'active' AND p.category = 'gamchas'
      │                   │
      │                   ▼
      │             [PostgreSQL Database]
      │                   │
      │                   ▼ Returns Rows
      │             [Render RSC Tree with Amazon/Flipkart Card Hierarchy]
      │                   │
      ▼ Stream Response (FCP < 1.5s)
[Hydrate Interactive Islands on Client]
(Color swatch selection, Add to Cart clicks, Hover zoom)
```

### 4.2 Interactive Cart & WhatsApp Checkout Intent Flow
```
[User Clicks "Buy Now" on Card]
      │
      ▼
[Client: useCartStore (Zustand)]
      │ Adds item to local cart & opens BuyNowInterceptModal
      │
      ▼
[User verifies details & clicks "Confirm on WhatsApp"]
      │
      ├─► 1. Async Background POST to /api/enquiries
      │         │
      │         ▼
      │   [Server Action / API]
      │   Validates payload via enquirySchema (Zod)
      │   Saves record in `enquiries` table with type='whatsapp_order'
      │
      └─► 2. Client launches formatted WhatsApp Click-to-Chat URL
                │
                ▼
          Target: https://wa.me/919876543210?text=Namaste%20RA%20Weaves...
          (Opens WhatsApp App or Web with order summary pre-filled)
```

---

## 5. Database Schema Design (PostgreSQL DDL)

The database schema is fully normalized, supporting multi-image galleries, discrete color variants, configurable corner badges, persistent shopping carts, and enquiry logging.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enum Types
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE product_category AS ENUM ('scarves_dupattas', 'gamchas');
CREATE TYPE product_status AS ENUM ('active', 'inactive');
CREATE TYPE badge_color_enum AS ENUM ('red', 'yellow', 'orange', 'gray', 'green');
CREATE TYPE enquiry_type AS ENUM ('b2b', 'whatsapp_order', 'general');
CREATE TYPE enquiry_status AS ENUM ('new', 'contacted', 'closed');

-- ============================================================================
-- 1. USERS TABLE (Supports Customers & Admins via RBAC)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(191) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    address_street TEXT,
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_pincode VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- ============================================================================
-- 2. PRODUCTS TABLE
-- ============================================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category product_category NOT NULL,
    fabric VARCHAR(120) NOT NULL, -- e.g., '100% Khadi Cotton', 'Chanderi Silk Blend'
    mrp NUMERIC(10, 2) NOT NULL CHECK (mrp > 0),
    selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price > 0),
    status product_status NOT NULL DEFAULT 'active',
    stock_count INT NOT NULL DEFAULT 10 CHECK (stock_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_pricing CHECK (selling_price <= mrp)
);

-- ============================================================================
-- 3. PRODUCT IMAGES TABLE (Supports Multiple Images per Product)
-- ============================================================================
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 4. PRODUCT COLORS TABLE (Visual Swatches)
-- ============================================================================
CREATE TABLE product_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,     -- e.g., 'Maroon Red', 'Indigo Blue'
    hex_code VARCHAR(10) NOT NULL, -- e.g., '#800000', '#1E3A8A'
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 5. PRODUCT TAGS TABLE (Admin-Configurable Corner Badges)
-- ============================================================================
CREATE TABLE product_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'Only 2-3 Left', 'Sale', 'Out of Stock', 'Best Selling'
    slug VARCHAR(50) NOT NULL UNIQUE,
    badge_color badge_color_enum NOT NULL DEFAULT 'red',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 6. PRODUCT TAG MAPPINGS TABLE (Many-to-Many Linking)
-- ============================================================================
CREATE TABLE product_tag_mappings (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (product_id, tag_id)
);

-- ============================================================================
-- 7. PROMOTIONAL OFFERS TABLE (First-Load Popup)
-- ============================================================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    coupon_code VARCHAR(50) NOT NULL,
    banner_image_url TEXT,
    is_popup_active BOOLEAN NOT NULL DEFAULT FALSE,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 8. CARTS TABLE (Supports Guests via session_id & Registered Users)
-- ============================================================================
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) UNIQUE, -- For guest tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- ============================================================================
-- 9. CART ITEMS TABLE
-- ============================================================================
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    color_id UUID REFERENCES product_colors(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_cart_product_color UNIQUE (cart_id, product_id, color_id)
);

-- ============================================================================
-- 10. ENQUIRIES TABLE (B2B Bulk Leads & WhatsApp Checkout Records)
-- ============================================================================
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type enquiry_type NOT NULL DEFAULT 'b2b',
    full_name VARCHAR(120) NOT NULL,
    business_name VARCHAR(150),       -- Populated for B2B
    gstin VARCHAR(20),                -- Optional for B2B
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(191),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    items_summary JSONB,              -- Snapshot of cart items for WhatsApp checkout leads
    estimated_volume VARCHAR(50),     -- e.g., '50-100 pcs', '100-500 pcs', '500+ pcs'
    message TEXT NOT NULL,
    status enquiry_status NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- INDEXES FOR HOT QUERY PATHS & PERFORMANCE
-- ============================================================================
CREATE INDEX idx_products_category_status ON products(category, status);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_price ON products(selling_price);
CREATE INDEX idx_product_images_product_primary ON product_images(product_id, is_primary);
CREATE INDEX idx_product_colors_product ON product_colors(product_id);
CREATE INDEX idx_offers_active ON offers(is_popup_active) WHERE is_popup_active = TRUE;
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_enquiries_type_status ON enquiries(type, status);
```

---

## 6. Authentication & Authorization Specification

### 6.1 Authentication Mechanism
- **Algorithm:** Stateless `HMAC-SHA256` signed JSON Web Tokens using `jose`.
- **Token Delivery:** Encrypted, HTTP-only, SameSite=Lax, Secure cookie named `__ra_session`.
- **Session Duration:** 7 days rolling expiration.
- **Password Hashing:** `bcryptjs` with salt round `12` (or `argon2id`).

```typescript
// Token Payload Structure
interface SessionPayload {
  userId: string;
  role: "customer" | "admin";
  email?: string;
  phone: string;
  fullName: string;
  exp: number;
}
```

### 6.2 Role-Based Access Control (RBAC) Matrix

| Route / Capability | Guest (Public) | Customer (Authenticated) | Admin |
| :--- | :---: | :---: | :---: |
| Browse Shop & Products | Allowed | Allowed | Allowed |
| Add to Cart (LocalStorage/Session) | Allowed | Allowed | Allowed |
| Trigger WhatsApp "Buy Now" Intent | Allowed | Allowed | Allowed |
| Submit B2B Wholesale Enquiry | Allowed | Allowed | Allowed |
| Customer Account & Profile | Blocked | Allowed | Allowed |
| Order History Placeholder | Blocked | Allowed | Allowed |
| Access Admin Dashboard (`/admin/*`)| Blocked (302 -> `/admin/login`) | Blocked (403 Forbidden) | Allowed |
| Product CRUD Operations | Blocked | Blocked | Allowed |
| Offer & Badge Tag Configuration | Blocked | Blocked | Allowed |
| Review B2B & WhatsApp Inquiries | Blocked | Blocked | Allowed |

### 6.3 Middleware Guard Architecture (`src/middleware.ts`)
```typescript
import { NextResponse, type NextRequest } from "next/server";
import { verifyJwtSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Guard Admin Routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const sessionCookie = request.cookies.get("__ra_session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    const session = await verifyJwtSession(sessionCookie);
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
    }
  }
  
  // Guard Customer Profile Routes
  if (pathname.startsWith("/account/profile")) {
    const sessionCookie = request.cookies.get("__ra_session")?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/account/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/profile/:path*"],
};
```

---

## 7. API Endpoints & Request/Response Contracts

All API endpoints strictly enforce JSON input/output, standardized error responses, and HTTP status codes.

### Standard Response Envelope
```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Error Response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;       // e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED', 'NOT_FOUND'
    message: string;    // Human-readable message
    details?: any;      // Zod validation field errors
  };
}
```

---

### 7.1 Authentication Endpoints

#### `POST /api/auth/signup`
- **Access:** Public
- **Input (Zod):**
  ```typescript
  const signupSchema = z.object({
    fullName: z.string().min(2).max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Must be valid 10-digit Indian phone number"),
    email: z.string().email().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "c7a8b9e0-1234-4567-890a-bcdef0123456",
        "fullName": "Priya Sharma",
        "phone": "9876543210",
        "email": "priya@example.com",
        "role": "customer"
      }
    }
  }
  ```

#### `POST /api/auth/login`
- **Access:** Public
- **Input (Zod):**
  ```typescript
  const loginSchema = z.object({
    identifier: z.string().min(1, "Phone or Email is required"),
    password: z.string().min(1, "Password is required"),
  });
  ```
- **Response (200 OK):** Sets HTTP-only `__ra_session` cookie; returns user profile.

#### `POST /api/auth/logout`
- **Access:** Public (Authenticated)
- **Response (200 OK):** Clears `__ra_session` cookie.

---

### 7.2 Storefront & Catalogue Endpoints

#### `GET /api/products`
- **Access:** Public
- **Query Params:**
  - `category`: `scarves_dupattas` | `gamchas` (Optional)
  - `color`: string (Optional)
  - `minPrice`: number (Optional)
  - `maxPrice`: number (Optional)
  - `sort`: `price_asc` | `price_desc` | `discount_desc` | `newest` (Default: `newest`)
  - `page`: number (Default: 1), `limit`: number (Default: 12)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Classic Bengal Cotton Gamcha - Heritage Red Check",
        "slug": "classic-bengal-cotton-gamcha-red",
        "category": "gamchas",
        "fabric": "100% Pure Bengal Weave Cotton",
        "mrp": 399.00,
        "sellingPrice": 199.00,
        "discountPercentage": 50,
        "primaryImage": "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800",
        "colors": [
          { "id": "uuid-1", "name": "Traditional Red", "hexCode": "#DC2626" },
          { "id": "uuid-2", "name": "Forest Green", "hexCode": "#15803D" }
        ],
        "badge": {
          "name": "Best Selling",
          "color": "yellow"
        },
        "stockCount": 25,
        "status": "active"
      }
    ],
    "meta": { "total": 24, "page": 1, "limit": 12 }
  }
  ```

#### `GET /api/offers/active`
- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "offer-uuid-1",
      "title": "Welcome Offer: First Order Free Delivery",
      "description": "Zero shipping fees across India on your initial handloom purchase.",
      "couponCode": "FIRSTFREE",
      "bannerImageUrl": "https://images.unsplash.com/photo-banner.jpg",
      "isPopupActive": true
    }
  }
  ```

#### `POST /api/enquiries`
- **Access:** Public
- **Input (Zod):**
  ```typescript
  const enquirySchema = z.object({
    type: z.enum(["b2b", "whatsapp_order", "general"]),
    fullName: z.string().min(2),
    businessName: z.string().optional(),
    gstin: z.string().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, "10-digit Indian phone number required"),
    email: z.string().email().optional(),
    productId: z.string().uuid().optional(),
    itemsSummary: z.array(z.object({
      title: z.string(),
      color: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })).optional(),
    estimatedVolume: z.enum(["50-100", "100-500", "500+"]).optional(),
    message: z.string().min(2),
  });
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "enquiryId": "enq-uuid-99",
      "message": "Enquiry registered successfully. Sales desk notified."
    }
  }
  ```

---

### 7.3 Admin Management Endpoints (`/api/admin/*`)

#### `POST /api/admin/products`
- **Access:** Admin Only
- **Input (Zod):**
  ```typescript
  const productCreateSchema = z.object({
    title: z.string().min(3).max(255),
    category: z.enum(["scarves_dupattas", "gamchas"]),
    fabric: z.string().min(2),
    description: z.string().min(10),
    mrp: z.number().positive(),
    sellingPrice: z.number().positive(),
    stockCount: z.number().int().nonnegative().default(10),
    status: z.enum(["active", "inactive"]).default("active"),
    tagId: z.string().uuid().optional(),
    images: z.array(z.object({
      imageUrl: z.string().url(),
      altText: z.string().optional(),
      isPrimary: z.boolean().default(false),
    })).min(1, "At least one product image is required"),
    colors: z.array(z.object({
      name: z.string(),
      hexCode: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Valid hex color required"),
    })).min(1, "At least one color swatch is required"),
  }).refine((data) => data.sellingPrice <= data.mrp, {
    message: "Selling price cannot exceed MRP",
    path: ["sellingPrice"],
  });
  ```
- **Response (201 Created):** Returns full created product record.

#### `PUT /api/admin/products/[id]`
- **Access:** Admin Only
- **Input:** Partial `productCreateSchema`.
- **Response (200 OK):** Returns updated product record.

#### `DELETE /api/admin/products/[id]`
- **Access:** Admin Only
- **Response (200 OK):** Soft or hard deletes product and unlinks associations.

#### `PUT /api/admin/offers/[id]`
- **Access:** Admin Only
- **Input:** `{ isPopupActive: boolean }`
- **Business Rule:** Setting `isPopupActive = true` automatically sets all other offers to `false`.

---

## 8. Error Handling & Validation Matrix

| HTTP Status | Error Code | Trigger Condition | Client Experience |
| :---: | :--- | :--- | :--- |
| **400** | `BAD_REQUEST` | Malformed JSON body or invalid route parameters. | Toast alert: "Invalid request payload." |
| **401** | `UNAUTHORIZED` | Missing, expired, or invalid session cookie on protected route. | Redirect to `/account/login` or `/admin/login`. |
| **403** | `FORBIDDEN` | Customer attempting to access `/admin/*` routes or endpoints. | Displays "Access Denied: Admin privileges required." |
| **404** | `NOT_FOUND` | Product slug or resource ID does not exist in database. | Custom 404 page: "Handloom item not found." |
| **409** | `CONFLICT` | Registering with a phone number that is already in use. | Form error under phone field: "Phone number already registered." |
| **422** | `VALIDATION_ERROR` | Selling price > MRP, invalid phone format, empty required fields. | Red input highlights with inline Zod error messages. |
| **500** | `SERVER_ERROR` | Database connection timeout or unexpected exception. | Graceful error boundary: "We're experiencing technical difficulties. Please refresh." |

---

## 9. Environment Variables Configuration

The application requires strict separation between public configuration and server-only secrets.

```bash
# =============================================================================
# SERVER-ONLY SECRETS (NEVER EXPOSE TO CLIENT / NEVER PREFIX WITH NEXT_PUBLIC_)
# =============================================================================

# PostgreSQL Database Connection String (Neon or Supabase Connection Pooler)
DATABASE_URL="postgresql://ra_admin:secret_pass@ep-ancient-lake.ap-southeast-1.neon.tech/ra_store?sslmode=require"

# JWT Encryption Key (Minimum 32-character random string for AES/HMAC signing)
JWT_SECRET="a8f6e2b1c4d9e0f3a7b5c8d1e4f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0"

# Initial Seed Admin Credentials (For first-run provisioning)
ADMIN_DEFAULT_PHONE="9999999999"
ADMIN_DEFAULT_PASSWORD="SuperSecureAdminPassword2026!"

# Optional: Cloudinary Cloud Storage (For Admin Product Image Uploads)
CLOUDINARY_CLOUD_NAME="ra-handloom"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuv_wxyz"

# Node Environment
NODE_ENV="production"

# =============================================================================
# CLIENT-SAFE EXPOSURES (PREFIXED WITH NEXT_PUBLIC_)
# =============================================================================

# Canonical Site URL
NEXT_PUBLIC_APP_URL="https://ra-weaves.vercel.app"

# Client Official WhatsApp Business Number (Without + or spaces, e.g. 91XXXXXXXXXX)
NEXT_PUBLIC_WHATSAPP_PHONE="919876543210"

# Store Brand Name for Prompts & WhatsApp Message Templates
NEXT_PUBLIC_BRAND_NAME="RA Heritage Weaves"
```

---

## 10. Security Boundaries & Hardening

1. **Zero Secret Leakage:**
   - Database credentials, `JWT_SECRET`, and Cloudinary API secrets are loaded strictly inside server modules (`src/db/*`, `src/lib/auth/*`). Next.js bundling rules prevent server-only files from compiling into client bundles.
2. **Server-Side Authorization Enforcement:**
   - Client-side checks are treated purely as UI conveniences. Every Server Action and API Route executes `verifyJwtSession()` and checks `session.role === 'admin'` before performing any database write or viewing inquiries.
3. **Strict Input Sanitization:**
   - All text inputs pass through Zod schemas. String lengths are hard-capped to prevent payload injection attacks. Drizzle ORM uses parameterized queries, eliminating SQL injection vectors.
4. **Image Upload & URL Safety:**
   - When admins input image URLs, the application validates that the URL scheme is strictly `https://` and resolves to allowed image domains configured in `next.config.mjs`:
     ```javascript
     // next.config.mjs
     export default {
       images: {
         remotePatterns: [
           { protocol: 'https', hostname: 'images.unsplash.com' },
           { protocol: 'https', hostname: 'res.cloudinary.com' },
           { protocol: 'https', hostname: '*.supabase.co' },
         ],
       },
     };
     ```
5. **CSRF & Cookie Protection:**
   - Cookies use `SameSite=Lax`, `HttpOnly=true`, and `Secure=true` (in production). Next.js Server Actions automatically protect against Cross-Site Request Forgery via origin header verification.

---

## 11. Testing & Quality Assurance Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TESTING PYRAMID                                │
│                                                                             │
│                  / \       [ E2E Tests (Playwright) ]                       │
│                 /   \      • Browse -> Add to Cart -> WhatsApp Intent       │
│                /     \     • Admin Login -> Add Product -> Live in Shop     │
│               /-------\                                                     │
│              /         \   [ Integration Tests (Vitest / Node) ]            │
│             /           \  • API Route Handlers (Auth, Products, Enquiries) │
│            /             \ • Database Migrations & Constraints              │
│           /---------------\                                                 │
│          /                 \ [ Unit Tests ]                                 │
│         /                   \• Discount % & INR Currency Formatter          │
│        /                     \• WhatsApp Click-to-Chat URL Encoder          │
│       /───────────────────────\• Zod Schemas Validation                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 11.1 Key Unit Test Cases (Example Logic)
- **Discount Calculator Test:** Ensures `calculateDiscount(500, 250)` outputs `50% OFF`, and edge cases like `calculateDiscount(499, 499)` output `0%`.
- **WhatsApp Link Generator Test:** Verifies that phone numbers are stripped of non-digits, and line items containing Hindi/English characters are properly percent-encoded (`encodeURIComponent`).

### 11.2 Core Integration Verification
- Verify that a non-admin session cookie receives `403 Forbidden` on `POST /api/admin/products`.
- Verify that inserting a product with `selling_price > mrp` fails the database constraint `check_pricing`.

---

## 12. Deployment, Hosting & Migration Strategy

```
                      ┌─────────────────────────────────┐
                      │        GITHUB REPOSITORY        │
                      └────────────────┬────────────────┘
                                       │ Push to main
                                       ▼
                      ┌─────────────────────────────────┐
                      │        VERCEL CI/CD PIPELINE    │
                      ├─────────────────────────────────┤
                      │ • Type Check (tsc --noEmit)     │
                      │ • Tailwind Build & Tree-shake   │
                      │ • Next.js Static Optimization   │
                      └────────────────┬────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
      ┌───────────────────────────────┐ ┌───────────────────────────────┐
      │       VERCEL PRODUCTION       │ │      NEON / SUPABASE PG       │
      │  • Global Edge CDN (Assets)   │ │  • Connection Pooler (PGBouncer)│
      │  • Serverless Node Functions  │ │  • Automated SSL & Replication│
      └───────────────────────────────┘ └───────────────────────────────┘
```

### 12.1 Step-by-Step Production Deployment Workflow
1. **Database Provisioning:**
   - Create a free-tier project on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
   - Copy the Pooled Connection String (`postgres://...`).
2. **Schema Migration:**
   - Run Drizzle migrations from the CLI:
     ```bash
     npx drizzle-kit push:pg
     ```
   - Run seed script to populate initial 12 handloom demo products:
     ```bash
     npm run db:seed
     ```
3. **Vercel Project Setup:**
   - Import the GitHub repository into Vercel.
   - Configure Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_WHATSAPP_PHONE`, `NEXT_PUBLIC_BRAND_NAME`).
   - Trigger build and verify zero TypeScript/ESLint warnings.
4. **Post-Deployment Smoke Test:**
   - Verify `/` loads within 1.5 seconds on mobile simulation.
   - Verify offer popup triggers on first visit and dismisses cleanly.
   - Verify `/admin/login` allows store owner login and displays product CRUD.

---

*End of Technical Architecture & System Specification (TECH_SPEC.md)*
