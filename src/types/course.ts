/**
 * Course — shared data shape for a sub-service item (Training Course, Dog Sport entry,
 * Boarding option, or Grooming service). This type is consumed by both the
 * {@link CourseForm} component and the {@link DashboardServiceDetail} read-only view.
 */
export interface Course {
  id?: string;
  name: string;
  certifiedTrainer: boolean;
  certifierName?: string | null;
  trainerExperienceDescription?: string | null;
  veterinaryTraining?: boolean | null;
  veterinaryTrainingCertifier?: string | null;
  veterinaryTrainingDetails?: string | null;
  dedicatedField: boolean;
  trainingFieldDescription?: string | null;
  trainingFieldAddress?: string | null;
  trainingFieldGoogleBusinessProfile?: string | null;
  trainingFieldGoogleMapsLink?: string | null;
  parking: boolean;
  parkingDescription?: string | null;
  details?: string | null;
  termsOfParticipation?: string | null;
  price?: string | null;
  priceType?: string | null;
  medicationAdministration?: boolean | null;
  medicationAdministrationDetails?: string | null;
  surveillance247?: boolean | null;
  surveillance247Details?: string | null;
  webCam?: boolean | null;
  webCamDetails?: string | null;
  dailyWalks?: number | null;
  ownerCommunication?: boolean | null;
  ownerCommunicationDetails?: string | null;
  personalizedMealPlan?: boolean | null;
  personalizedMealPlanDetails?: string | null;
  emergencyVetTransport?: boolean | null;
  emergencyVetTransportDetails?: string | null;
  maxPetsPerVisit?: number | null;
  additionalPetPolicy?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  checkinWeekend?: string | null;
  checkoutWeekend?: string | null;
  schedule?: string | null;
  ageLimitsEnabled?: boolean | null;
  ageLimits?: string | null;
  acceptedDogSizes?: string | null;
  trainingFormat?: string | null;
  maxDogsPerGroup?: number | null;
  indoorFacility?: boolean | null;
  indoorFacilityDescription?: string | null;
  playYard?: boolean | null;
  playYardDetails?: string | null;
  pool?: boolean | null;
  poolDetails?: string | null;
  socializationPolicy?: string | null;
  coverageZones?: string | null;
  faq?: string | null;
}

/**
 * SecondaryCoverageZone — defines neighborhood coverage for an additional secondary city.
 */
export interface SecondaryCoverageZone {
  city: string;
  cartiere: string[];
}

/**
 * CoverageZonesData — structured representation of primary and secondary city neighborhood coverage.
 */
export interface CoverageZonesData {
  primary: string[];
  secondary: SecondaryCoverageZone[];
}

/**
 * Parses raw coverageZones string (JSON array, JSON object, or comma-separated list) into CoverageZonesData.
 */
export function parseCoverageZones(raw?: string | null): CoverageZonesData {
  if (!raw) {
    return { primary: [], secondary: [] };
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { primary: parsed.map((s) => String(s).trim()).filter(Boolean), secondary: [] };
    }
    if (parsed && typeof parsed === "object") {
      const primary = Array.isArray(parsed.primary)
        ? parsed.primary.map((s: any) => String(s).trim()).filter(Boolean)
        : [];
      const secondary: SecondaryCoverageZone[] = Array.isArray(parsed.secondary)
        ? parsed.secondary
            .filter((item: any) => item && typeof item.city === "string" && Array.isArray(item.cartiere))
            .map((item: any) => ({
              city: item.city.trim(),
              cartiere: item.cartiere.map((c: any) => String(c).trim()).filter(Boolean),
            }))
        : [];
      return { primary, secondary };
    }
  } catch (e) {
    if (typeof raw === "string") {
      const primary = raw.split(",").map((s) => s.trim()).filter(Boolean);
      return { primary, secondary: [] };
    }
  }
  return { primary: [], secondary: [] };
}

/**
 * Serializes CoverageZonesData into a JSON string for database persistence.
 */
export function serializeCoverageZones(data: CoverageZonesData): string {
  return JSON.stringify(data);
}
