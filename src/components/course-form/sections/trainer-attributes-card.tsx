"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import { WysiwygEditor } from "@/components/wysiwyg-editor";

export interface TrainerAttributesCardProps {
  itemNoun: string;
  /** When true, renders without a card wrapper (used in the flat layout's existing card). */
  bare?: boolean;
  certifiedTrainer: boolean;
  onCertifiedTrainerChange: (v: boolean) => void;
  certifierName: string;
  onCertifierNameChange: (v: string) => void;
  trainerExperienceDescription: string;
  onTrainerExperienceDescriptionChange: (v: string) => void;
}

/**
 * TrainerAttributesCard — Renders the Certified Dog Trainer toggle and trainer
 * experience description fields.
 * Used in the tabbed layout's General tab and the flat layout's Trainer & Facility Attributes card.
 */
export function TrainerAttributesCard({
  itemNoun,
  bare = false,
  certifiedTrainer,
  onCertifiedTrainerChange,
  certifierName,
  onCertifierNameChange,
  trainerExperienceDescription,
  onTrainerExperienceDescriptionChange,
}: TrainerAttributesCardProps) {
  const content = (
    <>
      <BooleanToggleField
        label="Certified Dog Trainer"
        description={`Enable if this ${(itemNoun || "course").toLowerCase()} is coached by an officially certified trainer.`}
        checked={certifiedTrainer}
        onChange={onCertifiedTrainerChange}
      >
        <div className="space-y-2">
          <Label htmlFor="certifier-name" className="text-xs font-semibold">Certifier Name</Label>
          <Input
            id="certifier-name"
            type="text"
            placeholder="Name of certifying institution/body"
            value={certifierName}
            onChange={(e) => onCertifierNameChange(e.target.value)}
            className="h-9 bg-background text-xs font-semibold rounded-lg"
          />
        </div>
      </BooleanToggleField>

      <div className="h-px bg-border/40" />

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Experience Description</Label>
        <WysiwygEditor
          value={trainerExperienceDescription}
          onChange={onTrainerExperienceDescriptionChange}
          placeholder="Describe trainer background, qualifications, experience, accomplishments..."
        />
      </div>
    </>
  );

  if (bare) return <>{content}</>;

  return (
    <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
        Trainer Attributes
      </h3>
      {content}
    </div>
  );
}
