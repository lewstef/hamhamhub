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
  /** Age Limits & Restrictions toggle */
  ageLimitsEnabled?: boolean | null;
  /** Comma-separated list of accepted dog age groups (e.g. "Puppy (2-6 mos),Adult (1-7 yrs)") */
  ageLimits?: string | null;
  /** Accepted Dog Sizes toggle */
  acceptedDogSizesEnabled?: boolean | null;
  /** Comma-separated list of accepted dog sizes (e.g. "Small,Medium,Large,Giant") */
  acceptedDogSizes?: string | null;
  /** Training Format / Session Type preset (e.g. "Group Class", "Private 1-on-1 Session", "In-Home Training", "Board & Train", "Online Consultation") */
  trainingFormat?: string | null;
  /** Maximum number of dogs allowed in a group training session */
  maxDogsPerGroup?: number | null;
  /** Whether the facility includes an indoor / covered weatherproof training hall */
  indoorFacility?: boolean | null;
  /** Rich text description of indoor facility features, size, climate control, and flooring */
  indoorFacilityDescription?: string | null;
  /** Fenced Outdoor Play Yard toggle for Dog Boarding */
  playYard?: boolean | null;
  /** Rich text description of play yard amenities, security fencing, and agility features */
  playYardDetails?: string | null;
  /** Dog Swimming Pool & Splash Area toggle for Dog Boarding */
  pool?: boolean | null;
  /** Rich text description of pool entry, water quality, and life jacket safety */
  poolDetails?: string | null;
  /** Socialization & Group Play Policy for Dog Boarding */
  socializationPolicy?: string | null;
  /** Primary & Secondary coverage zones serialized JSON */
  coverageZones?: string | null;
  /** FAQs serialized JSON */
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
