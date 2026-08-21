"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import { Scale, CheckCheck, RotateCcw, Check, Minus, Plus, Sparkles } from "lucide-react";
import {
  SPOKEN_LANGUAGES_LIST,
  DOG_SPORT_DISCIPLINES,
  DOG_TRAINING_TOPICS,
  DOG_TRAINING_FORMATS,
  DOG_GROOMING_WEIGHT_KG,
  DOG_GROOMING_WEIGHT_TIERS,
  formatWeightRanges,
} from "@/types/course";

export {
  DOG_SPORT_DISCIPLINES,
  DOG_TRAINING_TOPICS,
  DOG_TRAINING_FORMATS,
  DOG_GROOMING_WEIGHT_KG,
  DOG_GROOMING_WEIGHT_TIERS,
  formatWeightRanges,
};

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
  acceptedDogWeight?: string[];
  onToggleWeight?: (kg: number | string) => void;
  onSelectAllWeight?: () => void;
  onClearWeight?: () => void;
  onSetWeightRange?: (start: number, end: number) => void;
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
  acceptedDogWeight = [],
  onToggleWeight,
  onSelectAllWeight,
  onClearWeight,
  onSetWeightRange,
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
              const isSelected = (name || "").trim().toLowerCase() === (preset || "").toLowerCase();
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
              const isSelected = (name || "").trim().toLowerCase() === (discipline || "").toLowerCase();
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
              const isSelected = (name || "").trim().toLowerCase() === (topic || "").toLowerCase();
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

      {/* Weight & Killograms Section for Dog Grooming (Min-Max Range Slider & Stepper) */}
      {(isGrooming || itemNoun === "Grooming service") && (
        <GroomingWeightSection
          acceptedDogWeight={acceptedDogWeight}
          onSetWeightRange={onSetWeightRange}
          onSelectAllWeight={onSelectAllWeight}
          onClearWeight={onClearWeight}
        />
      )}

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

interface GroomingWeightSectionProps {
  acceptedDogWeight: string[];
  onSetWeightRange?: (start: number, end: number) => void;
  onSelectAllWeight?: () => void;
  onClearWeight?: () => void;
}

