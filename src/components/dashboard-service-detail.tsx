"use client";

import { useState, useTransition, useEffect } from "react";
import type { Course } from "@/types/course";
import { toggleOrganizationServiceAction } from "@/app/actions/organizations";
import { deleteCourseAction, reorderOrgCoursesAction } from "@/app/actions/courses";
import { CourseForm, parseCoursePricings, parseClosedPeriods, parseSpecialOpenings } from "@/components/course-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Plus, Edit2, Trash2, Award, MapPin, Car, X, GripVertical, Pill, Footprints, Camera, Utensils, ChevronDown, ChevronUp, Users, Video, CalendarX, CalendarCheck, ShieldCheck, HeartPulse, Trees, Waves, GraduationCap, Warehouse } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAY_SHORT_NAMES: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export interface FormattedScheduleGroup {
  dayRangeLabel: string;
  enabled: boolean;
  checkin: string;
  checkout: string;
  /** Optional note attached to this schedule group, if all grouped days share the same note. */
  note?: string;
}

export function parseScheduleGroups(
  scheduleJson?: string | null,
  fallbackCheckin?: string | null,
  fallbackCheckout?: string | null,
  fallbackCheckinWeekend?: string | null,
  fallbackCheckoutWeekend?: string | null
): FormattedScheduleGroup[] {
  if (scheduleJson) {
    try {
      const parsed = JSON.parse(scheduleJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const groups: FormattedScheduleGroup[] = [];
        let currentGroup: { days: string[]; enabled: boolean; checkin: string; checkout: string; note?: string } | null = null;

        for (const item of parsed) {
          const shortName = DAY_SHORT_NAMES[item.day] || item.label || item.day;
          // Include note in the grouping key so days with different notes are never merged.
          const key = `${item.enabled}:${item.checkin}:${item.checkout}:${item.note || ""}`;

          if (!currentGroup) {
            currentGroup = { days: [shortName], enabled: item.enabled, checkin: item.checkin, checkout: item.checkout, note: item.note };
          } else {
            const prevKey = `${currentGroup.enabled}:${currentGroup.checkin}:${currentGroup.checkout}:${currentGroup.note || ""}`;
            if (key === prevKey) {
              currentGroup.days.push(shortName);
            } else {
              const rangeLabel =
                currentGroup.days.length === 1
                  ? currentGroup.days[0]
                  : `${currentGroup.days[0]}–${currentGroup.days[currentGroup.days.length - 1]}`;
              groups.push({
                dayRangeLabel: rangeLabel,
                enabled: currentGroup.enabled,
                checkin: currentGroup.checkin,
                checkout: currentGroup.checkout,
                note: currentGroup.note,
              });
              currentGroup = { days: [shortName], enabled: item.enabled, checkin: item.checkin, checkout: item.checkout, note: item.note };
            }
          }
        }
        if (currentGroup) {
          const rangeLabel =
            currentGroup.days.length === 1
              ? currentGroup.days[0]
              : `${currentGroup.days[0]}–${currentGroup.days[currentGroup.days.length - 1]}`;
          groups.push({
            dayRangeLabel: rangeLabel,
            enabled: currentGroup.enabled,
            checkin: currentGroup.checkin,
            checkout: currentGroup.checkout,
            note: currentGroup.note,
          });
        }
        return groups;
      }
    } catch (e) {}
  }

  const res: FormattedScheduleGroup[] = [];
  if (fallbackCheckin || fallbackCheckout) {
    res.push({
      dayRangeLabel: "Mon–Fri",
      enabled: true,
      checkin: fallbackCheckin || "",
      checkout: fallbackCheckout || "",
    });
  }
  if (fallbackCheckinWeekend || fallbackCheckoutWeekend) {
    res.push({
      dayRangeLabel: "Sat–Sun",
      enabled: true,
      checkin: fallbackCheckinWeekend || "",
      checkout: fallbackCheckoutWeekend || "",
    });
  }
  return res;
}

interface Service {
  id: string;
  name: string;
  description: string;
  coursesOrder?: string | null;
}

