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
  plantWatering?: boolean | null;
  plantWateringDetails?: string | null;
  nonSmoker?: boolean | null;
  spokenLanguages?: string | null;
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
  /** Comma-separated list of accepted dog weight kilograms from 1 to 50 (e.g. "1,2,3...50") */
  acceptedDogWeight?: string | null;
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
  /** Dog Grooming Service Location Mode: 'salon' (fixed salon), 'mobile_van' (mobile grooming van), or 'both' */
  groomingLocationType?: "salon" | "mobile_van" | "both" | string | null;
  /** Mobile Grooming Van: whether the unit operates autonomously on battery/generator/solar power */
  mobileVanAutonomousPower?: boolean | null;
  /** Mobile Grooming Van: whether the unit has an onboard fresh & grey water tank */
  mobileVanAutonomousWater?: boolean | null;
  /** Mobile Grooming Van: whether standard 220V power plug from client is required */
  mobileVanNeedsPowerPlug?: boolean | null;
  /** Mobile Grooming Van: whether garden tap/water hookup from client is required */
  mobileVanNeedsWaterHookup?: boolean | null;
  /** Mobile Grooming Van: minimum driveway / street parking space required for the van */
  mobileVanSpaceRequirement?: string | null;
  /** Mobile Grooming Van: travel fee notes or zone surcharge policies */
  mobileVanTravelFeePolicy?: string | null;
  /** Dog Grooming: rich text observations, health notices, and disclaimers */
  observationsAndDisclaimers?: string | null;
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
      const parsedObj = parsed as { primary?: unknown[]; secondary?: unknown[] };
      const primary = Array.isArray(parsedObj.primary)
        ? parsedObj.primary.map((s: unknown) => String(s).trim()).filter(Boolean)
        : [];
      const secondary: SecondaryCoverageZone[] = Array.isArray(parsedObj.secondary)
        ? (parsedObj.secondary
            .filter((item: unknown): item is { city: string; cartiere: unknown[] } => {
              return (
                typeof item === "object" &&
                item !== null &&
                "city" in item &&
                typeof (item as Record<string, unknown>).city === "string" &&
                "cartiere" in item &&
                Array.isArray((item as Record<string, unknown>).cartiere)
              );
            })
            .map((item) => ({
              city: item.city.trim(),
              cartiere: item.cartiere.map((c: unknown) => String(c).trim()).filter(Boolean),
            })))
        : [];
      return { primary, secondary };
    }
  } catch {
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

/**
 * Standard list of spoken languages supported for Dog Sitter and care services.
 */
export const SPOKEN_LANGUAGES_LIST = [
  "Romanian",
  "English",
  "Hungarian",
  "German",
  "French",
  "Italian",
  "Spanish",
  "Ukrainian",
] as const;

export type SpokenLanguage = typeof SPOKEN_LANGUAGES_LIST[number];

/**
 * Standard list of Dog Sport Disciplines.
 */
export const DOG_SPORT_DISCIPLINES = [
  "Agility",
  "IGP / Schutzhund",
  "Mondioring",
  "Ring",
  "Flyball",
  "Canine Frisbee / Disc Dog",
  "Dog dancing",
  "Hoopers",
  "Canicross / Bikejoring",
  "Mantrailing",
  "Search & rescue",
  "Rally Obedience",
  "Dock Diving",
] as const;

export type DogSportDiscipline = typeof DOG_SPORT_DISCIPLINES[number];

/**
 * Standard list of Dog Training Curriculum / Course Topic Presets.
 */
export const DOG_TRAINING_TOPICS = [
  "Puppy Socialization",
  "Basic Obedience",
  "Advanced Obedience",
  "Behavior Modification",
  "Truffle hunting",
  "Show handling",
  "Security & Protection",
] as const;

export type DogTrainingTopic = typeof DOG_TRAINING_TOPICS[number];

/**
 * Standard list of Dog Training Formats / Delivery Modes.
 */
export const DOG_TRAINING_FORMATS = [
  "Group Class",
  "Private 1-on-1 Session",
  "In-Home Training",
  "Board & Train",
  "Online Consultation",
] as const;

export type DogTrainingFormat = typeof DOG_TRAINING_FORMATS[number];

/**
 * Standard list of Dog Grooming weight values in kilograms (1 to 100 kg).
 */
export const DOG_GROOMING_WEIGHT_KG = Array.from({ length: 100 }, (_, i) => i + 1);

/**
 * Standard grouped weight breed presets for Dog Grooming.
 */
export const DOG_GROOMING_WEIGHT_TIERS = [
  { id: "mini", label: "Mini Breed", rangeLabel: "1 – 4 kg", start: 1, end: 4 },
  { id: "small", label: "Small Breed", rangeLabel: "4 – 10 kg", start: 4, end: 10 },
  { id: "medium", label: "Medium Breed", rangeLabel: "10 – 25 kg", start: 10, end: 25 },
  { id: "large", label: "Large Breed", rangeLabel: "25 – 45 kg", start: 25, end: 45 },
  { id: "giant", label: "Giant Breed", rangeLabel: "45 – 100+ kg", start: 45, end: 100 },
] as const;

export type DogGroomingWeightTier = typeof DOG_GROOMING_WEIGHT_TIERS[number];

/**
 * Formats an array of weight strings into a condensed string of ranges (e.g. "1–4 kg, 10–25 kg").
 */
export function formatWeightRanges(weights: string[]): string {
  if (!weights || weights.length === 0) return "None";
  if (weights.length >= 100) return "All weights (1–100+ kg)";
  const nums = weights
    .map(Number)
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);
  if (nums.length === 0) return "None";

  const ranges: string[] = [];
  let start = nums[0];
  let end = nums[0];

  const formatEndpoint = (val: number) => (val >= 100 ? "100+" : String(val));

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === end + 1) {
      end = nums[i];
    } else {
      ranges.push(start === end ? `${formatEndpoint(start)} kg` : `${start}–${formatEndpoint(end)} kg`);
      start = nums[i];
      end = nums[i];
    }
  }
  ranges.push(start === end ? `${formatEndpoint(start)} kg` : `${start}–${formatEndpoint(end)} kg`);
  return ranges.join(", ");
}
