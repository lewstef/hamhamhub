"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import type { Course } from "@/types/course";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import { ArrowLeft, Loader2, AlertCircle, Plus, Trash2, FileText, HelpCircle, DollarSign, MapPin, Calendar, FileCheck, Sliders } from "lucide-react";
import { TimePickerSelect, getCheckinOptions, getCheckoutOptions } from "@/components/ui/time-picker-select";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePickerInput, parseDateString } from "@/components/ui/date-picker-input";

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
  "Puppy (Up to 9 months)",
  "Junior (9 to 18 months)",
  "Adult (18 months to 8 years)",
  "Senior (8+ years)",
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
      label="Age Limits"
      description={`Enable if this ${itemNoun.toLowerCase()} has specific age limits/requirements.`}
      checked={ageLimitsEnabled}
      onChange={onAgeLimitsEnabledChange}
    >
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
          Select Age Phases
        </Label>
        <div className="space-y-2">
          {AGE_PHASES.map((option) => {
            const isChecked = selectedAgeLimits.includes(option);
            return (
              <label
                key={option}
                className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer text-sm font-medium"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) {
                      onSelectedAgeLimitsChange(selectedAgeLimits.filter((x) => x !== option));
                    } else {
                      onSelectedAgeLimitsChange([...selectedAgeLimits, option]);
                    }
                  }}
                  className="mt-0.5 rounded border-input text-primary focus:ring-primary size-4"
                />
                <span className="text-foreground">{option}</span>
              </label>
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
  const locationInputs = (
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
  dailyWalks: number;
  onDailyWalksChange: (v: number) => void;
  medicationAdministration: boolean;
  onMedicationAdministrationChange: (v: boolean) => void;
  medicationAdministrationDetails: string;
  onMedicationAdministrationDetailsChange: (v: string) => void;
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
 * daily walks, medication administration, webcam access, owner communication,
 * and personalized meal plan.
 *
 * Used in the tabbed layout's "Care & facilities" tab and the flat layout's
 * "Care & Facilities" card.
 */
function CareAmenitiesSection({
  dailyWalks,
  onDailyWalksChange,
  medicationAdministration,
  onMedicationAdministrationChange,
  medicationAdministrationDetails,
  onMedicationAdministrationDetailsChange,
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
        label="Medication Administration"
        description="Can you administer medication or medical care?"
        checked={medicationAdministration}
        onChange={onMedicationAdministrationChange}
      >
        <div className="space-y-2">
          <Label>Medication Administration Instructions</Label>
          <WysiwygEditor
            value={medicationAdministrationDetails}
            onChange={onMedicationAdministrationDetailsChange}
            placeholder="e.g. oral tablets, injections, schedule limitations"
          />
        </div>
      </BooleanToggleField>

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

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label="Communication with the Owner"
        description="Will you provide regular photo/video updates to the owner?"
        checked={ownerCommunication}
        onChange={onOwnerCommunicationChange}
      >
        <div className="space-y-2">
          <Label>Communication Updates Details</Label>
          <WysiwygEditor
            value={ownerCommunicationDetails}
            onChange={onOwnerCommunicationDetailsChange}
            placeholder="e.g. daily photos via WhatsApp, weekly email progress"
          />
        </div>
      </BooleanToggleField>

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label="Personalized Meal Plan"
        description="Can you provide a customized meal plan or accommodate special diets?"
        checked={personalizedMealPlan}
        onChange={onPersonalizedMealPlanChange}
      >
        <div className="space-y-2">
          <Label>Meal Plan Details</Label>
          <WysiwygEditor
            value={personalizedMealPlanDetails}
            onChange={onPersonalizedMealPlanDetailsChange}
            placeholder="e.g. BARF diet support, raw food storage, customized portions"
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
 */
interface CourseFormProps {
  organizationId: string;
  serviceId: string;
  itemNoun: string;
  initialCourse?: Course;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  serviceSlug?: string;
}

/**
 * CourseForm Component
 *
 * Form rendering panel for creating or editing sub-service items (Training Courses, Dog Sports, or Boarding rates).
 * Dog Sport and Dog Training services render a tabbed layout (General, Terms, Pricing, Schedule, Location, FAQ).
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
}: CourseFormProps) {
  const isEdit = !!initialCourse?.id;
  const isBoarding = serviceSlug === "dog-boarding" || itemNoun === "Boarding service";
  const isGrooming = serviceSlug === "dog-grooming" || itemNoun === "Grooming service";
  const isDogSport = serviceSlug === "sport-dog-training" || itemNoun === "Dog Sport";
  const isDogTraining = serviceSlug === "dog-training" || itemNoun === "Course";
  const isDogWalking = serviceSlug === "dog-walking" || itemNoun === "Walking service";
  const isTabbedLayout = isDogSport || isDogTraining || isBoarding || isDogWalking;
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
    formData.append("webCam", String(webCam));
    formData.append("webCamDetails", webCamDetails);
    formData.append("dailyWalks", String(dailyWalks));
    formData.append("ownerCommunication", String(ownerCommunication));
    formData.append("ownerCommunicationDetails", ownerCommunicationDetails);
    formData.append("personalizedMealPlan", String(personalizedMealPlan));
    formData.append("personalizedMealPlanDetails", personalizedMealPlanDetails);

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
              { key: "location" as const, label: "Location", Icon: MapPin, hasError: false },
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
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <Label htmlFor="course-name">{itemNoun} Name</Label>
                <Input
                  id="course-name"
                  type="text"
                  placeholder={
                    isBoarding
                      ? "e.g. Standard Room, VIP Cabin"
                      : "e.g. Agility, IGP, Obedience"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-card text-base font-semibold"
                  required
                />
              </div>

              {!isBoarding && (
                <TrainerAttributesCard
                  itemNoun={itemNoun}
                  certifiedTrainer={certifiedTrainer}
                  onCertifiedTrainerChange={setCertifiedTrainer}
                  certifierName={certifierName}
                  onCertifierNameChange={setCertifierName}
                  trainerExperienceDescription={trainerExperienceDescription}
                  onTrainerExperienceDescriptionChange={setTrainerExperienceDescription}
                />
              )}

              {/* Information & Details Editor */}
              <div className="space-y-2">
                <Label>{itemNoun} Information and Details</Label>
                <WysiwygEditor
                  value={details}
                  onChange={setDetails}
                  placeholder="What does the program include? Explain course objectives, discipline details..."
                />
              </div>
            </div>
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
              <PricingSection
                itemNoun={itemNoun}
                isBoarding={isBoarding}
                isGrooming={isGrooming}
                pricings={pricings}
                onAdd={handleAddPriceTier}
                onUpdate={handleUpdatePriceTier}
                onRemove={handleRemovePriceTier}
              />
            </div>
          )}

          {/* TAB 4: SCHEDULE */}
          {activeTab === "schedule" && (
            <ScheduleTabContent
              isDogSport={isDogSport}
              scheduleOverlapError={scheduleOverlapError}
              weeklySchedule={weeklySchedule}
              onUpdateDaySchedule={handleUpdateDaySchedule}
              onCopyMonToWorkweek={handleCopyMonToWorkweek}
              onCopyMonToAll={handleCopyMonToAll}
              closedPeriods={closedPeriods}
              onAddClosedPeriod={handleAddClosedPeriod}
              onUpdateClosedPeriod={handleUpdateClosedPeriod}
              onRemoveClosedPeriod={handleRemoveClosedPeriod}
              specialOpenings={specialOpenings}
              onAddSpecialOpening={handleAddSpecialOpening}
              onUpdateSpecialOpening={handleUpdateSpecialOpening}
              onRemoveSpecialOpening={handleRemoveSpecialOpening}
            />
          )}

          {/* TAB 5: LOCATION */}
          {activeTab === "location" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5">
                <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">Location &amp; Map Details</h3>
                  <p className="text-xs text-muted-foreground">
                    Provide location details, business profile, map links, and parking information for clients.
                  </p>
                </div>
                <LocationSection
                  layout="tabbed"
                  isBoarding={isBoarding}
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
            <FaqSection
              itemNoun={itemNoun}
              faqs={faqs}
              onAdd={handleAddFaq}
              onUpdate={handleUpdateFaq}
              onRemove={handleRemoveFaq}
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
                <CareAmenitiesSection
                  dailyWalks={dailyWalks}
                  onDailyWalksChange={setDailyWalks}
                  medicationAdministration={medicationAdministration}
                  onMedicationAdministrationChange={setMedicationAdministration}
                  medicationAdministrationDetails={medicationAdministrationDetails}
                  onMedicationAdministrationDetailsChange={setMedicationAdministrationDetails}
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
                  dailyWalks={dailyWalks}
                  onDailyWalksChange={setDailyWalks}
                  medicationAdministration={medicationAdministration}
                  onMedicationAdministrationChange={setMedicationAdministration}
                  medicationAdministrationDetails={medicationAdministrationDetails}
                  onMedicationAdministrationDetailsChange={setMedicationAdministrationDetails}
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
              onRemove={handleRemoveFaq}
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
              onRemove={handleRemovePriceTier}
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
    </form>
  );
}
