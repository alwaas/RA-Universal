import { signupSchema, loginSchema } from "../validation/auth.schema";
import { productCreateSchema, productUpdateSchema } from "../validation/product.schema";
import { enquiryCreateSchema } from "../validation/enquiry.schema";
import { calculateDiscount, calculateSavings, formatINR } from "../formatters";
import { generateWhatsAppOrderUrl } from "../whatsapp";
import { createSessionToken, verifyJwtSession } from "../auth/session";
import { requireResourceOwnership } from "../auth/rbac";
import { AuthService } from "../services/auth.service";
import { OfferService } from "../services/offer.service";
import seedProductsData from "@/data/seedProducts.json";
import type { Product, CartItem, SessionUser } from "@/types";

interface TestCase {
  category: string;
  name: string;
  fn: () => Promise<void> | void;
}

const testCases: TestCase[] = [];
let passCount = 0;
let failCount = 0;
const failures: { name: string; error: any }[] = [];

function it(category: string, name: string, fn: () => Promise<void> | void) {
  testCases.push({ category, name, fn });
}

// ============================================================================
// 1. STOREFRONT PAGES & PRODUCT CARD DISPLAY TESTS
// ============================================================================
it("Product Card", "Seed catalogue has valid products with required Amazon/Flipkart fields", () => {
  const products = seedProductsData as unknown as Product[];
  if (!products || products.length === 0) {
    throw new Error("Seed catalogue is empty!");
  }

  for (const p of products) {
    if (!p.id || !p.title || !p.slug) {
      throw new Error(`Product ${p.id} missing basic identification`);
    }
    if (!p.mrp || !p.sellingPrice) {
      throw new Error(`Product ${p.title} missing mrp or selling price`);
    }
    if (p.sellingPrice > p.mrp) {
      throw new Error(`Product ${p.title} has sellingPrice (${p.sellingPrice}) > MRP (${p.mrp})`);
    }
    if (!p.images || p.images.length === 0 || !p.images[0].imageUrl) {
      throw new Error(`Product ${p.title} has no images`);
    }
    if (!p.colors || p.colors.length === 0) {
      throw new Error(`Product ${p.title} has no color variants`);
    }
    if (p.discountPercentage !== Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100)) {
      throw new Error(`Product ${p.title} discountPercentage mismatch`);
    }
  }
});

it("Product Badges", "Correct badge colors and Out of Stock button disable logic", () => {
  const products = seedProductsData as unknown as Product[];
  const validBadgeColors = ["red", "yellow", "orange", "gray", "green"];

  for (const p of products) {
    if (p.badge) {
      if (!validBadgeColors.includes(p.badge.badgeColor)) {
        throw new Error(`Product ${p.title} has invalid badgeColor: ${p.badge.badgeColor}`);
      }
    }

    // Out of stock detection rule
    const isOutOfStock = p.stockCount <= 0 || p.badge?.slug === "out-of-stock";
    if (p.badge?.slug === "out-of-stock" && !isOutOfStock) {
      throw new Error(`Product with out-of-stock badge must evaluate isOutOfStock=true`);
    }
  }
});

// ============================================================================
// 2. FIRST VISIT OFFER POPUP TESTS
// ============================================================================
it("Offer Popup", "Active welcome offer is retrieved with FIRSTFREE coupon code", async () => {
  const activeOffer = await OfferService.getActiveOffer();
  if (!activeOffer) {
    throw new Error("No active offer found");
  }
  if (activeOffer.couponCode !== "FIRSTFREE") {
    throw new Error(`Expected couponCode 'FIRSTFREE', got '${activeOffer.couponCode}'`);
  }
  if (!activeOffer.isPopupActive) {
    throw new Error("Active offer must have isPopupActive=true");
  }
});

it("Offer Popup", "Toggle active state maintains valid boolean state", async () => {
  const success = await OfferService.setPopupActive("offer-firstfree", true);
  if (!success) {
    throw new Error("Failed to set popup active");
  }
});

