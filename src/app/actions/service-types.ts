"use server";

import { db } from "@/db";
import { serviceTypes } from "@/db/schema";
import { serviceTypesList, ServiceType } from "@/config/service-types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Returns the full list of service types, merging DB overrides with static config.
 *
 * On first call, if the `serviceTypes` table is empty, seeds it with all entries
 * from `src/config/service-types.ts`. Subsequent calls read from the DB.
 *
 * The returned objects always contain the full static config (applicableTo, fields, etc.)
 * with `name` and `description` overridden by whatever is stored in the DB.
 *
 * @returns Array of `ServiceType` objects (id, name, description, applicableTo, fields)
 */
export async function getServiceTypesAction(): Promise<ServiceType[]> {
  let dbList = await db.select().from(serviceTypes);
  if (dbList.length === 0) {
    const seedData = serviceTypesList.map((st) => ({
      id: st.id,
      name: st.name,
      description: st.description,
    }));
    await db.insert(serviceTypes).values(seedData);
    dbList = await db.select().from(serviceTypes);
  }

  // Merge dynamic properties from database with configurations
  return serviceTypesList.map((st) => {
    const dbItem = dbList.find((item) => item.id === st.id);
    return {
      ...st,
      name: dbItem ? dbItem.name : st.name,
      description: dbItem ? dbItem.description : st.description,
    };
  });
}

/**
 * Updates the display name and description of a service type in the database.
 * The `id` is immutable — only the editable display fields are changed.
 * Revalidates both the service types page and the services directory.
 *
 * @param formData.id          - Service type ID to update (required)
 * @param formData.name        - New display name, must be non-empty (required)
 * @param formData.description - New description, must be non-empty (required)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` on missing/empty fields or DB failure
 * @sideEffect Revalidates `/backoffice/services/types` and `/backoffice/services`
 */
export async function updateServiceTypeAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!id || !name || name.trim() === "" || !description || description.trim() === "") {
    return { error: "All fields are required." };
  }

  try {
    await db
      .update(serviceTypes)
      .set({
        name: name.trim(),
        description: description.trim(),
      })
      .where(eq(serviceTypes.id, id));

    revalidatePath("/backoffice/services/types");
    revalidatePath("/backoffice/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to update service type:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
