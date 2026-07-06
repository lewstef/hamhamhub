"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Creates a new staff account (role = "employee" | "admin").
 * Both username and email must be globally unique.
 *
 * @param formData.name     - Display name (required)
 * @param formData.username - Unique username for login (required)
 * @param formData.email    - Unique email address (required)
 * @param formData.password - Min 6 characters (required)
 * @param formData.role     - "employee" | "admin" (required)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` on missing fields, duplicate username/email, invalid role, or DB failure
 * @sideEffect Revalidates `/backoffice/employees`
 */
export async function createEmployeeAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "employee" | "admin";

  if (!name || !username || !email || !password || !role) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  if (!["employee", "admin"].includes(role)) {
    return { error: "Invalid role selected" };
  }

  try {
    // Check if username exists
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername) {
      return { error: "Username is already taken" };
    }

    // Check if email exists
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail) {
      return { error: "Email address is already taken" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert staff user
    await db.insert(users).values({
      name,
      username,
      email,
      password: hashedPassword,
      role,
    });

    revalidatePath("/backoffice/employees");
    return { success: true };
  } catch (error) {
    console.error("Failed to create employee:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Updates profile fields for an existing staff account.
 * Uniqueness checks exclude the account being edited (via `ne(users.id, id)`).
 *
 * @param formData.id       - Existing user ID (required)
 * @param formData.name     - New display name (required)
 * @param formData.username - New unique username (required)
 * @param formData.email    - New unique email (required)
 * @param formData.role     - "employee" | "admin" (required)
 *
 * @returns `{ error: string }` on validation or DB failure
 * @returns Never returns on success — issues a server-side `redirect()` to `/backoffice/employees`
 * @throws Re-throws Next.js NEXT_REDIRECT errors.
 * @sideEffect Revalidates `/backoffice/employees`
 */
export async function updateEmployeeAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as "employee" | "admin";

  if (!id || !name || !username || !email || !role) {
    return { error: "All fields are required" };
  }

  if (!["employee", "admin"].includes(role)) {
    return { error: "Invalid role selected" };
  }

  try {
    // Check if username is taken by another user
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), ne(users.id, id)))
      .limit(1);

    if (existingUsername) {
      return { error: "Username is already taken" };
    }

    // Check if email is taken by another user
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, id)))
      .limit(1);

    if (existingEmail) {
      return { error: "Email address is already taken" };
    }

    await db
      .update(users)
      .set({
        name,
        username,
        email,
        role,
      })
      .where(eq(users.id, id));

    revalidatePath("/backoffice/employees");
    redirect("/backoffice/employees");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to update employee:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Changes the password for an existing staff account.
 *
 * @param formData.id              - Staff user ID (required)
 * @param formData.password        - New password, min 6 characters (required)
 * @param formData.confirmPassword - Must match `password` exactly (required)
 *
 * @returns `{ error: string }` on validation or DB failure
 * @returns Never returns on success — issues a server-side `redirect()` to `/backoffice/employees`
 * @throws Re-throws Next.js NEXT_REDIRECT errors.
 * @sideEffect Revalidates `/backoffice/employees`
 */
export async function changeEmployeePasswordAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!id || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.id, id));

    revalidatePath("/backoffice/employees");
    redirect("/backoffice/employees");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to change employee password:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Permanently deletes a staff account.
 * Guards against deleting the primary "admin" username — that account is protected.
 *
 * @param formData.id - Staff user ID to delete (required)
 *
 * @returns `{ success: true }` on successful deletion
 * @returns `{ error: string }` if ID is missing, employee not found, or the "admin" guard triggers
 * @sideEffect Revalidates `/backoffice/employees`
 */
export async function deleteEmployeeAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "Employee ID is required" };
  }

  try {
    const [userToDelete] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userToDelete) {
      return { error: "Employee not found." };
    }

    if (userToDelete.username === "admin") {
      return { error: "The primary 'admin' account cannot be deleted." };
    }

    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/backoffice/employees");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return { error: "Could not delete employee. Please try again." };
  }
}
