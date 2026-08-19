/**
 * Canonical list of Dog Training courses.
 * This is the single source of truth used across:
 *  - ServicesTable (backoffice drag-and-drop ordering)
 *  - DashboardServicesList (dashboard service toggles)
 *  - EditOrganizationForm (organization services tab)
 *  - DogTrainingTabs (course tab navigation)
 */
export const DOG_TRAINING_COURSES = [] as const;

export type DogTrainingCourse = typeof DOG_TRAINING_COURSES[number];

export interface SortedCourse {
  id: string;
  key?: string;
  label: string;
  description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSortedCourses(_coursesOrderString?: string | null): SortedCourse[] {
  return [];
}