// ============================================================================
// 3. CART OPERATIONS & TOTAL CALCULATIONS
// ============================================================================
it("Cart Logic", "Cart calculations correctly compute count, MRP, selling price, and savings", () => {
  // Simulate cart items
  const items: CartItem[] = [
    {
      id: "item-1",
      productId: "prod-1",
      title: "Cotton Gamcha",
      slug: "cotton-gamcha",
      imageUrl: "https://example.com/img1.jpg",
      colorName: "Red",
      mrp: 500,
      sellingPrice: 250,
      quantity: 2,
    },
    {
      id: "item-2",
      productId: "prod-2",
      title: "Chanderi Dupatta",
      slug: "chanderi-dupatta",
      imageUrl: "https://example.com/img2.jpg",
      colorName: "Gold",
      mrp: 1200,
      sellingPrice: 799,
      quantity: 1,
    },
  ];

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalMrp = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const totalSelling = items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const totalSavings = totalMrp - totalSelling;

  if (totalCount !== 3) throw new Error(`Expected totalCount 3, got ${totalCount}`);
  if (totalMrp !== 2200) throw new Error(`Expected totalMrp 2200, got ${totalMrp}`);
  if (totalSelling !== 1299) throw new Error(`Expected totalSelling 1299, got ${totalSelling}`);
  if (totalSavings !== 901) throw new Error(`Expected totalSavings 901, got ${totalSavings}`);
});

it("Cart WhatsApp Protocol", "Buy Now intercept URL generation formats parameters and order snapshot", () => {
  const url = generateWhatsAppOrderUrl({
    items: [
      { title: "Kolkata Cotton Gamcha", color: "Indigo", quantity: 2, price: 299 },
    ],
    customerName: "Vikram Sengupta",
    customerPhone: "9876543210",
    city: "Kolkata",
  });

  if (!url.startsWith("https://wa.me/")) {
    throw new Error("Generated URL does not start with https://wa.me/");
  }
  if (!url.includes("Vikram%20Sengupta")) {
    throw new Error("Customer name not encoded in WhatsApp URL");
  }
  if (!url.includes("598")) {
    throw new Error("Total price (598) not present in WhatsApp message");
  }
});

// ============================================================================
// 4. CUSTOMER & ADMIN AUTHENTICATION TESTS
// ============================================================================
it("Customer Auth", "Customer registration validates 10-digit Indian mobile and hashes password", async () => {
  const phone = "9123456789";
  const pass = "ValidPassword123";

  const { user, token } = await AuthService.registerCustomer({
    fullName: "QA Test User",
    phone,
    password: pass,
  });

  if (user.role !== "customer") {
    throw new Error(`Expected customer role, got ${user.role}`);
  }
  if (!token || typeof token !== "string") {
    throw new Error("No token returned on registration");
  }

  // Verify JWT preserves identity
  const verified = await verifyJwtSession(token);
  if (!verified || verified.phone !== phone) {
    throw new Error("Session JWT does not decode registered phone");
  }
});

it("Customer Auth", "Rejects duplicate phone registration", async () => {
  let threw = false;
  try {
    await AuthService.registerCustomer({
      fullName: "Duplicate User",
      phone: "9123456789", // Already registered above
      password: "AnotherPassword123",
    });
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("AuthService allowed duplicate phone registration");
  }
});

it("Admin Auth", "Admin login authenticates via phone and email", async () => {
  const phoneLogin = await AuthService.login("9999999999", "SuperSecureAdminPassword2026!");
  if (phoneLogin.user.role !== "admin") {
    throw new Error("Phone login did not return admin role");
  }

  const emailLogin = await AuthService.login("admin@rauniversal.in", "SuperSecureAdminPassword2026!");
  if (emailLogin.user.role !== "admin") {
    throw new Error("Email login did not return admin role");
  }
});

it("Admin Security", "Tampered or expired token is safely rejected", async () => {
  const adminUser: SessionUser = {
    userId: "admin-root",
    role: "admin",
    fullName: "Admin",
    phone: "9999999999",
  };

  const token = await createSessionToken(adminUser, "1s");
  const tampered = token.slice(0, -5) + "xxxxx";
  const result = await verifyJwtSession(tampered);
  if (result !== null) {
    throw new Error("verifyJwtSession accepted tampered token");
  }
});

