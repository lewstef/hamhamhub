"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getOrganizationCategories } from "./organizations";
import { getServiceTypesAction } from "./service-types";

/**
 * Registers one or more service types under a specific organization category.
 * Accepts multiple service names via `formData.getAll("name")` (multi-value field).
 * Validates that each name matches a known service type and rejects duplicates
 * already registered under the same category.
 *
 * @param formData.name                 - One or more service type names (multi-value, required)
 * @param formData.organizationCategory - Must be a valid category ID (required)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` if fields are missing, a name is not a valid service type,
 *                              a name is already registered for this category, or DB failure
 * @sideEffect Revalidates `/backoffice/services`
 */
export async function createServiceAction(prevState: unknown, formData: FormData) {
  const names = formData.getAll("name") as string[];
  const organizationCategory = formData.get("organizationCategory") as string;

  if (!organizationCategory) {
    return { error: "Organization Category is required" };
  }

  try {
    const list = await getOrganizationCategories();
    const validCategories = list.map((t) => t.id);
    if (!validCategories.includes(organizationCategory)) {
      return { error: "A valid Organization Category is required" };
    }

    const serviceTypeList = await getServiceTypesAction();
    const validServiceNames = serviceTypeList.map((st) => st.name);
    for (const name of names) {
      if (!validServiceNames.includes(name)) {
        return { error: `A valid Service Type name is required: "${name}"` };
      }
    }

    // Get current registered services for this category
    const currentServices = await db
      .select()
      .from(services)
      .where(eq(services.organizationCategory, organizationCategory));

    const currentNames = currentServices.map((s) => s.name);

    // Delete deselected services
    const toDelete = currentServices.filter((s) => !names.includes(s.name));
    for (const s of toDelete) {
      await db.delete(services).where(eq(services.id, s.id));
    }

    // Insert new services
    const toInsert = names.filter((name) => !currentNames.includes(name));
    for (const name of toInsert) {
      await db.insert(services).values({
        name,
        organizationCategory,
      });
    }

    revalidatePath("/backoffice/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to create service:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Permanently removes a service registration by its database ID.
 *
 * @param formData.id - Service record ID to delete (required)
 *
 * @returns `{ success: true }` on successful deletion
 * @returns `{ error: string }` if ID is missing or DB failure
 * @sideEffect Revalidates `/backoffice/services`
 */
export async function deleteServiceAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "Service ID is required" };
  }

  try {
    await db.delete(services).where(eq(services.id, id));
    revalidatePath("/backoffice/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete service:", error);
    return { error: "Could not delete service. Please try again." };
  }
}

export async function reorderServicesAction(orderedServiceIds: string[]) {
  try {
    for (let i = 0; i < orderedServiceIds.length; i++) {
      await db
        .update(services)
        .set({ sortOrder: i })
        .where(eq(services.id, orderedServiceIds[i]));
    }
    revalidatePath("/backoffice/services");
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder services:", error);
    return { error: "Failed to save services order." };
  }
}

export async function reorderCoursesAction(serviceId: string, orderedCourses: string[]) {
  try {
    await db
      .update(services)
      .set({ coursesOrder: orderedCourses.join(",") })
      .where(eq(services.id, serviceId));
    revalidatePath("/backoffice/services");
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder courses:", error);
    return { error: "Failed to save courses order." };
  }
}
