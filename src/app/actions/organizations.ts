"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createOrganizationAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const organizationType = formData.get("organizationType") as "dog_service_provider" | "dog_kennel" | "cynological_association" | "ngo";

  if (!name || !email || !password || !organizationType) {
    return { error: "All fields are required" };
  }

  const validTypes = ["dog_service_provider", "dog_kennel", "cynological_association", "ngo"];
  if (!validTypes.includes(organizationType)) {
    return { error: "A valid Organization Type is required" };
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
      role: "organization",
      organizationType,
    });

    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to create organization:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function updateOrganizationAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const organizationType = formData.get("organizationType") as "dog_service_provider" | "dog_kennel" | "cynological_association" | "ngo";

  if (!id || !name || !email || !organizationType) {
    return { error: "All fields are required" };
  }

  const validTypes = ["dog_service_provider", "dog_kennel", "cynological_association", "ngo"];
  if (!validTypes.includes(organizationType)) {
    return { error: "A valid Organization Type is required" };
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
        organizationType,
      })
      .where(eq(users.id, id));

    revalidatePath("/backoffice/organizations");
    redirect("/backoffice/organizations");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to update organization:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function changeOrganizationPasswordAction(prevState: unknown, formData: FormData) {
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

    revalidatePath("/backoffice/organizations");
    redirect("/backoffice/organizations");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to change organization password:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function deleteOrganizationAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "Organization ID is required" };
  }

  try {
    const [userToDelete] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userToDelete) {
      return { error: "Organization not found." };
    }

    if (userToDelete.role !== "organization") {
      return { error: "Security restriction: Only organization accounts can be deleted." };
    }

    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return { error: "Could not delete organization. Please try again." };
  }
}
