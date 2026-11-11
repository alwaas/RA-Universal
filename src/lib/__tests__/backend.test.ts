import { signupSchema, loginSchema } from "../validation/auth.schema";
import { productCreateSchema } from "../validation/product.schema";
import { enquiryCreateSchema } from "../validation/enquiry.schema";
import { calculateDiscount, calculateSavings, formatINR } from "../formatters";
import { generateWhatsAppOrderUrl } from "../whatsapp";
import { createSessionToken, verifyJwtSession } from "../auth/session";
import { requireResourceOwnership } from "../auth/rbac";
import { AuthService } from "../services/auth.service";
import type { SessionUser } from "@/types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runBackendTests() {
  console.log("\n==================================================");
  console.log("RUNNING AUTHENTICATION, SECURITY & BACKEND TESTS");
  console.log("==================================================\n");

  // 1. Password Hashing & Bcrypt Cryptography (Salt Round 12)
  console.log("[1] Password Cryptography & Salting (AuthService):");
  const plaintext = "SafePass#2026";
  const hashedPassword = await AuthService.hashPassword(plaintext);
  
  assert(hashedPassword.startsWith("$2"), "Password hash utilizes standard bcrypt format");
  assert(await AuthService.verifyPassword(plaintext, hashedPassword), "Plaintext matches bcrypt hash");
  assert(
    (await AuthService.verifyPassword("IncorrectPassword", hashedPassword)) === false,
    "Mismatched password fails bcrypt verification"
  );

  // 2. JWT Stateless Session Lifecycle & Expiration (jose)
  console.log("\n[2] Stateless JWT Session Cryptography & Expiry (jose):");
  const testCustomer: SessionUser = {
    userId: "cust-uuid-456",
    role: "customer",
    fullName: "Priya Sharma",
    phone: "7388553867",
    email: "priya@example.com",
  };

  const token = await createSessionToken(testCustomer, "7d");
  assert(typeof token === "string" && token.length > 30, "7-day rolling JWT token generated");

  const verified = await verifyJwtSession(token);
  assert(verified?.userId === testCustomer.userId, "Verified JWT accurately decodes userId");
  assert(verified?.role === "customer", "Verified JWT preserves customer role");
  assert(verified?.phone === testCustomer.phone, "Verified JWT preserves phone identity");

  // Tampered token security check
  const tamperedToken = token.slice(0, -6) + "abcdef";
  const tamperedResult = await verifyJwtSession(tamperedToken);
  assert(tamperedResult === null, "Tampered JWT signature safely rejected");

  // Expired token security check (0s lifetime)
  const expiredToken = await createSessionToken(testCustomer, "0s");
  // Brief pause to ensure wall clock surpasses 0s
  await new Promise((res) => setTimeout(res, 50));
  const expiredResult = await verifyJwtSession(expiredToken);
  assert(expiredResult === null, "Expired JWT token safely rejected by expiration validator");

  // 3. Role-Based Permissions & Resource Ownership (RBAC)
  console.log("\n[3] Role-Based Access Control (RBAC) & Ownership:");
  const testAdmin: SessionUser = {
    userId: "admin-uuid-001",
    role: "admin",
    fullName: "Store Administrator",
    phone: "9999999999",
    email: "admin@rauniversal.in",
  };

  const otherCustomer: SessionUser = {
    userId: "cust-uuid-789",
    role: "customer",
    fullName: "Rohan Das",
    phone: "9876500000",
  };

  // Ownership checks
  assert(
    requireResourceOwnership(testCustomer, "cust-uuid-456") === true,
    "Customer can access/modify their own resource"
  );
  assert(
    requireResourceOwnership(otherCustomer, "cust-uuid-456") === false,
    "Customer is FORBIDDEN from accessing/modifying another customer's resource"
  );
  assert(
    requireResourceOwnership(testAdmin, "cust-uuid-456") === true,
    "Admin has overriding permission on any customer resource"
  );

  // 4. Input Validation & Strict Schema Boundaries (Zod)
  console.log("\n[4] Input Validation & Security Rules (Zod):");
  
  // Signup constraints
  assert(
    signupSchema.safeParse({
      fullName: "Ananya Roy",
      phone: "7388553867",
      password: "pass", // Under 6 characters
    }).success === false,
    "Password under 6 characters rejected by signup validation"
  );

  assert(
    signupSchema.safeParse({
      fullName: "Ananya Roy",
      phone: "1234567890", // Invalid prefix (must start with 6-9)
      password: "validPassword123",
    }).success === false,
    "Phone not starting with 6-9 rejected by Indian regex validation"
  );

  assert(
    signupSchema.safeParse({
      fullName: "Ananya Roy",
      phone: "8888888888",
      password: "validPassword123",
    }).success === true,
    "Valid Indian 10-digit mobile and strong password accepted"
  );

  // Login constraints
  assert(
    loginSchema.safeParse({ identifier: "", password: "pass" }).success === false,
    "Empty login identifier rejected"
  );
  assert(
    loginSchema.safeParse({ identifier: "7388553867", password: "" }).success === false,
    "Empty login password rejected"
  );

  // Product pricing business rule: sellingPrice <= mrp
  assert(
    productCreateSchema.safeParse({
      title: "Handloom Cotton Gamcha",
      description: "Traditional cotton gamcha.",
      category: "gamchas",
      fabric: "100% Cotton",
      mrp: 300,
      sellingPrice: 199,
      images: [{ imageUrl: "https://example.com/gamcha.jpg", isPrimary: true }],
      colors: [{ name: "Red", hexCode: "#DC2626" }],
    }).success === true,
    "Product with sellingPrice <= mrp passes validation"
  );

  assert(
    productCreateSchema.safeParse({
      title: "Handloom Cotton Gamcha",
      description: "Traditional cotton gamcha.",
      category: "gamchas",
      fabric: "100% Cotton",
      mrp: 200,
      sellingPrice: 350, // Invalid: sellingPrice > mrp
      images: [{ imageUrl: "https://example.com/gamcha.jpg" }],
      colors: [{ name: "Red", hexCode: "#DC2626" }],
    }).success === false,
    "Product with sellingPrice > mrp is rejected by Zod refinement"
  );

  // B2B Inquiry validation
  assert(
    enquiryCreateSchema.safeParse({
      type: "b2b",
      fullName: "Textile Buyer",
      businessName: "Kashi Weaves",
      phone: "7388553867",
      estimatedVolume: "100-500",
      message: "Bulk order inquiry for Dupattas.",
    }).success === true,
    "Valid B2B inquiry payload passes validation"
  );

  // 5. End-to-End AuthService Lifecycle (Registration, Login, RBAC)
  console.log("\n[5] AuthService Registration & Login Flow:");
  const testPhone = "7777777777";
  const testPass = "MyCustomerSecret123";

  // Register new customer
  const regResult = await AuthService.registerCustomer({
    fullName: "Meera Sen",
    phone: testPhone,
    password: testPass,
    email: "meera@example.com",
  });
  assert(regResult.user.fullName === "Meera Sen", "Customer account registered successfully");
  assert(regResult.user.role === "customer", "New user has customer role by default");
  assert(typeof regResult.token === "string", "Valid session token returned on registration");

  // Attempt duplicate registration
  let duplicateThrew = false;
  try {
    await AuthService.registerCustomer({
      fullName: "Duplicate User",
      phone: testPhone,
      password: "anotherPassword",
    });
  } catch {
    duplicateThrew = true;
  }
  assert(duplicateThrew === true, "Duplicate registration on existing phone number prevented");

  // Login with correct customer credentials
  const loginResult = await AuthService.login(testPhone, testPass);
  assert(loginResult.user.phone === testPhone, "Customer logged in with valid phone & password");

  // Login with incorrect password
  let invalidPassThrew = false;
  try {
    await AuthService.login(testPhone, "WrongPassword");
  } catch {
    invalidPassThrew = true;
  }
  assert(invalidPassThrew === true, "Invalid password login attempt rejected");

  // Admin Login with credentials
  const adminLoginPhone = await AuthService.login("9999999999", "SuperSecureAdminPassword2026!");
  assert(adminLoginPhone.user.role === "admin", "Admin login via phone authenticated with admin role");

  const adminLoginEmail = await AuthService.login("admin@rauniversal.in", "SuperSecureAdminPassword2026!");
  assert(adminLoginEmail.user.role === "admin", "Admin login via email authenticated with admin role");

  // Profile update and retrieval
  const updated = await AuthService.updateUserProfile(regResult.user.userId, {
    addressCity: "Varanasi",
    addressPincode: "221001",
  });
  assert(updated?.addressCity === "Varanasi", "Customer delivery profile updated successfully");

  const fetched = await AuthService.getUserById(regResult.user.userId);
  assert(fetched?.addressPincode === "221001", "Customer profile retrieved with updated pincode");

  // 6. Currency Formatter & WhatsApp Protocol
  console.log("\n[6] Currency Formatter & WhatsApp Order Protocol:");
  assert(calculateDiscount(500, 250) === 50, "calculateDiscount(500, 250) returns 50%");
  assert(calculateSavings(500, 250) === 250, "calculateSavings(500, 250) returns ₹250");
  assert(formatINR(1299).includes("1,299"), "formatINR(1299) renders correct thousand grouping");

  const waUrl = generateWhatsAppOrderUrl({
    items: [
      { title: "Cotton Gamcha", color: "Red", quantity: 2, price: 199 },
      { title: "Chanderi Dupatta", color: "Blue", quantity: 1, price: 799 },
    ],
    customerName: "Ananya",
    city: "Kolkata",
  });

  assert(waUrl.startsWith("https://wa.me/"), "WhatsApp URL has valid protocol prefix");
  assert(waUrl.includes("Cotton%20Gamcha"), "WhatsApp order items are properly URI-encoded");
  assert(waUrl.includes("1197"), "Total order value (1197) is encoded in message");

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} Passed | ${failed} Failed`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runBackendTests().catch((err) => {
  console.error("Test execution encountered an error:", err);
  process.exit(1);
});
