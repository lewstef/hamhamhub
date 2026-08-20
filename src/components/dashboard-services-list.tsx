"use client";

import { useState, useTransition, useMemo } from "react";
import { toggleOrganizationServiceAction, toggleOrganizationCourseAction } from "@/app/actions/organizations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, X } from "lucide-react";
import { getSortedCourses } from "@/config/dog-training";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { normalizeSearchText } from "@/lib/utils";

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
 * search filtering, and navigation shortcuts to manage details.
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    const query = normalizeSearchText(searchQuery);
    if (!query) return services;

    return services.filter((s) => {
      const nameMatch = normalizeSearchText(s.name).includes(query);
      const descMatch = normalizeSearchText(s.description).includes(query);
      const subCourses = getSortedCourses(s.coursesOrder);
      const subMatch = subCourses.some(
        (sub) =>
          normalizeSearchText(sub.label).includes(query) ||
          normalizeSearchText(sub.key).includes(query)
      );
      return nameMatch || descMatch || subMatch;
    });
  }, [services, searchQuery]);

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
    <div className="space-y-4">
      {/* Search Bar */}
      {services.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search services by name, description, or course topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs rounded-xl border-input bg-background/80 focus-visible:bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 px-1">
            <span className="font-semibold text-foreground">
              {filteredServices.length}
            </span>
            <span>of</span>
            <span className="font-semibold text-foreground">
              {services.length}
            </span>
            <span>services</span>
          </div>
        </div>
      )}

      {filteredServices.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-xl text-muted-foreground bg-muted/5 space-y-3">
          <p className="text-sm">
            No services found matching &ldquo;<span className="font-semibold text-foreground">{searchQuery}</span>&rdquo;.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="h-8 px-3 text-xs rounded-xl cursor-pointer"
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          {filteredServices.map((s) => {
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
                    {isEnabled && (s.slug === "dog-training" || s.slug === "dog-grooming" || s.slug === "dog-boarding" || s.slug === "sport-dog-training" || s.slug === "dog-walking" || s.slug === "dog-sitter") && getSortedCourses(s.coursesOrder).length > 0 && (
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
                    <ToggleSwitch
                      checked={isEnabled}
                      onChange={() => handleToggle(s.id)}
                      disabled={isLoading}
                    />
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
                                <ToggleSwitch
                                  checked={isSubEnabled}
                                  onChange={() => handleToggleCourse(sub.id)}
                                  disabled={isSubLoading}
                                />
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
      )}
    </div>
  );
}
