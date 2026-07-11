/**
 * Canonical list of Dog Training sub-services.
 * This is the single source of truth used across:
 *  - ServicesTable (backoffice drag-and-drop ordering)
 *  - DashboardServicesList (dashboard service toggles)
 *  - EditOrganizationForm (organization services tab)
 *  - DogTrainingTabs (sub-service tab navigation)
 */
export const DOG_TRAINING_SUB_SERVICES = [] as const;

export type DogTrainingSubService = typeof DOG_TRAINING_SUB_SERVICES[number];

export const SUB_SERVICE_KEY_TO_DB_ID: Record<string, string> = {};

export function getSortedSubServices(subServicesOrderString?: string | null) {
  return [];
}
