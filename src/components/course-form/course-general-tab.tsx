"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";

interface CourseGeneralTabProps {
  name: string;
  onNameChange: (v: string) => void;
  details: string;
  onDetailsChange: (v: string) => void;
  certifiedTrainer: boolean;
  onCertifiedTrainerChange: (v: boolean) => void;
  certifierName: string;
  onCertifierNameChange: (v: string) => void;
  trainerExperienceDescription: string;
  onTrainerExperienceDescriptionChange: (v: string) => void;
  ageLimitsEnabled: boolean;
  onAgeLimitsEnabledChange: (v: boolean) => void;
  selectedAgeLimits: string[];
  onToggleAgeLimit: (v: string) => void;
  itemNoun: string;
  isDogWalking?: boolean;
  isDogTraining?: boolean;
}

/**
 * CourseGeneralTab Component
 *
 * Renders the General tab fields: Name, Details (rich text), Trainer Certifications, and Age Limits.
 */
export function CourseGeneralTab({
  name,
  onNameChange,
  details,
  onDetailsChange,
  certifiedTrainer,
  onCertifiedTrainerChange,
  certifierName,
  onCertifierNameChange,
  trainerExperienceDescription,
  onTrainerExperienceDescriptionChange,
  ageLimitsEnabled,
  onAgeLimitsEnabledChange,
  selectedAgeLimits,
  onToggleAgeLimit,
  itemNoun,
  isDogWalking = false,
  isDogTraining = false,
}: CourseGeneralTabProps) {
  const hideAgeLimitsOnGeneral =
    isDogWalking ||
    isDogTraining ||
    itemNoun === "Boarding service" ||
    itemNoun === "Course" ||
    itemNoun === "Training course";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <Label htmlFor="course-name">{itemNoun} Name</Label>
        <Input
          id="course-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={
            itemNoun === "Boarding service"
              ? "e.g. Standard Room, VIP Cabin"
              : isDogWalking
              ? "e.g. Standard Neighborhood Walk"
              : "e.g. Agility, IGP, Obedience"
          }
          className="h-10 text-xs rounded-xl"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{itemNoun} Information and Details</Label>
        <WysiwygEditor
          value={details}
          onChange={onDetailsChange}
          placeholder="What does the program include? Explain course objectives, discipline details..."
        />
      </div>

      <BooleanToggleField
        label="Certified Dog Trainer"
        description="Indicate whether this service is conducted by a certified trainer."
        checked={certifiedTrainer}
        onChange={onCertifiedTrainerChange}
      >
        <div className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="certifier-name">Certifier Name</Label>
            <Input
              id="certifier-name"
              type="text"
              value={certifierName}
              onChange={(e) => onCertifierNameChange(e.target.value)}
              placeholder="e.g. ACHR (Asociația Chinologică Română), APDT, KNPV"
              className="h-10 text-xs rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Trainer Qualifications &amp; Experience</Label>
            <WysiwygEditor
              value={trainerExperienceDescription}
              onChange={onTrainerExperienceDescriptionChange}
              placeholder="Describe trainer background, certifications, and dog handling history..."
            />
          </div>
        </div>
      </BooleanToggleField>

      {!hideAgeLimitsOnGeneral && (
        <BooleanToggleField
          label="Age Limits &amp; Restrictions"
          description="Specify recommended dog age categories for participation."
          checked={ageLimitsEnabled}
          onChange={onAgeLimitsEnabledChange}
        >
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold">Allowed Dog Age Groups</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                "Puppy (2-6 mos)",
                "Junior (6-12 mos)",
                "Adult (1-7 yrs)",
                "Senior (7+ yrs)",
              ].map((label) => {
                const isSelected = selectedAgeLimits.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onToggleAgeLimit(label)}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:bg-muted/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </BooleanToggleField>
      )}
    </div>
  );
}
