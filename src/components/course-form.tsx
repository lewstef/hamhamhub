"use client";

import React, { useState, useTransition } from "react";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

interface Course {
  id?: string;
  name: string;
  certifiedTrainer: boolean;
  certifierName?: string | null;
  dedicatedField: boolean;
  trainingFieldDescription?: string | null;
  parking: boolean;
  parkingDescription?: string | null;
  details?: string | null;
  termsOfParticipation?: string | null;
  price?: string | null;
}

interface CourseFormProps {
  initialCourse?: Course;
  onCancel: () => void;
  onSubmitSuccess: () => void;
}

export function CourseForm({ initialCourse, onCancel, onSubmitSuccess }: CourseFormProps) {
  const isEdit = !!initialCourse?.id;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialCourse?.name || "");
  const [certifiedTrainer, setCertifiedTrainer] = useState(initialCourse?.certifiedTrainer || false);
  const [certifierName, setCertifierName] = useState(initialCourse?.certifierName || "");
  const [dedicatedField, setDedicatedField] = useState(initialCourse?.dedicatedField || false);
  const [trainingFieldDescription, setTrainingFieldDescription] = useState(initialCourse?.trainingFieldDescription || "");
  const [parking, setParking] = useState(initialCourse?.parking || false);
  const [parkingDescription, setParkingDescription] = useState(initialCourse?.parkingDescription || "");
  const [details, setDetails] = useState(initialCourse?.details || "");
  const [termsOfParticipation, setTermsOfParticipation] = useState(initialCourse?.termsOfParticipation || "");
  const [price, setPrice] = useState(initialCourse?.price || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Course name is required.");
      return;
    }

    setError(null);
    const formData = new FormData();
    if (isEdit && initialCourse?.id) {
      formData.append("id", initialCourse.id);
    }
    formData.append("name", name);
    formData.append("price", price);
    formData.append("certifiedTrainer", String(certifiedTrainer));
    formData.append("certifierName", certifierName);
    formData.append("dedicatedField", String(dedicatedField));
    formData.append("trainingFieldDescription", trainingFieldDescription);
    formData.append("parking", String(parking));
    formData.append("parkingDescription", parkingDescription);
    formData.append("details", details);
    formData.append("termsOfParticipation", termsOfParticipation);

    startTransition(async () => {
      const action = isEdit ? updateCourseAction : createCourseAction;
      const res = await action(null, formData);
      if (res?.success) {
        onSubmitSuccess();
      } else {
        setError(res?.error || "An error occurred while saving the course.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header and Back Button */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group self-start"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses List
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {isEdit ? `Edit Course: ${initialCourse?.name}` : "Create New Course"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure the specific course details, pricing structure, and facilities.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-semibold">
          <AlertCircle className="size-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[64%_36%] gap-6">
        {/* Column 1 - 64% Width */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="course-name">Course Name</Label>
            <Input
              id="course-name"
              type="text"
              placeholder="e.g. Puppy Socialization Class"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-card"
              required
            />
          </div>

          {/* Toggle groups */}
          <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
              Trainer & Facility Attributes
            </h3>

            {/* Certified Trainer Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-foreground">Certified Dog Trainer</span>
                  <p className="text-xs text-muted-foreground">
                    Enable if this course is coached by an officially certified trainer.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={certifiedTrainer}
                  onClick={() => setCertifiedTrainer(!certifiedTrainer)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    certifiedTrainer ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                      certifiedTrainer ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {certifiedTrainer && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20 transition-all duration-200">
                  <Label htmlFor="certifier-name">Certifier Name</Label>
                  <Input
                    id="certifier-name"
                    type="text"
                    placeholder="Name of certifying institution/body"
                    value={certifierName}
                    onChange={(e) => setCertifierName(e.target.value)}
                    className="bg-background"
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-border/60" />

            {/* Dedicated Training Field Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-foreground">Dedicated Training Field</span>
                  <p className="text-xs text-muted-foreground">
                    Does the class run on a fully closed, dedicated training field?
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={dedicatedField}
                  onClick={() => setDedicatedField(!dedicatedField)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    dedicatedField ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                      dedicatedField ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {dedicatedField && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20 transition-all duration-200">
                  <Label>Training Field Description</Label>
                  <WysiwygEditor
                    value={trainingFieldDescription}
                    onChange={setTrainingFieldDescription}
                    placeholder="Explain field attributes, size, safety fences, etc."
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-border/60" />

            {/* Parking Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-foreground">Parking</span>
                  <p className="text-xs text-muted-foreground">
                    Is parking available on site or nearby?
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={parking}
                  onClick={() => setParking(!parking)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    parking ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                      parking ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {parking && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20 transition-all duration-200">
                  <Label>Parking Description</Label>
                  <WysiwygEditor
                    value={parkingDescription}
                    onChange={setParkingDescription}
                    placeholder="Details about parking capacity, location, fee..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Details & Terms Editors */}
          <div className="space-y-2">
            <Label>Course Information and Details</Label>
            <WysiwygEditor
              value={details}
              onChange={setDetails}
              placeholder="What does the program include? Explain schedules, details..."
            />
          </div>

          <div className="space-y-2">
            <Label>Terms of Participation</Label>
            <WysiwygEditor
              value={termsOfParticipation}
              onChange={setTermsOfParticipation}
              placeholder="List prerequisites, mandatory vaccine records, age, etc."
            />
          </div>
        </div>

        {/* Column 2 - 36% Width */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90">
              Pricing Configuration
            </h3>
            <div className="space-y-2">
              <Label htmlFor="course-price">Price</Label>
              <Input
                id="course-price"
                type="text"
                placeholder="e.g. $150 or 500 RON"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-background text-lg font-semibold"
              />
              <p className="text-[11px] text-muted-foreground">
                Define the currency symbol and billing frequency directly.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              className="flex-1 font-bold h-11 shadow-md shadow-primary/10"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4.5 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Course"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 font-semibold"
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
