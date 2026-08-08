"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import type { Course, SecondaryCoverageZone, CoverageZonesData } from "@/types/course";
import { parseCoverageZones, serializeCoverageZones } from "@/types/course";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";
import { requestNewCartierAction } from "@/app/actions/organizations";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import { ArrowLeft, Loader2, AlertCircle, Plus, Trash2, FileText, HelpCircle, DollarSign, MapPin, Calendar, FileCheck, Sliders, X, CheckCircle2, Globe } from "lucide-react";
import { TimePickerSelect, getCheckinOptions, getCheckoutOptions } from "@/components/ui/time-picker-select";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePickerInput, parseDateString } from "@/components/ui/date-picker-input";
import { getCartiereForCity, ROMANIAN_CITY_CARTIERE } from "@/config/romanian-cartiere";
import { CourseGeneralTab } from "./course-form/course-general-tab";
import { CoursePricingTab } from "./course-form/course-pricing-tab";
import { CourseScheduleTab } from "./course-form/course-schedule-tab";
import { CourseCareTab } from "./course-form/course-care-tab";
import { CourseLocationTab } from "./course-form/course-location-tab";
import { CourseFaqTab } from "./course-form/course-faq-tab";

export function getComparableTimestamp(dateStr: string): number | null {
  const parsed = parseDateString(dateStr);
  if (!parsed) return null;
  return Date.UTC(parsed.year, parsed.month, parsed.day);
}

export interface CoursePricingItem {
  amount: string;
  type: string;
  label?: string;
}

export function parseCoursePricings(
  price?: string | null,
  priceType?: string | null,
  defaultType: string = "course"
): CoursePricingItem[] {
  if (price) {
    const trimmed = price.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            amount: typeof item === "object" && item?.amount !== undefined ? String(item.amount) : String(item),
            type: typeof item === "object" && item?.type ? String(item.type) : priceType || defaultType,
            label: typeof item === "object" && item?.label ? String(item.label) : "",
          }));
        }
      } catch (e) { }
    }
    return [{ amount: price, type: priceType || defaultType, label: "" }];
  }
  return [{ amount: "", type: priceType || defaultType, label: "" }];
}

export interface ClosedPeriodItem {
  title: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export function parseClosedPeriods(scheduleJson?: string | null): ClosedPeriodItem[] {
  if (scheduleJson) {
    try {
      const parsed = JSON.parse(scheduleJson);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Array.isArray(parsed.closedPeriods)) {
        return parsed.closedPeriods;
      }
    } catch (e) { }
  }
  return [];
}

export interface SpecialOpeningItem {
  title: string;
  startDate: string;
  endDate: string;
  checkin?: string;
  checkout?: string;
  note?: string;
}

export function parseSpecialOpenings(scheduleJson?: string | null): SpecialOpeningItem[] {
  if (scheduleJson) {
    try {
      const parsed = JSON.parse(scheduleJson);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Array.isArray(parsed.specialOpenings)) {
        return parsed.specialOpenings;
      }
    } catch (e) { }
  }
  return [];
}

export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface DayScheduleItem {
  day: DayKey;
  label: string;
  enabled: boolean;
  checkin: string;
  checkout: string;
  note?: string;
}

