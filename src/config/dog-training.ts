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

export const COURSE_KEY_TO_DB_ID: Record<string, string> = {};

export function getSortedCourses(coursesOrderString?: string | null) {
  return [];
}
