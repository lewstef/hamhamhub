import type { Course, SecondaryCoverageZone, CoverageZonesData } from "@/types/course";

export interface CoursePricingItem {
  amount: string;
  type: string;
  label?: string;
}

export interface ClosedPeriodItem {
  title: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface SpecialOpeningItem {
  title: string;
  startDate: string;
  endDate: string;
  checkin?: string;
  checkout?: string;
  note?: string;
}

export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface DayScheduleItem {
  day: DayKey;
  label: string;
  enabled: boolean;
  checkin: string;
  checkout: string;
  note?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CourseFormProps {
  organizationId: string;
  serviceId: string;
  itemNoun: string;
  initialCourse?: Course;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  serviceSlug?: string;
  orgCity?: string;
}
