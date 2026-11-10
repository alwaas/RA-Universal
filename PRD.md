# Product Requirement Document (PRD)

## Project: Demo E-Commerce Platform for Ethnic Apparel (Scarves, Dupattas & Gamchas)
**Document Version:** 1.0.0  
**Target Market:** India (D2C & B2B)  
**Author:** Senior Product Manager & Software Architect  
**Status:** Ready for Review & Client Approval  

---

## 1. Executive Summary & Product Overview

### 1.1 Problem Statement
Traditional Indian handloom and ethnic apparel producers (specifically artisans manufacturing Women's Scarves/Dupattas and Men's Gamchas) struggle to showcase their catalogue online to both retail buyers and wholesale partners. Existing solutions either require high upfront investment into complex ERP/enterprise e-commerce platforms or lack the localized, high-conversion visual design (Amazon/Flipkart styling) familiar to Indian consumers.

### 1.2 Value Proposition
A lightweight, modern, mobile-first e-commerce web application designed as an interactive product catalogue and demo store. It allows the client to:
1. Showcase handloom and ethnic products with familiar Indian marketplace UI patterns (MRP strikethrough, discount percentages, scarcity badges).
2. Capture customer demand through interactive shopping cart and checkout-intent workflows (WhatsApp/Direct Enquiry) prior to launching formal payment processing.
3. Serve both retail consumers (B2C) and bulk buyers (B2B) through dedicated experiences.
4. Manage catalogue items, promotional offers, and inventory badges dynamically through a simple admin dashboard without code changes.

### 1.3 Target Audience
1. **B2C Retail Shoppers (Tier 1 to Tier 3 Indian Consumers):**
   - Individuals seeking everyday and festive ethnic wear: breathable Men's Gamchas (cotton/bengal weave) and stylish Women's Dupattas/Scarves.
   - Accustomed to Flipkart/Amazon/Meesho navigation, value-conscious, responsive to discount tags and free delivery incentives.
2. **B2B Bulk Buyers & Resellers:**
   - Regional boutique owners, corporate gifting purchasers, and textile wholesalers looking for bulk pricing, minimum order quantities (MOQs), and direct supplier contact.
3. **Store Owner / Business Admin:**
   - Small business owner or sales team requiring a straightforward interface to update catalogue photos, adjust prices, edit offer popups, and manage product tags.

---

## 2. User Roles & Permissions

| Role | Description | Access Rights & Capabilities |
| :--- | :--- | :--- |
| **Guest** | Unauthenticated site visitor | - Browse all public pages (Home, Shop, B2B, About, Contact).<br>- View product cards, filter by category/color/price.<br>- Add items to local Cart and modify quantities.<br>- Trigger "Buy Now" intent and B2B enquiry forms.<br>- Register for an account or log in. |
| **Customer** | Authenticated registered user | - All Guest privileges.<br>- Persistent Cart across sessions.<br>- View and edit personal profile (Name, Phone, Delivery Address).<br>- Access Order History placeholder page.<br>- Fast-fill checkout intent forms. |
| **Admin** | Business owner / Store manager | - Access password-protected `/admin` portal.<br>- Create, read, update, delete (CRUD) products.<br>- Upload product images or provide external CDN URLs.<br>- Create, read, update, delete promotional popup offers.<br>- Create, read, update, delete product badges/tags.<br>- Toggle product status (Active / Inactive). |

---

## 3. Core User Journeys

