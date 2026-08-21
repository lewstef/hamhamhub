"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";

export const AGE_PHASES = [
  "Puppy (2-6 mos)",
  "Junior (6-12 mos)",
  "Adult (1-7 yrs)",
  "Senior (7+ yrs)",
] as const;

export const DOG_SIZES = [
  "Small",
  "Medium",
  "Large",
  "Giant",
] as const;

export interface AgeLimitsSectionProps {
  itemNoun: string;
  ageLimitsEnabled: boolean;
  onAgeLimitsEnabledChange: (v: boolean) => void;
  selectedAgeLimits: string[];
  onSelectedAgeLimitsChange: (v: string[]) => void;
  showDogSizes?: boolean;
  dogSizesEnabled?: boolean;
  onDogSizesEnabledChange?: (v: boolean) => void;
  selectedDogSizes?: string[];
  onSelectedDogSizesChange?: (v: string[]) => void;
}

/**
 * AgeLimitsSection — BooleanToggleField wrapping the dog age-phase checkbox list,
 * plus optional Accepted Dog Sizes BooleanToggleField for tabbed services.
 * Used in the tabbed layout's Terms tab and the flat layout's Trainer Attributes card.
 */
export function AgeLimitsSection({
  itemNoun,
  ageLimitsEnabled,
  onAgeLimitsEnabledChange,
  selectedAgeLimits,
  onSelectedAgeLimitsChange,
  showDogSizes = false,
  dogSizesEnabled = false,
  onDogSizesEnabledChange,
  selectedDogSizes = [],
  onSelectedDogSizesChange,
}: AgeLimitsSectionProps) {
  return (
    <div className="space-y-4">
      <BooleanToggleField
        label="Age Limits & Restrictions"
        description={`Enable if this ${(itemNoun || "service").toLowerCase()} has specific age limits/requirements.`}
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

      {showDogSizes && onSelectedDogSizesChange && (
        <>
          <div className="h-px bg-border/60" />
          <BooleanToggleField
            label="Accepted Dog Sizes"
            description={`Enable if this ${(itemNoun || "service").toLowerCase()} has specific dog size requirements (Small, Medium, Large, Giant).`}
            checked={dogSizesEnabled}
            onChange={onDogSizesEnabledChange || (() => {})}
          >
            <div className="space-y-2 pt-1">
              <Label className="text-xs font-semibold">Select Accepted Dog Sizes</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DOG_SIZES.map((size) => {
                  const isSelected = selectedDogSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          onSelectedDogSizesChange(selectedDogSizes.filter((x) => x !== size));
                        } else {
                          onSelectedDogSizesChange([...selectedDogSizes, size]);
                        }
                      }}
                      className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-input hover:bg-muted/50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </BooleanToggleField>
        </>
      )}
    </div>
  );
}
