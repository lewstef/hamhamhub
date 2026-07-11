"use server";

import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Creates a new course associated with the organization.
 *
 * @param prevState - Unused state placeholder
 * @param formData - The course form data
 * @returns `{ success: true }` or `{ error: string }`
 */
export async function createCourseAction(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "organization" &&
      session.user.role !== "admin" &&
      session.user.role !== "employee")
  ) {
    return { error: "Unauthorized access" };
  }

  let organizationId: string;
  if (session.user.role === "organization") {
    organizationId = session.user.id;
  } else {
    organizationId = formData.get("organizationId") as string;
    if (!organizationId) {
      return { error: "Organization ID is required." };
    }
  }

  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const serviceId = formData.get("serviceId") as string || null;
  const certifiedTrainer = formData.get("certifiedTrainer") === "true";
  const certifierName = formData.get("certifierName") as string;
  const dedicatedField = formData.get("dedicatedField") === "true";
  const trainingFieldDescription = formData.get("trainingFieldDescription") as string;
  const trainingFieldAddress = formData.get("trainingFieldAddress") as string;
  const trainingFieldGoogleBusinessProfile = formData.get("trainingFieldGoogleBusinessProfile") as string;
  const trainingFieldGoogleMapsLink = formData.get("trainingFieldGoogleMapsLink") as string;
  const parking = formData.get("parking") === "true";
  const parkingDescription = formData.get("parkingDescription") as string;
  const details = formData.get("details") as string;
  const termsOfParticipation = formData.get("termsOfParticipation") as string;

  if (!name) {
    return { error: "Course name is required." };
  }

  try {
    await db.insert(courses).values({
      organizationId,
      serviceId,
      name,
      certifiedTrainer,
      certifierName: certifiedTrainer ? certifierName : null,
      dedicatedField,
      trainingFieldDescription: dedicatedField ? trainingFieldDescription : null,
      trainingFieldAddress: dedicatedField ? trainingFieldAddress : null,
      trainingFieldGoogleBusinessProfile: dedicatedField ? trainingFieldGoogleBusinessProfile : null,
      trainingFieldGoogleMapsLink: dedicatedField ? trainingFieldGoogleMapsLink : null,
      parking,
      parkingDescription: parking ? parkingDescription : null,
      details,
      termsOfParticipation,
      price,
    });

    revalidatePath("/dashboard/services/dog-training");
    revalidatePath("/dashboard/services/sport-dog-training");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]");
    return { success: true };
  } catch (error) {
    console.error("Failed to create course:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Updates an existing course.
 *
 * @param prevState - Unused state placeholder
 * @param formData - The course form data
 * @returns `{ success: true }` or `{ error: string }`
 */
export async function updateCourseAction(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "organization" &&
      session.user.role !== "admin" &&
      session.user.role !== "employee")
  ) {
    return { error: "Unauthorized access" };
  }

  const courseId = formData.get("id") as string;
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const serviceId = formData.get("serviceId") as string || null;
  const certifiedTrainer = formData.get("certifiedTrainer") === "true";
  const certifierName = formData.get("certifierName") as string;
  const dedicatedField = formData.get("dedicatedField") === "true";
  const trainingFieldDescription = formData.get("trainingFieldDescription") as string;
  const trainingFieldAddress = formData.get("trainingFieldAddress") as string;
  const trainingFieldGoogleBusinessProfile = formData.get("trainingFieldGoogleBusinessProfile") as string;
  const trainingFieldGoogleMapsLink = formData.get("trainingFieldGoogleMapsLink") as string;
  const parking = formData.get("parking") === "true";
  const parkingDescription = formData.get("parkingDescription") as string;
  const details = formData.get("details") as string;
  const termsOfParticipation = formData.get("termsOfParticipation") as string;

  if (!courseId) {
    return { error: "Course ID is required." };
  }
  if (!name) {
    return { error: "Course name is required." };
  }

  try {
    const [existing] = await db
      .select({ organizationId: courses.organizationId })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!existing) {
      return { error: "Course not found" };
    }

    if (session.user.role === "organization" && existing.organizationId !== session.user.id) {
      return { error: "Unauthorized course modification" };
    }

    await db
      .update(courses)
      .set({
        name,
        serviceId,
        certifiedTrainer,
        certifierName: certifiedTrainer ? certifierName : null,
        dedicatedField,
        trainingFieldDescription: dedicatedField ? trainingFieldDescription : null,
        trainingFieldAddress: dedicatedField ? trainingFieldAddress : null,
        trainingFieldGoogleBusinessProfile: dedicatedField ? trainingFieldGoogleBusinessProfile : null,
        trainingFieldGoogleMapsLink: dedicatedField ? trainingFieldGoogleMapsLink : null,
        parking,
        parkingDescription: parking ? parkingDescription : null,
        details,
        termsOfParticipation,
        price,
      })
      .where(eq(courses.id, courseId));

    revalidatePath("/dashboard/services/dog-training");
    revalidatePath("/dashboard/services/sport-dog-training");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]");
    return { success: true };
  } catch (error) {
    console.error("Failed to update course:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Deletes a course.
 *
 * @param courseId - The course ID to delete
 * @returns `{ success: true }` or `{ error: string }`
 */
export async function deleteCourseAction(courseId: string) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "organization" &&
      session.user.role !== "admin" &&
      session.user.role !== "employee")
  ) {
    return { error: "Unauthorized access" };
  }

  try {
    const [existing] = await db
      .select({ organizationId: courses.organizationId })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!existing) {
      return { error: "Course not found" };
    }

    if (session.user.role === "organization" && existing.organizationId !== session.user.id) {
      return { error: "Unauthorized course deletion" };
    }

    await db.delete(courses).where(eq(courses.id, courseId));

    revalidatePath("/dashboard/services/dog-training");
    revalidatePath("/dashboard/services/sport-dog-training");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Reorders courses for an organization.
 *
 * @param orderedCourseIds - List of course IDs in their new order
 * @returns `{ success: true }` or `{ error: string }`
 */
export async function reorderOrgCoursesAction(orderedCourseIds: string[]) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "organization" &&
      session.user.role !== "admin" &&
      session.user.role !== "employee")
  ) {
    return { error: "Unauthorized access" };
  }

  try {
    for (let i = 0; i < orderedCourseIds.length; i++) {
      if (session.user.role === "organization") {
        await db
          .update(courses)
          .set({ sortOrder: i })
          .where(and(eq(courses.id, orderedCourseIds[i]), eq(courses.organizationId, session.user.id)));
      } else {
        await db
          .update(courses)
          .set({ sortOrder: i })
          .where(eq(courses.id, orderedCourseIds[i]));
      }
    }
    revalidatePath("/dashboard/services/dog-training");
    revalidatePath("/dashboard/services/sport-dog-training");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder organization courses:", error);
    return { error: "Failed to save courses order." };
  }
}
