"use client";

import { useState, useTransition } from "react";
import { toggleOrganizationServiceAction } from "@/app/actions/organizations";
import { deleteCourseAction } from "@/app/actions/courses";
import { CourseForm } from "@/components/course-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Plus, Edit2, Trash2, Award, MapPin, Car, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Course {
  id?: string;
  name: string;
  certifiedTrainer: boolean;
  certifierName?: string | null;
  dedicatedField: boolean;
  trainingFieldDescription?: string | null;
  parking: boolean;
  parkingDescription?: string | null;
  details?: string | null;
  termsOfParticipation?: string | null;
  price?: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string;
  coursesOrder?: string | null;
}

interface DashboardServiceDetailProps {
  organizationId: string;
  service: Service;
  initialIsEnabled: boolean;
  slug: string;
  activeCourseTab?: string;
  enabledCourseIds?: string[];
  courses?: Course[];
}

export function DashboardServiceDetail({
  organizationId,
  service,
  initialIsEnabled,
  slug,
  activeCourseTab,
  enabledCourseIds,
  courses = [],
}: DashboardServiceDetailProps) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [isPending, startTransition] = useTransition();

  // Course states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const isDogTraining = service.name.toLowerCase() === "dog training";

  const handleToggle = () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);

    startTransition(async () => {
      const res = await toggleOrganizationServiceAction(organizationId, service.id, nextState);
      if (res?.success) {
        router.refresh();
      } else {
        setIsEnabled(isEnabled); // Rollback
      }
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    setIsDeletingId(courseId);
    startTransition(async () => {
      const res = await deleteCourseAction(courseId);
      if (res?.success) {
        router.refresh();
      } else {
        alert(res?.error || "Failed to delete course.");
      }
      setIsDeletingId(null);
    });
  };

  if (isDogTraining && isFormOpen) {
    return (
      <div className="space-y-6 w-full">
        <CourseForm
          initialCourse={editingCourse}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingCourse(undefined);
          }}
          onSubmitSuccess={() => {
            setIsFormOpen(false);
            setEditingCourse(undefined);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Services
        </Link>

        {isDogTraining && (
          <Button
            onClick={() => {
              setEditingCourse(undefined);
              setIsFormOpen(true);
            }}
            className="font-bold shadow-md shadow-primary/10"
          >
            <Plus className="size-4 mr-2" />
            Add Course
          </Button>
        )}
      </div>

      {/* Main Details Card */}
      <Card className="border border-border bg-card shadow-lg relative overflow-hidden">
        {/* Glow decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                {service.name}
              </CardTitle>
              {!isDogTraining && (
                <CardDescription className="text-sm">
                  Service Template Identifier: {service.id}
                </CardDescription>
              )}
            </div>
            
            {/* Status Badge */}
            <div>
              {isEnabled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                  <XCircle className="size-3.5" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Toggle Control Area (Hidden for Dog Training since it lists custom courses) */}
          {!isDogTraining && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border bg-muted/20 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-foreground">
                  Service Status
                </span>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Toggle to enable or disable this service. Enabled services will automatically populate the sidebar navigation menu.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                disabled={isPending}
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${
                  isEnabled ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Dog Training Dynamic Courses Listing */}
          {isDogTraining && (
            <div className="space-y-4">
              {courses.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-border rounded-2xl text-muted-foreground bg-muted/5">
                  No courses created yet. Click "Add Course" above to add your first course.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between gap-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 max-w-[70%]">
                          <h4 className="text-lg font-bold text-foreground tracking-tight">
                            {course.name}
                          </h4>

                          {/* Quick details badges */}
                          <div className="flex flex-wrap gap-2">
                            {course.certifiedTrainer && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                <Award className="size-3" />
                                Trainer Certified: {course.certifierName}
                              </span>
                            )}
                            {course.dedicatedField && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                                <MapPin className="size-3" />
                                Dedicated Field
                              </span>
                            )}
                            {course.parking && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <Car className="size-3" />
                                Parking Available
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price Badge */}
                        <div className="text-right">
                          <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-sm font-extrabold bg-primary/10 text-primary border border-primary/20">
                            {course.price || "Free"}
                          </span>
                        </div>
                      </div>

                      {/* Course Details sections */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-relaxed text-muted-foreground/90 border-t border-border/60 pt-5">
                        <div className="space-y-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                            Course Details
                          </span>
                          <div
                            className="text-xs prose prose-sm dark:prose-invert max-w-none text-muted-foreground/95"
                            dangerouslySetInnerHTML={{ __html: course.details || "No details provided." }}
                          />
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                            Terms & Requirements
                          </span>
                          <div
                            className="text-xs prose prose-sm dark:prose-invert max-w-none text-muted-foreground/95"
                            dangerouslySetInnerHTML={{ __html: course.termsOfParticipation || "No terms specified." }}
                          />
                        </div>
                      </div>

                      {/* Facility details expansion (rendered dynamically if available) */}
                      {(course.dedicatedField || course.parking) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-relaxed text-muted-foreground/90 border-t border-border/40 pt-4 bg-muted/5 p-4 rounded-xl">
                          {course.dedicatedField && course.trainingFieldDescription && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-sky-500 flex items-center gap-1">
                                <MapPin className="size-3" />
                                Field details:
                              </span>
                              <div
                                className="text-xs prose prose-sm dark:prose-invert text-muted-foreground/90"
                                dangerouslySetInnerHTML={{ __html: course.trainingFieldDescription }}
                              />
                            </div>
                          )}

                          {course.parking && course.parkingDescription && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                                <Car className="size-3" />
                                Parking details:
                              </span>
                              <div
                                className="text-xs prose prose-sm dark:prose-invert text-muted-foreground/90"
                                dangerouslySetInnerHTML={{ __html: course.parkingDescription }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 justify-end border-t border-border/60 pt-4 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCourse(course);
                            setIsFormOpen(true);
                          }}
                          className="h-8.5 font-bold text-xs"
                          disabled={isDeletingId === course.id}
                        >
                          <Edit2 className="size-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => course.id && handleDeleteCourse(course.id)}
                          className="h-8.5 font-bold text-xs shadow-md shadow-destructive/10"
                          disabled={isDeletingId === course.id}
                        >
                          <Trash2 className="size-3.5 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

