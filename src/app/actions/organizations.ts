"use server";

import { db } from "@/db";
import { users, organizationCategories } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getOrganizationCategories() {
  let list = await db.select().from(organizationCategories);
  if (list.length === 0) {
    const defaults = [
      { id: "ngo", name: "NGO", description: "Non-governmental organizations working for animal welfare." },
      { id: "dog_kennel", name: "Dog Kennel", description: "Professional kennels offering boarding, breeding, and care services." },
      { id: "dog_service_provider", name: "Dog service provider", description: "Independent dog trainers, walkers, and groomers." },
      { id: "cynological_association", name: "Official Cynological Association", description: "National Cynological Association supervising breed standards and official registries." },
    ];
    await db.insert(organizationCategories).values(defaults);
    list = await db.select().from(organizationCategories);
  }
  return list;
}

export async function createOrganizationCategoryAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name || name.trim() === "") {
    return { error: "Organization category name is required." };
  }

  // Generate ID: lowercased, slugged name
  const id = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_+|_+$)/g, "");

  if (!id) {
    return { error: "Invalid organization category name." };
  }

  try {
    const [existing] = await db
      .select({ id: organizationCategories.id })
      .from(organizationCategories)
      .where(eq(organizationCategories.id, id))
      .limit(1);

    if (existing) {
      return { error: "An organization category with this name or ID already exists." };
    }

    await db.insert(organizationCategories).values({
      id,
      name: name.trim(),
      description: description?.trim() || null,
    });

    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to create organization category:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function updateOrganizationCategoryAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!id || !name || name.trim() === "") {
    return { error: "Organization category name is required." };
  }

  try {
    await db
      .update(organizationCategories)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .where(eq(organizationCategories.id, id));

    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to update organization category:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function deleteOrganizationCategoryAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Organization category ID is required." };
  }

  try {
    // Check if any organization user is assigned to this category
    const [assignedUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "organization"), eq(users.organizationCategory, id)))
      .limit(1);

    if (assignedUser) {
      return { error: "Cannot delete this organization category because it is in use by one or more organizations." };
    }

    await db.delete(organizationCategories).where(eq(organizationCategories.id, id));
    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete organization category:", error);
    return { error: "Could not delete organization category. Please try again." };
  }
}

export async function createOrganizationAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const organizationCategory = formData.get("organizationCategory") as string;

  if (!name || !email || !password || !organizationCategory) {
    return { error: "All fields are required" };
  }

  try {
    const list = await getOrganizationCategories();
    const validCategories = list.map((t) => t.id);
    if (!validCategories.includes(organizationCategory)) {
      return { error: "A valid Organization Category is required" };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }

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
      organizationCategory,
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
  const organizationCategory = formData.get("organizationCategory") as string;

  if (!id || !name || !email || !organizationCategory) {
    return { error: "All fields are required" };
  }

  try {
    const list = await getOrganizationCategories();
    const validCategories = list.map((t) => t.id);
    if (!validCategories.includes(organizationCategory)) {
      return { error: "A valid Organization Category is required" };
    }

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
        organizationCategory,
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
