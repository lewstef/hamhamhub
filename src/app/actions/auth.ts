"use server";

import { signIn, auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

/**
 * Registers a new user or staff account.
 *
 * User registration (roleType !== "staff"):
 * @param formData.name     - Display name (required)
 * @param formData.email    - Unique login email (required)
 * @param formData.password - Min 6 characters (required)
 * @param formData.roleType - Must be absent or any value other than "staff" to register as user
 *
 * Staff registration (roleType === "staff"):
 * @param formData.name     - Display name (required)
 * @param formData.username - Unique username (required)
 * @param formData.password - Min 6 characters (required)
 * @param formData.role     - "employee" | "admin" (required)
 * @param formData.roleType - Must be "staff"
 *
 * @returns `{ success: true }` on successful registration
 * @returns `{ error: string }` on validation failure or duplicate email/username
 */
export async function signUpAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const roleType = formData.get("roleType") as string; // "user" or "staff"

  if (!name || !password) {
    return { error: "Name and password are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (roleType === "staff") {
      const username = formData.get("username") as string;
      const role = formData.get("role") as "employee" | "admin";

      if (!username || !role) {
        return { error: "Username and staff role are required" };
      }

      if (!["employee", "admin"].includes(role)) {
        return { error: "Invalid staff role selected" };
      }

      // Check if username exists
      const [existingUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername) {
        return { error: "Username is already taken" };
      }

      // Insert staff user
      await db.insert(users).values({
        name,
        username,
        password: hashedPassword,
        role,
      });

    } else {
      // Standard User registration
      const email = formData.get("email") as string;

      if (!email) {
        return { error: "Email is required" };
      }

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
    }

    return { success: true };
  } catch (error) {
    console.error("Sign up action error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Authenticates a user or staff member via NextAuth Credentials provider.
 *
 * @param formData.identifier - Email address (for users/organizations) or username (for staff)
 * @param formData.password   - Account password (required)
 * @param formData.loginType  - "user" redirects to /dashboard; "staff" redirects to /backoffice
 *
 * @returns `{ error: string }` on invalid credentials or missing fields
 * @returns Never returns on success — issues a server-side `redirect()` to the target path.
 * @throws Re-throws Next.js NEXT_REDIRECT errors so the framework can handle navigation.
 */
export async function loginAction(prevState: unknown, formData: FormData) {
  const identifier = formData.get("identifier") as string; // Email or Username
  const password = formData.get("password") as string;
  const loginType = formData.get("loginType") as string; // "user" or "staff"

  if (!identifier || !password) {
    return { error: "All fields are required" };
  }

  const successRedirectTo = loginType === "staff" ? "/backoffice" : "/dashboard";

  try {
    // Use redirect: false to prevent NextAuth from auto-redirecting to pages.signIn on error
    const redirectUrl = await signIn("credentials", {
      identifier,
      password,
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
 * Persists the authenticated user's preferred UI theme to the database.
 * Requires an active session — returns an error if the user is not logged in.
 *
 * @param theme - "light" | "dark"
 *
 * @returns `{ success: true }` on successful update
 * @returns `{ error: string }` if unauthenticated, theme value is invalid, or DB update fails
 */
export async function updateUserThemeAction(theme: "light" | "dark") {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  if (theme !== "light" && theme !== "dark") {
    return { error: "Invalid theme" };
  }

  try {
    await db
      .update(users)
      .set({ theme })
      .where(eq(users.id, session.user.id));
    return { success: true };
  } catch (error) {
    console.error("Failed to update user theme:", error);
    return { error: "Failed to update theme" };
  }
}
