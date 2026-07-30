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
  webCam?: boolean | null;
  webCamDetails?: string | null;
  dailyWalks?: number | null;
  ownerCommunication?: boolean | null;
  ownerCommunicationDetails?: string | null;
  personalizedMealPlan?: boolean | null;
  personalizedMealPlanDetails?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  checkinWeekend?: string | null;
  checkoutWeekend?: string | null;
  schedule?: string | null;
  ageLimitsEnabled?: boolean | null;
  ageLimits?: string | null;
  faq?: string | null;
}
