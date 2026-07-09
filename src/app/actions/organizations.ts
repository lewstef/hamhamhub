"use server";

import { db } from "@/db";
import { users, organizationCategories } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Returns all organization categories from the database.
 * If the table is empty on first call, seeds it with 4 default categories
 * (NGO, Dog Kennel, Dog service provider, Official Cynological Association)
 * before returning.
 *
 * @returns Array of `{ id, name, description }` objects
 */
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

/**
 * Creates a new organization category.
 * The `id` is auto-derived from the name (lowercased, slugified).
 *
 * @param formData.name        - Category display name (required, must produce a non-empty slug)
 * @param formData.description - Optional description text
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` if name is missing, slug is invalid, or the category already exists
 * @sideEffect Revalidates `/backoffice/organizations`
 */
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

/**
 * Updates the name and description of an existing organization category.
 * The `id` is immutable — only display fields are changed.
 *
 * @param formData.id          - Existing category ID (required)
 * @param formData.name        - New display name (required)
 * @param formData.description - New description (optional, clears to null if empty)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` on missing fields or DB failure
 * @sideEffect Revalidates `/backoffice/organizations`
 */
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

/**
 * Deletes an organization category by ID.
 * Refuses deletion if any organization account is currently assigned to this category.
 *
 * @param formData.id - Category ID to delete (required)
 *
 * @returns `{ success: true }` on successful deletion
 * @returns `{ error: string }` if ID is missing, category is in use, or DB failure
 * @sideEffect Revalidates `/backoffice/organizations`
 */
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

/**
 * Creates a new organization account (role = "organization").
 * Validates that the given category is a known organization category.
 *
 * @param formData.name                 - Organization display name (required)
 * @param formData.email                - Unique login email (required)
 * @param formData.password             - Min 6 characters (required)
 * @param formData.organizationCategory - Must be a valid category ID (required)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` on missing fields, duplicate email, invalid category, or DB failure
 * @sideEffect Revalidates `/backoffice/organizations`
 */
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

/**
 * Updates profile fields for an existing organization account.
 * Does not change password or role.
 *
 * @param formData.id                   - Organization user ID (required)
 * @param formData.name                 - New display name (required)
 * @param formData.email                - New unique email (required)
 * @param formData.organizationCategory - Must be a valid category ID (required)
 *
 * @returns `{ error: string }` on validation or DB failure
 * @returns Never returns on success — issues a server-side `redirect()` to `/backoffice/organizations`
 * @throws Re-throws Next.js NEXT_REDIRECT errors.
 * @sideEffect Revalidates `/backoffice/organizations`
 */
export async function updateOrganizationAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const organizationCategory = formData.get("organizationCategory") as string;

  if (!id || !name || !organizationCategory) {
    return { error: "All fields are required" };
  }

  try {
    const list = await getOrganizationCategories();
    const validCategories = list.map((t) => t.id);
    if (!validCategories.includes(organizationCategory)) {
      return { error: "A valid Organization Category is required" };
    }

    const updateData: Record<string, any> = {
      name,
      organizationCategory,
    };

    if (formData.has("phoneNumber")) {
      updateData.phoneNumber = (formData.get("phoneNumber") as string) || null;
    }

    if (
      formData.has("addressLine") ||
      formData.has("addressCity") ||
      formData.has("addressState") ||
      formData.has("addressZip") ||
      formData.has("addressCountry")
    ) {
      const addressLine = formData.get("addressLine") as string | null;
      const addressCity = formData.get("addressCity") as string | null;
      const addressState = formData.get("addressState") as string | null;
      const addressZip = formData.get("addressZip") as string | null;
      const addressCountry = formData.get("addressCountry") as string | null;

      const parts = [
        addressLine?.trim(),
        addressCity?.trim(),
        addressState?.trim(),
        addressZip?.trim(),
        addressCountry?.trim(),
      ].filter(Boolean);

      updateData.address = parts.join(", ") || null;
      updateData.addressCountry = addressCountry || null;
      updateData.addressState = addressState || null;
      updateData.addressCity = addressCity || null;
      updateData.addressLine = addressLine || null;
      updateData.addressZip = addressZip || null;
    }

    if (formData.has("facebook")) {
      updateData.facebook = (formData.get("facebook") as string) || null;
    }
    if (formData.has("instagram")) {
      updateData.instagram = (formData.get("instagram") as string) || null;
    }
    if (formData.has("tiktok")) {
      updateData.tiktok = (formData.get("tiktok") as string) || null;
    }
    if (formData.has("youtube")) {
      updateData.youtube = (formData.get("youtube") as string) || null;
    }
    if (formData.has("website")) {
      updateData.website = (formData.get("website") as string) || null;
    }
    if (formData.has("googleBusinessProfile")) {
      updateData.googleBusinessProfile = (formData.get("googleBusinessProfile") as string) || null;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id));

    revalidatePath("/backoffice/organizations");
    revalidatePath(`/backoffice/organizations/edit/${id}`);
    revalidatePath("/dashboard/account");
    return { success: true };
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

