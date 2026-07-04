"use client";

import { Check, Circle } from "lucide-react";
import { useMemo } from "react";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  const requirements = useMemo(() => {
    return [
      {
        id: "length",
        label: "At least 6 characters",
        met: password.length >= 6,
      },
      {
        id: "uppercase",
        label: "At least one uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        id: "number",
        label: "At least one number (0-9)",
        met: /[0-9]/.test(password),
      },
      {
        id: "special",
        label: "At least one special character",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];
  }, [password]);

  const score = useMemo(() => {
    if (!password) return 0;
    return requirements.filter((req) => req.met).length;
  }, [password, requirements]);

  const { label, colorClass, textClass } = useMemo(() => {
    if (!password) {
      return { label: "", colorClass: "bg-muted/20", textClass: "text-muted-foreground" };
    }
    switch (score) {
      case 0:
      case 1:
        return { label: "Very Weak", colorClass: "bg-red-500", textClass: "text-red-500" };
      case 2:
        return { label: "Weak", colorClass: "bg-orange-500", textClass: "text-orange-500" };
      case 3:
        return { label: "Medium", colorClass: "bg-amber-500", textClass: "text-amber-500" };
      case 4:
        return { label: "Strong", colorClass: "bg-emerald-500", textClass: "text-emerald-500" };
      default:
        return { label: "", colorClass: "bg-muted/20", textClass: "text-muted-foreground" };
    }
  }, [password, score]);

  if (!password) return null;

  return (
    <div className="space-y-3.5 mt-2.5 p-3.5 rounded-xl border border-border/40 bg-muted/10 backdrop-blur-xs transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Password Strength
        </span>
        <span className={`text-xs font-semibold ${textClass} transition-colors duration-300`}>
          {label}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-full rounded-full transition-all duration-500 ${
              index <= score ? colorClass : "bg-muted-foreground/15"
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="space-y-1.5 pt-1.5 border-t border-border/30">
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center gap-2 text-[11px] transition-all duration-300">
            {req.met ? (
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[3px]" />
            ) : (
              <Circle className="size-3.5 text-muted-foreground/40 shrink-0 stroke-[2px]" />
            )}
            <span
              className={`transition-colors duration-300 ${
                req.met ? "text-foreground/90 font-medium" : "text-muted-foreground/60"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
