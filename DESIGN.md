# Design System & UI/UX Specification (DESIGN.md)

## Project: Premium Ethnic Handloom E-Commerce (Scarves, Dupattas & Gamchas)
**Document Version:** 1.0.0  
**Target Audience:** Indian Retail Shoppers (Mobile-First) & Wholesale B2B Partners  
**Source of Truth:** [PRD.md](file:///d:/Projects/RA-Universal/PRD.md)  
**Role:** Senior Product Designer & Design Systems Architect  

---

## 1. Design Principles

1. **Textile as the Hero:**  
   The natural texture, weave, drape, and vibrant dye of the dupattas and gamchas must be the primary visual focal point. Neutral, unobtrusive backgrounds and generous white space allow the craftsmanship to stand out without artificial digital decoration.
2. **Indian Marketplace Clarity with Artisanal Elegance:**  
   Combines the conversion-driven clarity of Indian marketplaces (Flipkart/Amazon pricing hierarchy, discount callouts, scarcity badges) with the restrained elegance of a boutique heritage brand.
3. **Mobile-First Ergonomics:**  
   Designed primarily for 360px–414px mobile viewports (where 80%+ of Indian retail traffic occurs). All touch targets adhere to a minimum of 44×44px, key actions sit within the thumb zone, and interfaces load instantaneously.
4. **Familiarity Over Novelty:**  
   Uses predictable, standard e-commerce patterns: top announcement bars, 2-column mobile product grids, bottom sheet filter drawers, and slide-over carts. Avoids experimental navigation patterns that create friction for Tier 2/Tier 3 shoppers.
5. **Trust & Transparency:**  
   Clear Rupee (`₹`) pricing, upfront disclosure that online payments are launching soon, prominent WhatsApp assistance, and visible fabric authenticity markers build immediate trust.

---

## 2. Color Palette & Token System

The color system draws inspiration from authentic Indian natural dyes (Indigo, Madder/Kumkum, Haldi/Ochre, and Kora/Raw Cotton) while meeting strict WCAG 2.1 AA accessibility contrast standards against white and off-white backgrounds.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CORE COLOR PALETTE                              │
│                                                                             │
│  [ Primary: Deep Madder ]   [ Secondary: Kora Silk ]   [ Accent: Haldi Gold]│
│         #7B181E                    #FDFBF7                    #B45309       │
│                                                                             │
│  [ Text: Charcoal Noir ]    [ Border: Loom Muted ]     [ Offer: Forest Green│
│         #1C1917                    #E7E5E4                    #15803D       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Brand & Semantic Color Tokens

| Token Name | Hex Code | Semantic Role & Usage | Contrast Ratio (vs Background) |
| :--- | :--- | :--- | :--- |
| **`color-brand-primary`** | `#7B181E` | Deep Madder Red. Primary brand identity, primary navigation links, active states, and boutique accents. | 8.2:1 on White (Passes AAA) |
| **`color-brand-primary-hover`** | `#5F1217` | Darkened Madder. Hover and pressed states for primary elements. | 10.5:1 on White |
| **`color-brand-secondary`** | `#FDFBF7` | Kora (Raw Silk / Unbleached Cotton). Surface background for page sections, cards, and subtle separators. | Base Surface |
| **`color-accent-gold`** | `#B45309` | Haldi / Brass Gold. Premium badges ("Best Selling"), star ratings, and celebratory accents. | 4.8:1 on White (Passes AA) |
| **`color-cta-buynow`** | `#F59E0B` | Indian Marketplace High-Intent Amber/Yellow. Dedicated to the "Buy Now" button for instant visual hierarchy. | 10.2:1 against `#1C1917` Text |
| **`color-cta-buynow-hover`** | `#D97706` | Darkened Amber for button hover/active states. | 8.6:1 against `#1C1917` Text |
| **`color-success`** | `#15803D` | Mehendi / Forest Green. Discount percentage tags (`50% OFF`), in-stock indicators, and savings callouts. | 5.3:1 on White (Passes AA) |
| **`color-warning`** | `#C2410C` | Deep Terracotta Orange. "Only 2-3 Left" scarcity badges. | 4.9:1 on White (Passes AA) |
| **`color-error`** | `#DC2626` | Crimson Red. Form field error messages, out-of-stock badges, and destructive actions. | 4.7:1 on White (Passes AA) |
| **`color-whatsapp`** | `#25D366` | WhatsApp Brand Green. Dedicated WhatsApp enquiry and direct order buttons. | 4.6:1 against `#0F172A` Text |

### 2.2 Neutral Palette (Text, Surfaces & Borders)

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **`color-neutral-900`** | `#1C1917` | Primary typography, headlines, product titles, and final selling prices. |
| **`color-neutral-700`** | `#44403C` | Body copy, fabric descriptions, and secondary metadata. |
| **`color-neutral-500`** | `#78716C` | MRP strikethrough prices, input placeholders, and inactive labels. |
| **`color-neutral-300`** | `#D6D3D1` | Card outlines, input borders, and divider rules. |
| **`color-neutral-100`** | `#F5F5F4` | Image background placeholder, skeleton loaders, and table header rows. |
| **`color-neutral-50`** | `#FAFAF9` | Subtle section backgrounds and alternating rows. |
| **`color-surface-white`** | `#FFFFFF` | Core card surface, dropdowns, and modal dialogs. |

---

## 3. Typography Scale & Hierarchy

The typographic system pairs a refined serif for editorial headlines (reflecting Indian handloom craftsmanship and heritage) with a clean, highly legible geometric sans-serif for numbers, prices, interface labels, and body text.

### 3.1 Font Families
- **Display & Headings:** `Playfair Display` or `Cinzel` (Fallback: `Georgia, serif`) — Applied to brand logo, section headings, and promotional titles.
- **Body & Interface:** `Plus Jakarta Sans` or `Inter` (Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) — Applied to product cards, pricing, filters, forms, and admin tables.

### 3.2 Type Scale (Based on a 1.250 Major Third Modular Scale)

| Style Token | Font Size | Line Height | Weight | Letter Spacing | Use Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display-1** | 36px (2.25rem) | 44px (1.2) | 700 Serif | -0.02em | Hero headline on Desktop |
| **Display-2** | 28px (1.75rem) | 36px (1.25) | 700 Serif | -0.01em | Hero headline on Mobile, Page Titles |
| **Heading-1** | 24px (1.5rem) | 32px (1.3) | 600 Serif | 0.00em | Section titles ("Trending Dupattas", "B2B Wholesale") |
| **Heading-2** | 20px (1.25rem) | 28px (1.35) | 600 Serif | 0.00em | Card group headers, drawer headings |
| **Heading-3** | 16px (1.0rem) | 24px (1.4) | 600 Sans | 0.01em | Modal headers, filter group titles |
| **Price-Hero** | 18px (1.125rem) | 24px (1.2) | 700 Sans | 0.00em | Final selling price on product cards |
| **Price-MRP** | 13px (0.8125rem)| 18px (1.2) | 400 Sans | 0.00em | Strikethrough original price |
| **Price-Discount** | 12px (0.75rem)| 16px (1.2) | 700 Sans | 0.02em | Green discount badge (`X% OFF`) |
| **Body-Large** | 16px (1.0rem) | 24px (1.5) | 400 Sans | 0.00em | About us story, editorial blurbs |
| **Body-Base** | 14px (0.875rem)| 20px (1.45) | 400 / 500 Sans| 0.00em | Product card titles, form inputs, table data |
| **Body-Small** | 12px (0.75rem) | 16px (1.4) | 400 Sans | 0.01em | Metadata, fabric info, trust markers |
| **Badge-Text** | 10px (0.625rem)| 14px (1.2) | 700 Sans | 0.04em Uppercase | Scarcity badges ("Only 2-3 Left", "Sale") |

---

## 4. Spacing, Elevation & Shape System

### 4.1 Spacing Scale (8-Point Grid with 4-Point Sub-Grid)

| Token | Dimension | Common Application |
| :--- | :--- | :--- |
| **`space-1`** | 4px | Badge padding, micro-spacing between price and discount badge |
| **`space-2`** | 8px | Button vertical padding (compact), gap between color swatches |
| **`space-3`** | 12px | Product card inner padding (mobile), stack gap between title and price |
| **`space-4`** | 16px | Product card inner padding (desktop), form field gaps, grid gap (mobile) |
| **`space-5`** | 20px | Navigation link spacing |
| **`space-6`** | 24px | Section inner padding, grid gap (desktop) |
| **`space-8`** | 32px | Modal dialog padding, major component gutters |
| **`space-12`**| 48px | Home page section vertical rhythm (mobile) |
| **`space-16`**| 64px | Home page section vertical rhythm (desktop) |
| **`space-24`**| 96px | Hero banner top/bottom padding |

### 4.2 Border Radius Scale
To maintain a crisp, refined textile aesthetic rather than a bubbly app look, border radiuses remain tight and deliberate:
- **`radius-none` (0px):** Announcement bar, full-bleed hero banners.
- **`radius-sm` (3px):** Corner badges, discount pills, color swatch focus rings.
- **`radius-md` (6px):** Product cards, action buttons, form inputs, dropdown menus.
- **`radius-lg` (12px):** Modal dialogs, bottom sheets, slide-over cart drawer corners.
- **`radius-full` (9999px):** Circular color swatches, round icon-only action triggers.

### 4.3 Elevation & Shadows (Tailored for White & Off-White Cards)
- **`shadow-none`:** Default state for product cards with clean 1px border (`#E7E5E4`).
- **`shadow-card-hover`:** `0 6px 16px -2px rgba(28, 25, 23, 0.08)` — Applied on product card hover.
- **`shadow-dropdown`:** `0 10px 25px -3px rgba(28, 25, 23, 0.12), 0 4px 6px -2px rgba(28, 25, 23, 0.04)` — Navigation menus and auto-complete results.
- **`shadow-modal`:** `0 20px 35px -5px rgba(28, 25, 23, 0.20), 0 10px 10px -5px rgba(28, 25, 23, 0.06)` — Offer popup and cart drawer.

---

## 5. Reusable Component Specifications

### 5.1 Global Header & Announcement Bar
- **Announcement Ribbon:** Height 34px, background `color-brand-primary` (`#7B181E`), text white 12px font-medium. Centered message: *"Free shipping across India on orders above ₹799 | Pure Handloom Authenticity"*.
- **Main Navigation Bar:** Height 64px (mobile: 56px), background `#FFFFFF`, border-bottom 1px `#E7E5E4`.
  - **Left:** Brand Mark (Serif logo, 20px height) + primary page links (Shop, B2B, About, Contact).
  - **Center (Desktop):** Search input with subtle rounded border and magnifying glass icon.
  - **Right:** Account profile trigger icon + Cart bag trigger icon with circular count badge (`bg-brand-primary text-white text-[10px] w-4 h-4`).
  - **Mobile Variant:** Hamburger menu on left, centered logo, cart and search icon on right.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Announcement: Free shipping across India on orders above ₹799          │
├────────────────────────────────────────────────────────────────────────┤
│ [LOGO]   Shop  B2B Wholesale  About Us  Contact   [Search]  [User] [Cart(2)]│
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Amazon/Flipkart-Style Product Card (The Core Component)
- **Container Dimensions:** Minimum width 160px (mobile 2-col), maximum 290px (desktop 4-col). Background `#FFFFFF`, border 1px solid `#E7E5E4`, radius 6px.
- **Card Anatomy (Top to Bottom):**
  1. **Image Media Box:** 3:4 aspect ratio. Neutral background (`#F5F5F4`). Product photo is centered, object-fit cover. Smooth 1.04x scale transition on card hover.
  2. **Pinned Corner Badge:** Positioned absolute `top-2 left-0`, z-index 10. Radius `0 3px 3px 0`. Padding `2px 8px`. Font size 10px bold uppercase.
  3. **Product Title:** 14px, semibold `#1C1917`. Truncated strictly at 2 lines (`line-clamp-2`, height fixed at 40px) to ensure aligned rows across the grid.
  4. **Available Color Dots:** Row of 16px circular swatches, spaced 6px apart. Active color has a 1px solid `#1C1917` ring offset by 2px white space.
  5. **Pricing Hierarchy (Crucial Indian E-Commerce Pattern):**
     - Left: **Final Selling Price** in 16px–18px bold `#1C1917` with Rupee symbol (`₹299`).
     - Center: **MRP** in 12px line-through `#78716C` (`₹599`).
     - Right: **Discount Tag** in 12px bold `#15803D` (`50% OFF`).
  6. **Action Buttons Container:** 2-column flexbox/grid pinned to bottom:
     - **Add to Cart:** Height 36px, border 1px solid `#D6D3D1`, text 13px medium `#1C1917`, background `#FFFFFF`. Hover: background `#F5F5F4`.
     - **Buy Now:** Height 36px, border none, background `color-cta-buynow` (`#F59E0B`), text 13px bold `#1C1917`. Hover: background `#D97706`.

```
┌───────────────────────────────────────────────┐
│ [Only 2-3 Left]                               │
│                                               │
│                 PRODUCT IMAGE                 │
│              (3:4 Aspect Ratio)               │
│                                               │
├───────────────────────────────────────────────┤
│ Bengal Cotton Handloom Gamcha - Red Border    │
│                                               │
│ [● Maroon] [● Indigo] [● Olive]               │
│                                               │
│ ₹299   <s>₹599</s>   (50% OFF)                │
│                                               │
│ ┌──────────────────────┐ ┌──────────────────┐ │
│ │     Add to Cart      │ │     Buy Now      │ │
│ └──────────────────────┘ └──────────────────┘ │
└───────────────────────────────────────────────┘
```

---

### 5.3 Product Corner Badges / Tags

| Badge Label | Background Token | Text Color | Icon / Indicator |
| :--- | :--- | :--- | :--- |
| **Only 2-3 Left** | `#C2410C` (Terracotta) | `#FFFFFF` | Lightning bolt or Flame icon |
| **Sale** | `#DC2626` (Crimson) | `#FFFFFF` | Tag icon |
| **Best Selling** | `#B45309` (Haldi Gold) | `#FFFFFF` | Star icon |
| **Out of Stock** | `#44403C` (Stone Grey) | `#FFFFFF` | None (Dims card opacity to 0.7) |

---

### 5.4 First-Visit Welcome Offer Popup
- **Backdrop Scrim:** `rgba(28, 25, 23, 0.65)` with CSS `backdrop-filter: blur(3px)`.
- **Card Container:** Width 90% (max-width 480px), background `#FFFFFF`, border-radius 12px, padding 32px (mobile: 24px), centered on screen.
- **Header:** Handloom border motif graphic or icon + Serif headline: *"Welcome to Heritage Weaves"*.
- **Offer Box:** Dashed border 1.5px `#7B181E`, background `#FDFBF7`, padding 16px, border-radius 8px.
  - Headline: *"First Order Free Delivery Across India"*.
  - Coupon Code Display: Bold monospaced coupon text: `FIRSTFREE` with a single-click "Copy Code" button.
- **Primary CTA:** Full-width button: *"Explore Handloom Collection"*, height 44px, background `color-brand-primary` (`#7B181E`), text white.
- **Dismiss Trigger:** Clear `✕` button top-right (size 32×32px) + secondary text button below CTA: *"No thanks, I'll browse first"*.

---

### 5.5 Cart Slide-Over Drawer
- **Dimensions:** Width 100% on mobile (< 640px), width 400px on desktop. Slides in from right edge over 250ms.
- **Drawer Header:** "Your Shopping Bag (X items)" with close button.
- **Cart Item Row:**
  - 64×80px image thumbnail with subtle border.
  - Title, selected color badge, and unit price.
  - Compact quantity controller: `[-] [ 1 ] [+]` (minimum tap zone 32×32px per button).
  - Trash can icon for item removal with confirmation undo toast.
- **Free Delivery Progress Indicator:**
  - Visual progress bar: *"Add ₹201 more to unlock FREE Delivery"* (Progress bar fills green when reaching ₹799).
- **Price Breakdown Box:**
  - Total MRP: `₹1,198`
  - Handloom Discount Saved: `-₹400` (in green)
  - Estimated Shipping: `FREE` (or `₹50`)
  - **Total Amount Payable: `₹798`**
- **Action Buttons:**
  - Primary: **"Buy Now via WhatsApp"** (Full-width, height 48px, background `#25D366`, white text, WhatsApp icon).
  - Secondary helper note: *"Online card/UPI payments are coming soon. Click to confirm instant delivery details with our weaver desk."*

---

### 5.6 Form Fields & Interactive Controls
- **Standard Input Height:** 44px (touch-friendly standard).
- **Default State:** Background `#FFFFFF`, border 1px solid `#D6D3D1`, radius 6px, text `#1C1917`, placeholder `#78716C`.
- **Focus State:** Border 1.5px solid `#7B181E`, outline 3px solid `rgba(123, 24, 30, 0.12)`.
- **Error State:** Border 1.5px solid `#DC2626`, accompanying 12px error text below the input field with warning icon.
- **Labels:** 13px medium `#44403C`, positioned cleanly above inputs with red asterisk for mandatory fields (`*`).

---

### 5.7 Empty, Loading & Error State Guidelines

| Component | State | Visual Representation |
| :--- | :--- | :--- |
| **Product Grid** | **Loading (Skeleton)** | Grid of 3:4 grey rectangle blocks with gentle shimmer animation (`#F5F5F4` to `#E7E5E4`), followed by 2 text lines and dual button blocks. |
| **Product Grid** | **Empty (No Search/Filter)** | Clean minimal illustration of a loom shuttle or empty shelf. Text: *"No matching handloom pieces found"*. Action button: *"Reset Filters"*. |
| **Shopping Cart** | **Empty** | Delicate outline of a shopping basket. Text: *"Your bag is empty"*. Subtext: *"Explore our authentic scarves, dupattas, and gamchas."* Action button: *"Shop New Arrivals"*. |
| **System Alert** | **Error (Network/Server)** | Non-blocking toast at bottom-center: Red accent border, alert icon, retry button. |

---

## 6. Page-Level Layout Guidance

### 6.1 Home Page (`/`)
1. **Announcement Ribbon:** Top fixed header.
2. **Hero Carousel:** 2 editorial slides with rich photography of models wearing pure cotton gamchas and handspun silk dupattas. Dual CTAs: "Shop Scarves & Dupattas" and "Shop Men's Gamchas".
3. **Category Splitter (2 Columns):** Large cards showcasing Women's Collection (Serif title) and Men's Gamchas.
4. **Trending Products Grid:** 8 cards (2 columns on mobile, 4 on desktop) displaying "Best Selling" and "Sale" badges.
5. **Craft & Origin Banner:** Storytelling section with cream background (`#FDFBF7`) highlighting 100% natural fibers, handloom origin, and artisan fair pay.
6. **B2B Bulk Wholesale Banner:** Prominent dark banner with direct link to `/b2b`.
7. **Customer Trust Badges:** 4 icons across a single row: Authentic Weaves, Direct Weaver Pricing, Safe Packaging, WhatsApp Assistance.

---

### 6.2 Collection / Shop Page (`/shop`)
- **Desktop:** Left column (260px sticky sidebar) for Filters. Right column (fluid) for Sorting dropdown, active filter pills, and 3–4 column Product Grid.
- **Mobile:** Sticky top bar below header showing Total Item Count ("48 Products Found") alongside a 50/50 split button bar: `[Sort By ▼]` and `[Filters (3) ⚙]`.
  - Tapping `Filters` opens a full-height **Slide-up Bottom Sheet** with expandable accordions for Category, Color, Price, and Availability, terminating in a fixed bottom action bar: *"Clear All"* and *"Apply Filters (48)"*.

---

### 6.3 Product Detail Experience (Modal / Page)
- **Visual Split:** Desktop 50/50 split (Left: sticky gallery; Right: product information & actions). Mobile: Full-bleed image carousel with pagination dots.
- **Key Details Displayed:**
  - Brand name / Artisan origin tag (e.g., *"Handwoven in West Bengal"*).
  - Title in Heading-1 Serif.
  - Price block with large Rupee font and savings breakdown.
  - Interactive color picker with text indicator (e.g., *"Selected: Peacock Blue"*).
  - Fabric specifications table: Material, Weave Type, Length & Width (e.g., *2.5 meters × 36 inches*), Wash Care instructions.
  - Sticky Bottom CTA on Mobile: Fixed bottom bar containing price and dual "Add to Cart" / "Buy Now" buttons whenever the main buttons scroll out of view.

---

### 6.4 B2B Wholesale Portal (`/b2b`)
- **Tone:** Professional, direct, and structured for institutional buyers.
- **Section 1 - Value Propositions:** 3 grid cards outlining MOQ advantages, custom dyeing capabilities, and direct weaver consignment rates.
- **Section 2 - Wholesale Form:** Clean, single-column card (max-width 640px) with clear sections:
  - Buyer Details (Name, Business Name, GSTIN).
  - Product Interest & Estimated Quantities (Select chips: `50-100 pcs`, `100-500 pcs`, `500+ pcs`).
  - Submit button with instant feedback.
- **Section 3 - Direct Contact:** Prominent "Direct Wholesale WhatsApp Desk" button for rapid communication.

---

### 6.5 Customer Account (Login, Signup, Profile, Orders)
- **Card Container:** Centered card (max-width 420px) on subtle cream background (`#FDFBF7`).
- **Tabbed Switcher:** Seamless toggle between "Login" and "Sign Up".
- **Order History Placeholder:**
  - Empty state graphic with friendly messaging: *"You don't have any online orders yet. We are actively finalizing our automated tracking portal!"*
  - Dedicated WhatsApp support button to track any existing manual orders.

---

### 6.6 Admin Product & Offer Management (`/admin`)
- **Design Philosophy:** Avoid complex, cluttered SaaS dashboard aesthetics. Prioritize clean typography, ample breathing room, high legibility, and straightforward tables.
- **Layout:** Collapsible left navigation bar (220px) + clean white content canvas.
- **Product Management View:**
  - Header with Page Title, Total Products count, and primary "+ Add New Product" button.
  - Data table with small thumbnail previews, editable title, price columns, category tag, inventory count, and a direct switch toggle for `Active / Inactive`.
- **Product Edit Drawer / Screen:**
  - Two-column form: Left side for Title, Description, Fabric, Category, and Pricing (MRP vs Selling Price auto-calculating discount).
  - Right side for Image Upload/URL preview box, Color Swatch manager (add/remove color hexes), and Badge selector dropdown.

---

## 7. Responsive Breakpoints & Grid Matrix

| Device Class | Viewport Range | Columns | Margin | Gutter | Layout Adaptation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `320px – 639px` | 2 columns | 12px | 12px | Product cards render strictly 2 per row; horizontal scroll for categories; filter bottom sheet. |
| **Tablet** | `640px – 1023px` | 3 columns | 24px | 16px | Product cards render 3 per row; header shows search input; filter sidebar toggles via drawer. |
| **Desktop** | `1024px – 1279px`| 4 columns | 32px | 24px | Sticky filter sidebar on shop page; 4-column product grid; mega-menus active. |
| **Wide Desktop**| `1280px+` | 4 columns | Auto | 24px | Max container width clamped at 1280px with centered auto-margins for clean framing. |

---

## 8. Accessibility Standards (WCAG 2.1 AA Compliance)

1. **Color Contrast:**
   - All body copy (`#1C1917` and `#44403C`) exceeds the 4.5:1 ratio against `#FFFFFF` and `#FDFBF7`.
   - Critical action buttons and text badges maintain at least 3.0:1 contrast for large/bold text.
2. **Touch Target Dimensions:**
   - Every clickable target (cart buttons, quantity modifiers, color dots, hamburger icon, close triggers) has a minimum physical bounding box of 44×44px.
3. **Screen Reader Optimization:**
   - All icon-only buttons (Close `✕`, Cart bag, Wishlist heart, Hamburger) must include descriptive `aria-label` attributes (e.g., `aria-label="Close offer popup"`).
   - Product card images must include programmatic alt-text combining Title and Category (e.g., `alt="Bengal Cotton Gamcha in Heritage Red Weave"`).
4. **Keyboard Focus Visibility:**
   - Interactive elements must never suppress outline indicators without providing an accessible alternative. Focus states feature a high-contrast 2px ring in `color-brand-primary` with a 2px offset.

---

## 9. Interaction, Motion & Animation Rules

All interface transitions must feel brisk, purposeful, and lightweight, reflecting physical paper and fabric interactions rather than flashy digital gimmicks.

- **Duration Tokens:**
  - **Fast (Micro-interactions):** `150ms` (Button press, color dot selection, checkbox toggle).
  - **Medium (Overlays & Drawers):** `250ms` (Cart slide-over, mobile navigation drawer, dropdown menus).
  - **Slow (Page transitions & Popups):** `300ms` (Offer popup fade-in, image modal expansion).
- **Easing Function:**
  - Standard Ease-Out: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy entry, natural settling).
- **Hover Transitions:**
  - Product Card Images: `transform: scale(1.03)` with `transition: transform 300ms ease-out`.
  - Buttons: Subtle brightness shift (`filter: brightness(0.95)`).
- **Reduced Motion:**
  - When the user's operating system requests `prefers-reduced-motion: reduce`, all scale, slide, and transform transitions are replaced with immediate opacity fades (`opacity: 0` to `1` over 100ms).

---

*End of Design System & UI/UX Specification (DESIGN.md)*

