"use server";

import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Typed payload returned by {@link parseCourseFormData}.
 * Contains all fields extracted from a course/boarding FormData submission.
 */
interface ParsedCourseData {
  name: string;
  price: string;
  priceType: string;
  serviceId: string | null;
  certifiedTrainer: boolean;
  certifierName: string;
  trainerExperienceDescription: string;
  veterinaryTraining: boolean;
  veterinaryTrainingCertifier: string;
  veterinaryTrainingDetails: string;
  dedicatedField: boolean;
  trainingFieldDescription: string;
  trainingFieldAddress: string;
  trainingFieldGoogleBusinessProfile: string;
  trainingFieldGoogleMapsLink: string;
  parking: boolean;
  parkingDescription: string;
  details: string;
  termsOfParticipation: string;
  medicationAdministration: boolean;
  medicationAdministrationDetails: string;
  surveillance247: boolean;
  surveillance247Details: string;
  webCam: boolean;
  webCamDetails: string;
  dailyWalks: number | null;
  ownerCommunication: boolean;
  ownerCommunicationDetails: string;
  personalizedMealPlan: boolean;
  personalizedMealPlanDetails: string;
  checkin: string | null;
  checkout: string | null;
  checkinWeekend: string | null;
  checkoutWeekend: string | null;
  schedule: string | null;
  ageLimitsEnabled: boolean;
  ageLimits: string | null;
  coverageZones: string | null;
  faq: string | null;
}

/**
 * Parses and validates all course/boarding fields from a FormData object.
 *
 * Performs time format validation for checkin/checkout fields and schedule items.
 * Returns either a typed {@link ParsedCourseData} payload or an error string.
 *
 * @param formData - The raw FormData submitted by {@link CourseForm}.
 * @returns `{ data: ParsedCourseData }` on success, or `{ error: string }` on validation failure.
 */
function parseCourseFormData(formData: FormData): { data: ParsedCourseData } | { error: string } {
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const priceType = (formData.get("priceType") as string) || "course";
  const serviceId = (formData.get("serviceId") as string) || null;
  const certifiedTrainer = formData.get("certifiedTrainer") === "true";
  const certifierName = formData.get("certifierName") as string;
  const trainerExperienceDescription = formData.get("trainerExperienceDescription") as string;
  const veterinaryTraining = formData.get("veterinaryTraining") === "true";
  const veterinaryTrainingCertifier = (formData.get("veterinaryTrainingCertifier") as string) || "";
  const veterinaryTrainingDetails = (formData.get("veterinaryTrainingDetails") as string) || "";
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
  const surveillance247 = formData.get("surveillance247") === "true";
  const surveillance247Details = formData.get("surveillance247Details") as string;
  const webCam = formData.get("webCam") === "true";
  const webCamDetails = formData.get("webCamDetails") as string;
  const dailyWalksStr = formData.get("dailyWalks") as string;
  const dailyWalks = dailyWalksStr ? parseInt(dailyWalksStr, 10) : null;
  const ownerCommunication = formData.get("ownerCommunication") === "true";
  const ownerCommunicationDetails = formData.get("ownerCommunicationDetails") as string;
  const personalizedMealPlan = formData.get("personalizedMealPlan") === "true";
  const personalizedMealPlanDetails = formData.get("personalizedMealPlanDetails") as string;
  const checkin = (formData.get("checkin") as string) || null;
  const checkout = (formData.get("checkout") as string) || null;
  const checkinWeekend = (formData.get("checkinWeekend") as string) || null;
  const checkoutWeekend = (formData.get("checkoutWeekend") as string) || null;
  const schedule = (formData.get("schedule") as string) || null;
  const ageLimitsEnabled = formData.get("ageLimitsEnabled") === "true";
  const ageLimits = (formData.get("ageLimits") as string) || null;
  const coverageZones = (formData.get("coverageZones") as string) || null;
  const faq = (formData.get("faq") as string) || null;

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (checkin && !timeRegex.test(checkin)) {
    return { error: "Invalid work week check-in time format. Use hh:mm (24h)." };
  }
  if (checkout && !timeRegex.test(checkout)) {
    return { error: "Invalid work week check-out time format. Use hh:mm (24h)." };
  }
  if (checkinWeekend && !timeRegex.test(checkinWeekend)) {
    return { error: "Invalid weekend check-in time format. Use hh:mm (24h)." };
  }
  if (checkoutWeekend && !timeRegex.test(checkoutWeekend)) {
    return { error: "Invalid weekend check-out time format. Use hh:mm (24h)." };
  }

  if (schedule) {
    try {
      const parsedSchedule = JSON.parse(schedule);
      if (Array.isArray(parsedSchedule)) {
        for (const item of parsedSchedule) {
          if (item && item.enabled) {
            if (item.checkin && !timeRegex.test(item.checkin)) {
              return { error: `Invalid check-in time format for ${item.label || item.day}. Use hh:mm (24h).` };
            }
            if (item.checkout && !timeRegex.test(item.checkout)) {
              return { error: `Invalid check-out time format for ${item.label || item.day}. Use hh:mm (24h).` };
            }
            if (item.checkin && item.checkout && item.checkout <= item.checkin) {
              return { error: `Check-out time cannot be before or equal to check-in time for ${item.label || item.day}.` };
            }
          }
        }
      }
    } catch (e) {
      return { error: "Invalid schedule JSON format." };
    }
  }

  return {
    data: {
      name, price, priceType, serviceId,
      certifiedTrainer, certifierName, trainerExperienceDescription,
      veterinaryTraining, veterinaryTrainingCertifier, veterinaryTrainingDetails,
      dedicatedField, trainingFieldDescription, trainingFieldAddress,
      trainingFieldGoogleBusinessProfile, trainingFieldGoogleMapsLink,
      parking, parkingDescription, details, termsOfParticipation,
      medicationAdministration, medicationAdministrationDetails,
      surveillance247, surveillance247Details,
      webCam, webCamDetails, dailyWalks,
      ownerCommunication, ownerCommunicationDetails,
      personalizedMealPlan, personalizedMealPlanDetails,
      checkin, checkout, checkinWeekend, checkoutWeekend,
      schedule, ageLimitsEnabled, ageLimits, coverageZones, faq,
    },
  };
}

