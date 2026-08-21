"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ChevronDown, Settings } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { getSortedCourses } from "@/config/dog-training";
import { Organization, Service } from "./types";

interface OrgServicesTabProps {
  organization: Organization;
  servicesList: Service[];
  isDashboard: boolean;
  enabledServiceIds: string[];
  enabledCourseIds: string[];
  expandedIds: string[];
  togglingServiceId: string | null;
  togglingCourseId: string | null;
  isPending: boolean;
  onToggleService: (serviceId: string) => void;
  onToggleCourse: (courseId: string) => void;
  onToggleExpand: (serviceId: string) => void;
}

export function OrgServicesTab({
  organization,
  servicesList,
  isDashboard,
  enabledServiceIds,
  enabledCourseIds,
  expandedIds,
  togglingServiceId,
  togglingCourseId,
  isPending,
  onToggleService,
  onToggleCourse,
  onToggleExpand,
}: OrgServicesTabProps) {
  const router = useRouter();

  return (
    <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
      <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Settings className="size-5" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Services Configuration</CardTitle>
      </div>
      <CardContent className="p-0">
        <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
          Enable or disable services offered by this organization.
        </div>
        {servicesList.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No active services associated with this organization&apos;s category.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {servicesList.map((s) => {
              const isEnabled = enabledServiceIds.includes(s.id);
              const isLoading = togglingServiceId === s.id && isPending;

              return (
                <div key={s.id} className="flex flex-col">
                  <div className="flex items-center justify-between p-6 hover:bg-muted dark:hover:bg-muted/70 transition-colors">
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
                        {s.description || "No description provided."}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {isEnabled && s.slug === "dog-training" && getSortedCourses(s.coursesOrder).length > 0 && (
                        <button
                          type="button"
                          onClick={() => onToggleExpand(s.id)}
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
                          type="button"
                          onClick={() => {
                            if (s.slug === "dog-training") {
                              if (isDashboard) {
                                router.push(`/dashboard/services/dog-training`);
                              } else {
                                router.push(`/backoffice/organizations/services/${s.slug}/${organization.id}`);
                              }
                            } else {
                              router.push(`/backoffice/organizations/services/${s.slug}/${organization.id}`);
                            }
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      <ToggleSwitch
                        checked={isEnabled}
                        onChange={() => onToggleService(s.id)}
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
                              <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-muted dark:hover:bg-muted/70 transition-colors">
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
                                      onClick={() => router.push(`/backoffice/organizations/services/dog-training/${sub.key}/${organization.id}`)}
                                    >
                                      Edit
                                    </Button>
                                  )}
                                  <ToggleSwitch
                                    checked={isSubEnabled}
                                    onChange={() => onToggleCourse(sub.id)}
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
      </CardContent>
    </Card>
  );
}
