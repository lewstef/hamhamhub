/**
 * Canonical list of Dog Training sub-services.
 * This is the single source of truth used across:
 *  - ServicesTable (backoffice drag-and-drop ordering)
 *  - DashboardServicesList (dashboard service toggles)
 *  - EditOrganizationForm (organization services tab)
 *  - DogTrainingTabs (sub-service tab navigation)
 */
export const DOG_TRAINING_SUB_SERVICES = [
  { id: "dog-training:basic", label: "Basic Training and Obedience", key: "basic-training-and-obedience" },
  { id: "dog-training:group", label: "Group Basic Obedience Training", key: "group-basic-obedience-training" },
  { id: "dog-training:private", label: "Private training", key: "private-training" },
  { id: "dog-training:sar", label: "Search & Rescue Training", key: "search-and-rescue-training" },
  { id: "dog-training:show", label: "Show Training and Handling", key: "show-training-and-handling" },
] as const;

export type DogTrainingSubService = typeof DOG_TRAINING_SUB_SERVICES[number];

/**
 * Maps sub-service URL key (used in DogTrainingTabs) back to the
 * canonical DB id (used in enabledSubServices and ordering strings).
 */
export const SUB_SERVICE_KEY_TO_DB_ID: Record<string, string> = Object.fromEntries(
  DOG_TRAINING_SUB_SERVICES.map(({ key, id }) => [key, id])
);

/**
 * Returns a copy of DOG_TRAINING_SUB_SERVICES sorted according to
 * the comma-separated ordering string stored in the database.
 */
export function getSortedSubServices(subServicesOrderString?: string | null) {
  const list = [...DOG_TRAINING_SUB_SERVICES];
  if (!subServicesOrderString) return list;
  const orderIds = subServicesOrderString.split(",").map((s) => s.trim()).filter(Boolean);
  return list.sort((a, b) => {
    const idxA = orderIds.indexOf(a.id);
    const idxB = orderIds.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
}
