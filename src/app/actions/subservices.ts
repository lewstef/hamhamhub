"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Updates organization custom configurations for basic or group dog training sub-services.
 * Enforces authentication and role verification (organization owners or staff/admins).
 *
 * @param formData.subServiceId - "basic-training-and-obedience" | "group-basic-obedience-training" (required)
 * @param formData.orgId         - Target organization user ID (optional, defaults to current session ID)
 * @param formData.hasField      - "true" if dedicated field is enabled, otherwise "false"
 * @param formData.fieldDesc     - Text description of the training field (required if hasField is "true")
 * @param formData.hasParking    - "true" if parking is enabled, otherwise "false"
 * @param formData.parkingDesc   - Text description of the parking (required if hasParking is "true")
 * @param formData.schedule      - Text description of the schedule (optional/required)
 * @param formData.terms         - Text description of participation terms (optional/required)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` on validation failure, unauthorized access, or database error
 */
export async function updateSubServiceSettingsAction(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized: Access Denied." };
  }

  const subServiceId = formData.get("subServiceId") as string;
  const targetOrgId = (formData.get("orgId") as string) || session.user.id;

  if (!subServiceId) {
    return { error: "Sub-service identifier is required." };
  }

  if (
    targetOrgId !== session.user.id &&
    session.user.role !== "admin" &&
    session.user.role !== "employee"
  ) {
    return { error: "Unauthorized: You do not have permission to edit this organization's services." };
  }

  const hasField = formData.get("hasField") === "true";
  const fieldDesc = (formData.get("fieldDesc") as string) || "";
  const hasParking = formData.get("hasParking") === "true";
  const parkingDesc = (formData.get("parkingDesc") as string) || "";
  const schedule = (formData.get("schedule") as string) || "";
  const terms = (formData.get("terms") as string) || "";
  const programIncludes = (formData.get("programIncludes") as string) || "";
  const hasCertifiedTrainer = formData.get("hasCertifiedTrainer") === "true";
  const trainerInstitution = (formData.get("trainerInstitution") as string) || "";

  // Validations
  if (hasField && !fieldDesc.trim()) {
    return { error: "Training field description is required when dedicated training field is enabled." };
  }

  if (hasParking && !parkingDesc.trim()) {
    return { error: "Parking description is required when parking is enabled." };
  }

  if (hasCertifiedTrainer && !trainerInstitution.trim()) {
    return { error: "Certifier name is required when certified dog trainer is enabled." };
  }

  try {
    const updateData: Record<string, any> = {};

    if (subServiceId === "basic-training-and-obedience") {
      updateData.basicHasField = hasField;
      updateData.basicFieldDesc = hasField ? fieldDesc.trim() : null;
      updateData.basicHasParking = hasParking;
      updateData.basicParkingDesc = hasParking ? parkingDesc.trim() : null;
      updateData.basicSchedule = schedule.trim() || null;
      updateData.basicTerms = terms.trim() || null;
      updateData.basicProgramIncludes = programIncludes.trim() || null;
      updateData.basicHasCertifiedTrainer = hasCertifiedTrainer;
      updateData.basicTrainerInstitution = hasCertifiedTrainer ? trainerInstitution.trim() : null;
    } else if (subServiceId === "group-basic-obedience-training") {
      updateData.groupHasField = hasField;
      updateData.groupFieldDesc = hasField ? fieldDesc.trim() : null;
      updateData.groupHasParking = hasParking;
      updateData.groupParkingDesc = hasParking ? parkingDesc.trim() : null;
      updateData.groupSchedule = schedule.trim() || null;
      updateData.groupTerms = terms.trim() || null;
      updateData.groupProgramIncludes = programIncludes.trim() || null;
      updateData.groupHasCertifiedTrainer = hasCertifiedTrainer;
      updateData.groupTrainerInstitution = hasCertifiedTrainer ? trainerInstitution.trim() : null;
    } else {
      return { error: "Invalid sub-service selected." };
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, targetOrgId));

    revalidatePath("/dashboard/services/dog-training");
    revalidatePath(`/dashboard/services/dog-training/${subServiceId}`);
    revalidatePath(`/backoffice/organizations/services/dog-training/${subServiceId}/${targetOrgId}`);
    revalidatePath(`/backoffice/organizations/edit/${targetOrgId}/services/dog-training`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update sub-service settings:", error);
    return { error: "Something went wrong while saving sub-service settings." };
  }
}
