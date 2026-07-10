"use client";

import { useState, useTransition } from "react";
import { toggleOrganizationServiceAction } from "@/app/actions/organizations";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DogTrainingTabs } from "@/components/dog-training-tabs";

interface Service {
  id: string;
  name: string;
  description: string;
  subServicesOrder?: string | null;
}

interface DashboardServiceDetailProps {
  organizationId: string;
  service: Service;
  initialIsEnabled: boolean;
  slug: string;
  activeSubServiceTab?: string;
  enabledSubServiceIds?: string[];
}

export function DashboardServiceDetail({
  organizationId,
  service,
  initialIsEnabled,
  slug,
  activeSubServiceTab,
  enabledSubServiceIds,
}: DashboardServiceDetailProps) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [isPending, startTransition] = useTransition();
  const isDogTraining = service.name.toLowerCase() === "dog training";

  const handleToggle = () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);

    startTransition(async () => {
      const res = await toggleOrganizationServiceAction(organizationId, service.id, nextState);
      if (res?.success) {
        router.refresh();
      } else {
        // Rollback on error
        setIsEnabled(isEnabled);
      }
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Back Button */}
      <div>
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Services
        </Link>
      </div>

      {/* Main Details Card */}
      <Card className="border border-border bg-card shadow-lg relative overflow-hidden">
        {/* Glow decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                {service.name}
              </CardTitle>
              {!isDogTraining && (
                <CardDescription className="text-sm">
                  Service Template Identifier: {service.id}
                </CardDescription>
              )}
            </div>
            
            {/* Status Badge */}
            <div>
              {isEnabled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                  <XCircle className="size-3.5" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Toggle Control Area */}
          {!isDogTraining && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border bg-muted/20 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-foreground">
                  Service Status
                </span>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Toggle to enable or disable this service. Enabled services will automatically populate the sidebar navigation menu.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                disabled={isPending}
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${
                  isEnabled ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Sub-Services tabs for dog training */}
          {service.name.toLowerCase() === "dog training" && (
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-semibold">
                Sub-Services configuration
              </h3>
              <DogTrainingTabs
                activeTabProp={activeSubServiceTab}
                enabledSubServiceIds={enabledSubServiceIds}
                subServicesOrder={service.subServicesOrder ? service.subServicesOrder.split(",").map(s => s.trim()).filter(Boolean) : []}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
