"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import {
  SPOKEN_LANGUAGES_LIST,
  DOG_SPORT_DISCIPLINES,
  DOG_TRAINING_TOPICS,
  DOG_TRAINING_FORMATS,
} from "@/types/course";

export { DOG_SPORT_DISCIPLINES, DOG_TRAINING_TOPICS, DOG_TRAINING_FORMATS };

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
  veterinaryTraining?: boolean;
  onVeterinaryTrainingChange?: (v: boolean) => void;
  veterinaryTrainingCertifier?: string;
  onVeterinaryTrainingCertifierChange?: (v: string) => void;
  veterinaryTrainingDetails?: string;
  onVeterinaryTrainingDetailsChange?: (v: string) => void;
  trainingFormat?: string;
  onTrainingFormatChange?: (v: string) => void;
  maxDogsPerGroup?: number | null;
  onMaxDogsPerGroupChange?: (v: number | null) => void;
  spokenLanguages?: string[];
  onToggleLanguage?: (lang: string) => void;
  ageLimitsEnabled: boolean;
  onAgeLimitsEnabledChange: (v: boolean) => void;
  selectedAgeLimits: string[];
  onToggleAgeLimit: (v: string) => void;
  itemNoun: string;
  isDogWalking?: boolean;
  isDogTraining?: boolean;
  isDogSport?: boolean;
  isDogSitter?: boolean;
  isGrooming?: boolean;
  hideAgeLimits?: boolean;
}

