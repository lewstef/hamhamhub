"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getOrganizationCategories } from "./organizations";
import { getServiceTypesAction } from "./service-types";

export async function createServiceAction(prevState: unknown, formData: FormData) {
  const names = formData.getAll("name") as string[];
  const organizationCategory = formData.get("organizationCategory") as string;

  if (!names || names.length === 0 || !organizationCategory) {
    return { error: "All fields are required" };
  }

  try {
    const serviceTypeList = await getServiceTypesAction();
    const validServiceNames = serviceTypeList.map((st) => st.name);
    for (const name of names) {
      if (!validServiceNames.includes(name)) {
        return { error: `A valid Service Type name is required: "${name}"` };
      }
    }

    const list = await getOrganizationCategories();
    const validCategories = list.map((t) => t.id);
    if (!validCategories.includes(organizationCategory)) {
      return { error: "A valid Organization Category is required" };
    }

    // Check for duplicates
    for (const name of names) {
      const existing = await db
        .select()
        .from(services)
        .where(
          and(
            eq(services.name, name),
            eq(services.organizationCategory, organizationCategory)
          )
        );
      if (existing.length > 0) {
        return { error: `Service "${name}" is already registered under this category.` };
      }
    }

    for (const name of names) {
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
