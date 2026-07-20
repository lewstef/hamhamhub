"use client";

import { useState, useTransition } from "react";
import { toggleOrganizationServiceAction, toggleOrganizationCourseAction } from "@/app/actions/organizations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { getSortedCourses } from "@/config/dog-training";

interface Service {
  id: string;
  name: string;
  description: string;
  slug: string;
  coursesOrder?: string | null;
}

/**
 * Props for the DashboardServicesList component.
 * @interface DashboardServicesListProps
 * @property {string} organizationId - The active organization's database ID.
 * @property {Service[]} services - List of master directory services available.
 * @property {string[]} initialEnabledIds - List of database IDs of services currently enabled for the organization.
 * @property {string[]} [initialEnabledCourseIds] - List of database IDs of courses currently active for the organization.
 */
interface DashboardServicesListProps {
  organizationId: string;
  services: Service[];
  initialEnabledIds: string[];
  initialEnabledCourseIds?: string[];
}

/**
 * DashboardServicesList Component
 *
 * Renders the business owner dashboard overview for active services and courses.
 * Supports optimistic toggle actions for services and individual courses, accordion collapse toggles,
 * and navigation shortcuts to manage details.
 *
 * @param {DashboardServicesListProps} props - The component props.
 * @returns {React.ReactElement} The dashboard services list component.
 */
export function DashboardServicesList({
  organizationId,
  services,
  initialEnabledIds,
  initialEnabledCourseIds = [],
}: DashboardServicesListProps) {
  const router = useRouter();

  const [enabledIds, setEnabledIds] = useState<string[]>(initialEnabledIds);
  const [enabledCourseIds, setEnabledCourseIds] = useState<string[]>(initialEnabledCourseIds);
  const [expandedIds, setExpandedIds] = useState<string[]>(initialEnabledIds);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null);

  const handleToggle = (serviceId: string) => {
    const isCurrentlyEnabled = enabledIds.includes(serviceId);
    setTogglingId(serviceId);

    // Optimistically update the state
    const nextIds = isCurrentlyEnabled
      ? enabledIds.filter((id) => id !== serviceId)
      : [...enabledIds, serviceId];
    setEnabledIds(nextIds);

    if (!isCurrentlyEnabled) {
      setExpandedIds((prev) => [...prev, serviceId]);
    }

    startTransition(async () => {
      const res = await toggleOrganizationServiceAction(organizationId, serviceId, !isCurrentlyEnabled);
      if (res?.success) {
        router.refresh();
      } else {
        // Rollback state on error
        setEnabledIds(enabledIds);
      }
      setTogglingId(null);
    });
  };

  const toggleExpand = (serviceId: string) => {
    setExpandedIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleToggleCourse = (courseId: string) => {
    const isCurrentlyEnabled = enabledCourseIds.includes(courseId);
    setTogglingCourseId(courseId);

    const nextIds = isCurrentlyEnabled
      ? enabledCourseIds.filter((id) => id !== courseId)
      : [...enabledCourseIds, courseId];
    setEnabledCourseIds(nextIds);

    startTransition(async () => {
      const res = await toggleOrganizationCourseAction(organizationId, courseId, !isCurrentlyEnabled);
      if (res?.success) {
        router.refresh();
      } else {
        setEnabledCourseIds(enabledCourseIds);
      }
      setTogglingCourseId(null);
    });
  };

  if (services.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-border rounded-xl text-muted-foreground bg-muted/5">
        No operational services match your organization category.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      {services.map((s) => {
        const isEnabled = enabledIds.includes(s.id);
        const isLoading = togglingId === s.id && isPending;

        return (
          <div key={s.id} className="flex flex-col">
            <div className="flex items-center justify-between p-5 hover:bg-muted/10 transition-colors">
              <div className="flex flex-col gap-1.5 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{s.name}</span>
                  {isEnabled && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      Active
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {s.description}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {isEnabled && s.slug === "dog-training" && getSortedCourses(s.coursesOrder).length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(s.id)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title={expandedIds.includes(s.id) ? "Collapse courses" : "Expand courses"}
                  >
                    <ChevronDown
                      className={`size-4.5 transition-transform duration-200 ${
                        expandedIds.includes(s.id) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
                {isEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/services/${s.slug}`)}
                  >
                    Edit
                  </Button>
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  disabled={isLoading}
                  onClick={() => handleToggle(s.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEnabled ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Nested Courses Accordion (for Dog training) */}
            {isEnabled && s.slug === "dog-training" && getSortedCourses(s.coursesOrder).length > 0 && (
              <div
                className={`grid transition-all duration-200 ease-in-out border-t border-border/30 bg-muted/5 ${
                  expandedIds.includes(s.id)
                    ? "grid-rows-[1fr] opacity-100 py-5 pl-12 pr-6"
                    : "grid-rows-[0fr] opacity-0 py-0 pl-12 pr-6 overflow-hidden"
                }`}
              >
                <div className="overflow-hidden space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Courses Configured
                  </div>
                  <div className="divide-y divide-border/20 border border-border/40 rounded-lg bg-card overflow-hidden">
                    {getSortedCourses(s.coursesOrder).map((sub) => {
                      const isSubEnabled = enabledCourseIds.includes(sub.id);
                      const isSubLoading = togglingCourseId === sub.id && isPending;

                      return (
                        <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                          <span className="text-sm font-semibold text-foreground/90">
                            {sub.label}
                          </span>

                          <div className="flex items-center gap-4">
                            {isSubEnabled && (
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                className="h-8 px-3"
                                onClick={() => router.push(`/dashboard/services/dog-training/${sub.key}`)}
                              >
                                Edit
                              </Button>
                            )}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isSubEnabled}
                              disabled={isSubLoading}
                              onClick={() => handleToggleCourse(sub.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                                isSubEnabled ? "bg-primary" : "bg-muted-foreground/30"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                                  isSubEnabled ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
