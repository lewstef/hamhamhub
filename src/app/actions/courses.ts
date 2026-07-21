"use server";

import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Creates a new offering (Course, Dog Sport, or Boarding Service) associated with the organization.
 *
 * @param prevState - Unused state placeholder
 * @param formData - The course/boarding form data
 * @param formData.name - Name of the offering (required)
 * @param formData.price - Price amount (e.g. "150 RON")
 * @param formData.priceType - Suffix billing frequency (e.g. "course", "month", "night", "day")
 * @param formData.serviceId - Linked service template UUID
 * @param formData.certifiedTrainer - Boolean string for training trainer certification
 * @param formData.certifierName - Trainer certification body name
 * @param formData.dedicatedField - Boolean string for training field availability
 * @param formData.trainingFieldDescription - Description of training field
 * @param formData.trainingFieldAddress - Address of training field
 * @param formData.trainingFieldGoogleBusinessProfile - Google Business Profile link of training field
 * @param formData.trainingFieldGoogleMapsLink - Google Maps link of training field
 * @param formData.parking - Boolean string for parking availability
 * @param formData.parkingDescription - Description of parking spaces
 * @param formData.details - Offering detailed description
 * @param formData.termsOfParticipation - Offering terms and prerequisites
 * @param formData.medicationAdministration - Boolean string for boarding meds administration
 * @param formData.medicationAdministrationDetails - Instructions for medication administration
 * @param formData.dailyWalks - Integer string (1-4) representing daily walk frequency
 * @param formData.ownerCommunication - Boolean string for owner updates communication
 * @param formData.ownerCommunicationDetails - Delivery methods for owner communication
 * @param formData.personalizedMealPlan - Boolean string for custom dietary meal plans
 * @param formData.personalizedMealPlanDetails - Custom meal planning specifications
 * @param formData.checkin - The check-in time, format: hh:mm (24h)
 * @param formData.checkout - The check-out time, format: hh:mm (24h)
 * @param formData.faq - Serialized JSON string representing array of Frequently Asked Questions
 *
 * @returns `{ success: true }` on successful creation
 * @returns `{ error: string }` if name is missing, unauthorized access, or DB failure
 * @sideEffect Revalidates /dashboard/services/dog-training, /dashboard/services/sport-dog-training, /dashboard/services/dog-boarding, and matching backoffice paths
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
  const priceType = formData.get("priceType") as string || "course";
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

  const medicationAdministration = formData.get("medicationAdministration") === "true";
  const medicationAdministrationDetails = formData.get("medicationAdministrationDetails") as string;
  const dailyWalksStr = formData.get("dailyWalks") as string;
  const dailyWalks = dailyWalksStr ? parseInt(dailyWalksStr, 10) : null;
  const ownerCommunication = formData.get("ownerCommunication") === "true";
  const ownerCommunicationDetails = formData.get("ownerCommunicationDetails") as string;
  const personalizedMealPlan = formData.get("personalizedMealPlan") === "true";
  const personalizedMealPlanDetails = formData.get("personalizedMealPlanDetails") as string;
  const checkin = formData.get("checkin") as string || null;
  const checkout = formData.get("checkout") as string || null;
  const ageLimitsEnabled = formData.get("ageLimitsEnabled") === "true";
  const ageLimits = formData.get("ageLimits") as string || null;
  const faq = formData.get("faq") as string || null;

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (checkin && !timeRegex.test(checkin)) {
    return { error: "Invalid check-in time format. Use hh:mm (24h)." };
  }
  if (checkout && !timeRegex.test(checkout)) {
    return { error: "Invalid check-out time format. Use hh:mm (24h)." };
  }

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
      priceType,
      medicationAdministration,
      medicationAdministrationDetails: medicationAdministration ? medicationAdministrationDetails : null,
      dailyWalks,
      ownerCommunication,
      ownerCommunicationDetails: ownerCommunication ? ownerCommunicationDetails : null,
      personalizedMealPlan,
      personalizedMealPlanDetails: personalizedMealPlan ? personalizedMealPlanDetails : null,
      checkin,
      checkout,
      ageLimitsEnabled,
      ageLimits: ageLimitsEnabled ? ageLimits : null,
      faq,
    });

    revalidatePath("/dashboard/services/dog-training");
    revalidatePath("/dashboard/services/sport-dog-training");
    revalidatePath("/dashboard/services/dog-boarding");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/dog-boarding/[...courseSlugAndId]");
    return { success: true };
  } catch (error) {
    console.error("Failed to create course:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Updates an existing offering (Course, Dog Sport, or Boarding Service).
 *
 * @param prevState - Unused state placeholder
 * @param formData - The course/boarding form data
 * @param formData.id - ID of the course to update (required)
 * @param formData.name - Name of the offering (required)
 * @param formData.price - Price amount (e.g. "150 RON")
 * @param formData.priceType - Suffix billing frequency (e.g. "course", "month", "night", "day")
 * @param formData.serviceId - Linked service template UUID
 * @param formData.certifiedTrainer - Boolean string for training trainer certification
 * @param formData.certifierName - Trainer certification body name
 * @param formData.dedicatedField - Boolean string for training field availability
 * @param formData.trainingFieldDescription - Description of training field
 * @param formData.trainingFieldAddress - Address of training field
 * @param formData.trainingFieldGoogleBusinessProfile - Google Business Profile link of training field
 * @param formData.trainingFieldGoogleMapsLink - Google Maps link of training field
 * @param formData.parking - Boolean string for parking availability
 * @param formData.parkingDescription - Description of parking spaces
 * @param formData.details - Offering detailed description
 * @param formData.termsOfParticipation - Offering terms and prerequisites
 * @param formData.medicationAdministration - Boolean string for boarding meds administration
 * @param formData.medicationAdministrationDetails - Instructions for medication administration
 * @param formData.dailyWalks - Integer string (1-4) representing daily walk frequency
 * @param formData.ownerCommunication - Boolean string for owner updates communication
 * @param formData.ownerCommunicationDetails - Delivery methods for owner communication
 * @param formData.personalizedMealPlan - Boolean string for custom dietary meal plans
 * @param formData.personalizedMealPlanDetails - Custom meal planning specifications
 * @param formData.checkin - The check-in time, format: hh:mm (24h)
 * @param formData.checkout - The check-out time, format: hh:mm (24h)
 * @param formData.faq - Serialized JSON string representing array of Frequently Asked Questions
 *
 * @returns `{ success: true }` on successful update
 * @returns `{ error: string }` if name or id is missing, unauthorized access, or DB failure
 * @sideEffect Revalidates /dashboard/services/dog-training, /dashboard/services/sport-dog-training, /dashboard/services/dog-boarding, and matching backoffice paths
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
  const priceType = formData.get("priceType") as string || "course";
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

  const medicationAdministration = formData.get("medicationAdministration") === "true";
  const medicationAdministrationDetails = formData.get("medicationAdministrationDetails") as string;
  const dailyWalksStr = formData.get("dailyWalks") as string;
  const dailyWalks = dailyWalksStr ? parseInt(dailyWalksStr, 10) : null;
  const ownerCommunication = formData.get("ownerCommunication") === "true";
  const ownerCommunicationDetails = formData.get("ownerCommunicationDetails") as string;
  const personalizedMealPlan = formData.get("personalizedMealPlan") === "true";
  const personalizedMealPlanDetails = formData.get("personalizedMealPlanDetails") as string;
  const checkin = formData.get("checkin") as string || null;
  const checkout = formData.get("checkout") as string || null;
  const ageLimitsEnabled = formData.get("ageLimitsEnabled") === "true";
  const ageLimits = formData.get("ageLimits") as string || null;
  const faq = formData.get("faq") as string || null;

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (checkin && !timeRegex.test(checkin)) {
    return { error: "Invalid check-in time format. Use hh:mm (24h)." };
  }
  if (checkout && !timeRegex.test(checkout)) {
    return { error: "Invalid check-out time format. Use hh:mm (24h)." };
  }

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
        priceType,
        medicationAdministration,
        medicationAdministrationDetails: medicationAdministration ? medicationAdministrationDetails : null,
        dailyWalks,
        ownerCommunication,
        ownerCommunicationDetails: ownerCommunication ? ownerCommunicationDetails : null,
        personalizedMealPlan,
        personalizedMealPlanDetails: personalizedMealPlan ? personalizedMealPlanDetails : null,
        checkin,
        checkout,
        ageLimitsEnabled,
        ageLimits: ageLimitsEnabled ? ageLimits : null,
        faq,
      })
      .where(eq(courses.id, courseId));

    revalidatePath("/dashboard/services/dog-training");
    revalidatePath("/dashboard/services/sport-dog-training");
    revalidatePath("/dashboard/services/dog-boarding");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/dog-boarding/[...courseSlugAndId]");
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
    revalidatePath("/dashboard/services/dog-boarding");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/dog-boarding/[...courseSlugAndId]");
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
    revalidatePath("/dashboard/services/dog-boarding");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]");
    revalidatePath("/backoffice/organizations/services/dog-boarding/[...courseSlugAndId]");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder organization courses:", error);
    return { error: "Failed to save courses order." };
  }
}