```
Journey 1: B2C Product Discovery & Cart Addition
[Landing on Home] ──> [Dismissible Offer Popup] ──> [Explore Collection / Shop]
        │                                                     │
        ▼                                                     ▼
 [Filter by Category/Color] ──> [View Amazon-style Card] ──> [Click "Add to Cart"]
                                                              │
                                                              ▼
                                                   [Open Cart Drawer/Page]
                                                              │
                                                              ▼
                                              [View Discounts & Order Summary]

Journey 2: Checkout Intent / "Buy Now" Flow
[Product Card / Cart] ──> [Click "Buy Now"]
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │        Checkout Intercept Modal              │
        │  "Online Payments Coming Soon! Complete      │
        │   your order via WhatsApp / Direct Enquiry"  │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
           [WhatsApp Intent Launched with Order Pre-fill]

Journey 3: B2B Wholesale Enquiry
[Click B2B Navigation] ──> [Review Bulk Order Terms & MOQs]
                               │
                               ▼
                   [Fill B2B Lead Form]
    (Business Name, Contact, Selected Products, Quantity)
                               │
                               ▼
        [Submission Confirmation & Email/DB Notification]
```

---

## 4. Scope of the Product

### 4.1 In-Scope (MVP Release)
- Fully responsive web application optimized for mobile (Android/iOS browsers) and desktop.
- 5 core public pages: Home, Collection/Shop, B2B, About Us, Contact.
- Amazon/Flipkart-style product cards with complete pricing hierarchy (MRP, Discount %, Selling Price).
- Dynamic admin-configurable corner badges: "Only 2-3 Left", "Sale", "Out of Stock", "Best Selling".
- First-load dismissible promotional popup with session persistence.
- Session-based / LocalStorage shopping cart with quantity controls.
- Customer authentication module (Signup, Login, Logout, Profile, Order History placeholder).
- Password-protected Admin Panel for Product, Offer, and Tag CRUD operations.
- Intercepted "Buy Now" / Cart Checkout experience tailored for demo and lead-capture (WhatsApp/Enquiry intent).

### 4.2 Out-of-Scope (Deferred to Phase 2)
- Online payment gateway integration (Razorpay, Paytm, Cashfree, UPI Gateway, Stripe).
- Automated payment reconciliation and refund management.
- Courier/logistics aggregators (Shiprocket, Delhivery, BlueDart APIs) for auto-AWB generation.
- Real-time live SMS OTP verification (mock/standard credential validation used in demo).
- Automated inventory synchronization with physical warehouse software.
- Multi-vendor marketplace capabilities (single-vendor store only).
- Native iOS or Android mobile applications.

---

## 5. Functional Requirements by Module

### 5.1 Promotional Offer Popup (First Load)
- **FR-POP-01:** On the user's initial visit to the website, the application must display a centered, dismissible modal overlay showing the latest active promotional offer (e.g., *"Welcome Offer: First Order Free Delivery - Use Code: FIRSTFREE"*).
- **FR-POP-02:** The popup must contain:
  - Promotional graphic/banner or headline.
  - Discount details / Coupon code text.
  - A prominent "Claim Offer" / "Shop Now" call to action linking to the Shop page.
  - An intuitive Close (`X`) button and overlay backdrop click-to-dismiss behavior.
- **FR-POP-03:** Once dismissed by the user, the popup must **not** re-appear during the same browser session (enforced via `sessionStorage` or a 24-hour `localStorage` cookie flag).
- **FR-POP-04:** If no active offer is configured in the Admin panel, the popup must remain suppressed.

---

