"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import { WysiwygEditor } from "@/components/wysiwyg-editor";

export interface CoursePlayYardTabProps {
  playYard: boolean;
  onPlayYardChange: (v: boolean) => void;
  playYardDetails: string;
  onPlayYardDetailsChange: (v: string) => void;
  pool: boolean;
  onPoolChange: (v: boolean) => void;
  poolDetails: string;
  onPoolDetailsChange: (v: string) => void;
  socializationPolicy: string;
  onSocializationPolicyChange: (v: string) => void;
}

/**
 * CoursePlayYardTab Component
 *
 * Renders the "Play yard & socialization" tab for Dog Boarding services:
 * - Fenced outdoor play yard toggle with features & amenities details
 * - Dog swimming pool & splash area toggle with amenities & safety details
 * - Socialization, group play, and temperament assessment policy WYSIWYG editor
 */
export function CoursePlayYardTab({
  playYard,
  onPlayYardChange,
  playYardDetails,
  onPlayYardDetailsChange,
  pool,
  onPoolChange,
  poolDetails,
  onPoolDetailsChange,
  socializationPolicy,
  onSocializationPolicyChange,
}: CoursePlayYardTabProps) {
  return (
    <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
        <h3 className="text-base font-bold text-foreground">Play Yard &amp; Socialization Areas</h3>
        <p className="text-xs text-muted-foreground">
          Configure outdoor exercise spaces, play yards, swimming pools, agility areas, and your boarding socialization policy.
        </p>
      </div>

      {/* Fenced Outdoor Play Yard Toggle */}
      <BooleanToggleField
        label="Fenced Outdoor Play Yard & Exercise Area"
        description="Does your boarding facility have a dedicated outdoor play yard or secure exercise space?"
        checked={playYard}
        onChange={onPlayYardChange}
      >
        <div className="space-y-2">
          <Label>Play Yard Features &amp; Amenities</Label>
          <WysiwygEditor
            value={playYardDetails}
            onChange={onPlayYardDetailsChange}
            placeholder="e.g. 500 sqm natural grass play area, 2-meter secure double fencing, splash pads, agility tunnel and enrichment toys..."
          />
        </div>
      </BooleanToggleField>

      <div className="h-px bg-border/60" />

      {/* Dog Swimming Pool Toggle */}
      <BooleanToggleField
        label="Dog Swimming Pool & Splash Area"
        description="Do you have a dedicated canine swimming pool, splash pad, or water play area for boarded pets?"
        checked={pool}
        onChange={onPoolChange}
      >
        <div className="space-y-2">
          <Label>Swimming Pool &amp; Water Play Details</Label>
          <WysiwygEditor
            value={poolDetails}
            onChange={onPoolDetailsChange}
            placeholder="e.g. Inground canine pool with gentle ramp entry, filtered and chlorine-free water, canine life jackets provided, 1-on-1 staff supervision at all times, seasonal availability (May-Sept)..."
          />
        </div>
      </BooleanToggleField>

      <div className="h-px bg-border/60" />

      {/* Socialization & Group Play Policy */}
      <div className="space-y-2">
        <div className="flex flex-col gap-0.5">
          <Label className="text-xs font-semibold">Socialization &amp; Group Play Policy</Label>
          <span className="text-[11px] text-muted-foreground">
            Describe temperament testing protocols, supervised small-group play rules, and individual play arrangements for non-social or reactive dogs.
          </span>
        </div>
        <WysiwygEditor
          value={socializationPolicy}
          onChange={onSocializationPolicyChange}
          placeholder="e.g. All dogs undergo a behavioral temperament assessment upon arrival. Supervised small group play sessions (3-5 compatible dogs) separated by size and play style. Solitary one-on-one play sessions provided for intact or reactive dogs..."
        />
      </div>
    </div>
  );
}
