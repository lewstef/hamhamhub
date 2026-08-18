import { db } from "./index";
import { organizationCategories, services } from "./schema";
import { eq } from "drizzle-orm";

const DEFAULT_CATEGORIES = [
  { id: "dog_school", name: "Dog Training School", description: "Cynological training schools, obedience, and sport handlers." },
  { id: "dog_kennel", name: "Boarding Kennel & Hotel", description: "Dog hotel and pet boarding facilities." },
  { id: "veterinary_clinic", name: "Veterinary Clinic", description: "Veterinary medicine and pet healthcare facilities." },
  { id: "pet_sitting", name: "Pet Sitting & Dog Walking", description: "In-home pet sitters, daily dog walkers, and companion care." },
  { id: "grooming_salon", name: "Grooming Salon & Spa", description: "Dog grooming, bathing, clipping, and spa treatments." },
];

async function main() {
  console.log("🌱 Database seeding script initialized...");

  try {
    // 1. Seed Organization Categories (Idempotent)
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await db
        .select()
        .from(organizationCategories)
        .where(eq(organizationCategories.id, cat.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(organizationCategories).values({
          id: cat.id,
          name: cat.name,
          description: cat.description,
        });
        console.log(`  ➕ Added category: ${cat.name} (${cat.id})`);
      } else {
        console.log(`  ✔ Category already exists: ${cat.name}`);
      }
    }

    console.log("ℹ️ Admin user setup is handled via interactive onboarding at /initialization.");
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