### 5.2 Product Listing & Amazon/Flipkart-Style Product Cards
- **FR-CRD-01:** Product cards must render in a uniform grid on desktop (3–4 columns) and mobile (2 columns), matching the standard Indian e-commerce layout.
- **FR-CRD-02 (Card Components):** Each card must systematically include the following components:
  1. **Corner Badge / Tag:** Pinned to top-left or top-right corner. Supports 4 core presets:
     - `Only 2-3 Left` (Urgency - Orange/Red)
     - `Sale` (Promotional - Bright Red)
     - `Out of Stock` (Status - Dark Grey)
     - `Best Selling` (Social Proof - Gold/Yellow)
  2. **Product Image:** Aspect ratio 3:4 or 1:1, high-resolution, lazy-loaded, with smooth hover-zoom on desktop.
  3. **Product Title:** Maximum 2 lines with text truncation ellipsis (`...`) for consistent card heights.
  4. **Available Color Swatches:** Visual circular color dots (e.g., Maroon, Indigo, Mustard, Olive, White) indicating available variants. Clicking or hovering shows color name tooltip.
  5. **Pricing Block:**
     - Final Selling Price in Indian Rupees (`₹`), displayed in large, bold font.
     - Maximum Retail Price (MRP) with strikethrough in muted grey.
     - Discount Percentage badge in green (e.g., `(40% OFF)`), automatically calculated via:
       $$\text{Discount \%} = \text{round}\left(\frac{\text{MRP} - \text{Selling Price}}{\text{MRP}} \times 100\right)$$
  6. **Call-to-Action Buttons:**
     - **Add to Cart:** Secondary button style (outlined or neutral), adds 1 unit to cart with toast notification.
     - **Buy Now:** Primary high-contrast button (Amazon Yellow / Flipkart Orange style), routes to instant checkout intent.
- **FR-CRD-03 (Out of Stock Handling):** When a product's tag is set to "Out of Stock" or its stock count is 0:
  - The card must display an "Out of Stock" badge.
  - "Add to Cart" and "Buy Now" buttons must be disabled and visually greyed out.
  - An optional "Notify Me" or "Enquire via WhatsApp" button replaces the action buttons.

---

### 5.3 Shopping Cart Module (No Payment Gateway)
- **FR-CRT-01:** Users must be able to view their shopping cart via a flyout slide-over drawer or dedicated `/cart` page.
- **FR-CRT-02:** The cart must list:
  - Product thumbnail, title, selected color, unit price, quantity increment/decrement controls (`-`, `qty`, `+`), line item subtotal, and a "Remove" icon.
- **FR-CRT-03:** Cart summary box must display:
  - Total MRP value.
  - Total Discount amount saved (e.g., *"You saved ₹450 on this order"*).
  - Delivery charge indicator (e.g., *"Free Delivery"* or *"₹50 - Free above ₹999"*).
  - Total Payable Amount (inclusive of all taxes).
- **FR-CRT-04 (Buy Now / Checkout Intent):**
  - Clicking "Checkout" or "Buy Now" must open the **Checkout Intent Modal**.
  - The modal informs the user: *"Online automated payments are launching soon! We are currently fulfilling orders directly via WhatsApp / Phone confirmation."*
  - Provides a single-click button: **"Confirm Order via WhatsApp"**.
  - On click, it generates a pre-formatted WhatsApp Web / App link directed to the client's business phone number containing:
    ```
    Hello [Store Name], I would like to order the following items:
    1. Bengal Cotton Gamcha - Red Stripe (Qty: 2) - ₹398
    2. Chanderi Silk Dupatta - Peacock Blue (Qty: 1) - ₹799
    Total Estimated Amount: ₹1,197
    Please confirm availability and dispatch details.
    ```

---

### 5.4 Customer Account Module
- **FR-ACC-01 (Authentication):**
  - **Signup:** Name, Email address, Phone number (10-digit Indian format), Password, and Confirm Password.
  - **Login:** Email/Phone + Password credentials with "Remember Me" toggle.
  - **Logout:** Clears active customer token/session and redirects to Home.
- **FR-ACC-02 (Customer Profile):**
  - Displays customer details with in-place editing for: Full Name, Contact Number, and Default Delivery Address (Street Address, Landmark, City, State, PIN Code).
- **FR-ACC-03 (Order History Placeholder):**
  - Dedicated tab under `/profile/orders`.
  - For this demo phase, displays an intuitive informational placeholder:
    - Illustrated graphic with message: *"No active online orders found. Once online payments go live, your order tracking, invoices, and shipment status will appear here."*
    - Includes a CTA: "Browse New Arrivals" linking to Shop.

---

### 5.5 Admin Panel Module (`/admin`)
- **FR-ADM-01 (Admin Access):**
  - Isolated admin route `/admin/login` protected by secure session authentication.
  - Unauthorized visitors attempting to access `/admin/*` are redirected to `/admin/login`.
