import { z } from "zod";

export const coursePricingSchema = z.object({
  id: z.string().optional(),
  billingFrequency: z.string().min(1, "Billing frequency is required"),
  walkFormat: z.string().optional(),
  packageSessions: z.number().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  sessionDuration: z.string().optional(),
});

export const courseScheduleItemSchema = z.object({
  day: z.string(),
  label: z.string(),
  enabled: z.boolean(),
  checkin: z.string().optional(),
  checkout: z.string().optional(),
  note: z.string().optional(),
});

export const closedPeriodSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
});

export const specialOpeningSchema = z.object({
  date: z.string(),
  checkin: z.string(),
  checkout: z.string(),
  note: z.string().optional(),
});

export const faqItemSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  answer: z.string().min(1, "Answer cannot be empty"),
});

export const courseSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().min(1, "Organization ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  name: z.string().min(1, "Course name is required"),
  details: z.string().optional(),
  certifiedTrainerOnly: z.boolean().optional(),
  minAgeMonths: z.number().nullable().optional(),
  maxAgeMonths: z.number().nullable().optional(),
  pricingTiers: z.array(coursePricingSchema).optional(),
  weeklySchedule: z.array(courseScheduleItemSchema).optional(),
  closedPeriods: z.array(closedPeriodSchema).optional(),
  specialOpenings: z.array(specialOpeningSchema).optional(),
  careAmenities: z.record(z.string(), z.boolean()).optional(),
  primaryCoverageZones: z.array(z.string()).optional(),
  secondaryCoverageZones: z.array(z.string()).optional(),
  hasDedicatedField: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  faqs: z.array(faqItemSchema).optional(),
});

export type CourseInput = z.infer<typeof courseSchema>;
