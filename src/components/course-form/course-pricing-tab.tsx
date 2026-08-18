"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import type { CoursePricingItem } from "./types";

interface CoursePricingTabProps {
  itemNoun: string;
  isBoarding: boolean;
  isGrooming: boolean;
  pricings: CoursePricingItem[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof CoursePricingItem, value: string) => void;
  onRemove: (index: number) => void;
  compact?: boolean;
  isDogWalking?: boolean;
  isDogSitter?: boolean;
}

/**
 * CoursePricingTab Component
 *
 * Renders the Pricing tab and pricing tier structure list.
 */
export function CoursePricingTab({
  itemNoun,
  isBoarding,
  isGrooming,
  pricings,
  onAdd,
  onUpdate,
  onRemove,
  compact = false,
  isDogWalking = false,
  isDogSitter = false,
}: CoursePricingTabProps) {
  const isItemBoarding = isBoarding || itemNoun === "Boarding service";
  const isItemGrooming = isGrooming || itemNoun === "Grooming service";
  const isItemSitting = isDogSitter || itemNoun === "Sitting service";

  const priceTypeOptions = useMemo(
    () =>
      isDogWalking
        ? [
            { value: "walk_30min", label: "Per 30-Minute Walk" },
            { value: "walk_45min", label: "Per 45-Minute Walk" },
            { value: "walk_60min", label: "Per 60-Minute Walk" },
            { value: "walk", label: "Per Walk" },
            { value: "month", label: "Per Monthly Package (Workweek)" },
            { value: "addl_dog", label: "Per Additional Household Dog" },
          ]
        : isItemSitting
        ? [
            { value: "1h", label: "1h" },
            { value: "2h", label: "2h" },
            { value: "3h", label: "3h" },
            { value: "4h", label: "4h" },
            { value: "5h", label: "5h" },
            { value: "6h", label: "6h" },
            { value: "7h", label: "7h" },
            { value: "8h", label: "8h" },
            { value: "9h", label: "9h" },
            { value: "10h", label: "10h" },
            { value: "11h", label: "11h" },
            { value: "12h", label: "12h" },
          ]
        : isItemBoarding
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
    [itemNoun, isItemBoarding, isItemGrooming, isDogWalking, isItemSitting]
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
                <Label htmlFor={`course-price-${index}`}>Price Amount (lei)</Label>
                <div className="relative">
                  <Input
                    id={`course-price-${index}`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="e.g. 500"
                    value={tier.amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/,/g, ".");
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        onUpdate(index, "amount", val);
                      }
                    }}
                    className="bg-background text-xs font-semibold h-9 pr-10"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none select-none">
                    lei
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor={`course-pricetype-${index}`} className="text-xs font-semibold">
                  Billing Frequency
                </Label>
                <CustomSelect
                  id={`course-pricetype-${index}`}
                  value={tier.type}
                  onChange={(val) => onUpdate(index, "type", val)}
                  options={priceTypeOptions}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`course-price-label-${index}`} className="text-xs font-semibold">Label / Title (Optional)</Label>
                <Input
                  id={`course-price-label-${index}`}
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. Early Bird, Standard, VIP"
                  value={tier.label || ""}
                  onChange={(e) => onUpdate(index, "label", e.target.value)}
                  className="bg-background text-xs font-semibold h-9"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="w-full text-xs font-semibold h-9 rounded-xl border-dashed"
      >
        <Plus className="size-3.5 mr-1.5" />
        Add Price Tier
      </Button>
    </div>
  );
}
