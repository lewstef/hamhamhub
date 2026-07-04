
async function main() {
  console.log("🌱 Database seeding started...");

  try {
        console.log(`ℹ️ Admin user seeding bypassed. Setup will occur on first launch via /initialization.`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