export function GroomingWeightSection({
  acceptedDogWeight,
  onSetWeightRange,
  onSelectAllWeight,
  onClearWeight,
}: GroomingWeightSectionProps) {
  const weightNumbers = acceptedDogWeight
    .map(Number)
    .filter((n) => !isNaN(n) && n >= 1 && n <= 100)
    .sort((a, b) => a - b);

  const minWeight = weightNumbers.length > 0 ? weightNumbers[0] : 1;
  const maxWeight = weightNumbers.length > 0 ? weightNumbers[weightNumbers.length - 1] : 100;
  const isAllSelected = acceptedDogWeight.length >= 100;

  // Local state for exact numeric keyboard editing without jumping cursor
  const [minInput, setMinInput] = useState(String(minWeight));
  const [maxInput, setMaxInput] = useState(String(maxWeight));

  useEffect(() => {
    setMinInput(String(minWeight));
  }, [minWeight]);

  useEffect(() => {
    setMaxInput(String(maxWeight));
  }, [maxWeight]);

  const handleUpdateMin = (val: number) => {
    const clamped = Math.max(1, Math.min(maxWeight, val));
    onSetWeightRange?.(clamped, maxWeight);
  };

  const handleUpdateMax = (val: number) => {
    const clamped = Math.min(100, Math.max(minWeight, val));
    onSetWeightRange?.(minWeight, clamped);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setMinInput(raw);
    if (raw === "") return;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
      if (parsed > maxWeight) {
        onSetWeightRange?.(parsed, parsed);
      } else {
        onSetWeightRange?.(parsed, maxWeight);
      }
    }
  };

  const handleMinInputBlur = () => {
    const parsed = parseInt(minInput, 10);
    if (isNaN(parsed) || parsed < 1) {
      setMinInput("1");
      onSetWeightRange?.(1, maxWeight);
    } else {
      const clamped = Math.max(1, Math.min(100, parsed));
      const targetMin = Math.min(clamped, maxWeight);
      setMinInput(String(targetMin));
      onSetWeightRange?.(targetMin, maxWeight);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setMaxInput(raw);
    if (raw === "") return;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
      if (parsed >= minWeight) {
        onSetWeightRange?.(minWeight, parsed);
      }
    }
  };

  const handleMaxInputBlur = () => {
    const parsed = parseInt(maxInput, 10);
    if (isNaN(parsed) || parsed < 1) {
      setMaxInput(String(Math.max(minWeight, 100)));
      onSetWeightRange?.(minWeight, 100);
    } else {
      const clamped = Math.max(1, Math.min(100, parsed));
      const targetMax = Math.max(clamped, minWeight);
      setMaxInput(String(targetMax));
      onSetWeightRange?.(minWeight, targetMax);
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const clickedWeight = Math.round(1 + percent * 99);
    const distToMin = Math.abs(clickedWeight - minWeight);
    const distToMax = Math.abs(clickedWeight - maxWeight);
    if (distToMin <= distToMax) {
      onSetWeightRange?.(clickedWeight, Math.max(clickedWeight, maxWeight));
    } else {
      onSetWeightRange?.(Math.min(minWeight, clickedWeight), clickedWeight);
    }
  };

  // Percentage for slider track background
  const minPercent = ((minWeight - 1) / 99) * 100;
  const maxPercent = ((maxWeight - 1) / 99) * 100;

  return (
    <div className="space-y-5 p-6 rounded-2xl border border-border/80 bg-card shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5">
              <Scale className="size-4 text-primary" />
              Weight
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {minWeight} – {maxWeight >= 100 ? "100+ kg" : `${maxWeight} kg`} ({maxWeight - minWeight + 1} kg range)
            </span>
          </div>
          <Label className="text-xs font-semibold text-foreground">Killograms</Label>
          <p className="text-[11px] text-muted-foreground">
            Specify the minimum and maximum dog weight accepted for this grooming service (from 1 to 100+ kg).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSelectAllWeight}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              isAllSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary"
            }`}
          >
            <CheckCheck className="size-3.5" />
            All Weights (1–100+ kg)
          </button>
          <button
            type="button"
            onClick={onClearWeight}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Stepper Inputs Block (Keyboard-Editable with Suffix) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Min Weight Stepper & Keyboard Input */}
        <div className="p-4 rounded-xl border border-border/70 bg-muted/20 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Minimum Weight</span>
            <span className="text-[11px] text-muted-foreground font-medium">Editable via keyboard & buttons</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Decrease min weight"
              onClick={() => handleUpdateMin(minWeight - 1)}
              disabled={minWeight <= 1}
              className="size-10 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:pointer-events-none text-foreground font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Minus className="size-4" />
            </button>
            <div className="relative flex-1 flex items-center">
              <input
                type="number"
                id="grooming-min-weight-input"
                aria-label="Minimum weight (kg)"
                min={1}
                max={100}
                value={minInput}
                onChange={handleMinInputChange}
                onBlur={handleMinInputBlur}
                className="w-full h-10 rounded-xl border border-input bg-background pl-3 pr-8 font-bold text-base text-foreground text-center shadow-xs focus-visible:border-ring focus-visible:ring-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-3 text-xs text-muted-foreground font-semibold pointer-events-none">
                kg
              </span>
            </div>
            <button
              type="button"
              aria-label="Increase min weight"
              onClick={() => handleUpdateMin(minWeight + 1)}
              disabled={minWeight >= maxWeight}
              className="size-10 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:pointer-events-none text-foreground font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {/* Max Weight Stepper & Keyboard Input */}
        <div className="p-4 rounded-xl border border-border/70 bg-muted/20 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Maximum Weight</span>
            <span className="text-[11px] text-muted-foreground font-medium">Editable via keyboard & buttons</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Decrease max weight"
              onClick={() => handleUpdateMax(maxWeight - 1)}
              disabled={maxWeight <= minWeight}
              className="size-10 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:pointer-events-none text-foreground font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Minus className="size-4" />
            </button>
            <div className="relative flex-1 flex items-center">
              <input
                type="number"
                id="grooming-max-weight-input"
                aria-label="Maximum weight (kg)"
                min={1}
                max={100}
                value={maxInput}
                onChange={handleMaxInputChange}
                onBlur={handleMaxInputBlur}
                className="w-full h-10 rounded-xl border border-input bg-background pl-3 pr-8 font-bold text-base text-foreground text-center shadow-xs focus-visible:border-ring focus-visible:ring-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-3 text-xs text-muted-foreground font-semibold pointer-events-none">
                kg
              </span>
            </div>
            <button
              type="button"
              aria-label="Increase max weight"
              onClick={() => handleUpdateMax(maxWeight + 1)}
              disabled={maxWeight >= 100}
              className="size-10 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:pointer-events-none text-foreground font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Dual Slider Track */}
      <div className="space-y-2.5 px-1 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Range Slider</span>
          <span className="text-foreground font-semibold">
            {minWeight} kg — {maxWeight >= 100 ? "100+ kg" : `${maxWeight} kg`}
          </span>
        </div>

        <div
          onClick={handleTrackClick}
          className="relative h-9 flex items-center cursor-pointer group"
          title="Click anywhere to jump the nearest marker, or drag min/max sliders"
        >
          {/* Background Base Bar */}
          <div className="absolute left-0 right-0 h-3 rounded-full bg-muted/80 border border-border/50 transition-colors group-hover:bg-muted" />
          {/* Active Highlighted Interval */}
          <div
            className="absolute h-3 rounded-full bg-primary shadow-xs transition-all pointer-events-none"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(2, maxPercent - minPercent)}%`,
            }}
          />
          {/* Native Min Input Range */}
          <input
            type="range"
            min={1}
            max={100}
            value={minWeight}
            aria-label="Minimum weight slider"
            onChange={(e) => handleUpdateMin(Number(e.target.value))}
            className={`absolute w-full h-9 opacity-0 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab [&::-moz-range-thumb]:cursor-grab [&::-webkit-slider-thumb]:size-7 [&::-moz-range-thumb]:size-7 ${
              minWeight > 80 ? "z-30" : "z-25"
            }`}
          />
          {/* Native Max Input Range */}
          <input
            type="range"
            min={1}
            max={100}
            value={maxWeight}
            aria-label="Maximum weight slider"
            onChange={(e) => handleUpdateMax(Number(e.target.value))}
            className={`absolute w-full h-9 opacity-0 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab [&::-moz-range-thumb]:cursor-grab [&::-webkit-slider-thumb]:size-7 [&::-moz-range-thumb]:size-7 ${
              minWeight > 80 ? "z-20" : "z-24"
            }`}
          />

          {/* Visual Thumb Indicators */}
          <div
            className="absolute size-6 rounded-full bg-background border-[2.5px] border-primary shadow-md -translate-x-1/2 pointer-events-none z-15 flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ left: `${minPercent}%` }}
          >
            <div className="size-1.5 rounded-full bg-primary" />
          </div>
          <div
            className="absolute size-6 rounded-full bg-background border-[2.5px] border-primary shadow-md -translate-x-1/2 pointer-events-none z-15 flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ left: `${maxPercent}%` }}
          >
            <div className="size-1.5 rounded-full bg-primary" />
          </div>
        </div>

        {/* Tick Markers */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground px-0.5">
          <span>1 kg</span>
          <span>25 kg</span>
          <span>50 kg</span>
          <span>75 kg</span>
          <span>100+ kg</span>
        </div>
      </div>

      {/* Quick Breed Presets */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
          <Sparkles className="size-3 text-primary" />
          Quick Breed Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Mini Breed", rangeLabel: "1 – 4 kg", range: [1, 4] },
            { label: "Small Breed", rangeLabel: "4 – 10 kg", range: [4, 10] },
            { label: "Medium Breed", rangeLabel: "10 – 25 kg", range: [10, 25] },
            { label: "Large Breed", rangeLabel: "25 – 45 kg", range: [25, 45] },
            { label: "Giant Breed", rangeLabel: "45 – 100+ kg", range: [45, 100] },
            { label: "All Weights", rangeLabel: "1 – 100+ kg", range: [1, 100] },
          ].map((preset) => {
            const isPresetActive =
              minWeight === preset.range[0] && maxWeight === preset.range[1];
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSetWeightRange?.(preset.range[0], preset.range[1])}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isPresetActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                    : "bg-muted/40 text-foreground border-border/80 hover:bg-muted hover:border-border"
                }`}
              >
                <span>{preset.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isPresetActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background/80 text-muted-foreground"
                  }`}
                >
                  {preset.rangeLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
