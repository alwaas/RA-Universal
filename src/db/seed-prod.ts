/**
 * Production Seed — Essential master data only.
 *
 * Seeds:
 *  1. One administrator account (credentials sourced from env vars)
 *  2. Four canonical product badge tags
 *  3. One "First Order Free Delivery" welcome offer
 *
 * Does NOT seed any demo catalogue products.
 * Run only with DATABASE_URL set and after migrations.
 */
import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, productTags, offers } from "./schema";

export async function runProductionSeed(): Promise<void> {
  if (!db) {
    throw new Error(
      "DATABASE_URL is required for production seed. Set it in .env.local."
    );
  }

  // ── 1. Administrator account ──────────────────────────────────────────────
  const phone = process.env.ADMIN_DEFAULT_PHONE;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_DEFAULT_PASSWORD;

  if (!phone || !email || !password) {
    throw new Error(
      "ADMIN_DEFAULT_PHONE, ADMIN_EMAIL, and ADMIN_DEFAULT_PASSWORD must be set " +
        "as environment variables before running the production seed."
    );
  }

  const hash = await bcrypt.hash(password, 12);
  await db
    .insert(users)
    .values({
      fullName: "Store Administrator",
      phone,
      email,
      passwordHash: hash,
      role: "admin",
    })
    .onConflictDoNothing();

  console.log(`✓ Admin account seeded for ${email}`);

  // ── 2. Product badge tags ─────────────────────────────────────────────────
  const canonicalTags = [
    { name: "Best Selling", slug: "best-selling", badgeColor: "yellow" as const },
    { name: "Only 2-3 Left", slug: "only-2-3-left", badgeColor: "orange" as const },
    { name: "Sale", slug: "sale", badgeColor: "red" as const },
    { name: "Out of Stock", slug: "out-of-stock", badgeColor: "gray" as const },
  ];

  for (const tag of canonicalTags) {
    await db
      .insert(productTags)
      .values({ ...tag, isActive: true })
      .onConflictDoNothing();
  }

  console.log("✓ Product tags seeded (Best Selling, Only 2-3 Left, Sale, Out of Stock)");

  // ── 3. Welcome offer popup ────────────────────────────────────────────────
  await db
    .insert(offers)
    .values({
      title: "First Order Free Delivery",
      description:
        "Zero delivery charges on your first order across India. Use code FIRSTFREE at checkout via WhatsApp.",
      couponCode: "FIRSTFREE",
      bannerImageUrl: null,
      isPopupActive: true,
    })
    .onConflictDoNothing();

  console.log("✓ Welcome offer seeded (FIRSTFREE)");
  console.log("\nProduction seed completed successfully.");
  console.log(
    "⚠️  IMPORTANT: Rotate the admin password immediately after first login."
  );
}

// Allow direct invocation: ts-node src/db/seed-prod.ts
if (require.main === module) {
  runProductionSeed()
    .then(() => process.exit(0))
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ Production seed failed:", message);
      process.exit(1);
    });
}
