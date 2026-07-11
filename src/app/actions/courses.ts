"use server";

import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  if (!session || session.user.role !== "organization") {
    return { error: "Unauthorized access" };
  }

  const organizationId = session.user.id;
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const certifiedTrainer = formData.get("certifiedTrainer") === "true";
  const certifierName = formData.get("certifierName") as string;
  const dedicatedField = formData.get("dedicatedField") === "true";
  const trainingFieldDescription = formData.get("trainingFieldDescription") as string;
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
      name,
      certifiedTrainer,
      certifierName: certifiedTrainer ? certifierName : null,
      dedicatedField,
      trainingFieldDescription: dedicatedField ? trainingFieldDescription : null,
      parking,
      parkingDescription: parking ? parkingDescription : null,
      details,
      termsOfParticipation,
      price,
    });

    revalidatePath("/dashboard/services/dog-training");
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
  if (!session || session.user.role !== "organization") {
    return { error: "Unauthorized access" };
  }

  const courseId = formData.get("id") as string;
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const certifiedTrainer = formData.get("certifiedTrainer") === "true";
  const certifierName = formData.get("certifierName") as string;
  const dedicatedField = formData.get("dedicatedField") === "true";
  const trainingFieldDescription = formData.get("trainingFieldDescription") as string;
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

    if (!existing || existing.organizationId !== session.user.id) {
      return { error: "Unauthorized course modification" };
    }

    await db
      .update(courses)
      .set({
        name,
        certifiedTrainer,
        certifierName: certifiedTrainer ? certifierName : null,
        dedicatedField,
        trainingFieldDescription: dedicatedField ? trainingFieldDescription : null,
        parking,
        parkingDescription: parking ? parkingDescription : null,
        details,
        termsOfParticipation,
        price,
      })
      .where(eq(courses.id, courseId));

    revalidatePath("/dashboard/services/dog-training");
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
  if (!session || session.user.role !== "organization") {
    return { error: "Unauthorized access" };
  }

  try {
    const [existing] = await db
      .select({ organizationId: courses.organizationId })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!existing || existing.organizationId !== session.user.id) {
      return { error: "Unauthorized course deletion" };
    }

    await db.delete(courses).where(eq(courses.id, courseId));

    revalidatePath("/dashboard/services/dog-training");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
