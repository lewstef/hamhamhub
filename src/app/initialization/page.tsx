import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { InitializationForm } from "./initialization-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Setup - HamHamHub",
  description: "Initial platform setup.",
};

export default async function InitializationPage() {
  // Query to check if an admin user already exists
  let adminExists = false;
  try {
    const [existingAdmin] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);
    
    if (existingAdmin) {
      adminExists = true;
    }
  } catch (error) {
    console.error("Failed to check if admin exists:", error);
  }

  if (adminExists) {
    redirect("/backoffice");
  }

  return <InitializationForm />;
}
