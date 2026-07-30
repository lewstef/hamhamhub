"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * ToggleSwitch Component
 *
 * A simple, accessible boolean toggle switch (pill-style).
 * Replaces the repeated inline `<button role="switch">` pattern
 * throughout the form components.
 *
 * @param props.checked - The current boolean state of the toggle.
 * @param props.onChange - Callback invoked with the new state when toggled.
 * @param props.disabled - When true, the toggle is non-interactive and visually dimmed.
 * @param props["aria-label"] - Accessible label for screen readers when no visible label is adjacent.
 */
export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