- **FR-ADM-02 (Product Management - CRUD):**
  - **Create:** Form supporting Title, Category (`Women's Scarves & Dupattas` vs `Men's Gamchas`), Description, Fabric Type (e.g., Pure Cotton, Khadi, Chanderi, Modal), MRP (₹), Selling Price (₹), Available Colors (comma-separated or multi-tag input), Image URL or direct file upload, and Assigned Tag/Badge.
  - **Read:** Paginated data table listing all products with search by title, category filter, thumbnail preview, price, status badge, and action buttons.
  - **Update:** Pre-filled edit form permitting updates to pricing, inventory status, descriptions, and imagery.
  - **Delete:** Soft or hard delete with confirmation prompt modal.
  - **Status Toggle:** Single-click toggle switch to mark product as `Active` (visible in store) or `Inactive` (hidden from store).
- **FR-ADM-03 (Offer Management - CRUD):**
  - Manage the first-load modal popup: Headline, Subtext, Coupon Code, Promo Graphic URL, and an `Active` toggle.
  - System rule: Only one offer can have the `Active Popup = TRUE` status at any given time.
- **FR-ADM-04 (Product Tag/Badge Management - CRUD):**
  - Manage badges assigned to product corners.
  - Admin can create custom badge text (e.g., "Handcrafted", "Festival Special") and select predefined accent colors (Red, Yellow, Blue, Green, Grey).

---

## 6. Page & Screen Specifications

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GLOBAL SITE HEADER                              │
│ [Brand Logo]   [Home] [Shop] [B2B Wholesale] [About Us] [Contact]      │
│                [Search Bar]      [Account Icon]      [Cart Icon (Badge)]│
└────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Page 1: Home (`/`)
- **Top Announcement Bar:** Sticky ribbon showing current store perk (e.g., *"Free shipping across India on orders above ₹799 | Handwoven Authenticity"*).
- **Hero Banner Carousel:**
  - High-impact banners spotlighting the two core categories:
    - Slide 1: *"Handcrafted Dupattas & Scarves - Elegance in Every Thread"* with "Shop Women's" CTA.
    - Slide 2: *"Authentic Indian Gamchas - 100% Breathable Pure Cotton"* with "Shop Men's" CTA.
- **Featured Categories Section:** 2 large visual cards directing traffic to "Women's Collection" and "Men's Gamchas".
- **Trending & Best Sellers Grid:** 8 curated Amazon/Flipkart-style cards showing top picks.
- **Value Proposition Bar:** 4 trust markers with clean icons:
  - *100% Authentic Handloom Weaves*
  - *Direct from Weaver Pricing*
  - *Easy WhatsApp Support*
  - *Pan-India Delivery (Coming Soon)*
- **B2B Teaser Banner:** Promotional strip: *"Looking for Bulk or Corporate Orders? Get exclusive wholesale rates."* with "Explore B2B" CTA.
- **Global Footer:** Company bio, quick links, category links, customer care contact, social media links, copyright notice.

---

### 6.2 Page 2: Collection / Shop (`/shop`)
- **Layout:** Desktop two-column layout (Left: Sticky Filter Sidebar; Right: Product Grid). Mobile: Floating "Filter & Sort" bottom bar opening a slide-up drawer.
- **Filters:**
  - Category: All, Women's Scarves & Dupattas, Men's Gamchas.
  - Fabric: Pure Cotton, Khadi, Chanderi Silk, Linen.
  - Color: Multi-select color circles.
  - Price Range Slider: Min ₹199 to Max ₹2,999.
  - Availability: In Stock only checkbox.
- **Sort Options:** Featured, Price: Low to High, Price: High to Low, Newest Arrivals, Discount: High to Low.
- **Product Card Grid:** Infinite scroll or clean pagination (12 products per page).

---