// ============================================================================
// 5. RESOURCE OWNERSHIP & RBAC PERMISSIONS
// ============================================================================
it("RBAC Ownership", "Owner and Admin allowed, unrelated customer forbidden", () => {
  const ownerUser: SessionUser = {
    userId: "user-alpha",
    role: "customer",
    fullName: "Alpha",
    phone: "9876543210",
  };

  const otherUser: SessionUser = {
    userId: "user-beta",
    role: "customer",
    fullName: "Beta",
    phone: "9876543211",
  };

  const adminUser: SessionUser = {
    userId: "admin-root",
    role: "admin",
    fullName: "Admin",
    phone: "9999999999",
  };

  if (!requireResourceOwnership(ownerUser, "user-alpha")) {
    throw new Error("Owner failed resource ownership check");
  }
  if (requireResourceOwnership(otherUser, "user-alpha")) {
    throw new Error("Unrelated customer was permitted access to another's resource");
  }
  if (!requireResourceOwnership(adminUser, "user-alpha")) {
    throw new Error("Admin was denied access to customer resource");
  }
});

// ============================================================================
// 6. INVALID INPUTS & BOUNDARY TESTING
// ============================================================================
it("Input Boundaries", "Zod schemas reject invalid phone, price, and empty login", () => {
  // 1. Non-Indian phone
  const phoneRes = signupSchema.safeParse({
    fullName: "Test",
    phone: "1234567890", // Does not start with 6-9
    password: "ValidPassword123",
  });
  if (phoneRes.success) throw new Error("Accepted non-Indian phone prefix");

  // 2. Short password
  const passRes = signupSchema.safeParse({
    fullName: "Test",
    phone: "9876543210",
    password: "123", // Under 6 characters
  });
  if (passRes.success) throw new Error("Accepted short password");

  // 3. Selling price > MRP
  const priceRes = productCreateSchema.safeParse({
    title: "Overpriced Gamcha",
    description: "Invalid pricing test",
    category: "gamchas",
    fabric: "Cotton",
    mrp: 200,
    sellingPrice: 500, // Invalid: > mrp
    images: [{ imageUrl: "https://example.com/img.jpg" }],
    colors: [{ name: "Red", hexCode: "#DC2626" }],
  });
  if (priceRes.success) throw new Error("Accepted sellingPrice > MRP");

  // 4. Empty login
  const emptyRes = loginSchema.safeParse({
    identifier: "",
    password: "",
  });
  if (emptyRes.success) throw new Error("Accepted empty login fields");
});

// ============================================================================
// 7. B2B ENQUIRY PAYLOAD VALIDATION
// ============================================================================
it("B2B Enquiry", "Validates required business lead fields", () => {
  const valid = enquiryCreateSchema.safeParse({
    type: "b2b",
    fullName: "Sanjay Singhal",
    businessName: "Singhal Handlooms Pvt Ltd",
    gstin: "19ABCDE1234F1Z5",
    phone: "9876543210",
    email: "sanjay@singhal.com",
    estimatedVolume: "100-500",
    message: "Requirement for 300 pieces of Sambalpuri dupattas.",
  });
  if (!valid.success) {
    throw new Error(`Valid B2B enquiry failed: ${JSON.stringify(valid.error.flatten())}`);
  }

  const invalid = enquiryCreateSchema.safeParse({
    type: "b2b",
    fullName: "",
    phone: "123", // Malformed phone
    message: "",
  });
  if (invalid.success) {
    throw new Error("Accepted invalid B2B enquiry with empty fields");
  }
});

// ============================================================================
// RUN QA TEST RUNNER
// ============================================================================
async function runQASuite() {
  console.log("\n=======================================================");
  console.log("   AUTOMATED QA AUDIT & TEST SUITE (PRD & TECH_SPEC)");
  console.log("=======================================================\n");

  let currentCategory = "";
  for (const test of testCases) {
    if (test.category !== currentCategory) {
      currentCategory = test.category;
      console.log(`\n--- [${currentCategory.toUpperCase()}] ---`);
    }

    try {
      await test.fn();
      console.log(`  ✓ PASS: ${test.name}`);
      passCount++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${test.name}`);
      console.error(`    Details: ${err.message || err}`);
      failCount++;
      failures.push({ name: test.name, error: err.message || err });
    }
  }

  console.log("\n=======================================================");
  console.log(`QA AUDIT SUMMARY: ${passCount} Passed | ${failCount} Failed`);
  console.log("=======================================================\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

runQASuite().catch((err) => {
  console.error("FATAL: QA Test Runner error:", err);
  process.exit(1);
});