/** Shared path revalidation applied after any course create or update. */
function revalidateCourseServicePaths() {
  revalidatePath("/dashboard/services/dog-training");
  revalidatePath("/dashboard/services/sport-dog-training");
  revalidatePath("/dashboard/services/dog-boarding");
  revalidatePath("/dashboard/services/dog-sitting");
  revalidatePath("/dashboard/services/dog-walking");
  revalidatePath("/dashboard/services/dog-grooming");
  revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]", "page");
  revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]", "page");
  revalidatePath("/backoffice/organizations/services/dog-boarding/[...courseSlugAndId]", "page");
  revalidatePath("/backoffice/organizations/services/dog-sitting/[...courseSlugAndId]", "page");
  revalidatePath("/backoffice/organizations/services/dog-walking/[...courseSlugAndId]", "page");
  revalidatePath("/backoffice/organizations/services/dog-grooming/[...courseSlugAndId]", "page");
}

/**
 * Creates a new offering (Course, Dog Sport, or Boarding Service) associated with the organization.
 *
 * @param prevState - Unused state placeholder
 * @param formData - The course/boarding form data (see {@link parseCourseFormData} for accepted fields)
 * @returns `{ success: true }` on successful creation
 * @returns `{ error: string }` if name is missing, unauthorized access, or DB failure
 * @sideEffect Revalidates /dashboard/services/* and matching backoffice paths
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

  const parsed = parseCourseFormData(formData);
  if ("error" in parsed) return parsed;
  const d = parsed.data;

  if (!d.name) {
    return { error: "Course name is required." };
  }

  try {
    await db.insert(courses).values({
      organizationId,
      serviceId: d.serviceId,
      name: d.name,
      certifiedTrainer: d.certifiedTrainer,
      certifierName: d.certifiedTrainer ? d.certifierName : null,
      trainerExperienceDescription: d.trainerExperienceDescription,
      veterinaryTraining: d.veterinaryTraining,
      veterinaryTrainingCertifier: d.veterinaryTraining ? d.veterinaryTrainingCertifier : null,
      veterinaryTrainingDetails: d.veterinaryTraining ? d.veterinaryTrainingDetails : null,
      dedicatedField: d.dedicatedField,
      trainingFieldDescription: d.dedicatedField ? d.trainingFieldDescription : null,
      trainingFieldAddress: d.dedicatedField ? d.trainingFieldAddress : null,
      trainingFieldGoogleBusinessProfile: d.dedicatedField ? d.trainingFieldGoogleBusinessProfile : null,
      trainingFieldGoogleMapsLink: d.dedicatedField ? d.trainingFieldGoogleMapsLink : null,
      parking: d.parking,
      parkingDescription: d.parking ? d.parkingDescription : null,
      details: d.details,
      termsOfParticipation: d.termsOfParticipation,
      price: d.price,
      priceType: d.priceType,
      medicationAdministration: d.medicationAdministration,
      medicationAdministrationDetails: d.medicationAdministration ? d.medicationAdministrationDetails : null,
      surveillance247: d.surveillance247,
      surveillance247Details: d.surveillance247 ? d.surveillance247Details : null,
      webCam: d.webCam,
      webCamDetails: d.webCam ? d.webCamDetails : null,
      dailyWalks: d.dailyWalks,
      ownerCommunication: d.ownerCommunication,
      ownerCommunicationDetails: d.ownerCommunication ? d.ownerCommunicationDetails : null,
      personalizedMealPlan: d.personalizedMealPlan,
      personalizedMealPlanDetails: d.personalizedMealPlan ? d.personalizedMealPlanDetails : null,
      checkin: d.checkin,
      checkout: d.checkout,
      checkinWeekend: d.checkinWeekend,
      checkoutWeekend: d.checkoutWeekend,
      schedule: d.schedule,
      ageLimitsEnabled: d.ageLimitsEnabled,
      ageLimits: d.ageLimitsEnabled ? d.ageLimits : null,
      coverageZones: d.coverageZones,
      faq: d.faq,
    });

    revalidateCourseServicePaths();
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
 * @param formData - The course/boarding form data (see {@link parseCourseFormData} for accepted fields).
 *   Also requires `formData.id` (the course ID to update).
 * @returns `{ success: true }` on successful update
 * @returns `{ error: string }` if name or id is missing, unauthorized access, or DB failure
 * @sideEffect Revalidates /dashboard/services/* and matching backoffice paths
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
  if (!courseId) {
    return { error: "Course ID is required." };
  }

  const parsed = parseCourseFormData(formData);
  if ("error" in parsed) return parsed;
  const d = parsed.data;

  if (!d.name) {
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
        name: d.name,
        serviceId: d.serviceId,
        certifiedTrainer: d.certifiedTrainer,
        certifierName: d.certifiedTrainer ? d.certifierName : null,
        trainerExperienceDescription: d.trainerExperienceDescription,
        veterinaryTraining: d.veterinaryTraining,
        veterinaryTrainingCertifier: d.veterinaryTraining ? d.veterinaryTrainingCertifier : null,
        veterinaryTrainingDetails: d.veterinaryTraining ? d.veterinaryTrainingDetails : null,
        dedicatedField: d.dedicatedField,
        trainingFieldDescription: d.dedicatedField ? d.trainingFieldDescription : null,
        trainingFieldAddress: d.dedicatedField ? d.trainingFieldAddress : null,
        trainingFieldGoogleBusinessProfile: d.dedicatedField ? d.trainingFieldGoogleBusinessProfile : null,
        trainingFieldGoogleMapsLink: d.dedicatedField ? d.trainingFieldGoogleMapsLink : null,
        parking: d.parking,
        parkingDescription: d.parking ? d.parkingDescription : null,
        details: d.details,
        termsOfParticipation: d.termsOfParticipation,
        price: d.price,
        priceType: d.priceType,
        medicationAdministration: d.medicationAdministration,
        medicationAdministrationDetails: d.medicationAdministration ? d.medicationAdministrationDetails : null,
        surveillance247: d.surveillance247,
        surveillance247Details: d.surveillance247 ? d.surveillance247Details : null,
        webCam: d.webCam,
        webCamDetails: d.webCam ? d.webCamDetails : null,
        dailyWalks: d.dailyWalks,
        ownerCommunication: d.ownerCommunication,
        ownerCommunicationDetails: d.ownerCommunication ? d.ownerCommunicationDetails : null,
        personalizedMealPlan: d.personalizedMealPlan,
        personalizedMealPlanDetails: d.personalizedMealPlan ? d.personalizedMealPlanDetails : null,
        checkin: d.checkin,
        checkout: d.checkout,
        checkinWeekend: d.checkinWeekend,
        checkoutWeekend: d.checkoutWeekend,
        schedule: d.schedule,
        ageLimitsEnabled: d.ageLimitsEnabled,
        ageLimits: d.ageLimitsEnabled ? d.ageLimits : null,
        coverageZones: d.coverageZones,
        faq: d.faq,
      })
      .where(eq(courses.id, courseId));

    revalidateCourseServicePaths();
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
    revalidatePath("/dashboard/services/dog-sitting");
    revalidatePath("/dashboard/services/dog-walking");
    revalidatePath("/dashboard/services/dog-grooming");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/dog-boarding/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/dog-sitting/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/dog-walking/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/dog-grooming/[...courseSlugAndId]", "page");
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
    revalidatePath("/dashboard/services/dog-sitting");
    revalidatePath("/dashboard/services/dog-walking");
    revalidatePath("/dashboard/services/dog-grooming");
    revalidatePath("/backoffice/organizations/services/dog-training/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/sport-dog-training/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/dog-boarding/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/dog-sitting/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/dog-walking/[...courseSlugAndId]", "page");
    revalidatePath("/backoffice/organizations/services/dog-grooming/[...courseSlugAndId]", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder organization courses:", error);
    return { error: "Failed to save courses order." };
  }
}