### 6.3 Page 3: B2B Wholesale Portal (`/b2b`)
- **Hero Section:** Clear headline catering to institutional buyers: *"Direct Handloom Wholesale & Bulk Supply"*.
- **Wholesale Capabilities Grid:**
  - Custom Dyeing & Weaving options.
  - Low Minimum Order Quantities (MOQs starting at 50 pieces).
  - Corporate gifting & customized packaging.
  - Export and pan-India transport support.
- **B2B Bulk Enquiry Form:**
  - Full Name & Designation.
  - Business / Company Name.
  - GSTIN (Optional field with helper text *"Optional for initial quote"*).
  - Phone / WhatsApp Number (Mandatory).
  - Email Address.
  - Product Interest (`Scarves/Dupattas`, `Gamchas`, or `Both`).
  - Estimated Order Volume (`50-100 pcs`, `100-500 pcs`, `500+ pcs`).
  - Requirements / Specifications Message.
  - "Submit Bulk Enquiry" Button with instant success feedback.

---

### 6.4 Page 4: About Us (`/about`)
- **Brand Story:** The narrative of celebrating Indian regional textile heritage, supporting rural weavers, and preserving traditional looms.
- **Craftsmanship & Fabric Quality:** Educational breakdown explaining why traditional Gamchas and handspun Dupattas are superior in Indian climatic conditions (sweat absorption, breathability, durability).
- **Weaver Empowerment:** Brief ethical statement on fair compensation for artisan clusters.

---

### 6.5 Page 5: Contact (`/contact`)
- **Direct Communication Cards:**
  - WhatsApp Business Chat link (prominent green button).
  - Customer Support Telephone Number.
  - Official Support Email Address.
  - Physical Workshop / Office Address in India.
- **General Inquiry Form:** Name, Email, Phone, Subject, Message, and Submit button.
- **Operating Hours:** Displaying business hours (e.g., Monday – Saturday, 10:00 AM – 7:00 PM IST).
- **Map Location:** Embedded Google Map placeholder for physical credibility.

---

## 7. Data Requirements & Schemas

### 7.1 Entity Relationship Diagram (Conceptual)

```
┌──────────────────┐            ┌──────────────────┐
│     PRODUCT      │            │       TAG        │
├──────────────────┤            ├──────────────────┤
│ id (PK)          │            │ id (PK)          │
│ title            │◄───────────│ name             │
│ slug             │            │ color_code       │
│ category         │            │ is_active        │
│ mrp              │            └──────────────────┘
│ selling_price    │
│ description      │            ┌──────────────────┐
│ colors (JSON)    │            │      OFFER       │
│ image_url        │            ├──────────────────┤
│ tag_id (FK)      │            │ id (PK)          │
│ status (ACT/INA) │            │ title            │
│ stock_count      │            │ coupon_code      │
└─────────┬────────┘            │ is_popup_active  │
          │                     └──────────────────┘
          ▼
┌──────────────────┐            ┌──────────────────┐
│    CART_ITEM     │            │       USER       │
├──────────────────┤            ├──────────────────┤
│ id (PK)          │            │ id (PK)          │
│ session_id / UID │◄───────────│ email / phone    │
│ product_id (FK)  │            │ password_hash    │
│ color_selected   │            │ role (CUST/ADM)  │
│ quantity         │            │ saved_address    │
└──────────────────┘            └──────────────────┘
```

### 7.2 Data Dictionaries

