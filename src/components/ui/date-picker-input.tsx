"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DatePickerInputProps {
  id?: string;
  value: string; // Expected Romanian format: DD.MM.YYYY (or fallback YYYY-MM-DD)
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ROMANIAN_MONTH_NAMES = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
];

const ROMANIAN_DAY_LABELS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

/**
 * Robust date parser supporting DD.MM.YYYY (1-2 digits day/month), DD/MM/YYYY, DD-MM-YYYY, and YYYY-MM-DD
 */
export function parseDateString(str: string): { year: number; month: number; day: number } | null {
  if (!str) return null;
  const trimmed = str.trim();

  // Match Romanian format D.M.YYYY, DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  const roMatch = trimmed.match(/^(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})$/);
  if (roMatch) {
    const d = Number(roMatch[1]);
    const m = Number(roMatch[2]);
    const y = Number(roMatch[3]);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { year: y, month: m - 1, day: d };
    }
  }

  // Match ISO format YYYY-M-D or YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[\.\/-](\d{1,2})[\.\/-](\d{1,2})$/);
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const m = Number(isoMatch[2]);
    const d = Number(isoMatch[3]);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { year: y, month: m - 1, day: d };
    }
  }

  return null;
}

/**
 * Formats day, zero-based month, and year into Romanian date string "DD.MM.YYYY"
 */
export function formatDateRO(day: number, monthZeroBased: number, year: number): string {
  const dStr = String(day).padStart(2, "0");
  const mStr = String(monthZeroBased + 1).padStart(2, "0");
  return `${dStr}.${mStr}.${year}`;
}

export function DatePickerInput({
  id,
  value,
  onChange,
  placeholder = "DD.MM.YYYY",
  className = "",
  disabled = false,
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view month/year from value or current date
  const parsed = React.useMemo(() => parseDateString(value), [value]);

  const [viewYear, setViewYear] = useState(() => parsed?.year || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (parsed ? parsed.month : new Date().getMonth()));

  // Sync view month/year when popover opens or value changes
  useEffect(() => {
    const res = parseDateString(value);
    if (res) {
      setViewYear(res.year);
      setViewMonth(res.month);
    }
  }, [value]);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formatted = formatDateRO(day, viewMonth, viewYear);
    onChange(formatted);
    setIsOpen(false);
  };

  // Generate calendar days for current view month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Get weekday of 1st day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  let firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  // Adjust so Monday = 0, ..., Sunday = 6
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      <div className="relative flex items-center">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-9 text-xs bg-background font-mono ${className}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-1 size-7 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          title="Open Calendar"
          aria-label="Open Calendar"
        >
          <CalendarIcon className="size-3.5" />
        </Button>
      </div>

      {isOpen && (
        <div
          data-testid="calendar-popover"
          className="absolute z-50 mt-1.5 right-0 sm:left-0 w-64 p-3 bg-popover text-popover-foreground rounded-xl border border-border shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
            <span className="text-xs font-bold text-foreground">
              {ROMANIAN_MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="size-6 text-muted-foreground hover:text-foreground rounded-lg"
                title="Luna anterioară"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="size-6 text-muted-foreground hover:text-foreground rounded-lg"
                title="Luna următoare"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {ROMANIAN_DAY_LABELS.map((lbl) => (
              <span key={lbl} className="text-[10px] font-bold text-muted-foreground uppercase">
                {lbl}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank offset days */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`blank-${idx}`} className="size-7" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected =
                parsed &&
                parsed.year === viewYear &&
                parsed.month === viewMonth &&
                parsed.day === dayNum;

              const isToday =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === viewMonth &&
                new Date().getDate() === dayNum;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`size-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm font-bold"
                      : isToday
                      ? "border border-primary text-primary font-bold hover:bg-primary/10"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
