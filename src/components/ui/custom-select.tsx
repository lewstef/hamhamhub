"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  id?: string;
  name?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  options: (CustomSelectOption | string | number)[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  hasError?: boolean;
  size?: "sm" | "default";
  defaultValue?: string | number;
}

/**
 * CustomSelect Component
 *
 * A modern, fully-styled custom dropdown component consistent with TimePickerSelect.
 * Provides custom scrollbar styling, clean animations, active item highlights,
 * and maintains an accessible/hidden native select fallback for tests and standard form data.
 */
export function CustomSelect({
  id,
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  options,
  placeholder = "Select option...",
  disabled = false,
  required = false,
  className = "",
  hasError = false,
  size = "default",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(
    controlledValue !== undefined
      ? String(controlledValue)
      : defaultValue !== undefined
      ? String(defaultValue)
      : ""
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? String(controlledValue) : internalValue;

  const formattedOptions: CustomSelectOption[] = options.map((opt) => {
    if (typeof opt === "object" && opt !== null && "value" in opt) {
      return opt as CustomSelectOption;
    }
    return { value: String(opt), label: String(opt) };
  });

  const selectedOption = formattedOptions.find((opt) => String(opt.value) === activeValue);

  useEffect(() => {
    if (isControlled) {
      setInternalValue(String(controlledValue));
    }
  }, [controlledValue, isControlled]);

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

  const handleSelect = (val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
  };

  const heightClass = size === "sm" ? "h-8 py-1 text-xs" : "h-9 py-1.5 text-sm";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden native select for form accessibility and test compatibility */}
      <select
        id={id}
        name={name}
        value={activeValue}
        onChange={(e) => handleSelect(e.target.value)}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only pointer-events-none absolute opacity-0 size-0"
      >
        {!selectedOption && placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {formattedOptions.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Visible Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          hasError ? "border-destructive focus-visible:ring-destructive" : ""
        } ${heightClass} ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate text-left ${!selectedOption ? "text-muted-foreground" : "text-foreground"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && !disabled && formattedOptions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[140px] max-h-48 overflow-y-auto custom-scrollbar bg-popover border border-border shadow-md rounded-md py-1 z-50 animate-in fade-in-50 zoom-in-95">
          {formattedOptions.map((opt) => {
            const isSelected = String(opt.value) === activeValue;
            return (
              <button
                key={String(opt.value)}
                type="button"
                disabled={opt.disabled}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? "bg-accent/60 font-semibold text-primary"
                    : "text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => handleSelect(String(opt.value))}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="size-4 text-primary shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
