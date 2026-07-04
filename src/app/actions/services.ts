"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createServiceAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const organizationType = formData.get("organizationType") as "dog_service_provider" | "dog_kennel" | "cynological_association" | "ngo";

  if (!name || !organizationType) {
    return { error: "All fields are required" };
  }

  const validTypes = ["dog_service_provider", "dog_kennel", "cynological_association", "ngo"];
  if (!validTypes.includes(organizationType)) {
    return { error: "A valid Organization Type is required" };
  }

  try {
    await db.insert(services).values({
      name,
      organizationType,
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
