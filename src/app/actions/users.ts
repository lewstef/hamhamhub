"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Creates a new end-user account (role = "user").
 *
 * @param formData.name     - Display name (required)
 * @param formData.email    - Unique login email (required)
 * @param formData.password - Min 6 characters (required)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` on missing fields, duplicate email, or DB failure
 * @sideEffect Revalidates `/backoffice/users`
 */
export async function createUserAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail) {
      return { error: "Email address is already taken" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    revalidatePath("/backoffice/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Updates the name and email of an existing end-user account.
 * Does not change password or role.
 * Uniqueness check for email excludes the account being edited.
 *
 * @param formData.id    - Existing user ID (required)
 * @param formData.name  - New display name (required)
 * @param formData.email - New unique email (required)
 *
 * @returns `{ error: string }` on validation or DB failure
 * @returns Never returns on success — issues a server-side `redirect()` to `/backoffice/users`
 * @throws Re-throws Next.js NEXT_REDIRECT errors.
 * @sideEffect Revalidates `/backoffice/users`
 */
export async function updateUserAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!id || !name || !email) {
    return { error: "All fields are required" };
  }

  try {
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
        email,
      })
      .where(eq(users.id, id));

    revalidatePath("/backoffice/users");
    redirect("/backoffice/users");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to update user:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Changes the password for an existing end-user account.
 *
 * @param formData.id              - User ID (required)
 * @param formData.password        - New password, min 6 characters (required)
 * @param formData.confirmPassword - Must match `password` exactly (required)
 *
 * @returns `{ error: string }` on validation or DB failure
 * @returns Never returns on success — issues a server-side `redirect()` to `/backoffice/users`
 * @throws Re-throws Next.js NEXT_REDIRECT errors.
 * @sideEffect Revalidates `/backoffice/users`
 */
export async function changeUserPasswordAction(prevState: unknown, formData: FormData) {
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

    revalidatePath("/backoffice/users");
    redirect("/backoffice/users");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to change user password:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Permanently deletes an end-user account.
 * Includes a role guard — only accounts with role "user" can be deleted via this action.
 *
 * @param formData.id - User ID to delete (required)
 *
 * @returns `{ success: true }` on successful deletion
 * @returns `{ error: string }` if ID is missing, user not found, wrong role, or DB failure
 * @sideEffect Revalidates `/backoffice/users`
 */
export async function deleteUserAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "User ID is required" };
  }

  try {
    const [userToDelete] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userToDelete) {
      return { error: "User not found." };
    }

    if (userToDelete.role !== "user") {
      return { error: "Security restriction: Only user accounts can be deleted." };
    }

    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/backoffice/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Could not delete user. Please try again." };
  }
}