/**
 * Props for the DashboardServiceDetail component.
 * @interface DashboardServiceDetailProps
 * @property {string} organizationId - The active organization's database ID.
 * @property {Service} service - The Service object metadata.
 * @property {boolean} initialIsEnabled - Initial state of whether this service is active for the organization.
 * @property {string} slug - Slug identifier for the service.
 * @property {string} [activeCourseTab] - Optional active tab identifier.
 * @property {string[]} [enabledCourseIds] - List of database IDs of courses registered under this service.
 * @property {Course[]} [courses] - List of courses associated with this service type.
 * @property {string} [backHref] - Optional navigation destination path for back action.
 * @property {string} [backLabel] - Optional display label for back navigation.
 */
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
  orgCity?: string;
}

/**
 * DashboardServiceDetail Component
 *
 * Renders the business owner detail dashboard view for an individual service type (e.g., Boarding, Training).
 * Provides a status toggle activation switch, full course lists, delete confirmation dialogs, drag and drop
 * item reordering support, and embedded CourseForm editing panels.
 *
 * @param {DashboardServiceDetailProps} props - The component props.
 * @returns {React.ReactElement} The dashboard service detail component.
 */
export function DashboardServiceDetail({
  organizationId,
  service,
  initialIsEnabled,
  slug,
  activeCourseTab,
  enabledCourseIds,
  courses,
  backHref = "/dashboard/services",
  backLabel = "Back to Services",
  orgCity,
}: DashboardServiceDetailProps) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [isPending, startTransition] = useTransition();

  // Course states
  const [localCourses, setLocalCourses] = useState<Course[]>(courses || []);
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(() => new Set());
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);

  const toggleExpandCourse = (courseId: string) => {
    setExpandedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sync localCourses with courses prop
  useEffect(() => {
    if (courses) {
      setLocalCourses(courses);
    }
  }, [courses]);

  const serviceName = service?.name?.toLowerCase() || "";
  const isDogTraining = serviceName === "dog training";
  const isSportDogTraining = serviceName === "dog sports training" || slug === "sport-dog-training";
  const isDogBoarding = serviceName === "dog boarding";
  const isDogGrooming = serviceName === "dog grooming";
  const isDogWalking = serviceName === "dog walking" || slug === "dog-walking";
  const isDogSitter = serviceName === "dog sitter" || slug === "dog-sitter";
  const isDynamicCourses = isDogTraining || isSportDogTraining || isDogBoarding || isDogGrooming || isDogWalking || isDogSitter;
  const itemNoun = isSportDogTraining
    ? "Dog Sport"
    : isDogBoarding
    ? "Boarding service"
    : isDogGrooming
    ? "Grooming service"
    : isDogWalking
    ? "Walking service"
    : isDogSitter
    ? "Sitting service"
    : "Course";

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
          serviceSlug={slug}
          orgCity={orgCity}
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

              <ToggleSwitch
                checked={isEnabled}
                onChange={handleToggle}
                disabled={isPending}
              />
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
                    const courseId = course.id || "";
                    const isExpanded = expandedCourseIds.has(courseId);

                    return (
                      <div
                        key={course.id}
                        draggable={true}
                        onDragStart={(e) => course.id && handleDragStart(e, course.id)}
                        onDragOver={(e) => course.id && handleDragOver(e, course.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex flex-col border-b border-border/40 last:border-b-0 bg-card transition-all ${
                          isCourseDragged
                            ? "opacity-40 bg-muted/20 border-dashed border border-primary/20 scale-[0.99]"
                            : ""
                        }`}
                      >
                        {/* Header Row */}
                        <div
                          onClick={() => courseId && toggleExpandCourse(courseId)}
                          className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/5 transition-colors cursor-pointer select-none"
                        >
                          {/* Left: Drag handle + Name + Chevron */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="text-muted-foreground/60 hover:text-primary transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted shrink-0"
                              title="Drag to reorder"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical className="size-3.5" />
                            </div>

                            <span className="text-sm font-bold text-foreground truncate">
                              {course.name}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (courseId) toggleExpandCourse(courseId);
                              }}
                              className="p-1 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                              title={isExpanded ? "Collapse details" : "Expand details"}
                              aria-label={isExpanded ? `Collapse ${course.name}` : `Expand ${course.name}`}
                            >
                              <ChevronDown
                                className={cn("size-4 transition-transform duration-200", isExpanded && "rotate-180")}
                              />
                            </button>
                          </div>

                          {/* Right: Action Buttons */}
                          <div
                            className="flex items-center gap-2 shrink-0"
                            draggable={false}
                            onDragStart={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
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
                              className="h-8 font-bold text-xs cursor-pointer"
                            >
                              <Edit2 className="size-3.5 mr-1.5" />
                              Edit
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isDeletingId === course.id}
                              onClick={() => course.id && handleDeleteCourse(course.id)}
                              className="h-8 font-bold text-xs cursor-pointer"
                            >
                              <Trash2 className="size-3.5 mr-1.5" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Collapsible Badges Tray */}
                        {isExpanded && (
                          <div className="px-5 pb-4 pt-1.5 border-t border-border/30 bg-muted/10 flex flex-wrap items-center gap-2 animate-in fade-in duration-150">
                            {slug === "dog-boarding" && (
                              <div className="inline-flex flex-wrap items-center gap-1.5">
                                {parseScheduleGroups(
                                  course.schedule,
                                  course.checkin,
                                  course.checkout,
                                  course.checkinWeekend,
                                  course.checkoutWeekend
                                ).map((grp, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border"
                                    title={`${grp.dayRangeLabel} operating hours`}
                                  >
                                    <span className="font-semibold text-foreground/80">{grp.dayRangeLabel}:</span>{" "}
                                    {grp.enabled ? (
                                      <>
                                        {grp.checkin ? `In: ${grp.checkin}` : ""}
                                        {grp.checkin && grp.checkout ? " • " : ""}
                                        {grp.checkout ? `Out: ${grp.checkout}` : ""}
                                      </>
                                    ) : (
                                      <span className="italic">Closed</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                            {course.certifiedTrainer && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                <Award className="size-2.5" />
                                Certified
                              </span>
                            )}
                            {course.veterinaryTraining && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20" title={course.veterinaryTrainingDetails || course.veterinaryTrainingCertifier || ""}>
                                <Award className="size-2.5" />
                                Vet Training
                              </span>
                            )}
                            {course.ageLimitsEnabled && course.ageLimits && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 border border-violet-500/20" title={course.ageLimits}>
                                <Users className="size-2.5" />
                                Ages: {course.ageLimits.split(",").length} {course.ageLimits.split(",").length === 1 ? "Phase" : "Phases"}
                              </span>
                            )}
                            {slug !== "dog-walking" && slug !== "dog-sitter" && course.dedicatedField && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                                <MapPin className="size-2.5" />
                                Field
                              </span>
                            )}
                            {slug !== "dog-walking" && slug !== "dog-sitter" && course.parking && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <Car className="size-2.5" />
                                Parking
                              </span>
                            )}
                            {course.medicationAdministration && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20" title={course.medicationAdministrationDetails || ""}>
                                <Pill className="size-2.5" />
                                Meds Administered
                              </span>
                            )}
                            {course.surveillance247 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20" title={course.surveillance247Details || ""}>
                                <ShieldCheck className="size-2.5" />
                                24/7 Surveillance
                              </span>
                            )}
                            {course.webCam && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20" title={course.webCamDetails || ""}>
                                <Video className="size-2.5" />
                                Webcam
                              </span>
                            )}
                            {course.dailyWalks && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                                <Footprints className="size-2.5" />
                                {course.dailyWalks} {course.dailyWalks === 1 ? "Walk" : "Walks"}
                              </span>
                            )}
                            {course.ownerCommunication && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-600 border border-pink-500/20" title={course.ownerCommunicationDetails || ""}>
                                <Camera className="size-2.5" />
                                Updates Sent
                              </span>
                            )}
                            {course.personalizedMealPlan && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20" title={course.personalizedMealPlanDetails || ""}>
                                <Utensils className="size-2.5" />
                                Meal Plan
                              </span>
                            )}
                            {course.emergencyVetTransport && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" title={course.emergencyVetTransportDetails || ""}>
                                <HeartPulse className="size-2.5" />
                                Emergency Vet Transport
                              </span>
                            )}
                            {course.maxPetsPerVisit && course.maxPetsPerVisit > 1 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20" title={course.additionalPetPolicy || `Max ${course.maxPetsPerVisit} pets per visit`}>
                                <Users className="size-2.5" />
                                Up to {course.maxPetsPerVisit} Pets
                              </span>
                            )}
                            {course.acceptedDogSizes && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 border border-violet-500/20" title={`Accepted Dog Sizes: ${course.acceptedDogSizes.split(",").join(", ")}`}>
                                <Footprints className="size-2.5" />
                                Sizes: {course.acceptedDogSizes.split(",").join(", ")}
                              </span>
                            )}
                            {course.trainingFormat && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20" title={course.maxDogsPerGroup ? `${course.trainingFormat} (Max ${course.maxDogsPerGroup} dogs)` : course.trainingFormat}>
                                <GraduationCap className="size-2.5" />
                                {course.trainingFormat}{course.maxDogsPerGroup ? ` (Max ${course.maxDogsPerGroup})` : ""}
                              </span>
                            )}
                            {course.indoorFacility && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20" title={course.indoorFacilityDescription || "Indoor / covered training hall"}>
                                <Warehouse className="size-2.5" />
                                Indoor Hall
                              </span>
                            )}
                            {course.playYard && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-500/10 text-lime-600 border border-lime-500/20" title={course.playYardDetails || "Fenced outdoor play yard"}>
                                <Trees className="size-2.5" />
                                Play Yard
                              </span>
                            )}
                            {course.pool && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20" title={course.poolDetails || "Canine swimming pool & splash area"}>
                                <Waves className="size-2.5" />
                                Swimming Pool
                              </span>
                            )}
                            {parseClosedPeriods(course.schedule).map((period, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                title={period.note || (period.startDate && period.endDate ? `${period.startDate} to ${period.endDate}` : period.startDate || period.endDate || "")}
                              >
                                <CalendarX className="size-2.5" />
                                Closed: {period.title || "Special Break"} ({period.startDate}{period.startDate && period.endDate ? " to " : ""}{period.endDate}{period.note ? ` • ${period.note}` : ""})
                              </span>
                            ))}
                            {parseSpecialOpenings(course.schedule).map((opening, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                title={opening.note || (opening.startDate && opening.endDate ? `${opening.startDate} to ${opening.endDate}` : opening.startDate || opening.endDate || "")}
                              >
                                <CalendarCheck className="size-2.5" />
                                Open: {opening.title || "Special Session"} ({opening.startDate}{opening.startDate && opening.endDate ? " to " : ""}{opening.endDate}{opening.checkin || opening.checkout ? ` • ${opening.checkin || ""}${opening.checkout ? ` - ${opening.checkout}` : ""}` : ""}{opening.note ? ` • ${opening.note}` : ""})
                              </span>
                            ))}
                            {course.price &&
                              parseCoursePricings(course.price, course.priceType, itemNoun.toLowerCase()).map((pTier, pIdx) => {
                                if (!pTier.amount) return null;
                                const rawType = pTier.type || "";
                                const typeLabel = rawType === "half_day"
                                  ? "half day"
                                  : rawType === "walk_30min"
                                  ? "30min walk"
                                  : rawType === "walk_45min"
                                  ? "45min walk"
                                  : rawType === "walk_60min"
                                  ? "60min walk"
                                  : rawType === "addl_dog"
                                  ? "addl dog"
                                  : ["1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "11h", "12h", "month", "night", "day", "service", "session", "hour", "course", "walk"].includes(rawType)
                                  ? rawType
                                  : itemNoun.toLowerCase();
                                const displayText = pTier.label
                                  ? `${pTier.label}: ${pTier.amount} lei / ${typeLabel}`
                                  : `${pTier.amount} lei / ${typeLabel}`;
                                return (
                                  <span
                                    key={pIdx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20"
                                  >
                                    {displayText}
                                  </span>
                                );
                              })}
                          </div>
                        )}
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
