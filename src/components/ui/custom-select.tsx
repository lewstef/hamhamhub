"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectMenu, SelectMenuItem } from "./select-menu";

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
  searchable?: boolean;
  searchPlaceholder?: string;
}

/**
 * CustomSelect Component
 *
 * A modern, fully-styled custom dropdown component consistent with TimePickerSelect.
 * Provides custom scrollbar styling, clean animations, active item highlights,
 * diacritic-insensitive search filtering, and full keyboard navigation (Arrow keys, Enter, Escape, Home, End).
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
  searchable = false,
  searchPlaceholder = "Search...",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [internalValue, setInternalValue] = useState<string>(
    controlledValue !== undefined
      ? String(controlledValue)
      : defaultValue !== undefined
      ? String(defaultValue)
      : ""
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? String(controlledValue) : internalValue;

  const formattedOptions: CustomSelectOption[] = options.map((opt) => {
    if (typeof opt === "object" && opt !== null && "value" in opt) {
      return opt as CustomSelectOption;
    }
    return { value: String(opt), label: String(opt) };
  });

  const selectedOption = formattedOptions.find((opt) => String(opt.value) === activeValue);

  const normalizeStr = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return formattedOptions;
    const q = normalizeStr(searchQuery);
    return formattedOptions.filter(
      (opt) =>
        String(opt.value) === "" || // Keep default empty option visible
        normalizeStr(opt.label).includes(q) ||
        normalizeStr(String(opt.value)).includes(q)
    );
  }, [formattedOptions, searchable, searchQuery]);

  const prevIsOpenRef = useRef(false);

  // Set initial highlighted index only when dropdown transition opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const activeIdx = filteredOptions.findIndex((opt) => String(opt.value) === activeValue);
      setHighlightedIndex(activeIdx >= 0 ? activeIdx : 0);
    } else if (!isOpen && prevIsOpenRef.current) {
      setHighlightedIndex(-1);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, filteredOptions, activeValue]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    if (isControlled) {
      setInternalValue(String(controlledValue));
    }
  }, [controlledValue, isControlled]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
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
    setSearchQuery("");
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
        const activeIdx = filteredOptions.findIndex((opt) => String(opt.value) === activeValue);
        setHighlightedIndex(activeIdx >= 0 ? activeIdx : 0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        let next = highlightedIndex + 1;
        while (next < filteredOptions.length && filteredOptions[next]?.disabled) {
          next++;
        }
        if (next < filteredOptions.length) {
          setHighlightedIndex(next);
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        let prev = highlightedIndex - 1;
        while (prev >= 0 && filteredOptions[prev]?.disabled) {
          prev--;
        }
        if (prev >= 0) {
          setHighlightedIndex(prev);
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        const first = filteredOptions.findIndex((opt) => !opt.disabled);
        if (first >= 0) setHighlightedIndex(first);
        break;
      }
      case "End": {
        e.preventDefault();
        for (let i = filteredOptions.length - 1; i >= 0; i--) {
          if (!filteredOptions[i].disabled) {
            setHighlightedIndex(i);
            break;
          }
        }
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const opt = filteredOptions[highlightedIndex];
          if (!opt.disabled) {
            handleSelect(String(opt.value));
          }
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        triggerRef.current?.focus();
        break;
      }
      case "Tab": {
        setIsOpen(false);
        setSearchQuery("");
        break;
      }
    }
  };

  const heightClass = size === "sm" ? "h-8 py-1 text-xs font-semibold" : "h-9 py-1.5 text-xs font-semibold";

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} className="relative w-full">
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

      {/* Visible Trigger Button using exact Input CSS classes to match TimePickerSelect & standard inputs */}
      <button
        ref={triggerRef}
        type="button"
        id={id ? `${id}-display` : undefined}
        disabled={disabled}
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (isOpen) setSearchQuery("");
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full min-w-0 rounded-lg border border-input px-2.5 py-1 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-9 pr-7 text-xs font-semibold bg-background cursor-pointer select-none flex items-center justify-between relative ${
          hasError ? "border-destructive focus-visible:ring-destructive" : ""
        } ${className}`}
      >
        <span className={`truncate text-left ${!selectedOption ? "text-muted-foreground" : "text-foreground"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="absolute right-1.5 p-1 text-muted-foreground hover:text-foreground rounded transition-colors pointer-events-none">
          <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && !disabled && formattedOptions.length > 0 && (
        <SelectMenu>
          {searchable && (
            <div className="px-2 py-1.5 border-b border-border bg-popover sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder || "Search..."}
                  className="h-7 pl-8 pr-7 text-xs font-semibold bg-muted/20 border-border focus-visible:ring-1"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                    }}
                    className="absolute right-2 p-0.5 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                  >
                    <X className="size-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = String(opt.value) === activeValue;
              const isHighlighted = idx === highlightedIndex;

              return (
                <SelectMenuItem
                  key={String(opt.value)}
                  ref={(el) => {
                    optionRefs.current[idx] = el;
                  }}
                  label={opt.label}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  disabled={opt.disabled}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(String(opt.value))}
                />
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center font-medium">
              No matching options found
            </div>
          )}
        </SelectMenu>
      )}
    </div>
  );
}
