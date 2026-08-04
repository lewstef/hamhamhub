"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { TimePickerSelect, getCheckinOptions, getCheckoutOptions } from "@/components/ui/time-picker-select";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import type { DayScheduleItem, DayKey, ClosedPeriodItem, SpecialOpeningItem } from "./types";

interface DayScheduleGridProps {
  weeklySchedule: DayScheduleItem[];
  useSportLabels: boolean;
  onUpdate: (dayKey: DayKey, field: keyof DayScheduleItem, value: any) => void;
  onCopyMonToWorkweek: () => void;
  onCopyMonToAll: () => void;
}

export function DayScheduleGrid({
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
                      {item.checkin && item.checkout && item.checkout <= item.checkin && (
                        <p className="text-[10px] text-destructive font-semibold">
                          Check-out time cannot be before or equal to check-in time.
                        </p>
                      )}
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
                      placeholder="e.g. Morning agility session 09:00 - 11:00, Evening session 16:00 - 18:00"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">
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

interface CourseScheduleTabProps {
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
 * CourseScheduleTab Component
 *
 * Full schedule tab editor: Weekly Day Schedule Grid + Closed Periods + Special Openings.
 */
export function CourseScheduleTab({
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
}: CourseScheduleTabProps) {
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

        {/* Closed Periods */}
        <div className="space-y-4 pt-4 border-t border-border/60">
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

        {/* Special Openings */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex flex-col gap-1">
            <Label className="text-base font-bold text-foreground">Special Openings &amp; Extra Working Dates</Label>
            <p className="text-xs text-muted-foreground">
              Specify special dates or holiday sessions when your organization IS open.
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