/**
 * Changes the password, email, and recovery email for an existing organization account.
 *
 * @param formData.id              - Organization user ID (required)
 * @param formData.email           - Unique login email (optional/required)
 * @param formData.recoveryEmail   - Recovery email (optional)
 * @param formData.password        - New password, min 6 characters (optional)
 * @param formData.confirmPassword - Must match `password` exactly (optional)
 *
 * @returns `{ success: true }` on successful update
 * @returns `{ error: string }` on validation or DB failure
 * @sideEffect Revalidates `/backoffice/organizations`
 */
export async function changeOrganizationPasswordAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const email = formData.get("email") as string | null;
  const recoveryEmail = formData.get("recoveryEmail") as string | null;
  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;
  const currentPassword = formData.get("currentPassword") as string | null;

  if (!id) {
    return { error: "Organization ID is required" };
  }

  try {
    const updateData: Partial<typeof users.$inferInsert> = {};

    if (email) {
      // Check if email is taken by another user
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), ne(users.id, id)))
        .limit(1);

      if (existingEmail) {
        return { error: "Email address is already taken" };
      }
      updateData.email = email;
    }

    if (recoveryEmail !== null) {
      updateData.recoveryEmail = recoveryEmail || null;
    }

    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        return { error: "All password fields are required" };
      }

      if (password.length < 6) {
        return { error: "Password must be at least 6 characters" };
      }

      if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
      }

      const session = await auth();
      if (session?.user?.role === "organization") {
        if (!currentPassword) {
          return { error: "Current password is required" };
        }

        const [orgUser] = await db
          .select({ password: users.password })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (!orgUser) {
          return { error: "Organization not found" };
        }

        const isMatch = await bcrypt.compare(currentPassword, orgUser.password);
        if (!isMatch) {
          return { error: "Incorrect current password" };
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id));
    }

    revalidatePath("/backoffice/organizations");
    revalidatePath(`/backoffice/organizations/edit/${id}`);
    revalidatePath("/dashboard/account");
    return { success: true };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to change organization account settings:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Permanently deletes an organization account.
 * Includes a role guard — only accounts with role "organization" can be deleted.
 *
 * @param formData.id - Organization user ID to delete (required)
 *
 * @returns `{ success: true }` on successful deletion
 * @returns `{ error: string }` if ID is missing, account not found, wrong role, or DB failure
 * @sideEffect Revalidates `/backoffice/organizations`
 */
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

export async function toggleOrganizationServiceAction(organizationId: string, serviceId: string, enabled: boolean) {
  try {
    const [org] = await db
      .select({ enabledServices: users.enabledServices })
      .from(users)
      .where(eq(users.id, organizationId))
      .limit(1);

    if (!org) {
      return { error: "Organization not found" };
    }

    let enabledList = org.enabledServices ? org.enabledServices.split(",").map(id => id.trim()).filter(Boolean) : [];
    if (enabled) {
      if (!enabledList.includes(serviceId)) {
        enabledList.push(serviceId);
      }
    } else {
      enabledList = enabledList.filter((id) => id !== serviceId);
    }

    const nextVal = enabledList.join(",");

    await db
      .update(users)
      .set({ enabledServices: nextVal || null })
      .where(eq(users.id, organizationId));

    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle organization service:", error);
    return { error: "Failed to toggle service. Please try again." };
  }
}

export async function toggleOrganizationSubServiceAction(organizationId: string, subServiceId: string, enabled: boolean) {
  try {
    const [org] = await db
      .select({ enabledSubServices: users.enabledSubServices })
      .from(users)
      .where(eq(users.id, organizationId))
      .limit(1);

    if (!org) {
      return { error: "Organization not found" };
    }

    let enabledList = org.enabledSubServices ? org.enabledSubServices.split(",").map(id => id.trim()).filter(Boolean) : [];
    if (enabled) {
      if (!enabledList.includes(subServiceId)) {
        enabledList.push(subServiceId);
      }
    } else {
      enabledList = enabledList.filter((id) => id !== subServiceId);
    }

    const nextVal = enabledList.join(",");

    await db
      .update(users)
      .set({ enabledSubServices: nextVal || null })
      .where(eq(users.id, organizationId));

    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard");
    revalidatePath("/backoffice/organizations/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle organization sub-service:", error);
    return { error: "Failed to toggle sub-service. Please try again." };
  }
}
