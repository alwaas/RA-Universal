# Demo Product Catalogue & Seed Data Specification (DATA_CATALOG.md)

## Project: Demo E-Commerce Platform for Ethnic Apparel (Scarves, Dupattas & Gamchas)
**Document Version:** 1.0.0  
**Target Market:** India (D2C Retail & B2B Wholesale)  
**Author:** Senior Product Manager & Merchandising Architect  
**Companion Documents:**
- [PRD.md](file:///d:/Projects/RA-Universal/PRD.md)
- [DESIGN.md](file:///d:/Projects/RA-Universal/DESIGN.md)
- [TECH_SPEC.md](file:///d:/Projects/RA-Universal/TECH_SPEC.md)

---

## 1. Merchandising Strategy & Catalogue Structure

The initial demo catalogue is curated to showcase the rich diversity of traditional Indian handloom textiles while demonstrating the full range of visual states on the storefront:
- **Price Brackets:** Low-ticket everyday essentials (Men's Cotton Gamchas: ₹199–₹349) to mid/premium ethnic wear (Women's Silk/Embroidered Dupattas: ₹599–₹1,499).
- **Urgency & Status Badges:** Demonstrates `Only 2-3 Left`, `Sale`, `Best Selling`, and `Out of Stock` (with disabled buttons).
- **Color Swatches:** Multi-variant swatches (2 to 4 colors per product) showcasing natural dye palettes (Madder Red, Indigo Blue, Haldi Ochre, Olive Green, Raw Ecru).
- **Wholesale Appeal:** Highlights minimum order quantities (MOQs) and bulk pricing tiers for boutique retailers and corporate gifting purchasers.

---

## 2. Product Corner Badges & Tag Registry

| Badge Label | Slug | Accent Color Token | Hex Code | Visual Indicator | Strategic Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Only 2-3 Left** | `low-stock` | `color-warning` | `#C2410C` | 🔥 Scarcity Flame | Creates urgency for high-demand, low-inventory artisanal batches. |
| **Sale** | `sale` | `color-error` | `#DC2626` | 🏷️ Discount Tag | Highlights deep-value deals (>= 40% OFF MRP). |
| **Best Selling** | `best-seller` | `color-accent-gold` | `#B45309` | ⭐ Gold Star | Social proof highlighting flagship handloom weaves. |
| **Out of Stock** | `out-of-stock` | `color-neutral-700`| `#44403C` | 🚫 Dimmed Card | Dims card; disables "Add to Cart" and "Buy Now" buttons. |

---

## 3. Active Promotional Offers (First-Load Popup)

```json
{
  "id": "offer-welcome-firstfree",
  "title": "First Order Free Delivery Across India",
  "description": "Experience genuine handloom weaves with zero shipping charges on your initial purchase. Enter coupon code during WhatsApp or phone confirmation.",
  "coupon_code": "FIRSTFREE",
  "banner_image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80",
  "is_popup_active": true,
  "valid_from": "2026-01-01T00:00:00Z",
  "valid_until": "2026-12-31T23:59:59Z"
}
```

---

## 4. Category 1: Men's Gamchas (6 Flagship Products)

### Product 01: Classic Bengal Cotton Gamcha - Heritage Red Check
- **Category:** `gamchas`
- **Slug:** `classic-bengal-cotton-gamcha-red`
- **Fabric:** 100% Pure Bengal Weave Cotton (Breathable, sweat-absorbent, quick-dry)
- **Dimensions:** 1.8 meters (Length) × 34 inches (Width)
- **Pricing:**
  - **MRP:** `₹399.00`
  - **Final Selling Price:** `₹199.00`
  - **Discount:** `50% OFF` (Saves ₹200)
- **Badge:** `Best Selling` (Gold)
- **Stock Status:** Active | `25 units` in stock
- **Available Colors:**
  - Traditional Red (`#DC2626`)
  - Forest Green (`#15803D`)
  - Indigo Royal Blue (`#1D4ED8`)
- **Primary Image:** `https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Gentle hand wash in cold water; dry in shade to preserve dye vibrancy.

---

### Product 02: Sambalpuri Handloom Pure Cotton Men's Gamcha
- **Category:** `gamchas`
- **Slug:** `sambalpuri-handloom-cotton-gamcha`
- **Fabric:** Sambalpuri Hand-Spun Cotton with Ikat Border Weave
- **Dimensions:** 2.0 meters (Length) × 36 inches (Width)
- **Pricing:**
  - **MRP:** `₹499.00`
  - **Final Selling Price:** `₹279.00`
  - **Discount:** `44% OFF` (Saves ₹220)
- **Badge:** `Only 2-3 Left` (Terracotta)
- **Stock Status:** Active | `3 units` in stock (Urgency simulation)
- **Available Colors:**
  - Maroon & Black Ikat (`#800000`)
  - Mustard Ochre (`#CA8A04`)
- **Primary Image:** `https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Hand wash separately for the first two washes; iron on medium heat.

---

### Product 03: Assam Traditional Phulam Gamosa / Gamcha
- **Category:** `gamchas`
- **Slug:** `assam-phulam-gamosa-cotton`
- **Fabric:** Assam Pat Weave Breathable Cotton with Woven Red Flora Motifs
- **Dimensions:** 1.75 meters (Length) × 32 inches (Width)
- **Pricing:**
  - **MRP:** `₹599.00`
  - **Final Selling Price:** `₹349.00`
  - **Discount:** `42% OFF` (Saves ₹250)
- **Badge:** `Sale` (Red)
- **Stock Status:** Active | `14 units` in stock
- **Available Colors:**
  - Bleached White with Crimson Floral Weave (`#B91C1C`)
  - Natural Ecru / Kora with Red Border (`#991B1B`)
- **Primary Image:** `https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Mild detergent wash; do not bleach.

---

### Product 04: Organic Khadi Cotton Daily Wear Gamcha
- **Category:** `gamchas`
- **Slug:** `organic-khadi-cotton-daily-gamcha`
- **Fabric:** 100% Hand-Spun Certified Khadi Cotton (Ultra-lightweight)
- **Dimensions:** 1.8 meters (Length) × 32 inches (Width)
- **Pricing:**
  - **MRP:** `₹349.00`
  - **Final Selling Price:** `₹189.00`
  - **Discount:** `46% OFF` (Saves ₹160)
- **Badge:** None (Standard listing)
- **Stock Status:** Active | `30 units` in stock
- **Available Colors:**
  - Raw Cotton Beige (`#D6D3D1`)
  - Pastel Sky Blue (`#0284C7`)
  - Khaki Brown (`#78716C`)
- **Primary Image:** `https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Machine wash gentle cycle; gets softer with every wash.

---

### Product 05: South Indian Traditional Angavastram / Cotton Thundu
- **Category:** `gamchas`
- **Slug:** `south-indian-cotton-angavastram-thundu`
- **Fabric:** Mercerized Combed Cotton with Woven Gold Zari Border
- **Dimensions:** 2.2 meters (Length) × 38 inches (Width)
- **Pricing:**
  - **MRP:** `₹699.00`
  - **Final Selling Price:** `₹399.00`
  - **Discount:** `43% OFF` (Saves ₹300)
- **Badge:** `Best Selling` (Gold)
- **Stock Status:** Active | `18 units` in stock
- **Available Colors:**
  - Off-White with Kasavu Gold Border (`#CA8A04`)
  - Pure White with Temple Red Border (`#991B1B`)
- **Primary Image:** `https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Dry clean or gentle hand wash; iron reverse on zari border.

---

### Product 06: Hand-Dyed Indigo Check Handloom Gamcha
- **Category:** `gamchas`
- **Slug:** `hand-dyed-indigo-check-gamcha`
- **Fabric:** Natural Fermented Indigo-Dyed Desi Cotton
- **Dimensions:** 1.85 meters (Length) × 35 inches (Width)
- **Pricing:**
  - **MRP:** `₹449.00`
  - **Final Selling Price:** `₹229.00`
  - **Discount:** `49% OFF` (Saves ₹220)
- **Badge:** `Out of Stock` (Grey)
- **Stock Status:** Active | `0 units` in stock (Demonstrates disabled checkout & out-of-stock badge)
- **Available Colors:**
  - Deep Natural Indigo (`#1E3A8A`)
- **Primary Image:** `https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Wash with like dark colors; cold wash only.

---

## 5. Category 2: Women's Scarves & Dupattas (6 Flagship Products)

### Product 07: Chanderi Silk Golden Zari Border Women's Dupatta
- **Category:** `scarves_dupattas`
- **Slug:** `chanderi-silk-golden-zari-dupatta`
- **Fabric:** Pure Chanderi Silk-Cotton Blend with Hand-Woven Zari Bootis
- **Dimensions:** 2.5 meters (Length) × 36 inches (Width)
- **Pricing:**
  - **MRP:** `₹1,499.00`
  - **Final Selling Price:** `₹799.00`
  - **Discount:** `47% OFF` (Saves ₹700)
- **Badge:** `Best Selling` (Gold)
- **Stock Status:** Active | `16 units` in stock
- **Available Colors:**
  - Peacock Blue (`#0284C7`)
  - Rani Fuchsia Pink (`#BE185D`)
  - Royal Emerald Green (`#047857`)
- **Primary Image:** `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Dry clean recommended for silk preservation.

---

### Product 08: Handcrafted Kalamkari Natural Dye Cotton Dupatta
- **Category:** `scarves_dupattas`
- **Slug:** `kalamkari-natural-dye-cotton-dupatta`
- **Fabric:** 100% Breathable Mulmul Cotton with Hand-Block Kalamkari Prints
- **Dimensions:** 2.4 meters (Length) × 34 inches (Width)
- **Pricing:**
  - **MRP:** `₹1,199.00`
  - **Final Selling Price:** `₹599.00`
  - **Discount:** `50% OFF` (Saves ₹600)
- **Badge:** `Sale` (Red)
- **Stock Status:** Active | `11 units` in stock
- **Available Colors:**
  - Indigo Navy Floral (`#1E3A8A`)
  - Earthy Ochre & Rust (`#B45309`)
- **Primary Image:** `https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Cold gentle wash with organic liquid detergent.

---

### Product 09: Amritsari Phulkari Embroidered Festive Dupatta
- **Category:** `scarves_dupattas`
- **Slug:** `amritsari-phulkari-embroidered-dupatta`
- **Fabric:** Lightweight Georgette with Artisanal Silk-Floss Geometric Needlework
- **Dimensions:** 2.3 meters (Length) × 38 inches (Width)
- **Pricing:**
  - **MRP:** `₹1,999.00`
  - **Final Selling Price:** `₹1,099.00`
  - **Discount:** `45% OFF` (Saves ₹900)
- **Badge:** `Only 2-3 Left` (Terracotta)
- **Stock Status:** Active | `2 units` in stock (Urgency simulation)
- **Available Colors:**
  - Festive Vermilion Red (`#DC2626`)
  - Basanti Yellow (`#EAB308`)
- **Primary Image:** `https://images.unsplash.com/photo-1610030469668-93510cb67655?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Dry clean only to preserve fine thread embroidery.

---

### Product 10: Banarasi Katan Silk Floral Brocade Dupatta
- **Category:** `scarves_dupattas`
- **Slug:** `banarasi-katan-silk-brocade-dupatta`
- **Fabric:** Pure Katan Silk with Intricate Kadwa Weave Floral Jaal
- **Dimensions:** 2.5 meters (Length) × 36 inches (Width)
- **Pricing:**
  - **MRP:** `₹2,499.00`
  - **Final Selling Price:** `₹1,449.00`
  - **Discount:** `42% OFF` (Saves ₹1,050)
- **Badge:** `Best Selling` (Gold)
- **Stock Status:** Active | `8 units` in stock
- **Available Colors:**
  - Deep Wine Maroon (`#7B181E`)
  - Midnight Royal Navy (`#0F172A`)
- **Primary Image:** `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Professional dry clean only.

---

### Product 11: Bhagalpuri Tussar Handwoven Silk Scarf / Stole
- **Category:** `scarves_dupattas`
- **Slug:** `bhagalpuri-tussar-silk-stole-scarf`
- **Fabric:** 100% Natural Wild Tussar (Kosa) Silk with Textured Slubs
- **Dimensions:** 2.0 meters (Length) × 28 inches (Width)
- **Pricing:**
  - **MRP:** `₹1,299.00`
  - **Final Selling Price:** `₹699.00`
  - **Discount:** `46% OFF` (Saves ₹600)
- **Badge:** `Sale` (Red)
- **Stock Status:** Active | `15 units` in stock
- **Available Colors:**
  - Natural Honey Gold (`#D97706`)
  - Muted Sage Green (`#15803D`)
  - Terracotta Rust (`#C2410C`)
- **Primary Image:** `https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Dry clean or gentle hand wash in lukewarm water with mild shampoo.

---

### Product 12: Bandhani Tie & Dye Jaipuri Georgette Dupatta
- **Category:** `scarves_dupattas`
- **Slug:** `bandhani-tie-dye-jaipuri-georgette-dupatta`
- **Fabric:** Crinkled Pure Georgette with Traditional Rai Bandhej Knots
- **Dimensions:** 2.4 meters (Length) × 35 inches (Width)
- **Pricing:**
  - **MRP:** `₹1,399.00`
  - **Final Selling Price:** `₹749.00`
  - **Discount:** `46% OFF` (Saves ₹650)
- **Badge:** `Out of Stock` (Grey)
- **Stock Status:** Active | `0 units` in stock (Demonstrates out-of-stock state for women's category)
- **Available Colors:**
  - Dual Tone Red & Yellow (`#DC2626`)
- **Primary Image:** `https://images.unsplash.com/photo-1610030469668-93510cb67655?w=800&auto=format&fit=crop&q=80`
- **Wash Care:** Roll press or dry clean to maintain traditional crinkled texture.

---

## 6. B2B Wholesale Pricing & Minimum Order Quantity (MOQ) Matrix

| Product Line | Minimum Order Qty (MOQ) | Wholesale Price Tier (50–100 pcs) | Bulk Price Tier (100–500 pcs) | Lead Time (Production) | Custom Packaging / Branding |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Men's Bengal Cotton Gamchas** | 50 pcs | ₹120 / pc (vs ₹199 retail) | ₹95 / pc (vs ₹199 retail) | 7–10 Business Days | Included for orders > 200 pcs |
| **Sambalpuri & Assamese Gamchas** | 40 pcs | ₹180 / pc (vs ₹279 retail) | ₹150 / pc (vs ₹279 retail) | 12–15 Business Days | Custom woven tags available |
| **Chanderi Silk-Cotton Dupattas** | 25 pcs | ₹480 / pc (vs ₹799 retail) | ₹410 / pc (vs ₹799 retail) | 14–20 Business Days | Velvet pouch packaging option |
| **Kalamkari Hand-Block Dupattas** | 30 pcs | ₹370 / pc (vs ₹599 retail) | ₹310 / pc (vs ₹599 retail) | 10–14 Business Days | Custom natural dye palettes |
| **Banarasi Brocade Silk Dupattas**| 20 pcs | ₹890 / pc (vs ₹1,449 retail)| ₹780 / pc (vs ₹1,449 retail)| 15–21 Business Days | Hard-box corporate gifting pack |

---

## 7. Client Content Replacement Guide

When the client is ready to replace these demo products with real stock, they can perform this through the `/admin` portal without developer intervention:

1. **Log in to `/admin`:**  
   Navigate to `/admin/login` using their secure credentials.
2. **Deactivate or Edit Demo Items:**  
   In `/admin/products`, click the **Status Switch** (`Active` → `Inactive`) to immediately hide any demo item from the public `/shop` page.
3. **Upload Real Photos:**  
   Click `+ Add New Product`. Enter real product title, description, and fabric details. Paste the photo link or upload the product file.
4. **Set Pricing & Automatic Discounts:**  
   Input the Maximum Retail Price (MRP) and Final Selling Price. The system will automatically calculate and render the green `(XX% OFF)` badge.
5. **Assign Urgency & Status Tags:**  
   Select `Only 2-3 Left`, `Sale`, or `Best Selling` from the tag dropdown. Setting stock to `0` automatically switches the card to `Out of Stock` with disabled buttons.

---

*End of Demo Product Catalogue & Seed Data Specification (DATA_CATALOG.md)*
