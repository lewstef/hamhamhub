"use client";

import React from "react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

interface BooleanToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /**
   * Content rendered in the indented expanded-details slot when `checked` is true.
   * Wrapped automatically in a `pl-4 border-l-2 border-primary/20` indent container.
   */
  children?: React.ReactNode;
}

/**
 * BooleanToggleField Component
 *
 * A compound form control that pairs a {@link ToggleSwitch} with a visible label
 * and secondary description. When `checked` is true and `children` is provided,
 * the children are rendered in an indented details slot below the toggle row.
 *
 * @param props.label - Primary label text rendered in bold.
 * @param props.description - Secondary description shown below the label.
 * @param props.checked - Current boolean value of the toggle.
 * @param props.onChange - Callback invoked with the new state when toggled.
 * @param props.disabled - When true, the underlying ToggleSwitch is non-interactive.
 * @param props.children - Expanded details content, visible only when checked is true.
 */
export function BooleanToggleField({
  label,
  description,
  checked,
  onChange,
  disabled,
  children,
}: BooleanToggleFieldProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div
          onClick={() => !disabled && onChange(!checked)}
          className="space-y-0.5 cursor-pointer select-none flex-1"
        >
          <span className="text-sm font-bold text-foreground">{label}</span>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
      </div>

      {checked && children && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/20 transition-all duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
