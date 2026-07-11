"use client";

import { useState, useTransition, useEffect } from "react";
import { toggleOrganizationServiceAction } from "@/app/actions/organizations";
import { deleteCourseAction, reorderOrgCoursesAction } from "@/app/actions/courses";
import { CourseForm } from "@/components/course-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Plus, Edit2, Trash2, Award, MapPin, Car, X, GripVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Course {
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
  backHref?: string;
  backLabel?: string;
}

export function DashboardServiceDetail({
  organizationId,
  service,
  initialIsEnabled,
  slug,
  activeCourseTab,
  enabledCourseIds,
  courses = [],
  backHref = "/dashboard/services",
  backLabel = "Back to Services",
}: DashboardServiceDetailProps) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [isPending, startTransition] = useTransition();

  // Course states
  const [localCourses, setLocalCourses] = useState<Course[]>(courses);
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sync localCourses with courses prop
  useEffect(() => {
    setLocalCourses(courses);
  }, [courses]);

  const isDogTraining = service.name.toLowerCase() === "dog training";
  const isSportDogTraining = service.name.toLowerCase() === "dog sports training";
  const isDynamicCourses = isDogTraining || isSportDogTraining;
  const itemNoun = isSportDogTraining ? "Dog Sport" : "Course";

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
    setDeleteTargetId(courseId);
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    setIsDeletingId(deleteTargetId);
    startTransition(async () => {
      const res = await deleteCourseAction(deleteTargetId);
      if (res?.success) {
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
        router.refresh();
      } else {
        setDeleteError(res?.error || "Failed to delete course.");
      }
      setIsDeletingId(null);
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCourseId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedCourseId || draggedCourseId === targetId) return;

    const draggedIndex = localCourses.findIndex((item) => item.id === draggedCourseId);
    const targetIndex = localCourses.findIndex((item) => item.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const updatedList = [...localCourses];
    const [draggedItem] = updatedList.splice(draggedIndex, 1);
    updatedList.splice(targetIndex, 0, draggedItem);

    setLocalCourses(updatedList);
  };

  const handleDragEnd = async () => {
    setDraggedCourseId(null);
    const orderedIds = localCourses.map((item) => item.id).filter((id): id is string => !!id);
    await reorderOrgCoursesAction(orderedIds);
  };

  if (isDynamicCourses && isFormOpen) {
    return (
      <div className="space-y-6 w-full">
        <CourseForm
          organizationId={organizationId}
          serviceId={service.id}
          itemNoun={itemNoun}
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
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          {backLabel}
        </Link>

        {isDynamicCourses && (
          <Button
            onClick={() => {
              setEditingCourse(undefined);
              setIsFormOpen(true);
            }}
            className="font-bold shadow-md shadow-primary/10"
          >
            <Plus className="size-4 mr-2" />
            Add {itemNoun}
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
              {!isDynamicCourses && (
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
          {/* Toggle Control Area (Hidden for dynamic course services since they list custom items) */}
          {!isDynamicCourses && (
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
          {isDynamicCourses && (
            <div className="space-y-2">
              {localCourses.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-border rounded-2xl text-muted-foreground bg-muted/5">
                  No {itemNoun.toLowerCase()}s created yet. Click "Add {itemNoun}" above to add your first {itemNoun.toLowerCase()}.
                </div>
              ) : (
                <div className="divide-y divide-border/60 rounded-2xl border border-border overflow-hidden">
                  {localCourses.map((course) => {
                    const isCourseDragged = draggedCourseId === course.id;
                    return (
                      <div
                        key={course.id}
                        draggable={true}
                        onDragStart={(e) => course.id && handleDragStart(e, course.id)}
                        onDragOver={(e) => course.id && handleDragOver(e, course.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between gap-4 px-5 py-4 bg-card hover:bg-muted/10 transition-colors ${
                          isCourseDragged
                            ? "opacity-40 bg-muted/20 border-dashed border border-primary/20 scale-[0.99]"
                            : ""
                        }`}
                      >
                        {/* Left: drag handle + name + chips */}
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          {/* Drag Handle */}
                          <div
                            className="text-muted-foreground/60 hover:text-primary transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted"
                            title="Drag to reorder courses"
                          >
                            <GripVertical className="size-3.5" />
                          </div>
                          <span className="text-sm font-bold text-foreground">
                            {course.name}
                          </span>
                          {course.certifiedTrainer && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              <Award className="size-2.5" />
                              Certified
                            </span>
                          )}
                          {course.dedicatedField && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                              <MapPin className="size-2.5" />
                              Field
                            </span>
                          )}
                          {course.parking && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <Car className="size-2.5" />
                              Parking
                            </span>
                          )}
                          {course.price && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20">
                              {course.price}
                            </span>
                          )}
                        </div>

                        {/* Right: action buttons */}
                        <div
                          className="flex items-center gap-2 shrink-0"
                          draggable={false}
                          onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCourse(course);
                              setIsFormOpen(true);
                            }}
                            className="h-8 font-bold text-xs"
                            disabled={isDeletingId === course.id}
                          >
                            <Edit2 className="size-3.5 mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => course.id && handleDeleteCourse(course.id)}
                            className="h-8 font-bold text-xs"
                            disabled={isDeletingId === course.id}
                          >
                            <Trash2 className="size-3.5 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTargetId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="relative w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteTargetId(null);
                setDeleteError(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">Delete {itemNoun}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Are you sure you want to delete this {itemNoun.toLowerCase()}? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {deleteError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTargetId(null);
                    setDeleteError(null);
                  }}
                  disabled={isDeletingId !== null}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeletingId !== null}
                >
                  {isDeletingId !== null ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

