"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getOrganizationCategories } from "./organizations";

export async function createServiceAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const organizationCategory = formData.get("organizationCategory") as string;

  if (!name || !organizationCategory) {
    return { error: "All fields are required" };
  }

  try {
    const list = await getOrganizationCategories();
    const validCategories = list.map((t) => t.id);
    if (!validCategories.includes(organizationCategory)) {
      return { error: "A valid Organization Category is required" };
    }

    await db.insert(services).values({
      name,
      organizationCategory,
    });

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
