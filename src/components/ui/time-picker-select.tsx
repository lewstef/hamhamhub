"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { SelectMenu, SelectMenuItem } from "./select-menu";

/** Pre-computed list of 30-minute interval time strings (00:00 to 23:30). */
const TIME_OPTIONS_30MIN: string[] = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, "0");
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

/** Returns the full list of available check-in time options. */
export function getCheckinOptions(): string[] {
  return TIME_OPTIONS_30MIN;
}

/**
 * Returns check-out time options that come strictly after the given check-in time.
 * Falls back to the full list if the check-in time is not found.
 *
 * @param checkinTime - A valid 24-hour time string (hh:mm) representing the check-in time.
 */
export function getCheckoutOptions(checkinTime: string): string[] {
  const index = TIME_OPTIONS_30MIN.indexOf(checkinTime);
  if (index !== -1 && index < TIME_OPTIONS_30MIN.length - 1) {
    return TIME_OPTIONS_30MIN.slice(index + 1);
  }
  return TIME_OPTIONS_30MIN;
}

export interface TimePickerSelectProps {
  /** Unique HTML id for the underlying text input element. */
  id: string;
  /** Current time value in hh:mm (24-hour) format. */
  value: string;
  /** Callback fired when the user selects or types a new time value. */
  onChange: (val: string) => void;
  /** Dropdown options to display (use getCheckinOptions / getCheckoutOptions). */
  options: string[];
  /** Placeholder text shown when the input is empty. Defaults to "08:00". */
  placeholder?: string;
  /** Whether the input is required for form submission. Defaults to false. */
  required?: boolean;
  /** Additional CSS class names for the container. */
  className?: string;
  /** When true, renders the input with destructive border/ring styling. */
  hasError?: boolean;
}

/**
 * TimePickerSelect Component
 *
 * A combobox-style time picker that combines a free-text input (allowing manual
 * 24-hour time entry) with a dropdown of 30-minute interval suggestions.
 * Closes automatically when the user clicks outside the component.
 *
 * @param props - {@link TimePickerSelectProps}
 * @returns A controlled time picker input with dropdown suggestion list.
 */
export function TimePickerSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "08:00",
  required = false,
  className = "",
  hasError = false,
}: TimePickerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      const activeIdx = options.indexOf(value);
      setHighlightedIndex(activeIdx >= 0 ? activeIdx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, options, value]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (highlightedIndex < options.length - 1) {
          setHighlightedIndex((prev) => prev + 1);
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (highlightedIndex > 0) {
          setHighlightedIndex((prev) => prev - 1);
        }
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex]);
          setIsOpen(false);
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        setIsOpen(false);
        break;
      }
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} className="relative w-full">
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
          placeholder={placeholder}
          title="Please enter a valid time in 24-hour hh:mm format."
          className={`h-9 pr-7 bg-background font-mono text-xs ${hasError ? "border-destructive focus-visible:ring-destructive" : ""} ${className}`}
          required={required}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-1.5 p-1 text-muted-foreground hover:text-foreground rounded transition-colors focus:outline-none"
          title="Toggle time dropdown"
          aria-label="Toggle time options dropdown"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      {isOpen && options.length > 0 && (
        <SelectMenu minWidthClass="min-w-[110px]" maxHeightClass="max-h-[155px]">
          {options.map((time, idx) => {
            const isHighlighted = idx === highlightedIndex;
            const isSelected = time === value;
            return (
              <SelectMenuItem
                key={time}
                ref={(el) => {
                  optionRefs.current[idx] = el;
                }}
                label={time}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                fontClass="font-mono"
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
              />
            );
          })}
        </SelectMenu>
      )}
    </div>
  );
}
