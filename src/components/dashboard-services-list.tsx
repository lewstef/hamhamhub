"use client";

import { useState, useTransition } from "react";
import { toggleOrganizationServiceAction } from "@/app/actions/organizations";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string;
}

interface DashboardServicesListProps {
  organizationId: string;
  services: Service[];
  initialEnabledIds: string[];
}

export function DashboardServicesList({
  organizationId,
  services,
  initialEnabledIds,
}: DashboardServicesListProps) {
  const router = useRouter();
  const [enabledIds, setEnabledIds] = useState<string[]>(initialEnabledIds);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = (serviceId: string) => {
    const isCurrentlyEnabled = enabledIds.includes(serviceId);
    setTogglingId(serviceId);

    // Optimistically update the state
    const nextIds = isCurrentlyEnabled
      ? enabledIds.filter((id) => id !== serviceId)
      : [...enabledIds, serviceId];
    setEnabledIds(nextIds);

    startTransition(async () => {
      const res = await toggleOrganizationServiceAction(organizationId, serviceId, !isCurrentlyEnabled);
      if (res?.success) {
        router.refresh();
      } else {
        // Rollback state on error
        setEnabledIds(enabledIds);
      }
      setTogglingId(null);
    });
  };

  if (services.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-border rounded-xl text-muted-foreground bg-muted/5">
        No operational services match your organization category.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      {services.map((s) => {
        const isEnabled = enabledIds.includes(s.id);
        const isLoading = togglingId === s.id && isPending;

        return (
          <div key={s.id} className="flex items-center justify-between p-5 hover:bg-muted/10 transition-colors">
            <div className="flex flex-col gap-1.5 max-w-[80%]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{s.name}</span>
                {isEnabled && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    Active
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {s.description}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              disabled={isLoading}
              onClick={() => handleToggle(s.id)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${
                isEnabled ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
