# Agent Instructions & Operational Rules (AGENTS.md)

## Project: Demo E-Commerce Platform for Ethnic Apparel (Scarves, Dupattas & Gamchas)
**Target:** AI Coding Agents & Pair-Programming Engineers  
**Project Directory:** `d:\Projects\RA-Universal`  
**Status:** Mandatory & Strictly Enforced  

---

## 1. Source of Truth & Scope Boundaries

1. **Hierarchy of Truth:**  
   Always consult and strictly adhere to the project specification documents:
   - [PRD.md](file:///d:/Projects/RA-Universal/PRD.md): Product scope, user journeys, feature requirements, and out-of-scope boundaries.
   - [DESIGN.md](file:///d:/Projects/RA-Universal/DESIGN.md): Visual design tokens, 8pt spacing grid, typography, color palette, and component micro-layouts.
   - [TECH_SPEC.md](file:///d:/Projects/RA-Universal/TECH_SPEC.md): Tech stack (Next.js App Router, TypeScript, Tailwind, Drizzle, PostgreSQL), architecture, DB schemas, API contracts, and security rules.
2. **Strict MVP Boundaries:**  
   - **Payment Gateway is OUT OF SCOPE.** Do not integrate Razorpay, Stripe, Paytm, or any live payment processor.
   - **Courier/Shipping APIs are OUT OF SCOPE.** Do not integrate Shiprocket, Delhivery, etc.
   - **Never add unapproved features** (e.g., reviews/ratings system, multi-vendor marketplace, real-time chat, AI chatbots, complex analytics).
   - If an instruction conflicts with `PRD.md`, stop and ask the user for clarification.

---

## 2. Code Investigation & Modification Rules

1. **Read Before Writing:**  
   Always inspect existing files, utilities, types, and components before creating or modifying code. Never assume a file's content or implement duplicate functionality.
2. **Zero Unrelated Changes:**  
   Do not reformat, rewrite, refactor, or delete code in files unrelated to your current task. Keep diffs minimal, clean, and reviewable.
3. **Preserve Documentation & Comments:**  
   Do not delete existing comments, docstrings, or license headers unless explicitly requested by the user.
4. **Reuse Existing Primitives:**  
   Always leverage existing components (`Button`, `Input`, `Modal`, `ProductCard`), stores (`useCartStore`), and utilities (`formatters.ts`, `whatsapp.ts`, `db.ts`) instead of writing duplicate inline implementations.

---

## 3. TypeScript & Code Quality Standards

1. **Strict Type Safety:**  
   - Enable and respect strict TypeScript (`noImplicitAny: true`, `strictNullChecks: true`).
   - Never use `any`. Always use explicit interfaces, type aliases, or `unknown` with type guards.
   - Share types across API routes, server actions, and frontend components via `src/types/index.ts`.
2. **Folder Structure Consistency:**  
   Adhere strictly to the Next.js App Router structure defined in `TECH_SPEC.md`:
   - Storefront routes in `src/app/(storefront)/...`
   - Admin routes in `src/app/admin/...`
   - Reusable components in `src/components/...`
   - Business logic, DB, and stores in `src/lib/...` and `src/db/...`
3. **Naming Conventions:**
   - **Components & Files:** PascalCase (e.g., `ProductCard.tsx`, `CartDrawer.tsx`).
   - **Utilities & Helpers:** camelCase (e.g., `formatCurrency.ts`, `generateWhatsAppLink.ts`).
   - **API Routes & Pages:** lowercase kebab-case or standard Next.js conventions (`page.tsx`, `route.ts`).
   - **Constants & Enums:** UPPER_SNAKE_CASE (e.g., `MAX_CART_QUANTITY`, `DEFAULT_PAGE_LIMIT`).
4. **No Unnecessary Dependencies:**  
   Do not install third-party packages for simple tasks that can be achieved with native JavaScript/TypeScript or standard Tailwind CSS utilities.

---

## 4. UI/UX & Component Implementation Rules

1. **Mobile-First Responsiveness:**  
   Indian e-commerce is overwhelmingly mobile (> 80%). Always build mobile views first (360px–414px) and progressively enhance for tablet (768px) and desktop (1024px+).
   - Shop page must render strictly **2 columns on mobile** and **4 columns on desktop**.
   - All interactive touch targets must have a minimum physical bounding box of **44×44 pixels**.
2. **Mandatory 4 UI States:**  
   Every component and page fetching or submitting data must handle:
   - **Loading State:** Pulse skeletons matching the component aspect ratio (never blank white screens).
   - **Empty State:** Friendly graphic or icon, helpful copy, and a recovery CTA (e.g., "Clear Filters" or "Start Shopping").
   - **Error State:** Non-blocking inline feedback or toast alert with retry option.
   - **Success State:** Instant visual feedback (e.g., green checkmark, item added toast).
3. **Accessibility (WCAG 2.1 AA):**  
   - Every `img` must feature meaningful `alt` text.
   - Every icon-only button must include an `aria-label`.
   - Never remove keyboard focus outlines (`focus-visible:ring-2` required).
   - Maintain minimum color contrast ratio of 4.5:1 for body copy and 3.0:1 for large text/badges.
4. **Amazon/Flipkart Card Integrity:**  
   Every product card must display:
   - 3:4 aspect ratio image container with hover zoom.
   - Admin-configurable corner badge (`Only 2-3 Left`, `Sale`, `Best Selling`, `Out of Stock`).
   - 2-line truncated title.
   - Circular color swatches.
   - Rupee (`₹`) selling price (bold), strikethrough MRP, and green discount badge (`XX% OFF`).
   - Dual buttons: "Add to Cart" and "Buy Now".
   - If stock is `0` or badge is `Out of Stock`, buttons must be disabled.

---

## 5. Backend, Data & Security Standards

1. **Server-Side Validation (Zero Client Trust):**  
   - Validate every incoming payload using **Zod** schemas on the server before database interaction.
   - Never trust prices, discount percentages, or stock values provided by the client. Recalculate and verify from the database.
2. **Server-Side Authorization (RBAC):**  
   - Protect all `/admin/*` routes and `/api/admin/*` endpoints using encrypted HTTP-only session verification (`verifyJwtSession()`).
   - Verify `session.role === 'admin'` on the server for all admin mutations. Never rely on client-side state alone.
3. **Secret & Credential Management:**  
   - **NEVER hardcode secrets, tokens, or credentials in source code.**
   - Store all credentials (`DATABASE_URL`, `JWT_SECRET`, Cloudinary API keys) in `.env.local`.
   - Only variables with the `NEXT_PUBLIC_` prefix may be exposed to the client. Never prefix sensitive secrets with `NEXT_PUBLIC_`.
4. **Safe Database Operations:**  
   - Use Drizzle ORM parameterized queries to prevent SQL injection.
   - Respect relational integrity: foreign keys, cascading deletes where appropriate, and table constraints (e.g., `CHECK (selling_price <= mrp)`).
5. **Safe Asset & Image Handling:**  
   - Only accept images from verified sources or whitelisted domains defined in `next.config.mjs`.
   - Sanitize all text fields in B2B inquiries and contact forms against XSS.

---

## 6. WhatsApp Order & E-Commerce Flow Rules

1. **"Buy Now" & Checkout Handling:**  
   - Do not display generic broken checkout pages.
   - When the user clicks "Buy Now" or "Checkout", trigger the **Checkout Intercept Modal** informing them that automated payment is coming soon.
   - Provide the primary action: **"Confirm Order via WhatsApp"**.
2. **WhatsApp Message Protocol:**  
   - Use `src/lib/whatsapp.ts` to construct the standard encoded click-to-chat URL:
     ```
     https://wa.me/<NEXT_PUBLIC_WHATSAPP_PHONE>?text=<ENCODED_MESSAGE>
     ```
   - Pre-fill item titles, selected colors, quantities, and total order value in ₹ INR.
3. **Session Persistence for Offer Popup:**  
   - The first-visit offer popup must appear once per user session.
   - When dismissed by the user, immediately record the dismissal in `sessionStorage` or a cookie to prevent annoying repeats during that session.

---

## 7. Verification & Definition of Done

Before declaring any coding task complete, you must execute and verify the following:

1. **Type Checking:**  
   Run `npm run type-check` (or `npx tsc --noEmit`) and verify **0 TypeScript errors**.
2. **Linting & Code Formatting:**  
   Run `npm run lint` and verify zero errors or warnings.
3. **Production Build Verification:**  
   Run `npm run build` to ensure all Server Components, Client Components, and dynamic routes compile cleanly.
4. **Manual Functional Checks:**  
   - Verify mobile viewport layout (360px).
   - Test loading, empty, and error states for the feature touched.
   - Test cart addition, quantity updates, and WhatsApp link generation.
5. **Focused Commits:**  
   Write clean, descriptive commit messages adhering to Conventional Commits:
   - `feat(storefront): add amazon-style product card component`
   - `fix(cart): correct mrp savings calculation in drawer`
   - `chore(db): add drizzle schema and initial seed script`

---

## 8. Ambiguity Protocol

If a user request or design requirement is unclear, contradictory, or lacks necessary business logic:
- **STOP immediately.**
- Do not make arbitrary assumptions or build speculative features.
- Formulate a clear, direct question outlining the trade-offs and ask the user for confirmation before proceeding.

---

*End of Agent Instructions & Operational Rules (AGENTS.md)*

