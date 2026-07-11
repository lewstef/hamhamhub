"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { SUB_SERVICE_KEY_TO_DB_ID } from "@/config/dog-training";

interface DogTrainingTabsProps {
  activeTabProp?: string;
  enabledSubServiceIds?: string[];
  subServicesOrder?: string[];
}



function DogTrainingTabsContent({ activeTabProp, enabledSubServiceIds, subServicesOrder = [] }: DogTrainingTabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
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
        return (
          <Card key={tab.id} className="border border-border/50 shadow-sm bg-muted/5 rounded-xl">
            <CardContent className="p-6 space-y-2">
              <h4 className="text-base font-bold text-foreground">{tab.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{tab.content}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function DogTrainingTabs({ activeTabProp, enabledSubServiceIds, subServicesOrder }: DogTrainingTabsProps) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading training tabs...</div>}>
      <DogTrainingTabsContent
        activeTabProp={activeTabProp}
        enabledSubServiceIds={enabledSubServiceIds}
        subServicesOrder={subServicesOrder}
      />
    </Suspense>
  );
}