#### Product Entity
```typescript
interface Product {
  id: string;                    // UUID or auto-increment integer
  title: string;                 // e.g., "Pure Cotton Traditional Red Check Gamcha"
  slug: string;                  // URL-friendly slug
  category: "scarves_dupattas" | "gamchas";
  mrp: number;                   // In INR, e.g., 499
  selling_price: number;         // In INR, e.g., 299
  discount_percentage: number;   // Computed: Math.round(((mrp - selling_price) / mrp) * 100)
  description: string;           // Product details, fabric composition, dimensions
  fabric: string;                // e.g., "100% Khadi Cotton"
  colors: Array<{
    name: string;                // e.g., "Maroon"
    hex: string;                 // e.g., "#800000"
  }>;
  image_url: string;             // Direct URL or cloud asset link
  gallery_urls?: string[];       // Optional secondary view images
  tag_id?: string;               // Reference to assigned Badge
  status: "active" | "inactive"; // Soft toggle for catalogue display
  stock_count: number;           // Numeric inventory indicator (0 triggers Out of Stock)
  created_at: string;            // ISO timestamp
  updated_at: string;
}
```

#### Offer Entity
```typescript
interface Offer {
  id: string;
  title: string;                 // e.g., "First Order Free Delivery"
  description: string;           // e.g., "Get zero shipping charges on your first purchase."
  coupon_code: string;           // e.g., "FIRSTFREE"
  banner_image_url?: string;
  is_popup_active: boolean;      // True if displayed on first load
  created_at: string;
}
```

#### B2B Lead / Enquiry Entity
```typescript
interface B2BEnquiry {
  id: string;
  full_name: string;
  business_name: string;
  gstin?: string;
  phone: string;
  email: string;
  product_interest: "scarves_dupattas" | "gamchas" | "both";
  estimated_volume: "50-100" | "100-500" | "500+";
  message: string;
  created_at: string;
}
```

---

## 8. User Stories with Acceptance Criteria

### US-01: Amazon/Flipkart-Style Product Browsing
**As a** value-conscious Indian shopper,  
**I want to** see the product's MRP, discounted price, and discount percentage clearly on the product card,  
**So that** I immediately recognize the cost savings and make quick purchase decisions.

#### Acceptance Criteria:
1. GIVEN a product with an MRP of ₹500 and a selling price of ₹250,  
   WHEN the product card renders on mobile or desktop,  
   THEN it must display `₹250` in bold, `₹500` with a line strikethrough, and a badge reading `50% OFF`.
2. GIVEN any product card,  
   WHEN hovering on desktop or viewing on mobile,  
   THEN all available color swatches must be visible as color dots.
3. GIVEN a product with the tag "Only 2-3 Left",  
   WHEN displayed in the grid,  
   THEN an attention-grabbing badge must be pinned to the card corner.

---

### US-02: First-Load Welcome Offer Popup
**As a** first-time website visitor,  
**I want to** receive an attractive welcome offer when I land on the store,  
**So that** I feel encouraged to explore and initiate an order.

#### Acceptance Criteria:
1. GIVEN a user visiting the website for the first time in a browser session,  
   WHEN the home page finishes loading,  
   THEN the promotional modal popup must appear over a dimmed background.
2. GIVEN the offer popup is displayed,  
   WHEN the user clicks the close `X` button, presses `Escape`, or clicks outside the modal,  
   THEN the modal must close immediately and remain closed for the remainder of that browser session.
3. GIVEN the admin has set all offers to `is_popup_active = false`,  
   WHEN any visitor opens the site,  
   THEN no popup shall be triggered.

---

### US-03: Cart Checkout Intent & WhatsApp Routing
**As a** customer ready to purchase an item,  
**I want to** click "Buy Now" and receive a clear confirmation pathway,  
**So that** I know how my order will be fulfilled even without an active payment gateway.

#### Acceptance Criteria:
1. GIVEN a user with items in their cart or clicking "Buy Now" on a card,  
   WHEN they trigger checkout,  
   THEN an explicit message must display: *"Online payment gateway is launching soon. Complete your order instantly via WhatsApp confirmation."*
2. GIVEN the user chooses to proceed via WhatsApp,  
   WHEN clicking "Confirm on WhatsApp",  
   THEN a new tab/application opens with a pre-filled text containing item names, quantities, and total amount directed to the store's official WhatsApp number.
3. GIVEN a product is marked "Out of Stock",  
   WHEN viewing the card,  
   THEN "Buy Now" and "Add to Cart" buttons must be disabled.