/**
 * CourseGeneralTab Component
 *
 * Renders the General tab fields: Name, Details (rich text), Trainer Certifications, and Veterinary Training.
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
  veterinaryTraining = false,
  onVeterinaryTrainingChange,
  veterinaryTrainingCertifier = "",
  onVeterinaryTrainingCertifierChange,
  veterinaryTrainingDetails = "",
  onVeterinaryTrainingDetailsChange,
  trainingFormat = "",
  onTrainingFormatChange,
  maxDogsPerGroup = null,
  onMaxDogsPerGroupChange,
  spokenLanguages = ["Romanian", "English"],
  onToggleLanguage = () => {},
  ageLimitsEnabled,
  onAgeLimitsEnabledChange,
  selectedAgeLimits,
  onToggleAgeLimit,
  itemNoun,
  isDogWalking = false,
  isDogTraining = false,
  isDogSport = false,
  isDogSitter = false,
  isGrooming = false,
  hideAgeLimits = false,
}: CourseGeneralTabProps) {
  const hideAgeLimitsOnGeneral =
    hideAgeLimits ||
    isDogWalking ||
    isDogTraining ||
    isDogSport ||
    isDogSitter ||
    isGrooming ||
    itemNoun === "Dog Sport" ||
    itemNoun === "Boarding service" ||
    itemNoun === "Course" ||
    itemNoun === "Training course" ||
    itemNoun === "Sitting service" ||
    itemNoun === "Grooming service";

  const getNamePlaceholder = () => {
    if (isGrooming || itemNoun === "Grooming service") {
      return "e.g. Full Grooming & Bath";
    }
    if (isDogSitter || itemNoun === "Sitting service") {
      return "e.g. In-Home Sitting, Daytime Visit, Overnight Care";
    }
    if (isDogWalking || itemNoun === "Dog Walking" || itemNoun === "Walking service") {
      return "e.g. Standard Neighborhood Walk";
    }
    if (itemNoun === "Boarding service") {
      return "e.g. Standard Room, VIP Cabin";
    }
    return "e.g. Agility, IGP, Obedience";
  };

  const getDetailsPlaceholder = () => {
    if (isGrooming || itemNoun === "Grooming service") {
      return "Describe what the grooming service includes (bath, haircut, brush, nail clipping)...";
    }
    if (isDogSitter || itemNoun === "Sitting service") {
      return "Describe what the sitting service includes (feeding, playtime, supervision, home visits)...";
    }
    if (isDogWalking || itemNoun === "Dog Walking" || itemNoun === "Walking service") {
      return "Describe the walking routine, duration, group size, and route details...";
    }
    if (itemNoun === "Boarding service") {
      return "Describe accommodation amenities, feeding schedules, room features, and daily care routines...";
    }
    return "What does the program include? Explain course objectives, discipline details...";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sitting Type Preset Selector */}
      {(isDogSitter || itemNoun === "Sitting service") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">Sitting Type</Label>
            <span className="text-[11px] text-muted-foreground">Select a standard preset or customize name below</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "In home sitting",
              "Daytime visit",
              "Daytime visit with walk",
              "Overnight stay",
            ].map((preset) => {
              const isSelected = name.trim().toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onNameChange(preset)}
                  className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* Dog Sport Disciplines Selector */}
      {(isDogSport || itemNoun === "Dog Sport") && (
        <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">Sport Discipline</Label>
            <span className="text-[11px] text-muted-foreground">Select a standard discipline or customize name below</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DOG_SPORT_DISCIPLINES.map((discipline) => {
              const isSelected = name.trim().toLowerCase() === discipline.toLowerCase();
              return (
                <button
                  key={discipline}
                  type="button"
                  onClick={() => onNameChange(discipline)}
                  className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {discipline}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dog Training Topic / Discipline Presets (Optional quick-fill) */}
      {(isDogTraining || itemNoun === "Training course" || itemNoun === "Course") && (
        <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">Course Topic / Specialization</Label>
            <span className="text-[11px] text-muted-foreground">Select a standard course topic or customize name below</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DOG_TRAINING_TOPICS.map((topic) => {
              const isSelected = name.trim().toLowerCase() === topic.toLowerCase();
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onNameChange(topic)}
                  className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dog Training Format / Delivery Mode Selector (Group Class, Private 1-on-1, etc.) */}
      {(isDogTraining || itemNoun === "Training course" || itemNoun === "Course") && onTrainingFormatChange && (
        <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">Training Format / Delivery Mode</Label>
            <span className="text-[11px] text-muted-foreground">Select how training is conducted</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DOG_TRAINING_FORMATS.map((format) => {
              const isSelected = trainingFormat === format;
              return (
                <button
                  key={format}
                  type="button"
                  onClick={() => onTrainingFormatChange(format)}
                  className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {format}
                </button>
              );
            })}
          </div>

          {trainingFormat === "Group Class" && onMaxDogsPerGroupChange && (
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <Label htmlFor="max-dogs-group" className="text-xs font-semibold">Maximum Dogs Per Group</Label>
              <Input
                id="max-dogs-group"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={maxDogsPerGroup || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  onMaxDogsPerGroupChange(val ? parseInt(val, 10) : null);
                }}
                placeholder="e.g. 6"
                className="h-9 text-xs rounded-xl w-36"
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="course-name">{itemNoun} Name</Label>
        <Input
          id="course-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={getNamePlaceholder()}
          className="h-10 text-xs rounded-xl"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{itemNoun} Information and Details</Label>
        <WysiwygEditor
          value={details}
          onChange={onDetailsChange}
          placeholder={getDetailsPlaceholder()}
        />
      </div>

      {/* Spoken Languages Selector */}
      <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-muted/20">
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-semibold text-foreground">Spoken Languages</Label>
          <span className="text-[11px] text-muted-foreground">Select the languages staff / instructors can comfortably communicate in with pet owners</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {SPOKEN_LANGUAGES_LIST.map((lang) => {
            const isSelected = spokenLanguages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => onToggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                    : "bg-card text-muted-foreground hover:bg-muted/70 hover:text-foreground border-border"
                }`}
              >
                {isSelected && <span>✓</span>}
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {!isGrooming && itemNoun !== "Grooming service" && (
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
      )}

      {(isDogSitter || itemNoun === "Sitting service") && (
        <BooleanToggleField
          label="Veterinary Training"
          description="Indicate whether the sitter has veterinary qualifications or specialized medical handling training."
          checked={veterinaryTraining}
          onChange={onVeterinaryTrainingChange || (() => {})}
        >
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="vet-certifier-name">Certifier / Institution Name</Label>
              <Input
                id="vet-certifier-name"
                type="text"
                value={veterinaryTrainingCertifier}
                onChange={(e) => onVeterinaryTrainingCertifierChange?.(e.target.value)}
                placeholder="e.g. USAMV, Veterinary Technician Certification, Vet Assistant Diploma"
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Veterinary Qualifications &amp; Experience</Label>
              <WysiwygEditor
                value={veterinaryTrainingDetails}
                onChange={onVeterinaryTrainingDetailsChange || (() => {})}
                placeholder="Describe veterinary background, clinical training, emergency first aid certifications..."
              />
            </div>
          </div>
        </BooleanToggleField>
      )}

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
