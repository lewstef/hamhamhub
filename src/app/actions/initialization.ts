"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createAdminAction(prevState: unknown, formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "All password fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    // Check if an admin user already exists (safety check)
    const [existingAdmin] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);

    if (existingAdmin) {
      return { error: "Platform has already been initialized." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the admin user
    await db.insert(users).values({
      name: "Platform Administrator",
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to initialize platform admin:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