---

### US-04: Admin Catalogue Management
**As a** non-technical store administrator,  
**I want to** add and edit products, update pricing, and toggle inventory tags from an admin screen,  
**So that** my demo website always reflects current inventory without modifying source code.

#### Acceptance Criteria:
1. GIVEN an authenticated admin on the `/admin/products` page,  
   WHEN they input product details, enter image URLs or upload files, and click "Save",  
   THEN the new product must instantly be queryable and visible on the public `/shop` page.
2. GIVEN an existing product,  
   WHEN the admin updates the status toggle from `Active` to `Inactive`,  
   THEN the product must be immediately hidden from public search and category listings.
3. GIVEN the admin modifying an offer,  
   WHEN marking an offer as active for popup,  
   THEN all previously active popups must automatically be deactivated.

---

## 9. Non-Functional Requirements (NFRs)

### 9.1 Performance & Responsiveness
- **NFR-PERF-01 (Speed on 4G):** Total page weight for `/` and `/shop` must not exceed 2.0 MB on initial load. First Contentful Paint (FCP) must be under 1.8 seconds on standard Indian 4G mobile connections.
- **NFR-PERF-02 (Mobile-First Layout):** Over 80% of Indian retail web traffic originates on mobile devices. All interactive targets (buttons, color dots, filter chips) must have a minimum tap area of 44x44 pixels.
- **NFR-PERF-03 (Image Optimization):** Product images must be automatically rendered with modern compression (WebP/AVIF format) with explicit width/height to avoid Cumulative Layout Shift (CLS < 0.1).

### 9.2 Usability & Localization
- **NFR-LOC-01 (Currency):** All monetary figures must consistently format with the Indian Rupee symbol (`₹`) using Indian numbering formatting (e.g., `₹1,299` and `₹12,499`, not `12499.00`).
- **NFR-LOC-02 (Marketplace Familiarity):** Typography and visual hierarchy must mimic established Indian e-commerce conventions: green badges for discounts, orange/yellow for "Buy Now", clean white background cards with subtle box-shadows.

### 9.3 Security & Authentication
- **NFR-SEC-01 (Admin Protection):** The admin route `/admin` must be protected by salted password hashing (e.g., bcrypt) and secure, HTTP-only session cookies or JWT tokens.
- **NFR-SEC-02 (Input Sanitation):** All contact and B2B enquiry form inputs must be sanitized against cross-site scripting (XSS) and SQL/NoSQL injection attacks.
- **NFR-SEC-03 (Data Privacy):** Customer phone numbers and addresses collected during signup or B2B requests must be kept private and never exposed via client-side API responses.

### 9.4 Compatibility
- Cross-browser support for Google Chrome (Mobile & Desktop), Apple Safari (iOS & macOS), Mozilla Firefox, Samsung Internet, and Microsoft Edge.

---

## 10. UI State Specifications (Edge Cases, Loading, Empty & Error States)

| Screen / Component | State | UI Behavior & Copy Specification |
| :--- | :--- | :--- |
| **Product Grid (`/shop`)** | **Loading** | Displays 8 pulsating skeleton cards mimicking the image, title line, and button placeholders. |
| **Product Grid (`/shop`)** | **Empty (No Filter Matches)** | Centered illustration of a handloom spindle: *"No products match your selected filters. Try resetting color or price filters."* with a "Clear All Filters" button. |
| **Product Grid (`/shop`)** | **Error (API/Network Fail)** | Toast or inline alert: *"Unable to load catalogue right now. Please check your internet connection and refresh."* |
| **Shopping Cart (`/cart`)** | **Empty** | Empty shopping bag illustration: *"Your shopping cart is empty! Explore our handwoven dupattas and gamchas."* with a prominent "Start Shopping" button. |
| **Customer Order History** | **Placeholder State** | Informational banner: *"No online orders yet. We are currently accepting orders via WhatsApp and direct contact while automated checkout is under preparation."* |
| **B2B Enquiry Form** | **Submitting / Success** | Button displays loading spinner during submission. On success, replaces form with a green tick card: *"Thank you! Your bulk enquiry has been received. Our team will contact you within 24 hours on your provided phone/WhatsApp number."* |
| **Admin Product Form** | **Validation Error** | Red outline around invalid inputs with specific feedback: *"Selling Price cannot exceed MRP"*, *"Please upload at least one product photo"*. |

