"use server";

import { signIn, auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { isValidEmail } from "@/lib/validation";
import { signUpSchema, loginSchema, updateUserThemeSchema } from "@/lib/validations/auth";

/**
 * Registers a new customer ("user") account using Bcrypt password hashing.
 * Validates inputs against `signUpSchema` and blocks public registration for staff roles.
 *
 * @param {unknown} prevState - Previous form/action state (unused).
 * @param {FormData} formData - Form payload containing `name`, `email`, `password`, and optional `roleType`.
 * @returns {Promise<{ success?: boolean; error?: string }>} Resolves with `{ success: true }` on creation, or `{ error: string }`.
 * @sideEffect Inserts new record into `users` table with hashed password and role='user'.
 */
export async function signUpAction(prevState: unknown, formData: FormData) {
  const roleType = formData.get("roleType") as string; // "user" or "staff"

  if (roleType === "staff") {
    return { error: "Staff registration is disabled" };
  }

  const rawName = formData.get("name") as string;
  const rawPassword = formData.get("password") as string;
  const rawEmail = formData.get("email") as string;

  if (!rawName || !rawPassword) {
    return { error: "Name and password are required" };
  }

  if (rawPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  if (!rawEmail || !isValidEmail(rawEmail)) {
    return { error: "Please enter a valid email address." };
  }

  const parsed = signUpSchema.safeParse({
    name: rawName,
    email: rawEmail,
    password: rawPassword,
    confirmPassword: rawPassword,
    type: "user",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Validation error" };
  }

  const { name, email, password } = parsed.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email exists
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail) {
      return { error: "Email is already registered" };
    }

    // Insert standard user
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    return { success: true };
  } catch (error) {
    console.error("Sign up action error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Authenticates a customer or staff user via Auth.js Credentials provider.
 * Validates inputs against `loginSchema` and executes Next.js server redirection on success.
 *
 * @param {unknown} prevState - Previous form/action state (unused).
 * @param {FormData} formData - Form payload containing `identifier` (username or email), `password`, and `loginType` ("user" | "staff").
 * @returns {Promise<{ error?: string } | never>} Redirects to target portal (`/dashboard` or `/backoffice`) on success, or returns `{ error: string }`.
 * @sideEffect Creates user session cookie and triggers URL redirection.
 */
export async function loginAction(prevState: unknown, formData: FormData) {
  const identifier = formData.get("identifier") as string; // Email or Username
  const password = formData.get("password") as string;
  const loginType = formData.get("loginType") as string; // "user" or "staff"

  if (!identifier || !password) {
    return { error: "All fields are required" };
  }

  const parsed = loginSchema.safeParse({
    identifier,
    password,
    type: loginType === "staff" ? "staff" : "user",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "All fields are required" };
  }

  if (loginType === "user" && !isValidEmail(identifier)) {
    return { error: "Invalid email format." };
  }

  const successRedirectTo = loginType === "staff" ? "/backoffice" : "/dashboard";

  try {
    // Use redirect: false to prevent NextAuth from auto-redirecting to pages.signIn on error
    const redirectUrl = await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirectTo: successRedirectTo,
      redirect: false,
    });

    if (redirectUrl) {
      const url = new URL(redirectUrl);
      if (url.searchParams.has("error")) {
        // Failed login (e.g. error=CredentialsSignin)
        return { error: "Invalid credentials." };
      }

      // Successful login - trigger manual redirection
      redirect(url.pathname + url.search);
    }
  } catch (error) {
    // If it's a Next.js redirect error, we must let it bubble up
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Login action error:", error);
    return { error: "Something went wrong during sign-in." };
  }
}

/**
 * Persists the authenticated user's preferred UI theme ('light' | 'dark') in the database.
 *
 * @param {"light" | "dark"} theme - Target color scheme preference.
 * @returns {Promise<{ success?: boolean; error?: string }>} Resolves with `{ success: true }` or `{ error: string }`.
 * @sideEffect Updates `users.theme` record in the database.
 * @security Guarded by active session check.
 */
export async function updateUserThemeAction(theme: "light" | "dark") {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = updateUserThemeSchema.safeParse({
    userId: session.user.id,
    theme,
  });

  if (!parsed.success) {
    return { error: "Invalid theme" };
  }

  try {
    await db
      .update(users)
      .set({ theme: parsed.data.theme })
      .where(eq(users.id, parsed.data.userId));
    return { success: true };
  } catch (error) {
    console.error("Failed to update user theme:", error);
    return { error: "Failed to update theme" };
  }
}
