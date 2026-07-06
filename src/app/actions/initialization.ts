"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

/**
 * One-time platform initialization — creates the primary admin account.
 * This action is idempotent-safe: it checks for an existing admin and returns
 * an error rather than creating a duplicate.
 *
 * The created account always has:
 *   - username: "admin"
 *   - name: "Platform Administrator"
 *   - role: "admin"
 *
 * @param formData.password        - Min 6 characters (required)
 * @param formData.confirmPassword - Must match `password` exactly (required)
 *
 * @returns `{ success: true }` on successful initialization
 * @returns `{ error: string }` if passwords are missing/mismatched, admin already exists, or DB failure
 * @sideEffect Revalidates `/`
 */
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
