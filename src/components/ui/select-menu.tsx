"use client";

import React, { forwardRef } from "react";
import { Check } from "lucide-react";

export interface SelectMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxHeightClass?: string;
  minWidthClass?: string;
}

/**
 * Shared Popover Container Component for Select Dropdowns
 * Ensures unified scrollbars, popover shadows, rounded borders, and entrance animations.
 */
export const SelectMenu = forwardRef<HTMLDivElement, SelectMenuProps>(
  (
    {
      children,
      className = "",
      maxHeightClass = "max-h-56",
      minWidthClass = "min-w-[140px]",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="listbox"
        className={`absolute top-full left-0 mt-1 w-full ${minWidthClass} ${maxHeightClass} overflow-y-auto custom-scrollbar bg-popover border border-border shadow-md rounded-md py-1 z-50 animate-in fade-in-50 zoom-in-95 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectMenu.displayName = "SelectMenu";

export interface SelectMenuItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label: React.ReactNode;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick: () => void;
  className?: string;
  fontClass?: string;
}

/**
 * Shared Dropdown Option Item Component
 * Renders consistent highlight, active state, checkmark icon, and ARIA option accessibility attributes.
 */
export const SelectMenuItem = forwardRef<HTMLButtonElement, SelectMenuItemProps>(
  (
    {
      label,
      isSelected = false,
      isHighlighted = false,
      disabled = false,
      onClick,
      className = "",
      fontClass = "font-semibold",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${fontClass} ${
          isHighlighted
            ? "bg-accent text-accent-foreground"
            : isSelected
            ? "bg-accent/60 text-primary"
            : "text-popover-foreground hover:bg-accent hover:text-accent-foreground"
        } ${className}`}
        onClick={onClick}
        {...props}
      >
        <span className="truncate">{label}</span>
        {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
      </button>
    );
  }
);

SelectMenuItem.displayName = "SelectMenuItem";
