# Project Implementation Plan & Execution Roadmap (IMPLEMENTATION_PLAN.md)

## Project: Demo E-Commerce Platform for Ethnic Apparel (Scarves, Dupattas & Gamchas)
**Document Version:** 1.0.0  
**Target Market:** India (D2C & B2B)  
**Companion Documents:**
- [PRD.md](file:///d:/Projects/RA-Universal/PRD.md)
- [TECH_SPEC.md](file:///d:/Projects/RA-Universal/TECH_SPEC.md)
- [DESIGN.md](file:///d:/Projects/RA-Universal/DESIGN.md)

---

## 1. Project Directory Structure

```
ra-universal/
├── public/
│   ├── images/
│   │   ├── hero/               # High-res banners for Men's & Women's collections
│   │   ├── products/           # Seed demo product photography (WebP format)
│   │   ├── icons/              # Handloom motifs, trust badges, WhatsApp icon
│   │   └── placeholders/       # Empty cart, loom spindle, search-empty SVG
│   └── favicon.ico
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (storefront)/       # Public Storefront Group
│   │   │   ├── layout.tsx      # AnnouncementBar + Header + Footer + Cart Drawer
│   │   │   ├── page.tsx        # Home Page (Hero, Categories, Trending Grid)
│   │   │   ├── shop/
│   │   │   │   └── page.tsx    # Collection / Shop with Sticky Filter & Sort
│   │   │   ├── product/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx# Product Detail View (Color swatches, Fabric specs)
│   │   │   ├── b2b/
│   │   │   │   └── page.tsx    # Wholesale Portal & Lead Form
│   │   │   ├── about/
│   │   │   │   └── page.tsx    # Brand Heritage & Weaver Story
│   │   │   ├── contact/
│   │   │   │   └── page.tsx    # Contact, WhatsApp Quick Connect & Map
│   │   │   └── account/
│   │   │       ├── login/page.tsx
│   │   │       ├── signup/page.tsx
│   │   │       └── profile/page.tsx # Profile & Order History Placeholder
│   │   ├── admin/              # Isolated Admin Portal
│   │   │   ├── layout.tsx      # Admin Sidebar & Session Gate
│   │   │   ├── login/page.tsx  # Admin Login
│   │   │   ├── products/page.tsx # Product CRUD Table & Form Modal
│   │   │   ├── offers/page.tsx   # Popup Offer CRUD
│   │   │   ├── tags/page.tsx     # Badge/Tag CRUD
│   │   │   └── enquiries/page.tsx# B2B Lead Inquiries Log
│   │   └── api/                # API Route Handlers
│   │       ├── products/route.ts
│   │       ├── offers/active/route.ts
│   │       ├── b2b/enquiry/route.ts
│   │       └── admin/
│   │           ├── auth/route.ts
│   │           ├── products/route.ts
│   │           └── tags/route.ts
│   ├── components/             # Reusable UI Component Library
│   │   ├── layout/
│   │   │   ├── AnnouncementBar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNavDrawer.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx       # Amazon/Flipkart-style Card
│   │   │   ├── ProductBadge.tsx      # Pinned corner tags
│   │   │   ├── PriceDisplay.tsx      # ₹ Selling Price, MRP, % Discount
│   │   │   ├── ColorSelector.tsx     # Circular swatch picker
│   │   │   └── ProductGridSkeleton.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx        # Slide-over bag
│   │   │   ├── CartItemRow.tsx
│   │   │   ├── FreeDeliveryProgress.tsx
│   │   │   └── BuyNowInterceptModal.tsx # WhatsApp order router
│   │   ├── marketing/
│   │   │   └── FirstVisitOfferModal.tsx # First-load dismissible popup
│   │   └── ui/                       # Primitives (Button, Input, Badge, Dialog)
│   ├── lib/                    # Utilities, DB Client & State
│   │   ├── db.ts               # Database client (Prisma/Drizzle/SQLite)
│   │   ├── store/
│   │   │   └── useCartStore.ts # Zustand cart store with localStorage persistence
│   │   ├── whatsapp.ts         # WhatsApp click-to-chat URL encoder
│   │   └── utils.ts            # Currency formatter (INR), classNames merger
│   └── data/
│       └── seedProducts.json   # Initial 12 authentic handloom items
├── PRD.md
├── TECH_SPEC.md
├── DESIGN.md
├── IMPLEMENTATION_PLAN.md
└── package.json
```

---

## 2. Sprint Execution Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SPRINT TIMELINE OVERVIEW                        │
├───────────┬──────────────────────────────────┬─────────────────────────┤
│ Sprint 1  │ Foundation & Storefront UI       │ Days 1 – 2              │
│ Sprint 2  │ Cart, WhatsApp Engine & Lead Gen │ Days 3 – 4              │
│ Sprint 3  │ Admin Dashboard & Catalogue CRUD │ Days 5 – 6              │
│ Sprint 4  │ QA, Audit & Client Demo Handover │ Day 7                   │
└───────────┴──────────────────────────────────┴─────────────────────────┘
```

### Sprint 1: Foundation & Storefront UI (Days 1–2)
- **Task 1.1:** Initialize Next.js project with Tailwind CSS, Lucide Icons, and TypeScript configuration.
- **Task 1.2:** Implement Design System color tokens, font configurations (Serif for headings, Sans for numbers/UI), and 8-point spacing variables in `tailwind.config.ts`.
- **Task 1.3:** Build Global Layout: Announcement Bar ("Free Shipping above ₹799"), Header with search and cart badge, and Footer with trust markers.
- **Task 1.4:** Construct the core **Amazon/Flipkart-style ProductCard** component:
  - 3:4 aspect ratio image container with hover zoom.
  - Pinned corner badge ("Only 2-3 Left", "Sale", "Best Selling", "Out of Stock").
  - Two-line truncated title.
  - Available color dots.
  - Price block: bold selling price, strikethrough MRP, green discount percentage.
  - Dual action buttons: "Add to Cart" and "Buy Now".
- **Task 1.5:** Construct `/` (Home) with Hero Banner Carousel, Category Highlight Splitter, and Best Sellers Grid.
- **Task 1.6:** Construct `/shop` (Collection) with responsive desktop sidebar filters and mobile bottom sheet drawer (filter by category, color, price range, stock).

---

### Sprint 2: Cart, WhatsApp Engine & Lead Generation (Days 3–4)
- **Task 2.1:** Setup `useCartStore` using Zustand with `localStorage` persistence.
- **Task 2.2:** Build the slide-over **CartDrawer**:
  - Live item counter badge in header.
  - Line items with thumbnail, selected color, quantity increment/decrement (`-` / `+`), and delete action.
  - Free Delivery Progress Bar (animates toward ₹799 threshold).
  - Discount breakdown: Total MRP, Total Savings, Shipping, Net Payable.
- **Task 2.3:** Build the **BuyNowInterceptModal** & WhatsApp order link generator:
  - Intercepts checkout and explains that automated online payment is coming soon.
  - Formats cart contents or single item into a polite, structured WhatsApp order message.
  - Launches `https://wa.me/[PHONE]?text=[ENCODED_MESSAGE]` in a new tab.
- **Task 2.4:** Build the **FirstVisitOfferModal**:
  - Triggers on first website load.
  - Displays welcome discount (`FIRSTFREE`).
  - Dismissing saves a flag in `sessionStorage` preventing reappearance during the session.
- **Task 2.5:** Build the `/b2b` Wholesale page with bulk tier info and lead inquiry form.
- **Task 2.6:** Build `/about` and `/contact` pages.

---

### Sprint 3: Admin Dashboard & Catalogue CRUD (Days 5–6)
- **Task 3.1:** Create password-protected `/admin/login` and session validation middleware.
- **Task 3.2:** Build `/admin/products` data table:
  - List all products with thumbnail, title, category, price, stock count, and active/inactive toggle switch.
  - Search bar and category filter.
- **Task 3.3:** Build Product Create/Edit Modal:
  - Fields for Title, Category, Description, Fabric, MRP, Selling Price (auto-calculating discount %).
  - Image URL input or file upload preview.
  - Multi-color hex selector.
  - Corner badge assignment dropdown ("Only 2-3 Left", "Sale", "Best Selling", "Out of Stock").
- **Task 3.4:** Build `/admin/offers` for toggling the first-visit popup offer and coupon code.
- **Task 3.5:** Build `/admin/enquiries` to view submitted B2B wholesale leads.

---

### Sprint 4: QA, Audit & Client Demo Handover (Day 7)
- **Task 4.1:** Verify mobile layout on 360px–414px viewports (Android Chrome & iOS Safari).
- **Task 4.2:** Run Lighthouse / Web Vitals audit (verify FCP < 1.8s, CLS < 0.1).
- **Task 4.3:** Verify edge cases:
  - Empty cart state.
  - No search results filter state.
  - Out of stock item behavior (disabled buttons).
- **Task 4.4:** Conduct client demonstration walkthrough.

---

## 3. Quality Assurance & Test Case Matrix

| Test ID | Area | Scenario / Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **Pricing** | Product with MRP ₹500, Selling Price ₹250 rendered on card. | Shows `₹250` bold, `₹500` strikethrough, `(50% OFF)` in green. | [ ] |
| **TC-02** | **Badges** | Product tagged with "Only 2-3 Left". | Corner badge renders with red/orange background and flame/warning icon. | [ ] |
| **TC-03** | **Stock** | Product marked "Out of Stock" (stock count = 0). | Card displays grey "Out of Stock" badge; "Add to Cart" and "Buy Now" are disabled. | [ ] |
| **TC-04** | **Cart State** | Add 2 items, refresh page or open in new tab. | Cart retains both items with correct quantities from `localStorage`. | [ ] |
| **TC-05** | **Free Delivery** | Cart total = ₹600. | Progress bar displays *"Add ₹199 more to get FREE Delivery"*. | [ ] |
| **TC-06** | **WhatsApp CTA**| Click "Buy Now" on Red Cotton Gamcha (Qty: 2). | Intercept modal opens; clicking WhatsApp button launches chat with pre-filled order text and ₹398 total. | [ ] |
| **TC-07** | **Popup Offer** | Visit homepage on fresh incognito window. | Popup appears with `FIRSTFREE` code. Closing it and reloading does not trigger it again. | [ ] |
| **TC-08** | **Admin Toggle**| Admin toggles product status from `Active` to `Inactive`. | Product immediately disappears from `/shop` and search results. | [ ] |
| **TC-09** | **B2B Form** | Submit B2B form with 10-digit Indian phone number and MOQ "100-500 pcs". | Shows green confirmation card; lead appears in `/admin/enquiries`. | [ ] |
| **TC-10** | **Mobile Grid** | Open `/shop` on 375px mobile screen. | Exactly 2 product cards per row, no horizontal scroll, clean touch targets (>= 44px). | [ ] |

---

## 4. Client Demonstration Script (Demo Runbook)

When presenting the completed website to the Indian client, follow this structured 5-step walkthrough:

1. **First Impression (Hero & Offer Popup):**
   - Open the homepage on a fresh browser tab. Show the immediate appearance of the **"First Order Free Delivery"** welcome popup. Demonstrate how easy it is to copy the coupon code or dismiss it.
2. **Browsing Experience (Amazon/Flipkart Familiarity):**
   - Navigate to `/shop`. Point out the 2-column mobile layout and the 4-column desktop layout.
   - Highlight the **Amazon/Flipkart-style pricing hierarchy**: ₹ Selling Price in bold, original MRP strikethrough, and prominent green `(XX% OFF)` discount badge.
   - Point out the corner scarcity tags: *"Only 2-3 Left"* and *"Best Selling"*.
3. **Cart & WhatsApp Order Flow:**
   - Click "Add to Cart" on a Men's Bengal Gamcha. Show the instantaneous toast notification and the live cart icon counter.
   - Open the Cart Drawer. Show the **Free Delivery threshold progress bar**.
   - Click **"Buy Now"**. Show the transparent checkout intercept modal explaining that online card/UPI payments are coming soon and demonstrate the one-click **WhatsApp Order intent** with the auto-populated bill summary.
4. **B2B Wholesale Portal:**
   - Navigate to `/b2b`. Show how corporate and boutique buyers can submit bulk inquiries with business name, product interest, and volume tiers (50–500+ pieces).
5. **Admin Self-Sufficiency (The Ultimate Test):**
   - Log into `/admin/login`.
   - Add a new product (e.g., *"Banarasi Silk Dupatta"*), enter MRP `₹1,999`, Selling Price `₹999`, choose "Best Selling" badge, and toggle `Active`.
   - Switch back to the public `/shop` tab and refresh to prove that the client can independently manage their store without paying a developer for ongoing updates.

---

*End of Project Implementation Plan (IMPLEMENTATION_PLAN.md)*