---

## 11. MVP Success Criteria

1. **Client Sign-off & Demo Satisfaction:**  
   The client can independently navigate all 5 pages, verify that product cards look indistinguishable from established marketplace patterns, and experience an authentic shopping flow.
2. **Zero-Code Catalogue Autonomy:**  
   The client successfully logs into `/admin`, creates a real product with images and color variants, sets an "Only 2-3 Left" tag, and sees it live in the shop within 30 seconds without developer assistance.
3. **Frictionless Lead Capture:**  
   Clicking "Buy Now" smoothly transitions into a pre-populated WhatsApp message on both mobile devices and desktop WhatsApp Web, demonstrating clear customer intent capture.
4. **B2B Pipeline Demonstration:**  
   Wholesale leads submitted via the `/b2b` page are recorded accurately in the database and visible in the admin inquiries log.

---

## 12. Project Assumptions

1. **Demo Product Assets:** Initial deployment will use placeholder or sample photography of Men's Gamchas (traditional red/white cotton checks, modern plains) and Women's Dupattas (Chanderi, Kalamkari, Phulkari styles) until real inventory photos are ready.
2. **Hosting Infrastructure:** The demo website will be hosted on scalable modern serverless platforms (e.g., Vercel, Netlify, or standard VPS) with a lightweight PostgreSQL/MongoDB/Supabase backend.
3. **No Financial Regulatory Overhead for Phase 1:** Because payment gateway integration is deferred, requirements for GST merchant onboarding, payment aggregator KYC, automated invoicing, and PCI-DSS compliance are not applicable for this milestone.
4. **WhatsApp Communication:** The client maintains an active mobile number registered on WhatsApp Business to handle customer inquiries triggered from the website.

---

## 13. Architectural Decisions Requiring Client Approval

Prior to technical implementation, the client must review and approve the following design decisions:

| # | Decision Item | Recommended Approach | Alternative Approach | Impact / Trade-off |
| :- | :--- | :--- | :--- | :--- |
| **D-01** | **"Buy Now" Action Target** | **Pre-filled WhatsApp Intent:** Directly opens WhatsApp with the order summary. Highly preferred in the Indian market for small businesses and artisanal brands. | **Informational Modal Only:** Shows a popup saying *"Online payment launching soon; please call us."* | WhatsApp approach captures actual leads; modal only provides passive information. |
| **D-02** | **Product Image Storage** | **Cloudinary or AWS S3 Storage:** Admin uploads photo files directly from phone/laptop; system resizes and hosts them. | **External Image URL Input Only:** Admin must manually host photos elsewhere and paste image links. | Cloudinary/S3 offers superior ease-of-use for non-technical admins; requires cloud bucket credentials. |
| **D-03** | **Customer Account Requirement** | **Optional Guest Checkout Intent:** Users can use Cart and "Buy Now" without registering. Registration is optional. | **Mandatory Login:** User must register/login before adding to cart or clicking Buy Now. | Mandatory login adds friction and reduces demo conversion; guest checkout allows effortless exploration. |
| **D-04** | **B2B GSTIN Requirement** | **Optional Field:** Keep GSTIN optional so small boutique owners without active GST can still submit wholesale inquiries. | **Mandatory Field:** Require valid 15-digit GSTIN to prevent non-genuine B2B submissions. | Making it optional maximizes lead volume during the initial launch phase. |

---

*End of Product Requirement Document (PRD.md)*

