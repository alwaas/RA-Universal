# Production Deployment Runbook — RA-Universal

**Platform:** Next.js 14 App Router + TypeScript + Tailwind CSS + Drizzle ORM + PostgreSQL  
**Target Environment:** Node.js 18+ / 20+ Production Host (Vercel, AWS ECS, Railway, VPS, Docker)  
**Project Directory:** `d:\Projects\RA-Universal`  

---

## 1. Production Architecture & Security Guardrails

This application adheres to strict production security and integrity rules:

1. **Safe Database Migrations (No `db:push` in Production):**
   - Use versioned Drizzle migrations via `npm run db:migrate`.
   - Never use `db:push` against a staging or production database.
2. **Separation of Master Data vs. Demo Catalogue:**
   - Default seed (`npm run db:seed:prod`) only seeds:
     - 1 Admin user (using `ADMIN_DEFAULT_PHONE`, `ADMIN_EMAIL`, `ADMIN_DEFAULT_PASSWORD`).
     - 4 Canonical product badge tags (`Best Selling`, `Only 2-3 Left`, `Sale`, `Out of Stock`).
     - 1 Welcome offer (`FIRSTFREE`).
   - Demo catalogue data (8 handloom products) is **never** seeded unless `SEED_DEMO_DATA=true` is explicitly provided.
3. **No Offline Demo Fallback in Production:**
   - In production (`NODE_ENV=production`), `isDemoFallbackAllowed()` returns `false` unless `ENABLE_DEMO_FALLBACK=true` is set.
   - If PostgreSQL is unreachable, the storefront renders clean maintenance/error states instead of misleading customers with fake catalogue data.
4. **Minimal Public Health Check & Authenticated Diagnostics:**
   - Public endpoint `/api/health`: Returns strictly `{"status":"ok"}` or `{"status":"error"}` with `200` or `503` HTTP status, verified with a real `SELECT 1` database ping. Does not leak infrastructure details.
   - Authenticated endpoint `/api/admin/health`: Requires admin JWT session. Returns DB latency, memory usage, Cloudinary status, and uptime.
5. **Admin Initial Bootstrap & Password Rotation:**
   - Admin account is bootstrapped with credentials from environment variables.
   - Admin must immediately rotate the password upon first login using the Admin Security panel or `POST /api/admin/password`.
   - In production, bootstrap fallback from env vars is disabled once a database user exists.
6. **Strict Content Security Policy (CSP):**
   - Configured in `next.config.mjs` with `frame-ancestors 'self'` to prevent clickjacking.
   - HSTS `preload` is omitted until a verified custom domain is deployed with SSL.
7. **Secure Asset Handling:**
   - Server-side image uploads handled via `POST /api/admin/upload` (JPEG, PNG, WEBP, max 5 MB).
   - If Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are present, images upload directly to secure cloud storage.
   - In offline/local development, images fall back to `/public/uploads`.

---

## 2. Environment Variables Configuration

Create `.env.local` or configure production hosting environment variables:

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `NODE_ENV` | Yes | Node environment | `production` |
| `PORT` | Optional | Web server port | `3000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `JWT_SECRET` | Yes | 32+ character secret for JWT sessions | Random 64-char hex string |
| `ADMIN_DEFAULT_PHONE` | Yes | Initial admin phone for bootstrap | `9876543210` |
| `ADMIN_EMAIL` | Yes | Initial admin email | `admin@rauniversal.com` |
| `ADMIN_DEFAULT_PASSWORD` | Yes | Strong initial admin password | Min 8 chars with upper, digit, symbol |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Yes | WhatsApp Business order line | `919876543210` |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical site URL | `https://rauniversal.com` |
| `ENABLE_DEMO_FALLBACK` | No | Allow in-memory fallback during DB outage | `false` (default in prod) |
| `SEED_DEMO_DATA` | No | Seed 8 demo products during migration | `false` |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name | `ra-universal` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret | `abc123xyz_sec` |

---

## 3. Pre-Deployment Verification Checklist

Execute these verification commands locally or in CI before deploying:

```bash
# 1. Type check (must exit with 0 errors)
npm run type-check

# 2. ESLint (must pass with 0 warnings/errors)
npm run lint

# 3. Security & Backend Unit Tests (36 tests)
npm run test

# 4. QA Automation & Spec Audit (13 tests)
npm run test:qa

# 5. Production Build (all static & dynamic routes compile)
npm run build
```

---

## 4. Production Database Deployment Steps

When pointing to a live PostgreSQL database:

```bash
# Step 1: Generate pending migrations (if schema was altered)
npm run db:generate

# Step 2: Apply versioned migrations to the production database
npm run db:migrate

# Step 3: Seed essential master data (Admin, Tags, Welcome Offer)
npm run db:seed:prod
```

> **Note:** Never run `npm run db:seed:demo` in a production environment. Keep `SEED_DEMO_DATA=false`.

---

## 5. Starting the Production Server

```bash
# Start Next.js optimized production server
npm start
```

Default listener: `http://localhost:3000` (or configured `PORT`).

---

## 6. Post-Deployment Smoke Test & Health Verification

Verify following endpoints after deployment:

1. **Public Health Probe:**
   ```bash
   curl -i https://yourdomain.com/api/health
   # Expected: HTTP 200 {"status":"ok"}
   ```
2. **Storefront Home:**
   `https://yourdomain.com` — Header, carousel, categories, promotional popup, footer.
3. **Shop Catalogue:**
   `https://yourdomain.com/shop` — 2-column mobile layout, 4-column desktop layout.
4. **Product Detail Page:**
   `https://yourdomain.com/product/[slug]` — Multi-photo gallery, swatch image synchronization, desktop zoom, Buy Now WhatsApp modal.
5. **Admin Portal & Security:**
   - Login at `https://yourdomain.com/admin/login` using bootstrapped admin credentials.
   - Navigate to **Security** tab:
     - Check DB connectivity status & latency.
     - Rotate the bootstrap password to a strong personal admin password.
   - Navigate to **Products** tab:
     - Verify image upload (Cloudinary or local server storage).
     - Verify multiple photo gallery fields and color variant mapping.
