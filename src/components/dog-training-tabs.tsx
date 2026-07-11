"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { SUB_SERVICE_KEY_TO_DB_ID } from "@/config/dog-training";
import { updateSubServiceSettingsAction } from "@/app/actions/subservices";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { WYSIWYGEditor } from "@/components/ui/wysiwyg";

interface DogTrainingTabsProps {
  activeTabProp?: string;
  enabledSubServiceIds?: string[];
  subServicesOrder?: string[];
  organization?: any;
}



function DogTrainingTabsContent({ activeTabProp, enabledSubServiceIds, subServicesOrder = [], organization }: DogTrainingTabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const segments = pathname.split("/");
  const dogTrainingIdx = segments.indexOf("dog-training");
  const basePath = dogTrainingIdx !== -1 ? segments.slice(0, dogTrainingIdx + 1).join("/") : "";

  const isBackoffice = pathname.includes("/backoffice/organizations/services/");
  const orgId = isBackoffice ? segments[segments.length - 1] : "";

  const tabs = [
    {
      id: "basic-training-and-obedience",
      label: "Basic Training and Obedience",
      title: "Basic Training and Obedience",
      content: "This foundational course focuses on basic commands such as Sit, Stay, Come, Down, and Heel, alongside essential leash etiquette and boundary manners.",
    },
    {
      id: "group-basic-obedience-training",
      label: "Group Basic Obedience Training",
      title: "Group Basic Obedience Training",
      content: "Interactive group training sessions to foster high socialization. Ideal for learning basic control and focus amidst external distractions.",
    },
    {
      id: "private-training",
      label: "Private training",
      title: "Private training",
      content: "Tailored 1-on-1 coaching focusing on your dog's unique traits. Perfect for customized behavioral adjustment plans and flexible pacing.",
    },
    {
      id: "search-and-rescue-training",
      label: "Search & Rescue Training",
      title: "Search & Rescue Training",
      content: "Advanced tracking and scent training. Instructs canine intelligence to locate lost persons or search complex environments.",
    },
    {
      id: "show-training-and-handling",
      label: "Show Training and Handling",
      title: "Show Training and Handling",
      content: "Prepares dogs and handlers for the conformation ring. Covers pacing, stack positioning, judge inspection posture, and display rules.",
    },
  ];

  if (subServicesOrder && subServicesOrder.length > 0) {
    tabs.sort((a, b) => {
      const idxA = subServicesOrder.indexOf(SUB_SERVICE_KEY_TO_DB_ID[a.id]);
      const idxB = subServicesOrder.indexOf(SUB_SERVICE_KEY_TO_DB_ID[b.id]);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  const [activeTab, setActiveTab] = useState(activeTabProp || tabs[0].id);

  useEffect(() => {
    if (activeTabProp) {
      setActiveTab(activeTabProp);
    } else {
      const tabParam = searchParams.get("tab");
      if (tabParam) {
        const match = tabs.find((t) => t.id === tabParam);
        if (match) {
          setActiveTab(match.id);
        }
      }
    }
  }, [activeTabProp, searchParams]);

  // Form states for sub-service settings
  const [hasField, setHasField] = useState(false);
  const [fieldDesc, setFieldDesc] = useState("");
  const [hasParking, setHasParking] = useState(false);
  const [parkingDesc, setParkingDesc] = useState("");
  const [terms, setTerms] = useState("");
  const [programIncludes, setProgramIncludes] = useState("");
  const [hasCertifiedTrainer, setHasCertifiedTrainer] = useState(false);
  const [trainerInstitution, setTrainerInstitution] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFormError(null);
    setFormSuccess(false);

    if (activeTab === "basic-training-and-obedience") {
      setHasField(organization?.basicHasField ?? false);
      setFieldDesc(organization?.basicFieldDesc ?? "");
      setHasParking(organization?.basicHasParking ?? false);
      setParkingDesc(organization?.basicParkingDesc ?? "");
      setTerms(organization?.basicTerms ?? "");
      setProgramIncludes(organization?.basicProgramIncludes ?? "");
      setHasCertifiedTrainer(organization?.basicHasCertifiedTrainer ?? false);
      setTrainerInstitution(organization?.basicTrainerInstitution ?? "");
    } else if (activeTab === "group-basic-obedience-training") {
      setHasField(organization?.groupHasField ?? false);
      setFieldDesc(organization?.groupFieldDesc ?? "");
      setHasParking(organization?.groupHasParking ?? false);
      setParkingDesc(organization?.groupParkingDesc ?? "");
      setTerms(organization?.groupTerms ?? "");
      setProgramIncludes(organization?.groupProgramIncludes ?? "");
      setHasCertifiedTrainer(organization?.groupHasCertifiedTrainer ?? false);
      setTrainerInstitution(organization?.groupTrainerInstitution ?? "");
    }
  }, [activeTab, organization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (hasField && !fieldDesc.trim()) {
      setFormError("Training field description is required when dedicated training field is enabled.");
      return;
    }
    if (hasParking && !parkingDesc.trim()) {
      setFormError("Parking description is required when parking is enabled.");
      return;
    }
    if (hasCertifiedTrainer && !trainerInstitution.trim()) {
      setFormError("Certifier name is required when certified dog trainer is enabled.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("subServiceId", activeTab);
      formData.append("orgId", organization?.id || "");
      formData.append("hasField", String(hasField));
      formData.append("fieldDesc", fieldDesc);
      formData.append("hasParking", String(hasParking));
      formData.append("parkingDesc", parkingDesc);
      formData.append("terms", terms);
      formData.append("programIncludes", programIncludes);
      formData.append("hasCertifiedTrainer", String(hasCertifiedTrainer));
      formData.append("trainerInstitution", trainerInstitution);

      const res = await updateSubServiceSettingsAction(null, formData);
      if (res?.success) {
        setFormSuccess(true);
        router.refresh();
      } else {
        setFormError(res?.error || "Failed to save settings.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation Menu */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          const dbId = SUB_SERVICE_KEY_TO_DB_ID[tab.id];
          const isSubEnabled = enabledSubServiceIds ? enabledSubServiceIds.includes(dbId) : true;

          const className = `px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            !isSubEnabled
              ? "opacity-40 bg-muted/30 text-muted-foreground/60 cursor-not-allowed pointer-events-none border border-transparent select-none"
              : isActive
                ? "bg-primary text-primary-foreground shadow-sm cursor-pointer"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
          }`;

          if (!isSubEnabled) {
            return (
              <span
                key={tab.id}
                className={className}
                title={`${tab.label} is currently disabled`}
              >
                {tab.label}
              </span>
            );
          }

          if (basePath) {
            const tabHref = isBackoffice ? `${basePath}/${tab.id}/${orgId}` : `${basePath}/${tab.id}`;
            return (
              <Link
                key={tab.id}
                href={tabHref}
                className={className}
              >
                {tab.label}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={className}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {tabs.map((tab) => {
        if (tab.id !== activeTab) return null;
        
        const isConfigurable = tab.id === "basic-training-and-obedience" || tab.id === "group-basic-obedience-training";

        return (
          <Card key={tab.id} className="border border-border/50 shadow-sm bg-muted/5 rounded-xl">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h4 className="text-base font-bold text-foreground">{tab.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{tab.content}</p>
              </div>

              {isConfigurable && organization && (
                <form onSubmit={handleSubmit} className="pt-6 border-t border-border/60 space-y-6">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Custom Settings
                  </h5>

                  {formSuccess && (
                    <div className="p-3 text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                      Settings saved successfully!
                    </div>
                  )}

                  {formError && (
                    <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                      {formError}
                    </div>
                  )}

                  {/* Certified Dog Trainer Toggle */}
                  <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="hasCertifiedTrainer" className="text-sm font-semibold text-foreground">
                          Certified Dog Trainer
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enable if a certified dog trainer conducts or oversees this program.
                        </p>
                      </div>
                      <button
                        id="hasCertifiedTrainer"
                        type="button"
                        role="switch"
                        aria-checked={hasCertifiedTrainer}
                        disabled={isPending}
                        onClick={() => setHasCertifiedTrainer(!hasCertifiedTrainer)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasCertifiedTrainer ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                            hasCertifiedTrainer ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                     {hasCertifiedTrainer && (
                      <div className="space-y-1.5 pt-1">
                        <Label htmlFor="trainerInstitution" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Certifier name
                        </Label>
                        <input
                          id="trainerInstitution"
                          type="text"
                          value={trainerInstitution}
                          onChange={(e) => setTrainerInstitution(e.target.value)}
                          disabled={isPending}
                          placeholder="Certifier name (e.g. Karen Pryor Academy, CCPDT, etc.)"
                          required
                          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:border-zinc-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* Parking Toggle */}
                  <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="hasParking" className="text-sm font-semibold text-foreground">
                          Parking
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enable if parking is available at the training site.
                        </p>
                      </div>
                      <button
                        id="hasParking"
                        type="button"
                        role="switch"
                        aria-checked={hasParking}
                        disabled={isPending}
                        onClick={() => setHasParking(!hasParking)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasParking ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                            hasParking ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {hasParking && (
                      <div className="space-y-1.5 pt-1">
                        <Label id="parkingDescLabel" htmlFor="parkingDesc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Parking Description
                        </Label>
                        <WYSIWYGEditor
                          id="parkingDesc"
                          ariaLabelledBy="parkingDescLabel"
                          value={parkingDesc}
                          onChange={setParkingDesc}
                          disabled={isPending}
                          placeholder="Describe parking capacity, location, fee..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Dedicated Training Field Toggle */}
                  <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="hasField" className="text-sm font-semibold text-foreground">
                          Dedicated Training Field
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enable if you provide a dedicated training field for lessons.
                        </p>
                      </div>
                      <button
                        id="hasField"
                        type="button"
                        role="switch"
                        aria-checked={hasField}
                        disabled={isPending}
                        onClick={() => setHasField(!hasField)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasField ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                            hasField ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {hasField && (
                      <div className="space-y-1.5 pt-1">
                        <Label id="fieldDescLabel" htmlFor="fieldDesc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Training Field Description
                        </Label>
                        <WYSIWYGEditor
                          id="fieldDesc"
                          ariaLabelledBy="fieldDescLabel"
                          value={fieldDesc}
                          onChange={setFieldDesc}
                          disabled={isPending}
                          placeholder="Describe the training field dimensions, surface, features..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    <Label id="programIncludesLabel" htmlFor="programIncludes" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Details
                    </Label>
                    <WYSIWYGEditor
                      id="programIncludes"
                      ariaLabelledBy="programIncludesLabel"
                      value={programIncludes}
                      onChange={setProgramIncludes}
                      disabled={isPending}
                      placeholder="List details of what participants receive, curriculum items, or package details..."
                    />
                  </div>

                  {/* Terms of Participation */}
                  <div className="space-y-1.5">
                    <Label id="termsLabel" htmlFor="terms" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Terms of Participation
                    </Label>
                    <WYSIWYGEditor
                      id="terms"
                      ariaLabelledBy="termsLabel"
                      value={terms}
                      onChange={setTerms}
                      disabled={isPending}
                      placeholder="Describe standard requirements, vaccination rules, handler presence..."
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                      {isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function DogTrainingTabs({ activeTabProp, enabledSubServiceIds, subServicesOrder, organization }: DogTrainingTabsProps) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading training tabs...</div>}>
      <DogTrainingTabsContent
        activeTabProp={activeTabProp}
        enabledSubServiceIds={enabledSubServiceIds}
        subServicesOrder={subServicesOrder}
        organization={organization}
      />
    </Suspense>
  );
}
