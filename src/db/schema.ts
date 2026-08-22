import { pgTable, text, timestamp, uuid, integer, boolean, primaryKey } from "drizzle-orm/pg-core";

export const organizationCategories = pgTable("organization_categories", {
  id: text("id").primaryKey(), // Sluggified name, e.g. "ngo", "dog_kennel"
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique(), // nullable for employee/admin logins
  username: text("username").unique(), // nullable for user logins
  password: text("password").notNull(), // hashed
  role: text("role").$type<"user" | "employee" | "admin" | "organization">().default("user").notNull(),
  theme: text("theme").$type<"light" | "dark">().default("light").notNull(),
  organizationCategory: text("organization_category").references(() => organizationCategories.id, { onDelete: "set null" }),
  address: text("address"),
  phoneNumber: text("phone_number"),
  recoveryEmail: text("recovery_email"),
  addressCountry: text("address_country"),
  addressState: text("address_state"),
  addressCity: text("address_city"),
  addressLine: text("address_line"),
  addressZip: text("address_zip"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  linkedin: text("linkedin"),
  youtube: text("youtube"),
  website: text("website"),
  googleBusinessProfile: text("google_business_profile"),
  billingCompanyName: text("billing_company_name"),
  billingTaxId: text("billing_tax_id"),
  billingTradeRegistryNumber: text("billing_trade_registry_number"),
  billingEuid: text("billing_euid"),
  billingBankAccountNumber: text("billing_bank_account_number"),
  billingBankName: text("billing_bank_name"),
  billingContactName: text("billing_contact_name"),
  billingContactPhone: text("billing_contact_phone"),
  billingContactEmail: text("billing_contact_email"),
  billingSecondaryContactName: text("billing_secondary_contact_name"),
  billingSecondaryContactPhone: text("billing_secondary_contact_phone"),
  billingSecondaryContactEmail: text("billing_secondary_contact_email"),
  description: text("description"),
  verificationStatus: text("verification_status").$type<"unverified" | "pending" | "verified">().default("unverified").notNull(),
  verificationRequestedAt: timestamp("verification_requested_at"),
  verificationNotes: text("verification_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  organizationCategory: text("organization_category").notNull().references(() => organizationCategories.id, { onDelete: "restrict" }),
  sortOrder: integer("sort_order").default(0).notNull(),
  coursesOrder: text("courses_order"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceTypes = pgTable("service_types", {
  id: text("id").primaryKey(), // e.g., "dog_training"
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  certifiedTrainer: boolean("certified_trainer").default(false).notNull(),
  certifierName: text("certifier_name"),
  trainerExperienceDescription: text("trainer_experience_description"),
  veterinaryTraining: boolean("veterinary_training").default(false).notNull(),
  veterinaryTrainingCertifier: text("veterinary_training_certifier"),
  veterinaryTrainingDetails: text("veterinary_training_details"),
  dedicatedField: boolean("dedicated_field").default(false).notNull(),
  trainingFieldDescription: text("training_field_description"),
  trainingFieldAddress: text("training_field_address"),
  trainingFieldGoogleBusinessProfile: text("training_field_google_business_profile"),
  trainingFieldGoogleMapsLink: text("training_field_google_maps_link"),
  parking: boolean("parking").default(false).notNull(),
  parkingDescription: text("parking_description"),
  details: text("details"),
  termsOfParticipation: text("terms_of_participation"),
  price: text("price"),
  priceType: text("price_type").default("course").notNull(),
  medicationAdministration: boolean("medication_administration").default(false).notNull(),
  medicationAdministrationDetails: text("medication_administration_details"),
  surveillance247: boolean("surveillance_247").default(false).notNull(),
  surveillance247Details: text("surveillance_247_details"),
  webCam: boolean("web_cam").default(false).notNull(),
  webCamDetails: text("web_cam_details"),
  dailyWalks: integer("daily_walks"),
  ownerCommunication: boolean("owner_communication").default(false).notNull(),
  ownerCommunicationDetails: text("owner_communication_details"),
  personalizedMealPlan: boolean("personalized_meal_plan").default(false).notNull(),
  personalizedMealPlanDetails: text("personalized_meal_plan_details"),
  emergencyVetTransport: boolean("emergency_vet_transport").default(false).notNull(),
  emergencyVetTransportDetails: text("emergency_vet_transport_details"),
  plantWatering: boolean("plant_watering").default(false).notNull(),
  plantWateringDetails: text("plant_watering_details"),
  nonSmoker: boolean("non_smoker").default(false).notNull(),
  spokenLanguages: text("spoken_languages"),
  maxPetsPerVisit: integer("max_pets_per_visit"),
  additionalPetPolicy: text("additional_pet_policy"),
  checkin: text("checkin"),
  checkout: text("checkout"),
  checkinWeekend: text("checkin_weekend"),
  checkoutWeekend: text("checkout_weekend"),
  schedule: text("schedule"),
  ageLimitsEnabled: boolean("age_limits_enabled").default(false).notNull(),
  ageLimits: text("age_limits"),
  acceptedDogSizesEnabled: boolean("accepted_dog_sizes_enabled").default(false).notNull(),
  acceptedDogSizes: text("accepted_dog_sizes"),
  acceptedDogWeight: text("accepted_dog_weight"),
  trainingFormat: text("training_format"),
  maxDogsPerGroup: integer("max_dogs_per_group"),
  indoorFacility: boolean("indoor_facility").default(false).notNull(),
  indoorFacilityDescription: text("indoor_facility_description"),
  playYard: boolean("play_yard").default(false).notNull(),
  playYardDetails: text("play_yard_details"),
  pool: boolean("pool").default(false).notNull(),
  poolDetails: text("pool_details"),
  socializationPolicy: text("socialization_policy"),
  coverageZones: text("coverage_zones"),
  groomingLocationType: text("grooming_location_type"),
  mobileVanAutonomousPower: boolean("mobile_van_autonomous_power").default(false).notNull(),
  mobileVanAutonomousWater: boolean("mobile_van_autonomous_water").default(false).notNull(),
  mobileVanNeedsPowerPlug: boolean("mobile_van_needs_power_plug").default(false).notNull(),
  mobileVanNeedsWaterHookup: boolean("mobile_van_needs_water_hookup").default(false).notNull(),
  mobileVanSpaceRequirement: text("mobile_van_space_requirement"),
  mobileVanTravelFeePolicy: text("mobile_van_travel_fee_policy"),
  observationsAndDisclaimers: text("observations_and_disclaimers"),
  faq: text("faq"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const organizationEnabledServices = pgTable(
  "organization_enabled_services",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.organizationId, table.serviceId] }),
  ]
);

export const organizationEnabledCourses = pgTable(
  "organization_enabled_courses",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.organizationId, table.courseId] }),
  ]
);