export const DEFAULT_WEEKLY_SCHEDULE: DayScheduleItem[] = [
  { day: "monday", label: "Monday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "tuesday", label: "Tuesday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "wednesday", label: "Wednesday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "thursday", label: "Thursday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "friday", label: "Friday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "saturday", label: "Saturday", enabled: true, checkin: "09:00", checkout: "16:00" },
  { day: "sunday", label: "Sunday", enabled: true, checkin: "09:00", checkout: "16:00" },
];

export function getInitialWeeklySchedule(initialCourse?: Course | null): DayScheduleItem[] {
  if (initialCourse?.schedule) {
    try {
      const parsed = JSON.parse(initialCourse.schedule);
      if (Array.isArray(parsed) && parsed.length === 7) {
        return parsed;
      }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Array.isArray(parsed.weeklySchedule) && parsed.weeklySchedule.length === 7) {
        return parsed.weeklySchedule;
      }
    } catch (e) { }
  }
  const workIn = initialCourse?.checkin || "08:00";
  const workOut = initialCourse?.checkout || "18:00";
  const weekIn = initialCourse?.checkinWeekend || "09:00";
  const weekOut = initialCourse?.checkoutWeekend || "16:00";

  return [
    { day: "monday", label: "Monday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "tuesday", label: "Tuesday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "wednesday", label: "Wednesday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "thursday", label: "Thursday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "friday", label: "Friday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "saturday", label: "Saturday", enabled: true, checkin: weekIn, checkout: weekOut },
    { day: "sunday", label: "Sunday", enabled: true, checkin: weekIn, checkout: weekOut },
  ];
}

// ============================================================
// DayScheduleGrid
// ============================================================

interface DayScheduleGridProps {
  weeklySchedule: DayScheduleItem[];
  /**
   * When true, renders "Start"/"End" labels and "Closed" closed-state text
   * instead of "Check-in"/"Check-out" / "Closed for check-in / check-out".
   * Used for Dog Sport and Dog Training services.
   */
  useSportLabels: boolean;
  onUpdate: (dayKey: DayKey, field: keyof DayScheduleItem, value: any) => void;
  onCopyMonToWorkweek: () => void;
  onCopyMonToAll: () => void;
}

/**
 * DayScheduleGrid Component
 *
 * Renders the 7-day weekly schedule editor with per-day toggles, start/end time pickers,
 * and optional notes. Shared between the Dog Sport/Dog Training tabbed layout
 * (Schedule tab) and the Dog Boarding inline layout.
 *
 * @param props - {@link DayScheduleGridProps}
 */
function DayScheduleGrid({
  weeklySchedule,
  useSportLabels,
  onUpdate,
  onCopyMonToWorkweek,
  onCopyMonToAll,
}: DayScheduleGridProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-3">
        <div>
          <Label className="text-base font-bold text-foreground">
            {useSportLabels ? "Schedule" : "Daily Operating Schedule"}
          </Label>
          <p className="text-xs text-muted-foreground">
            {useSportLabels
              ? "Specify day-specific operating schedule (Monday to Sunday)"
              : "Specify day-specific check-in and check-out times (Monday to Sunday)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopyMonToWorkweek}
            className="text-xs h-7 px-2.5"
            title="Copy Monday check-in/out times to Tuesday through Friday"
          >
            Copy Mon to Mon–Fri
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopyMonToAll}
            className="text-xs h-7 px-2.5"
            title="Copy Monday check-in/out times to all days of the week"
          >
            Copy Mon to All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {weeklySchedule.map((item) => (
          <div
            key={item.day}
            className={`p-3 rounded-lg border transition-colors ${
              item.enabled ? "bg-muted/10 border-border/70" : "bg-muted/5 border-border/30 opacity-60"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-[130px]">
                <input
                  type="checkbox"
                  id={`schedule-enable-${item.day}`}
                  checked={item.enabled}
                  onChange={(e) => onUpdate(item.day, "enabled", e.target.checked)}
                  className="size-4 rounded border-input text-primary focus:ring-primary/20 cursor-pointer"
                />
                <Label
                  htmlFor={`schedule-enable-${item.day}`}
                  className={`text-sm font-semibold cursor-pointer select-none ${
                    item.enabled ? "text-foreground" : "text-muted-foreground line-through"
                  }`}
                >
                  {item.label}
                </Label>
              </div>

              {item.enabled ? (
                <div className="flex flex-col gap-2.5 flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="space-y-1 w-full sm:w-36">
                      <Label htmlFor={`checkin-${item.day}`} className="text-[11px] font-medium text-muted-foreground">
                        {useSportLabels ? "Start" : "Check-in Time"}
                      </Label>
                      <TimePickerSelect
                        id={`checkin-${item.day}`}
                        value={item.checkin}
                        onChange={(val) => onUpdate(item.day, "checkin", val)}
                        options={getCheckinOptions()}
                        placeholder="08:00"
                        required={item.enabled}
                      />
                    </div>
                    <div className="space-y-1 w-full sm:w-36">
                      <Label htmlFor={`checkout-${item.day}`} className="text-[11px] font-medium text-muted-foreground">
                        {useSportLabels ? "End" : "Check-out Time"}
                      </Label>
                      <TimePickerSelect
                        id={`checkout-${item.day}`}
                        value={item.checkout}
                        onChange={(val) => onUpdate(item.day, "checkout", val)}
                        options={getCheckoutOptions(item.checkin)}
                        placeholder="18:00"
                        required={item.enabled}
                        hasError={!!(item.checkin && item.checkout && item.checkout <= item.checkin)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`note-${item.day}`} className="text-[11px] font-medium text-muted-foreground">
                      Note / Schedule Remarks (Optional)
                    </Label>
                    <Input
                      id={`note-${item.day}`}
                      type="text"
                      value={item.note || ""}
                      onChange={(e) => onUpdate(item.day, "note", e.target.value)}
                      placeholder="e.g. Group sessions only, advance registration required..."
                      className="h-9 text-xs bg-background rounded-lg border-input/80 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>

                  {item.checkin && item.checkout && item.checkout <= item.checkin && (
                    <p className="text-[11px] text-destructive font-semibold mt-0.5">
                      {useSportLabels
                        ? "End time cannot be before or equal to start time."
                        : "Check-out time cannot be before or equal to check-in time."}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-xs italic text-muted-foreground py-1">
                  {useSportLabels ? "Closed" : "Closed for check-in / check-out"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================
// AgeLimitsSection — Age limits toggle + dog age phase checkboxes
// ============================================================

const AGE_PHASES = [
  "Puppy (2-6 mos)",
  "Junior (6-12 mos)",
  "Adult (1-7 yrs)",
  "Senior (7+ yrs)",
] as const;

interface AgeLimitsSectionProps {
  itemNoun: string;
  ageLimitsEnabled: boolean;
  onAgeLimitsEnabledChange: (v: boolean) => void;
  selectedAgeLimits: string[];
  onSelectedAgeLimitsChange: (v: string[]) => void;
}

/**
 * AgeLimitsSection — BooleanToggleField wrapping the dog age-phase checkbox list.
 * Used in the tabbed layout's Terms tab and the flat layout's Trainer Attributes card.
 */
function AgeLimitsSection({
  itemNoun,
  ageLimitsEnabled,
  onAgeLimitsEnabledChange,
  selectedAgeLimits,
  onSelectedAgeLimitsChange,
}: AgeLimitsSectionProps) {
  return (
    <BooleanToggleField
      label="Age Limits & Restrictions"
      description={`Enable if this ${itemNoun.toLowerCase()} has specific age limits/requirements.`}
      checked={ageLimitsEnabled}
      onChange={onAgeLimitsEnabledChange}
    >
      <div className="space-y-2 pt-1">
        <Label className="text-xs font-semibold">Allowed Dog Age Groups</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AGE_PHASES.map((option) => {
            const isSelected = selectedAgeLimits.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onSelectedAgeLimitsChange(selectedAgeLimits.filter((x) => x !== option));
                  } else {
                    onSelectedAgeLimitsChange([...selectedAgeLimits, option]);
                  }
                }}
                className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-input hover:bg-muted/50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </BooleanToggleField>
  );
}

// ============================================================
// LocationSection — Dedicated training field + location inputs + parking
// ============================================================

interface LocationSectionProps {
  /**
   * "tabbed" — address/GBP/Maps are always visible; Dedicated Field toggle reveals only the description.
   * "flat"   — all location inputs are gated behind the Dedicated Field toggle.
   */
  layout: "tabbed" | "flat";
  isBoarding?: boolean;
  isDogWalking?: boolean;
  orgCity?: string;
  selectedCartiere?: string[];
  onCartiereChange?: (zones: string[]) => void;
  secondaryZones?: SecondaryCoverageZone[];
  onAddSecondaryZone?: () => void;
  onRemoveSecondaryZone?: (index: number) => void;
  onSecondaryCityChange?: (index: number, newCity: string) => void;
  onSecondaryCartiereChange?: (index: number, cartiere: string[]) => void;
  hideDedicatedField?: boolean;
  hideParking?: boolean;
  dedicatedField: boolean;
  onDedicatedFieldChange: (v: boolean) => void;
  trainingFieldDescription: string;
  onTrainingFieldDescriptionChange: (v: string) => void;
  trainingFieldAddress: string;
  onTrainingFieldAddressChange: (v: string) => void;
  trainingFieldGoogleBusinessProfile: string;
  onGbpChange: (v: string) => void;
  trainingFieldGoogleMapsLink: string;
  onMapsChange: (v: string) => void;
  parking: boolean;
  onParkingChange: (v: boolean) => void;
  parkingDescription: string;
  onParkingDescriptionChange: (v: string) => void;
}

/**
 * LocationSection — Renders location inputs, dedicated training field toggle, and parking toggle.
 * Behaviour differs by `layout` prop — see {@link LocationSectionProps}.
 */
function LocationSection({
  layout,
  isBoarding,
  isDogWalking = false,
  orgCity = "",
  selectedCartiere = [],
  onCartiereChange,
  secondaryZones = [],
  onAddSecondaryZone,
  onRemoveSecondaryZone,
  onSecondaryCityChange,
  onSecondaryCartiereChange,
  hideDedicatedField = false,
  hideParking = false,
  dedicatedField,
  onDedicatedFieldChange,
  trainingFieldDescription,
  onTrainingFieldDescriptionChange,
  trainingFieldAddress,
  onTrainingFieldAddressChange,
  trainingFieldGoogleBusinessProfile,
  onGbpChange,
  trainingFieldGoogleMapsLink,
  onMapsChange,
  parking,
  onParkingChange,
  parkingDescription,
  onParkingDescriptionChange,
}: LocationSectionProps) {
  const cityName = orgCity?.trim() || "Cluj-Napoca";
  const cartiereList = isDogWalking ? getCartiereForCity(cityName) : null;

  const [isRequestCartierOpen, setIsRequestCartierOpen] = useState(false);
  const [newCartierName, setNewCartierName] = useState("");
  const [newCartierNotes, setNewCartierNotes] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);
  const [requestErrorMsg, setRequestErrorMsg] = useState<string | null>(null);

  const [inlineSuccessBanner, setInlineSuccessBanner] = useState<string | null>(null);

  const handleSendCartierRequest = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!newCartierName.trim()) return;

    setIsSubmittingRequest(true);
    setRequestErrorMsg(null);
    setRequestSuccessMsg(null);

    const res = await requestNewCartierAction({
      cityName,
      cartierName: newCartierName.trim(),
      notes: newCartierNotes.trim(),
    });

    setIsSubmittingRequest(false);
    if ("error" in res) {
      setRequestErrorMsg(res.error);
    } else {
      setRequestSuccessMsg(res.message);
      setInlineSuccessBanner(res.message);
      setNewCartierName("");
      setNewCartierNotes("");
    }
  };

  const locationInputs = (
    <>
      {isDogWalking && (
        <div className="space-y-6 pb-2">
          {inlineSuccessBanner && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="font-semibold">{inlineSuccessBanner}</p>
              </div>
              <button
                type="button"
                onClick={() => setInlineSuccessBanner(null)}
                className="text-emerald-700 dark:text-emerald-400 hover:opacity-75 cursor-pointer shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* CARD 1: PRIMARY COVERAGE ZONE */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  Primary Coverage Zone
                </h4>
                <p className="text-xs text-muted-foreground">
                  Neighborhood coverage for your primary business city ({cityName}).
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 self-start sm:self-auto">
                Primary City: {cityName}
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Primary City / Localitate</Label>
              <Input
                type="text"
                value={cityName}
                readOnly
                disabled
                className="h-9 bg-muted/30 text-xs font-semibold rounded-lg cursor-not-allowed opacity-90"
              />
            </div>

            {cartiereList ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-foreground">Neighborhood Coverage Zones (Cartiere)</Label>
                    <p className="text-[11px] text-muted-foreground">Configure specific neighborhoods in {cityName} where you offer dog walking services.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onCartiereChange?.([...cartiereList])}
                      className="h-7 text-[10px] font-semibold px-2"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onCartiereChange?.([])}
                      className="h-7 text-[10px] font-semibold px-2"
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                  {cartiereList.map((cartier) => {
                    const isSelected = selectedCartiere.includes(cartier);
                    return (
                      <button
                        key={cartier}
                        type="button"
                        onClick={() => {
                          if (!onCartiereChange) return;
                          if (isSelected) {
                            onCartiereChange(selectedCartiere.filter((c) => c !== cartier));
                          } else {
                            onCartiereChange([...selectedCartiere, cartier]);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                            : "bg-background border-border text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="size-3.5 rounded border-border text-primary focus:ring-primary/20 pointer-events-none"
                        />
                        <span className="truncate">{cartier}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setRequestErrorMsg(null);
                      setRequestSuccessMsg(null);
                      setIsRequestCartierOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-dashed border-primary/50 text-primary hover:bg-primary/5 transition-all text-left cursor-pointer"
                  >
                    <Plus className="size-3.5 shrink-0" />
                    <span className="truncate">Request new Coverage zone (Cartier)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">Unsupported City for Neighborhood Selection</p>
                    <p className="text-[11px] mt-0.5 opacity-90">
                      Your city (<strong>{cityName}</strong>) is currently not in our standard neighborhood coverage dataset. A notification has been sent to our staff to add neighborhood zones for your city.
                    </p>
                  </div>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRequestErrorMsg(null);
                      setRequestSuccessMsg(null);
                      setIsRequestCartierOpen(true);
                    }}
                    className="h-8 border-dashed text-xs font-semibold text-primary hover:text-primary gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    Request new Coverage zone (Cartier)
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: SECONDARY COVERAGE ZONES */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  Secondary Coverage Zones
                </h4>
                <p className="text-xs text-muted-foreground">
                  Add additional cities where your dog walking services operate and configure neighborhood coverage.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddSecondaryZone}
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer border-dashed border-primary/60 text-primary hover:bg-primary/5 self-start sm:self-auto"
              >
                <Plus className="size-3.5" />
                Add Secondary Coverage Zone
              </Button>
            </div>

            {secondaryZones.length > 0 ? (
              <div className="space-y-4 pt-1">
                {secondaryZones.map((secZone, idx) => {
                  const secCityName = secZone.city;
                  const secCartiereList = secCityName ? getCartiereForCity(secCityName) : null;
                  const availableCities = Object.keys(ROMANIAN_CITY_CARTIERE).filter(
                    (c) => c !== cityName && (c === secCityName || !secondaryZones.some((s, i) => i !== idx && s.city === c))
                  );

                  return (
                    <div key={idx} className="p-4 rounded-xl border border-border bg-muted/10 shadow-xs space-y-4 relative">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1.5 max-w-xs">
                          <Label className="text-xs font-semibold">Secondary City</Label>
                          <CustomSelect
                            options={[
                              { value: "", label: "Select Secondary City" },
                              ...availableCities.map((c) => ({ value: c, label: c })),
                            ]}
                            value={secCityName}
                            onChange={(val) => onSecondaryCityChange?.(idx, val)}
                            placeholder="Select Secondary City..."
                            searchable
                            searchPlaceholder="Search city..."
                            className="h-9 text-xs font-semibold"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveSecondaryZone?.(idx)}
                          className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10 gap-1.5 self-end cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          Remove Zone
                        </Button>
                      </div>

                      {secCityName && secCartiereList && (
                        <div className="space-y-3 pt-2 border-t border-border/60">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground">
                              Neighborhoods in <strong>{secCityName}</strong>
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onSecondaryCartiereChange?.(idx, [...secCartiereList])}
                                className="h-6 text-[10px] font-semibold px-2"
                              >
                                Select All
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onSecondaryCartiereChange?.(idx, [])}
                                className="h-6 text-[10px] font-semibold px-2"
                              >
                                Deselect All
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                            {secCartiereList.map((cartier) => {
                              const isSelected = secZone.cartiere.includes(cartier);
                              return (
                                <button
                                  key={cartier}
                                  type="button"
                                  onClick={() => {
                                    if (!onSecondaryCartiereChange) return;
                                    const next = isSelected
                                      ? secZone.cartiere.filter((c) => c !== cartier)
                                      : [...secZone.cartiere, cartier];
                                    onSecondaryCartiereChange(idx, next);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                                    isSelected
                                      ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                                      : "bg-background border-border text-foreground hover:bg-muted/40"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="size-3.5 rounded border-border text-primary focus:ring-primary/20 pointer-events-none"
                                  />
                                  <span className="truncate">{cartier}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/5 text-center py-6 space-y-1">
                <p className="text-xs font-semibold text-foreground">No Secondary Coverage Zones Added</p>
                <p className="text-[11px] text-muted-foreground">
                  If you walk dogs in adjacent or additional cities, click "Add Secondary Coverage Zone" above to configure coverage.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {isRequestCartierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200 space-y-4">
            <button
              type="button"
              onClick={() => setIsRequestCartierOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                <MapPin className="size-4 text-primary" />
                Request new Coverage zone (Cartier)
              </h3>
              <p className="text-xs text-muted-foreground">
                Can't find a neighborhood in <strong className="text-foreground">{cityName}</strong>? Request a new zone and our staff will review and add it.
              </p>
            </div>

            {requestSuccessMsg ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-3 shadow-xs">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">Request Submitted Successfully!</p>
                    <p className="font-medium text-xs leading-relaxed">{requestSuccessMsg}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsRequestCartierOpen(false)}
                    className="h-8 text-xs font-semibold px-4 cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {requestErrorMsg && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {requestErrorMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="req-city-name" className="text-xs font-semibold">City / Localitate</Label>
                  <Input
                    id="req-city-name"
                    value={cityName}
                    disabled
                    readOnly
                    className="h-9 bg-muted/30 text-xs font-semibold cursor-not-allowed opacity-90"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="req-cartier-name" className="text-xs font-semibold">Neighborhood Name (Nume Cartier) *</Label>
                  <Input
                    id="req-cartier-name"
                    type="text"
                    placeholder="e.g. Mănăștur Nord, Borhanci Est"
                    value={newCartierName}
                    onChange={(e) => setNewCartierName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendCartierRequest();
                      }
                    }}
                    required
                    className="h-9 text-xs font-semibold bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="req-notes" className="text-xs font-semibold">Additional Notes (Optional)</Label>
                  <textarea
                    id="req-notes"
                    rows={3}
                    placeholder="Any specific landmarks, streets, or zone boundary details..."
                    value={newCartierNotes}
                    onChange={(e) => setNewCartierNotes(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRequestCartierOpen(false)}
                    disabled={isSubmittingRequest}
                    className="h-8 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSendCartierRequest()}
                    disabled={isSubmittingRequest || !newCartierName.trim()}
                    className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    {isSubmittingRequest && <Loader2 className="size-3.5 animate-spin" />}
                    Submit Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isDogWalking && (
        <>
          <div className="space-y-2">
            <Label htmlFor="training-field-address" className="text-xs font-semibold">Address</Label>
            <Input
              id="training-field-address"
              type="text"
              placeholder="e.g. 123 Canine Lane, Bucharest"
              value={trainingFieldAddress}
              onChange={(e) => onTrainingFieldAddressChange(e.target.value)}
              className="h-9 bg-background text-xs font-semibold rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="training-field-gbp" className="text-xs font-semibold">Google Business Profile</Label>
            <Input
              id="training-field-gbp"
              type="url"
              placeholder="https://business.google.com/..."
              value={trainingFieldGoogleBusinessProfile}
              onChange={(e) => onGbpChange(e.target.value)}
              className="h-9 bg-background text-xs font-semibold rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="training-field-maps" className="text-xs font-semibold">Google Maps Link</Label>
            <Input
              id="training-field-maps"
              type="url"
              placeholder="https://maps.google.com/..."
              value={trainingFieldGoogleMapsLink}
              onChange={(e) => onMapsChange(e.target.value)}
              className="h-9 bg-background text-xs font-semibold rounded-lg"
            />
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      {layout === "tabbed" && (
        <>
          <div className="space-y-4">{locationInputs}</div>
          {(!hideDedicatedField || !hideParking) && <div className="h-px bg-border/60" />}
        </>
      )}

      {!isBoarding && !hideDedicatedField && (
        <>
          <BooleanToggleField
            label="Dedicated Training Field"
            description="Does the class run on a fully closed, dedicated training field?"
            checked={dedicatedField}
            onChange={onDedicatedFieldChange}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Training Field Description</Label>
                <WysiwygEditor
                  value={trainingFieldDescription}
                  onChange={onTrainingFieldDescriptionChange}
                  placeholder="Explain field attributes, size, safety fences, etc."
                />
              </div>
              {layout === "flat" && locationInputs}
            </div>
          </BooleanToggleField>

          {!hideParking && <div className="h-px bg-border/60" />}
        </>
      )}

      {!hideParking && (
        <BooleanToggleField
          label={isBoarding ? "Parking" : "Dedicated Parking"}
          description="Is parking available on site or nearby?"
          checked={parking}
          onChange={onParkingChange}
        >
          <WysiwygEditor
            value={parkingDescription}
            onChange={onParkingDescriptionChange}
            placeholder="Details about parking capacity, location, fee..."
          />
        </BooleanToggleField>
      )}
    </div>
  );
}

// ============================================================
// PricingSection — Pricing tier builder
// ============================================================

interface PricingSectionProps {
  itemNoun: string;
  isBoarding: boolean;
  isGrooming: boolean;
  pricings: CoursePricingItem[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof CoursePricingItem, value: string) => void;
  onRemove: (index: number) => void;
  /**
   * compact=true uses the sidebar/column-2 visual style:
   * smaller heading, tighter padding, and stacked fields (no 3-col grid).
   */
  compact?: boolean;
}

/**
 * PricingSection — Pricing tier builder.
 * Renders with a full card and "Pricing Structure" heading when compact=false (tabbed layout).
 * Renders with a smaller "Pricing Configuration" heading and tighter layout when compact=true (flat sidebar).
 */
function PricingSection({
  itemNoun,
  isBoarding,
  isGrooming,
  pricings,
  onAdd,
  onUpdate,
  onRemove,
  compact = false,
}: PricingSectionProps) {
  const isItemBoarding = isBoarding || itemNoun === "Boarding service";
  const isItemGrooming = isGrooming || itemNoun === "Grooming service";

  const priceTypeOptions = useMemo(
    () =>
      isItemBoarding
        ? [
            { value: "night", label: "Per Night" },
            { value: "day", label: "Per Day" },
            { value: "half_day", label: "Per Half Day" },
            { value: "month", label: "Per Month" },
            { value: "service", label: "Per Boarding service" },
          ]
        : isItemGrooming
        ? [
            { value: "service", label: "Per Grooming service" },
            { value: "session", label: "Per Session" },
            { value: "hour", label: "Per Hour" },
          ]
        : [
            { value: "course", label: `Per ${itemNoun}` },
            { value: "month", label: "Per Month" },
            { value: "session", label: "Per Session" },
            { value: "hour", label: "Per Hour" },
            { value: "day", label: "Per Day" },
          ],
    [itemNoun, isItemBoarding, isItemGrooming]
  );

  return (
    <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5">
      {compact ? (
        <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90">
            Pricing Configuration
          </h3>
          <p className="text-xs text-muted-foreground">Specify one or multiple pricing tiers.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
          <h3 className="text-base font-bold text-foreground">Pricing Structure</h3>
          <p className="text-xs text-muted-foreground">
            Configure one or more pricing options (e.g. per course, per month, per session) for this{" "}
            {itemNoun.toLowerCase()}.
          </p>
        </div>
      )}

      <div className="space-y-4" data-testid="pricing-tiers-list">
        {pricings.map((tier, index) => (
          <div
            key={index}
            className={`${compact ? "p-3.5" : "p-4"} rounded-xl border border-border bg-muted/10 space-y-3 relative group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Price Option #{index + 1}
              </span>
              {pricings.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  className={`${compact ? "size-6" : "size-7"} text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors`}
                  title="Remove Price Option"
                >
                  <Trash2 className={compact ? "size-3" : "size-3.5"} />
                </Button>
              )}
            </div>

            <div className={compact ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-3 gap-3"}>
              <div className="space-y-1">
                <Label htmlFor={`course-price-${index}`} className="text-xs font-semibold">
                  Price Amount
                </Label>
                <Input
                  id={`course-price-${index}`}
                  type="text"
                  placeholder="e.g. $150 or 500 RON"
                  value={tier.amount}
                  onChange={(e) => onUpdate(index, "amount", e.target.value)}
                  className={compact ? "bg-background text-sm font-semibold" : "h-9 bg-background text-xs font-semibold rounded-lg"}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`course-price-type-${index}`} className="text-xs font-semibold">
                  Billing Frequency
                </Label>
                <CustomSelect
                  id={`course-price-type-${index}`}
                  value={tier.type}
                  onChange={(val) => onUpdate(index, "type", val)}
                  options={priceTypeOptions}
                  className={compact ? undefined : "h-9 text-xs font-semibold"}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`course-price-label-${index}`} className="text-xs font-semibold">
                  Label / Title (Optional)
                </Label>
                <Input
                  id={`course-price-label-${index}`}
                  type="text"
                  placeholder={compact ? "e.g. Basic, Drop-in" : "e.g. Basic, Drop-in Pass"}
                  value={tier.label || ""}
                  onChange={(e) => onUpdate(index, "label", e.target.value)}
                  className={compact ? "bg-background text-xs" : "h-9 bg-background text-xs font-semibold rounded-lg"}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className={`w-full font-bold text-xs ${compact ? "py-3" : "py-4"} rounded-xl border-dashed border-2 border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200`}
        >
          <Plus className="size-3.5 mr-1.5" />
          Add Price Tier
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// FaqSection — FAQ Q&A builder
// ============================================================

interface FaqSectionProps {
  itemNoun: string;
  faqs: Array<{ question: string; answer: string }>;
  onAdd: () => void;
  onUpdate: (index: number, key: "question" | "answer", value: string) => void;
  onRemove: (index: number) => void;
  /**
   * compact=true renders as an inline inline section without a card wrapper,
   * used in the flat two-column layout's Column 1.
   */
  compact?: boolean;
}

/**
 * FaqSection — FAQ builder shared between the tabbed (card wrapper) and flat (inline) layouts.
 */
function FaqSection({ itemNoun, faqs, onAdd, onUpdate, onRemove, compact = false }: FaqSectionProps) {
  const faqItems = (
    <div className="space-y-3">
      {faqs.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-border rounded-xl text-xs text-muted-foreground bg-muted/5">
          No FAQs added yet. Click &quot;Add FAQ Item&quot; below to start.
        </div>
      ) : (
        <div className="space-y-3" data-testid="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  FAQ Item #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Remove FAQ"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor={`faq-q-${index}`} className="text-xs font-semibold">Question</Label>
                  <Input
                    id={`faq-q-${index}`}
                    type="text"
                    placeholder="e.g. Is there a vaccination requirement?"
                    value={faq.question}
                    onChange={(e) => onUpdate(index, "question", e.target.value)}
                    className="bg-background h-8 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Answer</Label>
                  <WysiwygEditor
                    value={faq.answer}
                    onChange={(val) => onUpdate(index, "answer", val)}
                    placeholder="e.g. Yes, all dogs must have up-to-date DHPP and Rabies vaccines."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="w-full font-bold text-xs py-5 rounded-xl border-dashed border-2 border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
      >
        <Plus className="size-3.5 mr-1.5" />
        Add FAQ Item
      </Button>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-bold">Frequently Asked Questions (FAQ)</Label>
          <p className="text-xs text-muted-foreground">
            Add Q&amp;A pairs for clients regarding this {itemNoun.toLowerCase()}.
          </p>
        </div>
        {faqItems}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
        <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
          <h3 className="text-base font-bold text-foreground">Frequently Asked Questions (FAQ)</h3>
          <p className="text-xs text-muted-foreground">
            Add Q&amp;A pairs for clients regarding rules, gear requirements, and participation for this{" "}
            {itemNoun.toLowerCase()}.
          </p>
        </div>
        {faqItems}
      </div>
    </div>
  );
}

// ============================================================
// TrainerAttributesCard — Certified trainer toggle + experience description
// ============================================================

interface TrainerAttributesCardProps {
  itemNoun: string;
  /** When true, renders without a card wrapper (used in the flat layout's existing card). */
  bare?: boolean;
  certifiedTrainer: boolean;
  onCertifiedTrainerChange: (v: boolean) => void;
  certifierName: string;
  onCertifierNameChange: (v: string) => void;
  trainerExperienceDescription: string;
  onTrainerExperienceDescriptionChange: (v: string) => void;
}

/**
 * TrainerAttributesCard — Renders the Certified Dog Trainer toggle and trainer
 * experience description fields.
 * Used in the tabbed layout's General tab and the flat layout's Trainer & Facility
 * Attributes card.
 *
 * @param props.bare - When true, omits the outer card wrapper so the caller can
 *   embed the content inside an existing card element.
 */
function TrainerAttributesCard({
  itemNoun,
  bare = false,
  certifiedTrainer,
  onCertifiedTrainerChange,
  certifierName,
  onCertifierNameChange,
  trainerExperienceDescription,
  onTrainerExperienceDescriptionChange,
}: TrainerAttributesCardProps) {
  const content = (
    <>
      <BooleanToggleField
        label="Certified Dog Trainer"
        description={`Enable if this ${itemNoun.toLowerCase()} is coached by an officially certified trainer.`}
        checked={certifiedTrainer}
        onChange={onCertifiedTrainerChange}
      >
        <div className="space-y-2">
          <Label htmlFor="certifier-name" className="text-xs font-semibold">Certifier Name</Label>
          <Input
            id="certifier-name"
            type="text"
            placeholder="Name of certifying institution/body"
            value={certifierName}
            onChange={(e) => onCertifierNameChange(e.target.value)}
            className="h-9 bg-background text-xs font-semibold rounded-lg"
          />
        </div>
      </BooleanToggleField>

      <div className="h-px bg-border/40" />

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Experience Description</Label>
        <WysiwygEditor
          value={trainerExperienceDescription}
          onChange={onTrainerExperienceDescriptionChange}
          placeholder="Describe trainer background, qualifications, experience, accomplishments..."
        />
      </div>
    </>
  );

  if (bare) return <>{content}</>;

  return (
    <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
        Trainer Attributes
      </h3>
      {content}
    </div>
  );
}

// ============================================================
// ScheduleTabContent — Full schedule tab: weekly grid + closed periods + special openings
// ============================================================

interface ScheduleTabContentProps {
  isDogSport: boolean;
  scheduleOverlapError: string | null;
  weeklySchedule: DayScheduleItem[];
  onUpdateDaySchedule: (dayKey: DayKey, field: keyof DayScheduleItem, value: any) => void;
  onCopyMonToWorkweek: () => void;
  onCopyMonToAll: () => void;
  closedPeriods: ClosedPeriodItem[];
  onAddClosedPeriod: () => void;
  onUpdateClosedPeriod: (index: number, field: keyof ClosedPeriodItem, value: string) => void;
  onRemoveClosedPeriod: (index: number) => void;
  specialOpenings: SpecialOpeningItem[];
  onAddSpecialOpening: () => void;
  onUpdateSpecialOpening: (index: number, field: keyof SpecialOpeningItem, value: string) => void;
  onRemoveSpecialOpening: (index: number) => void;
}

/**
 * ScheduleTabContent — Full schedule editor used in the "Schedule" tab (tabbed layout).
 * Contains: weekly day schedule grid, closed periods builder, and special openings builder.
 */
function ScheduleTabContent({
  isDogSport,
  scheduleOverlapError,
  weeklySchedule,
  onUpdateDaySchedule,
  onCopyMonToWorkweek,
  onCopyMonToAll,
  closedPeriods,
  onAddClosedPeriod,
  onUpdateClosedPeriod,
  onRemoveClosedPeriod,
  specialOpenings,
  onAddSpecialOpening,
  onUpdateSpecialOpening,
  onRemoveSpecialOpening,
}: ScheduleTabContentProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {scheduleOverlapError && (
        <div
          data-testid="schedule-overlap-notification"
          className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-3 shadow-sm animate-in fade-in duration-200"
        >
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider">Date Overlap Conflict Notification</span>
            <span className="text-xs font-semibold">{scheduleOverlapError}</span>
          </div>
        </div>
      )}

      <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
        <DayScheduleGrid
          weeklySchedule={weeklySchedule}
          useSportLabels={isDogSport}
          onUpdate={onUpdateDaySchedule}
          onCopyMonToWorkweek={onCopyMonToWorkweek}
          onCopyMonToAll={onCopyMonToAll}
        />

        {/* Closed Periods & Special Closures */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          {scheduleOverlapError && (
            <div
              data-testid="schedule-overlap-notification-section"
              className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-3 shadow-sm animate-in fade-in duration-200"
            >
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider">Date Overlap Conflict Notification</span>
                <span className="text-xs font-semibold">{scheduleOverlapError}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label className="text-base font-bold text-foreground">Closed Periods &amp; Special Closures</Label>
            <p className="text-xs text-muted-foreground">
              Specify vacation dates, seasonal breaks, or holiday closure periods when your organization is closed.
            </p>
          </div>

          <div className="space-y-3" data-testid="closed-periods-list">
            {closedPeriods.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground bg-muted/5">
                No special closed periods specified. Click &quot;Add Closed Period&quot; below to add vacation dates or holiday breaks.
              </div>
            ) : (
              <div className="space-y-3">
                {closedPeriods.map((period, index) => (
                  <div key={index} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Closed Period #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveClosedPeriod(index)}
                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Remove Closed Period"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`closed-period-title-${index}`} className="text-xs font-semibold">Closure Reason / Title</Label>
                          <Input
                            id={`closed-period-title-${index}`}
                            type="text"
                            placeholder="e.g. Summer Vacation, Christmas Break"
                            value={period.title}
                            onChange={(e) => onUpdateClosedPeriod(index, "title", e.target.value)}
                            className="bg-background text-xs font-semibold h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`closed-period-start-${index}`} className="text-xs font-semibold">Start Date</Label>
                          <DatePickerInput
                            id={`closed-period-start-${index}`}
                            value={period.startDate}
                            onChange={(val) => onUpdateClosedPeriod(index, "startDate", val)}
                            placeholder="DD.MM.YYYY"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`closed-period-end-${index}`} className="text-xs font-semibold">End Date</Label>
                          <DatePickerInput
                            id={`closed-period-end-${index}`}
                            value={period.endDate}
                            onChange={(val) => onUpdateClosedPeriod(index, "endDate", val)}
                            placeholder="DD.MM.YYYY"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`closed-period-note-${index}`} className="text-[11px] font-medium text-muted-foreground">Note / Closure Remarks (Optional)</Label>
                        <Input
                          id={`closed-period-note-${index}`}
                          type="text"
                          placeholder="e.g. Facility closed for annual renovation and staff training..."
                          value={period.note || ""}
                          onChange={(e) => onUpdateClosedPeriod(index, "note", e.target.value)}
                          className="bg-background text-xs h-9 rounded-lg border-input/80 focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddClosedPeriod}
            className="w-full font-bold text-xs py-4 rounded-xl border-dashed border-2 border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
          >
            <Plus className="size-3.5 mr-1.5" />
            Add Closed Period
          </Button>
        </div>

        {/* Special Openings & Extra Working Dates */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex flex-col gap-1">
            <Label className="text-base font-bold text-foreground">Special Openings &amp; Extra Working Dates</Label>
            <p className="text-xs text-muted-foreground">
              Specify special dates or holiday sessions when your organization IS open (e.g. Christmas special session, weekend workshop).
            </p>
          </div>

          <div className="space-y-3" data-testid="special-openings-list">
            {specialOpenings.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground bg-muted/5">
                No special opening dates specified. Click &quot;Add Special Opening&quot; below to add special open dates or extra working hours.
              </div>
            ) : (
              <div className="space-y-3">
                {specialOpenings.map((opening, index) => (
                  <div key={index} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Special Opening #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveSpecialOpening(index)}
                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Remove Special Opening"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`special-opening-title-${index}`} className="text-xs font-semibold">Opening Reason / Event Title</Label>
                          <Input
                            id={`special-opening-title-${index}`}
                            type="text"
                            placeholder="e.g. Christmas Special Session"
                            value={opening.title}
                            onChange={(e) => onUpdateSpecialOpening(index, "title", e.target.value)}
                            className="bg-background text-xs font-semibold h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`special-opening-start-${index}`} className="text-xs font-semibold">Start Date</Label>
                          <DatePickerInput
                            id={`special-opening-start-${index}`}
                            value={opening.startDate}
                            onChange={(val) => onUpdateSpecialOpening(index, "startDate", val)}
                            placeholder="DD.MM.YYYY"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`special-opening-end-${index}`} className="text-xs font-semibold">End Date</Label>
                          <DatePickerInput
                            id={`special-opening-end-${index}`}
                            value={opening.endDate}
                            onChange={(val) => onUpdateSpecialOpening(index, "endDate", val)}
                            placeholder="DD.MM.YYYY"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`special-opening-checkin-${index}`} className="text-xs font-semibold">Check-in Time</Label>
                          <TimePickerSelect
                            id={`special-opening-checkin-${index}`}
                            value={opening.checkin || "09:00"}
                            onChange={(val) => onUpdateSpecialOpening(index, "checkin", val)}
                            options={getCheckinOptions()}
                            placeholder="09:00"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`special-opening-checkout-${index}`} className="text-xs font-semibold">Check-out Time</Label>
                          <TimePickerSelect
                            id={`special-opening-checkout-${index}`}
                            value={opening.checkout || "17:00"}
                            onChange={(val) => onUpdateSpecialOpening(index, "checkout", val)}
                            options={getCheckoutOptions(opening.checkin || "09:00")}
                            placeholder="17:00"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`special-opening-note-${index}`} className="text-[11px] font-medium text-muted-foreground">Note / Opening Remarks (Optional)</Label>
                        <Input
                          id={`special-opening-note-${index}`}
                          type="text"
                          placeholder="e.g. Special Christmas session open to all breeds..."
                          value={opening.note || ""}
                          onChange={(e) => onUpdateSpecialOpening(index, "note", e.target.value)}
                          className="bg-background text-xs h-9 rounded-lg border-input/80 focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddSpecialOpening}
            className="w-full font-bold text-xs py-4 rounded-xl border-dashed border-2 border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
          >
            <Plus className="size-3.5 mr-1.5" />
            Add Special Opening
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CareAmenitiesSection — Boarding-only care toggles
// ============================================================

interface CareAmenitiesSectionProps {
  isDogWalking?: boolean;
  dailyWalks: number;
  onDailyWalksChange: (v: number) => void;
  medicationAdministration: boolean;
  onMedicationAdministrationChange: (v: boolean) => void;
  medicationAdministrationDetails: string;
  onMedicationAdministrationDetailsChange: (v: string) => void;
  surveillance247: boolean;
  onSurveillance247Change: (v: boolean) => void;
  surveillance247Details: string;
  onSurveillance247DetailsChange: (v: string) => void;
  webCam: boolean;
  onWebCamChange: (v: boolean) => void;
  webCamDetails: string;
  onWebCamDetailsChange: (v: string) => void;
  ownerCommunication: boolean;
  onOwnerCommunicationChange: (v: boolean) => void;
  ownerCommunicationDetails: string;
  onOwnerCommunicationDetailsChange: (v: string) => void;
  personalizedMealPlan: boolean;
  onPersonalizedMealPlanChange: (v: boolean) => void;
  personalizedMealPlanDetails: string;
  onPersonalizedMealPlanDetailsChange: (v: string) => void;
}

/**
 * CareAmenitiesSection — Renders boarding-specific care amenity toggles:
 * daily walks, medication administration, 24/7 surveillance, webcam access, owner communication,
 * and personalized meal plan.
 *
 * Used in the tabbed layout's "Care & facilities" tab and the flat layout's
 * "Care & Facilities" card.
 */
function CareAmenitiesSection({
  isDogWalking = false,
  dailyWalks,
  onDailyWalksChange,
  medicationAdministration,
  onMedicationAdministrationChange,
  medicationAdministrationDetails,
  onMedicationAdministrationDetailsChange,
  surveillance247,
  onSurveillance247Change,
  surveillance247Details,
  onSurveillance247DetailsChange,
  webCam,
  onWebCamChange,
  webCamDetails,
  onWebCamDetailsChange,
  ownerCommunication,
  onOwnerCommunicationChange,
  ownerCommunicationDetails,
  onOwnerCommunicationDetailsChange,
  personalizedMealPlan,
  onPersonalizedMealPlanChange,
  personalizedMealPlanDetails,
  onPersonalizedMealPlanDetailsChange,
}: CareAmenitiesSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="daily-walks" className="text-xs font-semibold">Daily Walks</Label>
        <CustomSelect
          id="daily-walks"
          value={dailyWalks}
          onChange={(val) => onDailyWalksChange(parseInt(val, 10))}
          options={[
            { value: 1, label: "1 walk per day" },
            { value: 2, label: "2 walks per day" },
            { value: 3, label: "3 walks per day" },
            { value: 4, label: "4 walks per day" },
          ]}
        />
      </div>

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label={isDogWalking ? "Key Access & Home Entry Protocol" : "Medication Administration"}
        description={
          isDogWalking
            ? "Specify home entry instructions (lockbox codes, key pickup, concierge, alarm codes)."
            : "Can you administer medication or medical care?"
        }
        checked={medicationAdministration}
        onChange={onMedicationAdministrationChange}
      >
        <div className="space-y-2">
          <Label>
            {isDogWalking ? "Home Access & Key Handling Instructions" : "Medication Administration Instructions"}
          </Label>
          <WysiwygEditor
            value={medicationAdministrationDetails}
            onChange={onMedicationAdministrationDetailsChange}
            placeholder={
              isDogWalking
                ? "e.g. Lockbox code 1234 on side gate, concierge key handoff, alarm disarm code 5678, key drop-off in mailbox"
                : "e.g. oral tablets, injections, schedule limitations"
            }
          />
        </div>
      </BooleanToggleField>

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label="24/7 Surveillance"
        description="Do you provide 24/7 continuous staff presence and surveillance for boarded pets?"
        checked={surveillance247}
        onChange={onSurveillance247Change}
      >
        <div className="space-y-2">
          <Label>24/7 Surveillance Details</Label>
          <WysiwygEditor
            value={surveillance247Details}
            onChange={onSurveillance247DetailsChange}
            placeholder="e.g. 24/7 on-site staff supervision, live CCTV camera monitoring, night security protocol"
          />
        </div>
      </BooleanToggleField>

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label={isDogWalking ? "Post-Walk Feeding & Treat Customization" : "Personalized Meal Plan"}
        description={
          isDogWalking
            ? "Can you feed or provide custom treats to the dog after the walk?"
            : "Can you provide a customized meal plan or accommodate special diets?"
        }
        checked={personalizedMealPlan}
        onChange={onPersonalizedMealPlanChange}
      >
        <div className="space-y-2">
          <Label>{isDogWalking ? "Post-Walk Feeding Instructions" : "Meal Plan Details"}</Label>
          <WysiwygEditor
            value={personalizedMealPlanDetails}
            onChange={onPersonalizedMealPlanDetailsChange}
            placeholder={
              isDogWalking
                ? "e.g. Post-walk kibble feeding, custom treat administration, dietary restriction adherence"
                : "e.g. BARF diet support, raw food storage, customized portions"
            }
          />
        </div>
      </BooleanToggleField>

      {!isDogWalking && (
        <>
          <div className="h-px bg-border/60" />

          <BooleanToggleField
            label="Webcam"
            description="Do you offer live video/webcam access to owners?"
            checked={webCam}
            onChange={onWebCamChange}
          >
            <div className="space-y-2">
              <Label>Webcam Access Instructions</Label>
              <WysiwygEditor
                value={webCamDetails}
                onChange={onWebCamDetailsChange}
                placeholder="e.g. live stream link provided upon check-in, 24/7 access"
              />
            </div>
          </BooleanToggleField>
        </>
      )}

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label={isDogWalking ? "GPS Route Tracking & Post-Walk Reports" : "Communication with the Owner"}
        description={
          isDogWalking
            ? "Will you provide live GPS route tracking, walk photos, potty status, and post-walk summaries?"
            : "Will you provide regular photo/video updates to the owner?"
        }
        checked={ownerCommunication}
        onChange={onOwnerCommunicationChange}
      >
        <div className="space-y-2">
          <Label>{isDogWalking ? "GPS & Walk Report Details" : "Communication Updates Details"}</Label>
          <WysiwygEditor
            value={ownerCommunicationDetails}
            onChange={onOwnerCommunicationDetailsChange}
            placeholder={
              isDogWalking
                ? "e.g. Photo & video update sent after walk, potty status tracking (pee/poop), fresh water refill, paw wipe on rainy days"
                : "e.g. daily photos via WhatsApp, weekly email progress"
            }
          />
        </div>
      </BooleanToggleField>
    </>
  );
}

// ============================================================
// CourseForm — Main component
// ============================================================

/**
 * Props for the CourseForm component.
 * @interface CourseFormProps
 * @property {string} organizationId - The active organization's database ID.
 * @property {string} serviceId - The parent service's database ID.
 * @property {string} itemNoun - Singular human-readable label of the sub-service (e.g. Course, Boarding Option).
 * @property {Course} [initialCourse] - Optional initial Course data for edit/update mode.
 * @property {() => void} onCancel - Callback triggered when cancelling/going back.
 * @property {() => void} onSubmitSuccess - Callback triggered after successful creation or update action.
 * @property {string} [serviceSlug] - Slug of the parent service. Used to conditionally render boarding-only fields
 *   (Check-in / Check-out pickers) and hide age-limits toggle for non-training services.
 * @property {string} [orgCity] - Optional city name of the organization, used for neighborhood coverage zone selection in Dog Walking mode.
 */
interface CourseFormProps {
  organizationId: string;
  serviceId: string;
  itemNoun: string;
  initialCourse?: Course;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  serviceSlug?: string;
  orgCity?: string;
}

/**
 * CourseForm Component
 *
 * Form rendering panel for creating or editing sub-service items (Training Courses, Dog Sports, or Boarding rates).
 * Dog Sport and Dog Training services render a tabbed layout (General, Terms, Pricing, Schedule, Coverage zones, FAQ).
 * All other services (Boarding, Grooming, base Training) render a two-column flat layout.
 *
 * Submits data via `createCourseAction` or `updateCourseAction` Server Actions.
 *
 * @param {CourseFormProps} props - The component props.
 * @returns {React.ReactElement} The course/boarding configuration form component.
 */
export function CourseForm({
  organizationId,
  serviceId,
  itemNoun,
  initialCourse,
  onCancel,
  onSubmitSuccess,
  serviceSlug,
  orgCity,
}: CourseFormProps) {
  const isEdit = !!initialCourse?.id;
  const isBoarding = serviceSlug === "dog-boarding" || itemNoun === "Boarding service";
  const isGrooming = serviceSlug === "dog-grooming" || itemNoun === "Grooming service";
  const isDogSport = serviceSlug === "sport-dog-training" || itemNoun === "Dog Sport";
  const isDogTraining = serviceSlug === "dog-training" || itemNoun === "Course";
  const isDogWalking = serviceSlug === "dog-walking" || itemNoun === "Walking service";
  const isTabbedLayout = isDogSport || isDogTraining || isBoarding || isDogWalking;
  const cityName = orgCity || "Cluj-Napoca";
  const cartiereList = getCartiereForCity(cityName);
  const [activeTab, setActiveTab] = useState<"general" | "terms" | "faq" | "pricing" | "schedule" | "location" | "others">("general");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialCourse?.name || "");
  const [certifiedTrainer, setCertifiedTrainer] = useState(initialCourse?.certifiedTrainer || false);
  const [certifierName, setCertifierName] = useState(initialCourse?.certifierName || "");
  const [trainerExperienceDescription, setTrainerExperienceDescription] = useState(initialCourse?.trainerExperienceDescription || "");
  const [ageLimitsEnabled, setAgeLimitsEnabled] = useState(initialCourse?.ageLimitsEnabled || false);
  const [selectedAgeLimits, setSelectedAgeLimits] = useState<string[]>(
    initialCourse?.ageLimits
      ? initialCourse.ageLimits.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );

  const handleToggleAgeLimit = (limit: string) => {
    setSelectedAgeLimits((prev) =>
      prev.includes(limit) ? prev.filter((a) => a !== limit) : [...prev, limit]
    );
  };
  const [dedicatedField, setDedicatedField] = useState(initialCourse?.dedicatedField || false);
  const [trainingFieldDescription, setTrainingFieldDescription] = useState(initialCourse?.trainingFieldDescription || "");
  const [trainingFieldAddress, setTrainingFieldAddress] = useState(initialCourse?.trainingFieldAddress || "");
  const [trainingFieldGoogleBusinessProfile, setTrainingFieldGoogleBusinessProfile] = useState(initialCourse?.trainingFieldGoogleBusinessProfile || "");
  const [trainingFieldGoogleMapsLink, setTrainingFieldGoogleMapsLink] = useState(initialCourse?.trainingFieldGoogleMapsLink || "");
  const [parking, setParking] = useState(initialCourse?.parking || false);
  const [parkingDescription, setParkingDescription] = useState(initialCourse?.parkingDescription || "");
  const [details, setDetails] = useState(initialCourse?.details || "");
  const [termsOfParticipation, setTermsOfParticipation] = useState(initialCourse?.termsOfParticipation || "");

  const defaultPriceType = isBoarding ? "night" : isGrooming ? "service" : "course";
  const [pricings, setPricings] = useState<CoursePricingItem[]>(() =>
    parseCoursePricings(initialCourse?.price, initialCourse?.priceType, defaultPriceType)
  );
  const [medicationAdministration, setMedicationAdministration] = useState(initialCourse?.medicationAdministration || false);
  const [medicationAdministrationDetails, setMedicationAdministrationDetails] = useState(initialCourse?.medicationAdministrationDetails || "");
  const [surveillance247, setSurveillance247] = useState(initialCourse?.surveillance247 || false);
  const [surveillance247Details, setSurveillance247Details] = useState(initialCourse?.surveillance247Details || "");
  const [webCam, setWebCam] = useState(initialCourse?.webCam || false);
  const [webCamDetails, setWebCamDetails] = useState(initialCourse?.webCamDetails || "");
  const [dailyWalks, setDailyWalks] = useState(initialCourse?.dailyWalks || 1);
  const [ownerCommunication, setOwnerCommunication] = useState(initialCourse?.ownerCommunication || false);
  const [ownerCommunicationDetails, setOwnerCommunicationDetails] = useState(initialCourse?.ownerCommunicationDetails || "");
  const [personalizedMealPlan, setPersonalizedMealPlan] = useState(initialCourse?.personalizedMealPlan || false);
  const [personalizedMealPlanDetails, setPersonalizedMealPlanDetails] = useState(initialCourse?.personalizedMealPlanDetails || "");

  // Boarding check-in and check-out times in 24-hour (hh:mm) format (Work week & Weekend)
  const [checkin, setCheckin] = useState(initialCourse?.checkin || "08:00");
  const [checkout, setCheckout] = useState(initialCourse?.checkout || "18:00");
  const [checkinWeekend, setCheckinWeekend] = useState(initialCourse?.checkinWeekend || "09:00");
  const [checkoutWeekend, setCheckoutWeekend] = useState(initialCourse?.checkoutWeekend || "16:00");

  // 7-Day Day-Specific Schedule state
  const [weeklySchedule, setWeeklySchedule] = useState<DayScheduleItem[]>(() =>
    getInitialWeeklySchedule(initialCourse)
  );

  // Closed Periods / Special Closures state
  const [closedPeriods, setClosedPeriods] = useState<ClosedPeriodItem[]>(() =>
    parseClosedPeriods(initialCourse?.schedule)
  );

  // Cartiere Coverage Zones state (Primary & Secondary for Dog Walking)
  const [coverageData, setCoverageData] = useState<CoverageZonesData>(() =>
    parseCoverageZones(initialCourse?.coverageZones)
  );

  const handlePrimaryCartiereChange = (zones: string[]) => {
    setCoverageData((prev) => ({ ...prev, primary: zones }));
  };

  const handleAddSecondaryZone = () => {
    setCoverageData((prev) => ({
      ...prev,
      secondary: [...prev.secondary, { city: "", cartiere: [] }],
    }));
  };

  const handleRemoveSecondaryZone = (index: number) => {
    setCoverageData((prev) => ({
      ...prev,
      secondary: prev.secondary.filter((_, i) => i !== index),
    }));
  };

  const handleSecondaryCityChange = (index: number, newCity: string) => {
    setCoverageData((prev) => {
      const nextSec = [...prev.secondary];
      nextSec[index] = { city: newCity, cartiere: [] };
      return { ...prev, secondary: nextSec };
    });
  };

  const handleSecondaryCartiereChange = (index: number, cartiere: string[]) => {
    setCoverageData((prev) => {
      const nextSec = [...prev.secondary];
      nextSec[index] = { ...nextSec[index], cartiere };
      return { ...prev, secondary: nextSec };
    });
  };

  // Special Openings / Extra Working Dates state
  const [specialOpenings, setSpecialOpenings] = useState<SpecialOpeningItem[]>(() =>
    parseSpecialOpenings(initialCourse?.schedule)
  );

  // FAQ Builder state
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(() => {
    if (initialCourse?.faq) {
      try {
        const parsed = JSON.parse(initialCourse.faq);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse FAQ initial value:", e);
      }
    }
    return [];
  });

  // Live schedule overlap conflict calculation
  const scheduleOverlapError = useMemo(() => {
    const activeClosed = closedPeriods.filter(
      (item) => item.title.trim() !== "" || item.startDate.trim() !== "" || item.endDate.trim() !== ""
    );
    const activeOpen = specialOpenings.filter(
      (item) => item.title.trim() !== "" || item.startDate.trim() !== "" || item.endDate.trim() !== ""
    );

    for (const closed of activeClosed) {
      const cStart = getComparableTimestamp(closed.startDate);
      const cEnd = getComparableTimestamp(closed.endDate);
      if (cStart === null || cEnd === null) continue;

      for (const openItem of activeOpen) {
        const oStart = getComparableTimestamp(openItem.startDate);
        const oEnd = getComparableTimestamp(openItem.endDate);
        if (oStart === null || oEnd === null) continue;

        if (cStart <= oEnd && oStart <= cEnd) {
          return `Closed period "${closed.title}" (${closed.startDate} – ${closed.endDate}) overlaps with special opening "${openItem.title}" (${openItem.startDate} – ${openItem.endDate}).`;
        }
      }
    }
    return null;
  }, [closedPeriods, specialOpenings]);

  // Stable initial value snapshot — captured once at mount, never changes.
  // Using useRef avoids adding initialCourse to the isDirty dependency array
  // while still allowing clean ESLint exhaustive-deps compliance.
  const iv = useRef({
    name: initialCourse?.name || "",
    certifiedTrainer: initialCourse?.certifiedTrainer || false,
    certifierName: initialCourse?.certifierName || "",
    trainerExperienceDescription: initialCourse?.trainerExperienceDescription || "",
    ageLimitsEnabled: initialCourse?.ageLimitsEnabled || false,
    ageLimits: initialCourse?.ageLimits || "",
    dedicatedField: initialCourse?.dedicatedField || false,
    trainingFieldDescription: initialCourse?.trainingFieldDescription || "",
    trainingFieldAddress: initialCourse?.trainingFieldAddress || "",
    trainingFieldGbp: initialCourse?.trainingFieldGoogleBusinessProfile || "",
    trainingFieldMaps: initialCourse?.trainingFieldGoogleMapsLink || "",
    parking: initialCourse?.parking || false,
    parkingDescription: initialCourse?.parkingDescription || "",
    details: initialCourse?.details || "",
    terms: initialCourse?.termsOfParticipation || "",
    pricings: JSON.stringify(parseCoursePricings(initialCourse?.price, initialCourse?.priceType, defaultPriceType)),
    closedPeriods: JSON.stringify(parseClosedPeriods(initialCourse?.schedule)),
    specialOpenings: JSON.stringify(parseSpecialOpenings(initialCourse?.schedule)),
    weeklySchedule: JSON.stringify(getInitialWeeklySchedule(initialCourse)),
    faq: (() => {
      if (initialCourse?.faq) {
        try {
          const parsed = JSON.parse(initialCourse.faq);
          if (Array.isArray(parsed)) return JSON.stringify(parsed);
        } catch (e) {}
      }
      return "[]";
    })(),
    medicationAdministration: initialCourse?.medicationAdministration || false,
    medicationAdministrationDetails: initialCourse?.medicationAdministrationDetails || "",
    surveillance247: initialCourse?.surveillance247 || false,
    surveillance247Details: initialCourse?.surveillance247Details || "",
    webCam: initialCourse?.webCam || false,
    webCamDetails: initialCourse?.webCamDetails || "",
    dailyWalks: initialCourse?.dailyWalks || 1,
    ownerCommunication: initialCourse?.ownerCommunication || false,
    ownerCommunicationDetails: initialCourse?.ownerCommunicationDetails || "",
    personalizedMealPlan: initialCourse?.personalizedMealPlan || false,
    personalizedMealPlanDetails: initialCourse?.personalizedMealPlanDetails || "",
    checkin: initialCourse?.checkin || "08:00",
    checkout: initialCourse?.checkout || "18:00",
    checkinWeekend: initialCourse?.checkinWeekend || "09:00",
    checkoutWeekend: initialCourse?.checkoutWeekend || "16:00",
  });

  // Dirty check — memoized for performance; only recomputes when actual state changes.
  const isDirty = useMemo(() => {
    const i = iv.current;
    return (
      name !== i.name ||
      certifiedTrainer !== i.certifiedTrainer ||
      certifierName !== i.certifierName ||
      trainerExperienceDescription !== i.trainerExperienceDescription ||
      ageLimitsEnabled !== i.ageLimitsEnabled ||
      selectedAgeLimits.join(",") !== i.ageLimits ||
      dedicatedField !== i.dedicatedField ||
      trainingFieldDescription !== i.trainingFieldDescription ||
      trainingFieldAddress !== i.trainingFieldAddress ||
      trainingFieldGoogleBusinessProfile !== i.trainingFieldGbp ||
      trainingFieldGoogleMapsLink !== i.trainingFieldMaps ||
      parking !== i.parking ||
      parkingDescription !== i.parkingDescription ||
      details !== i.details ||
      termsOfParticipation !== i.terms ||
      JSON.stringify(pricings) !== i.pricings ||
      JSON.stringify(closedPeriods) !== i.closedPeriods ||
      JSON.stringify(specialOpenings) !== i.specialOpenings ||
      medicationAdministration !== i.medicationAdministration ||
      medicationAdministrationDetails !== i.medicationAdministrationDetails ||
      surveillance247 !== i.surveillance247 ||
      surveillance247Details !== i.surveillance247Details ||
      webCam !== i.webCam ||
      webCamDetails !== i.webCamDetails ||
      dailyWalks !== i.dailyWalks ||
      ownerCommunication !== i.ownerCommunication ||
      ownerCommunicationDetails !== i.ownerCommunicationDetails ||
      personalizedMealPlan !== i.personalizedMealPlan ||
      personalizedMealPlanDetails !== i.personalizedMealPlanDetails ||
      checkin !== i.checkin ||
      checkout !== i.checkout ||
      checkinWeekend !== i.checkinWeekend ||
      checkoutWeekend !== i.checkoutWeekend ||
      JSON.stringify(weeklySchedule) !== i.weeklySchedule ||
      JSON.stringify(faqs) !== i.faq
    );
  }, [
    name, certifiedTrainer, certifierName, trainerExperienceDescription, ageLimitsEnabled, selectedAgeLimits,
    dedicatedField, trainingFieldDescription, trainingFieldAddress,
    trainingFieldGoogleBusinessProfile, trainingFieldGoogleMapsLink,
    parking, parkingDescription, details, termsOfParticipation,
    pricings, closedPeriods, specialOpenings,
    medicationAdministration, medicationAdministrationDetails,
    surveillance247, surveillance247Details,
    webCam, webCamDetails, dailyWalks,
    ownerCommunication, ownerCommunicationDetails,
    personalizedMealPlan, personalizedMealPlanDetails,
    checkin, checkout, checkinWeekend, checkoutWeekend,
    weeklySchedule, faqs,
  ]);

  // Safeguard: Ask before leaving page when there are unsaved changes
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmLeave) return;
    }
    onCancel();
  };

  const handleUpdateDaySchedule = (dayKey: DayKey, field: keyof DayScheduleItem, value: any) => {
    setWeeklySchedule((prev) =>
      prev.map((item) => (item.day === dayKey ? { ...item, [field]: value } : item))
    );
  };

  const handleCopyMonToWorkweek = () => {
    const mon = weeklySchedule.find((item) => item.day === "monday") || weeklySchedule[0];
    setWeeklySchedule((prev) =>
      prev.map((item) =>
        item.day === "saturday" || item.day === "sunday"
          ? item
          : { ...item, checkin: mon.checkin, checkout: mon.checkout, enabled: mon.enabled }
      )
    );
  };

  const handleCopyMonToAll = () => {
    const mon = weeklySchedule.find((item) => item.day === "monday") || weeklySchedule[0];
    setWeeklySchedule((prev) =>
      prev.map((item) => ({ ...item, checkin: mon.checkin, checkout: mon.checkout, enabled: mon.enabled }))
    );
  };

  // Closed Periods Handlers
  const handleAddClosedPeriod = () => {
    setClosedPeriods((prev) => [...prev, { title: "", startDate: "", endDate: "" }]);
  };

  const handleUpdateClosedPeriod = (index: number, field: keyof ClosedPeriodItem, value: string) => {
    setClosedPeriods((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveClosedPeriod = (index: number) => {
    setClosedPeriods((prev) => prev.filter((_, i) => i !== index));
  };

  // Special Openings Handlers
  const handleAddSpecialOpening = () => {
    setSpecialOpenings((prev) => [...prev, { title: "", startDate: "", endDate: "", checkin: "09:00", checkout: "17:00" }]);
  };

  const handleUpdateSpecialOpening = (index: number, field: keyof SpecialOpeningItem, value: string) => {
    setSpecialOpenings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveSpecialOpening = (index: number) => {
    setSpecialOpenings((prev) => prev.filter((_, i) => i !== index));
  };

  // Pricing Tier Handlers
  const handleAddPriceTier = () => {
    setPricings((prev) => [...prev, { amount: "", type: defaultPriceType, label: "" }]);
  };

  const handleUpdatePriceTier = (index: number, field: keyof CoursePricingItem, value: string) => {
    setPricings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemovePriceTier = (index: number) => {
    if (pricings.length <= 1) return;
    setPricings((prev) => prev.filter((_, i) => i !== index));
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleUpdateFaq = (index: number, key: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index][key] = value;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Safety Confirmation Guard State for Item Removals
  interface RemoveConfirmState {
    type: "secondaryZone" | "closedPeriod" | "specialOpening" | "priceTier" | "faq";
    index: number;
    title: string;
    description: string;
  }

  const [removeConfirm, setRemoveConfirm] = useState<RemoveConfirmState | null>(null);

  const requestRemoveSecondaryZone = (index: number) => {
    const secZone = coverageData.secondary[index];
    const cityName = secZone?.city ? ` (${secZone.city})` : "";
    setRemoveConfirm({
      type: "secondaryZone",
      index,
      title: "Remove Secondary Coverage Zone",
      description: `Are you sure you want to remove secondary zone${cityName}? All selected neighborhoods for this city will be removed.`,
    });
  };

  const requestRemoveClosedPeriod = (index: number) => {
    const period = closedPeriods[index];
    const title = period?.title ? ` "${period.title}"` : "";
    setRemoveConfirm({
      type: "closedPeriod",
      index,
      title: "Remove Closed Period",
      description: `Are you sure you want to remove closed period${title}?`,
    });
  };

  const requestRemoveSpecialOpening = (index: number) => {
    const opening = specialOpenings[index];
    const title = opening?.title ? ` "${opening.title}"` : "";
    setRemoveConfirm({
      type: "specialOpening",
      index,
      title: "Remove Special Opening",
      description: `Are you sure you want to remove special opening${title}?`,
    });
  };

  const requestRemovePriceTier = (index: number) => {
    if (pricings.length <= 1) return;
    setRemoveConfirm({
      type: "priceTier",
      index,
      title: "Remove Price Option",
      description: `Are you sure you want to remove Price Option #${index + 1}?`,
    });
  };

  const requestRemoveFaq = (index: number) => {
    const faq = faqs[index];
    const qText = faq?.question ? ` "${faq.question}"` : "";
    setRemoveConfirm({
      type: "faq",
      index,
      title: "Remove FAQ Item",
      description: `Are you sure you want to remove FAQ Item #${index + 1}${qText}?`,
    });
  };

  const confirmRemoveItem = () => {
    if (!removeConfirm) return;
    const { type, index } = removeConfirm;
    if (type === "secondaryZone") {
      handleRemoveSecondaryZone(index);
    } else if (type === "closedPeriod") {
      handleRemoveClosedPeriod(index);
    } else if (type === "specialOpening") {
      handleRemoveSpecialOpening(index);
    } else if (type === "priceTier") {
      handleRemovePriceTier(index);
    } else if (type === "faq") {
      handleRemoveFaq(index);
    }
    setRemoveConfirm(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(`${itemNoun} name is required.`);
      return;
    }

    setError(null);
    const formData = new FormData();
    if (isEdit && initialCourse?.id) {
      formData.append("id", initialCourse.id);
    }
    formData.append("organizationId", organizationId);
    formData.append("serviceId", serviceId);
    formData.append("name", name);
    if (pricings.length === 1 && !pricings[0].label) {
      formData.append("price", pricings[0].amount);
      formData.append("priceType", pricings[0].type || "course");
    } else {
      formData.append("price", JSON.stringify(pricings));
      formData.append("priceType", pricings[0]?.type || "course");
    }
    formData.append("certifiedTrainer", String(certifiedTrainer));
    formData.append("certifierName", certifierName);
    formData.append("trainerExperienceDescription", trainerExperienceDescription);
    formData.append("ageLimitsEnabled", String(ageLimitsEnabled));
    formData.append("ageLimits", selectedAgeLimits.join(","));
    formData.append("dedicatedField", String(dedicatedField));
    formData.append("trainingFieldDescription", trainingFieldDescription);
    formData.append("trainingFieldAddress", trainingFieldAddress);
    formData.append("trainingFieldGoogleBusinessProfile", trainingFieldGoogleBusinessProfile);
    formData.append("trainingFieldGoogleMapsLink", trainingFieldGoogleMapsLink);
    formData.append("parking", String(parking));
    formData.append("parkingDescription", parkingDescription);
    formData.append("details", details);
    formData.append("termsOfParticipation", termsOfParticipation);
    formData.append("medicationAdministration", String(medicationAdministration));
    formData.append("medicationAdministrationDetails", medicationAdministrationDetails);
    formData.append("surveillance247", String(surveillance247));
    formData.append("surveillance247Details", surveillance247Details);
    formData.append("webCam", String(webCam));
    formData.append("webCamDetails", webCamDetails);
    formData.append("dailyWalks", String(dailyWalks));
    formData.append("ownerCommunication", String(ownerCommunication));
    formData.append("ownerCommunicationDetails", ownerCommunicationDetails);
    formData.append("personalizedMealPlan", String(personalizedMealPlan));
    formData.append("personalizedMealPlanDetails", personalizedMealPlanDetails);
    formData.append("coverageZones", serializeCoverageZones(coverageData));

    for (const item of weeklySchedule) {
      if (item.enabled && item.checkin && item.checkout) {
        if (item.checkout <= item.checkin) {
          setError(`Check-out time cannot be before or equal to check-in time for ${item.label}.`);
          return;
        }
      }
    }

    // Filter out empty closed period & special opening entries
    const activeClosedPeriods = closedPeriods.filter(
      (item) => item.title.trim() !== "" || item.startDate.trim() !== "" || item.endDate.trim() !== ""
    );
    for (const item of activeClosedPeriods) {
      if (!item.title.trim() || !item.startDate.trim() || !item.endDate.trim()) {
        setError(`All closed period entries must have a title, start date, and end date.`);
        return;
      }
      const sTs = getComparableTimestamp(item.startDate);
      const eTs = getComparableTimestamp(item.endDate);
      if (sTs === null || eTs === null) {
        setError(`Invalid date in closed period "${item.title}". Please use DD.MM.YYYY format (e.g. 25.12.2026).`);
        return;
      }
      if (eTs < sTs) {
        setError(`Closed period "${item.title}" end date cannot be before start date.`);
        return;
      }
    }

    const activeSpecialOpenings = specialOpenings.filter(
      (item) => item.title.trim() !== "" || item.startDate.trim() !== "" || item.endDate.trim() !== ""
    );
    for (const item of activeSpecialOpenings) {
      if (!item.title.trim() || !item.startDate.trim() || !item.endDate.trim()) {
        setError(`All special opening entries must have a title, start date, and end date.`);
        return;
      }
      const sTs = getComparableTimestamp(item.startDate);
      const eTs = getComparableTimestamp(item.endDate);
      if (sTs === null || eTs === null) {
        setError(`Invalid date in special opening "${item.title}". Please use DD.MM.YYYY format (e.g. 25.12.2026).`);
        return;
      }
      if (eTs < sTs) {
        setError(`Special opening "${item.title}" end date cannot be before start date.`);
        return;
      }
    }

    // Validate closed periods do NOT overlap with special opening periods
    for (const closed of activeClosedPeriods) {
      const cStart = getComparableTimestamp(closed.startDate);
      const cEnd = getComparableTimestamp(closed.endDate);
      if (cStart === null || cEnd === null) continue;

      for (const openItem of activeSpecialOpenings) {
        const oStart = getComparableTimestamp(openItem.startDate);
        const oEnd = getComparableTimestamp(openItem.endDate);
        if (oStart === null || oEnd === null) continue;

        if (cStart <= oEnd && oStart <= cEnd) {
          setError(
            `Closed period "${closed.title}" (${closed.startDate} – ${closed.endDate}) overlaps with special opening "${openItem.title}" (${openItem.startDate} – ${openItem.endDate}).`
          );
          return;
        }
      }
    }

    const mon = weeklySchedule.find((item) => item.day === "monday");
    const sat = weeklySchedule.find((item) => item.day === "saturday");
    formData.append("checkin", mon?.checkin || checkin);
    formData.append("checkout", mon?.checkout || checkout);
    formData.append("checkinWeekend", sat?.checkin || checkinWeekend);
    formData.append("checkoutWeekend", sat?.checkout || checkoutWeekend);
    if (activeClosedPeriods.length > 0 || activeSpecialOpenings.length > 0) {
      formData.append("schedule", JSON.stringify({ weeklySchedule, closedPeriods: activeClosedPeriods, specialOpenings: activeSpecialOpenings }));
    } else {
      formData.append("schedule", JSON.stringify(weeklySchedule));
    }
    formData.append("faq", JSON.stringify(faqs));

    startTransition(async () => {
      const action = isEdit ? updateCourseAction : createCourseAction;
      const res = await action(null, formData);
      if ("success" in res && res.success) {
        onSubmitSuccess();
      } else {
        setError("error" in res ? res.error : `An error occurred while saving the ${itemNoun.toLowerCase()}.`);
      }
    });
  };

  // ──────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header and Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border/60">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group self-start"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to {itemNoun}s List
          </button>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {isEdit ? `Edit ${itemNoun}: ${initialCourse?.name}` : `Create New ${itemNoun}`}
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure the specific {itemNoun.toLowerCase()} details, pricing structure, and facilities.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-10 px-5 font-semibold text-xs rounded-xl"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="font-bold h-10 px-6 text-xs rounded-xl shadow-md shadow-primary/10"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit ? "Save Changes" : `Create ${itemNoun}`}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-semibold">
          <AlertCircle className="size-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation (tabbed layout only) */}
      {isTabbedLayout && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
          {(
            [
              { key: "general" as const, label: "General", Icon: FileText, hasError: false },
              { key: "terms" as const, label: isBoarding ? "Terms" : "Terms of participation", Icon: FileCheck, hasError: false },
              { key: "pricing" as const, label: "Pricing", Icon: DollarSign, hasError: false },
              { key: "schedule" as const, label: "Schedule", Icon: Calendar, hasError: !!scheduleOverlapError },
              { key: "location" as const, label: "Coverage zones", Icon: MapPin, hasError: false },
              { key: "faq" as const, label: "FAQ", Icon: HelpCircle, hasError: false },
              ...(isBoarding ? [{ key: "others" as const, label: "Care & facilities", Icon: Sliders, hasError: false }] : []),
            ]
          ).map(({ key, label, Icon, hasError }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === key
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
              {hasError && (
                <span className="size-2 rounded-full bg-destructive animate-pulse" title="Overlap Conflict Detected" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── TABBED LAYOUT ────────────────────────────────────── */}
      {isTabbedLayout ? (
        <div className="space-y-6 min-h-[400px]">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <CourseGeneralTab
              name={name}
              onNameChange={setName}
              details={details}
              onDetailsChange={setDetails}
              certifiedTrainer={certifiedTrainer}
              onCertifiedTrainerChange={setCertifiedTrainer}
              certifierName={certifierName}
              onCertifierNameChange={setCertifierName}
              trainerExperienceDescription={trainerExperienceDescription}
              onTrainerExperienceDescriptionChange={setTrainerExperienceDescription}
              ageLimitsEnabled={ageLimitsEnabled}
              onAgeLimitsEnabledChange={setAgeLimitsEnabled}
              selectedAgeLimits={selectedAgeLimits}
              onToggleAgeLimit={handleToggleAgeLimit}
              itemNoun={itemNoun}
              isDogWalking={isDogWalking}
              isDogTraining={isDogTraining}
            />
          )}

          {/* TAB 2: TERMS OF PARTICIPATION */}
          {activeTab === "terms" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                  Age Limits &amp; Prerequisites
                </h3>
                <AgeLimitsSection
                  itemNoun={itemNoun}
                  ageLimitsEnabled={ageLimitsEnabled}
                  onAgeLimitsEnabledChange={setAgeLimitsEnabled}
                  selectedAgeLimits={selectedAgeLimits}
                  onSelectedAgeLimitsChange={setSelectedAgeLimits}
                />
              </div>

              <div className="space-y-2">
                <Label>{isBoarding ? "Terms" : "Terms of Participation"}</Label>
                <WysiwygEditor
                  value={termsOfParticipation}
                  onChange={setTermsOfParticipation}
                  placeholder="List prerequisites, mandatory vaccine records, age limits, discipline rules..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <CoursePricingTab
                itemNoun={itemNoun}
                isBoarding={isBoarding}
                isGrooming={isGrooming}
                pricings={pricings}
                onAdd={handleAddPriceTier}
                onUpdate={handleUpdatePriceTier}
                onRemove={requestRemovePriceTier}
                isDogWalking={isDogWalking}
              />
            </div>
          )}

          {/* TAB 4: SCHEDULE */}
          {activeTab === "schedule" && (
            <CourseScheduleTab
              isDogSport={isDogSport}
              scheduleOverlapError={scheduleOverlapError}
              weeklySchedule={weeklySchedule}
              onUpdateDaySchedule={handleUpdateDaySchedule}
              onCopyMonToWorkweek={handleCopyMonToWorkweek}
              onCopyMonToAll={handleCopyMonToAll}
              closedPeriods={closedPeriods}
              onAddClosedPeriod={handleAddClosedPeriod}
              onUpdateClosedPeriod={handleUpdateClosedPeriod}
              onRemoveClosedPeriod={requestRemoveClosedPeriod}
              specialOpenings={specialOpenings}
              onAddSpecialOpening={handleAddSpecialOpening}
              onUpdateSpecialOpening={handleUpdateSpecialOpening}
              onRemoveSpecialOpening={requestRemoveSpecialOpening}
            />
          )}

          {/* TAB 5: LOCATION */}
          {activeTab === "location" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5">
                <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">
                    {isDogWalking ? "Coverage zones" : "Location & Map Details"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isDogWalking
                      ? "Configure specific neighborhoods and coverage zones in your city where dog walking services are provided."
                      : "Provide location details, business profile, map links, and parking information for clients."}
                  </p>
                </div>
                <CourseLocationTab
                  layout="tabbed"
                  isBoarding={isBoarding}
                  isDogWalking={isDogWalking}
                  cityName={cityName}
                  cartiereList={cartiereList}
                  selectedCartiere={coverageData.primary}
                  onSelectedCartiereChange={handlePrimaryCartiereChange}
                  secondaryZones={coverageData.secondary}
                  onAddSecondaryZone={handleAddSecondaryZone}
                  onRemoveSecondaryZone={requestRemoveSecondaryZone}
                  onSecondaryCityChange={handleSecondaryCityChange}
                  onSecondaryCartiereChange={handleSecondaryCartiereChange}
                  hideDedicatedField={isDogWalking}
                  hideParking={isDogWalking}
                  dedicatedField={dedicatedField}
                  onDedicatedFieldChange={setDedicatedField}
                  trainingFieldDescription={trainingFieldDescription}
                  onTrainingFieldDescriptionChange={setTrainingFieldDescription}
                  trainingFieldAddress={trainingFieldAddress}
                  onTrainingFieldAddressChange={setTrainingFieldAddress}
                  trainingFieldGoogleBusinessProfile={trainingFieldGoogleBusinessProfile}
                  onGbpChange={setTrainingFieldGoogleBusinessProfile}
                  trainingFieldGoogleMapsLink={trainingFieldGoogleMapsLink}
                  onMapsChange={setTrainingFieldGoogleMapsLink}
                  parking={parking}
                  onParkingChange={setParking}
                  parkingDescription={parkingDescription}
                  onParkingDescriptionChange={setParkingDescription}
                />
              </div>
            </div>
          )}

          {/* TAB 6: FAQ */}
          {activeTab === "faq" && (
            <CourseFaqTab
              itemNoun={itemNoun}
              faqs={faqs}
              onAdd={handleAddFaq}
              onUpdate={handleUpdateFaq}
              onRemove={requestRemoveFaq}
            />
          )}

          {/* TAB 7: OTHERS (Boarding Details & Care Amenities) */}
          {activeTab === "others" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5">
                <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">Care &amp; Facilities</h3>
                  <p className="text-xs text-muted-foreground">
                    Configure specialized boarding amenities, webcam access, meal customization, and owner updates.
                  </p>
                </div>
                <CourseCareTab
                  isDogWalking={isDogWalking}
                  dailyWalks={dailyWalks}
                  onDailyWalksChange={setDailyWalks}
                  medicationAdministration={medicationAdministration}
                  onMedicationAdministrationChange={setMedicationAdministration}
                  medicationAdministrationDetails={medicationAdministrationDetails}
                  onMedicationAdministrationDetailsChange={setMedicationAdministrationDetails}
                  surveillance247={surveillance247}
                  onSurveillance247Change={setSurveillance247}
                  surveillance247Details={surveillance247Details}
                  onSurveillance247DetailsChange={setSurveillance247Details}
                  webCam={webCam}
                  onWebCamChange={setWebCam}
                  webCamDetails={webCamDetails}
                  onWebCamDetailsChange={setWebCamDetails}
                  ownerCommunication={ownerCommunication}
                  onOwnerCommunicationChange={setOwnerCommunication}
                  ownerCommunicationDetails={ownerCommunicationDetails}
                  onOwnerCommunicationDetailsChange={setOwnerCommunicationDetails}
                  personalizedMealPlan={personalizedMealPlan}
                  onPersonalizedMealPlanChange={setPersonalizedMealPlan}
                  personalizedMealPlanDetails={personalizedMealPlanDetails}
                  onPersonalizedMealPlanDetailsChange={setPersonalizedMealPlanDetails}
                />
              </div>
            </div>
          )}

          {/* Bottom Action Buttons (tabbed layout) */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 px-6 font-semibold"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="font-bold h-11 px-8 shadow-md shadow-primary/10"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4.5 animate-spin" />}
              {isEdit ? "Save Changes" : `Create ${itemNoun}`}
            </Button>
          </div>
        </div>
      ) : (
        /* ── FLAT LAYOUT (Boarding, Grooming, and other non-tabbed services) ── */
        <div className="grid grid-cols-1 lg:grid-cols-[64%_36%] gap-6">
          {/* Column 1 — 64% Width */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="course-name">{itemNoun} Name</Label>
              <Input
                id="course-name"
                type="text"
                placeholder={
                  itemNoun === "Boarding service"
                    ? "e.g. Standard Room, VIP Cabin"
                    : isGrooming
                    ? "e.g. Full Grooming & Bath"
                    : "e.g. Puppy Socialization Class"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card"
                required
              />
            </div>

            {/* Trainer & Facility Attributes card (not for grooming) */}
            {!isGrooming && (
              <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                  {itemNoun === "Boarding service" ? "Facility Attributes" : "Trainer & Facility Attributes"}
                </h3>

                {itemNoun !== "Boarding service" && (
                  <>
                    <TrainerAttributesCard
                      itemNoun={itemNoun}
                      bare
                      certifiedTrainer={certifiedTrainer}
                      onCertifiedTrainerChange={setCertifiedTrainer}
                      certifierName={certifierName}
                      onCertifierNameChange={setCertifierName}
                      trainerExperienceDescription={trainerExperienceDescription}
                      onTrainerExperienceDescriptionChange={setTrainerExperienceDescription}
                    />

                    <div className="h-px bg-border/40" />

                    {/* Age Limits */}
                    <AgeLimitsSection
                      itemNoun={itemNoun}
                      ageLimitsEnabled={ageLimitsEnabled}
                      onAgeLimitsEnabledChange={setAgeLimitsEnabled}
                      selectedAgeLimits={selectedAgeLimits}
                      onSelectedAgeLimitsChange={setSelectedAgeLimits}
                    />

                    <div className="h-px bg-border/60" />

                    {/* Dedicated Training Field */}
                    <BooleanToggleField
                      label="Dedicated Training Field"
                      description="Does the class run on a fully closed, dedicated training field?"
                      checked={dedicatedField}
                      onChange={setDedicatedField}
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Training Field Description</Label>
                          <WysiwygEditor
                            value={trainingFieldDescription}
                            onChange={setTrainingFieldDescription}
                            placeholder="Explain field attributes, size, safety fences, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="training-field-address">Address</Label>
                          <Input
                            id="training-field-address"
                            type="text"
                            placeholder="e.g. 123 Canine Lane, Bucharest"
                            value={trainingFieldAddress}
                            onChange={(e) => setTrainingFieldAddress(e.target.value)}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="training-field-gbp">Google Business Profile</Label>
                          <Input
                            id="training-field-gbp"
                            type="url"
                            placeholder="https://business.google.com/..."
                            value={trainingFieldGoogleBusinessProfile}
                            onChange={(e) => setTrainingFieldGoogleBusinessProfile(e.target.value)}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="training-field-maps">Google Maps Link</Label>
                          <Input
                            id="training-field-maps"
                            type="url"
                            placeholder="https://maps.google.com/..."
                            value={trainingFieldGoogleMapsLink}
                            onChange={(e) => setTrainingFieldGoogleMapsLink(e.target.value)}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    </BooleanToggleField>

                    <div className="h-px bg-border/60" />
                  </>
                )}

                {/* Parking (all non-grooming services) */}
                <BooleanToggleField
                  label="Parking"
                  description="Is parking available on site or nearby?"
                  checked={parking}
                  onChange={setParking}
                >
                  <WysiwygEditor
                    value={parkingDescription}
                    onChange={setParkingDescription}
                    placeholder="Details about parking capacity, location, fee..."
                  />
                </BooleanToggleField>
              </div>
            )}

            {/* Boarding Details (boarding-only section) */}
            {itemNoun === "Boarding service" && (
              <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                  Care &amp; Facilities
                </h3>
                <CareAmenitiesSection
                  isDogWalking={isDogWalking}
                  dailyWalks={dailyWalks}
                  onDailyWalksChange={setDailyWalks}
                  medicationAdministration={medicationAdministration}
                  onMedicationAdministrationChange={setMedicationAdministration}
                  medicationAdministrationDetails={medicationAdministrationDetails}
                  onMedicationAdministrationDetailsChange={setMedicationAdministrationDetails}
                  surveillance247={surveillance247}
                  onSurveillance247Change={setSurveillance247}
                  surveillance247Details={surveillance247Details}
                  onSurveillance247DetailsChange={setSurveillance247Details}
                  webCam={webCam}
                  onWebCamChange={setWebCam}
                  webCamDetails={webCamDetails}
                  onWebCamDetailsChange={setWebCamDetails}
                  ownerCommunication={ownerCommunication}
                  onOwnerCommunicationChange={setOwnerCommunication}
                  ownerCommunicationDetails={ownerCommunicationDetails}
                  onOwnerCommunicationDetailsChange={setOwnerCommunicationDetails}
                  personalizedMealPlan={personalizedMealPlan}
                  onPersonalizedMealPlanChange={setPersonalizedMealPlan}
                  personalizedMealPlanDetails={personalizedMealPlanDetails}
                  onPersonalizedMealPlanDetailsChange={setPersonalizedMealPlanDetails}
                />
                {isBoarding && (
                  <>
                    <div className="h-px bg-border/60" />
                    <div className="space-y-4">
                      <DayScheduleGrid
                        weeklySchedule={weeklySchedule}
                        useSportLabels={isDogSport}
                        onUpdate={handleUpdateDaySchedule}
                        onCopyMonToWorkweek={handleCopyMonToWorkweek}
                        onCopyMonToAll={handleCopyMonToAll}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Details & Terms Editors */}
            <div className="space-y-2">
              <Label>{itemNoun} Information and Details</Label>
              <WysiwygEditor
                value={details}
                onChange={setDetails}
                placeholder="What does the program include? Explain schedules, details..."
              />
            </div>

            <div className="space-y-2">
              <Label>{isBoarding ? "Terms" : "Terms of Participation"}</Label>
              <WysiwygEditor
                value={termsOfParticipation}
                onChange={setTermsOfParticipation}
                placeholder="List prerequisites, mandatory vaccine records, age, etc."
              />
            </div>

            <FaqSection
              itemNoun={itemNoun}
              faqs={faqs}
              onAdd={handleAddFaq}
              onUpdate={handleUpdateFaq}
              onRemove={requestRemoveFaq}
              compact
            />
          </div>

          {/* Column 2 — 36% Width */}
          <div className="space-y-6">
            <PricingSection
              itemNoun={itemNoun}
              isBoarding={isBoarding}
              isGrooming={isGrooming}
              pricings={pricings}
              onAdd={handleAddPriceTier}
              onUpdate={handleUpdatePriceTier}
              onRemove={requestRemovePriceTier}
              compact
            />

            {/* Submit Actions */}
            <div className="space-y-3">
              {(error || scheduleOverlapError) && (
                <div
                  data-testid="bottom-submit-notification"
                  className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2.5 text-xs font-semibold shadow-sm animate-in fade-in duration-150"
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error || scheduleOverlapError}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  className="flex-1 font-bold h-11 shadow-md shadow-primary/10"
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 size-4.5 animate-spin" />}
                  {isEdit ? "Save Changes" : `Create ${itemNoun}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="h-11 font-semibold"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Confirmation Guard Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              type="button"
              onClick={() => setRemoveConfirm(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <div className="space-y-1.5 pt-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="size-4 text-destructive shrink-0" />
                {removeConfirm.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {removeConfirm.description}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRemoveConfirm(null)}
                className="rounded-xl h-9 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={confirmRemoveItem}
                className="rounded-xl h-9 text-xs font-semibold"
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
