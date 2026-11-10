import { runProductionSeed } from "./seed-prod";
import { runDemoSeed } from "./seed-demo";

/**
 * Main Database Seed Entrypoint:
 * Defaults to safe production master data seeding.
 * Demo catalogue data is ONLY seeded if SEED_DEMO_DATA === "true".
 */
export async function runSeed() {
  if (process.env.SEED_DEMO_DATA === "true") {
    console.log("SEED_DEMO_DATA=true detected. Seeding full demo catalogue...");
    return await runDemoSeed();
  }

  console.log("Seeding essential production master data (Admin, Tags, Welcome Offer)...");
  return await runProductionSeed();
}

if (require.main === module) {
  runSeed().then(() => process.exit(0));
}
