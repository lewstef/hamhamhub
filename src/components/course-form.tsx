"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle, Plus, Trash2 } from "lucide-react";

interface Course {
  id?: string;
  name: string;
  certifiedTrainer: boolean;
  certifierName?: string | null;
  dedicatedField: boolean;
  trainingFieldDescription?: string | null;
  trainingFieldAddress?: string | null;
  trainingFieldGoogleBusinessProfile?: string | null;
  trainingFieldGoogleMapsLink?: string | null;
  parking: boolean;
  parkingDescription?: string | null;
  details?: string | null;
  termsOfParticipation?: string | null;
  price?: string | null;
  priceType?: string | null;
  medicationAdministration?: boolean | null;
  medicationAdministrationDetails?: string | null;
  dailyWalks?: number | null;
  ownerCommunication?: boolean | null;
  ownerCommunicationDetails?: string | null;
  personalizedMealPlan?: boolean | null;
  personalizedMealPlanDetails?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  faq?: string | null;
}

// Pre-populates 30-minute interval suggestions (00:00 to 23:30) for check-in/check-out combobox selectors
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, "0");
  const minutes = (i % 2 === 0 ? "00" : "30");
  return `${hours}:${minutes}`;
});

/**
 * Props for the CourseForm component.
 * @interface CourseFormProps
 * @property {string} organizationId - The active organization's database ID.
 * @property {string} serviceId - The parent service's database ID.
 * @property {string} itemNoun - Singular human-readable label of the sub-service (e.g. Course, Boarding Option).
 * @property {Course} [initialCourse] - Optional initial Course data for edit/update mode.
 * @property {() => void} onCancel - Callback triggered when cancelling/going back.
 * @property {() => void} onSubmitSuccess - Callback triggered after successful creation or update action.
 */
interface CourseFormProps {
  organizationId: string;
  serviceId: string;
  itemNoun: string;
  initialCourse?: Course;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  serviceSlug?: string;
}

/**
 * CourseForm Component
 *
 * Form rendering panel for creating or editing sub-service items (such as Training Courses or Boarding rates).
 * Provides toggles and expand/collapse fieldsets for Certified Trainer, Dedicated Field, Parking,
 * Medication Administration, Owner Updates, and personalized meal planning.
 * Submits data via createCourseAction or updateCourseAction Server Actions.
 *
 * @param {CourseFormProps} props - The component props.
 * @returns {React.ReactElement} The course/boarding configuration form component.
 */
export function CourseForm({ organizationId, serviceId, itemNoun, initialCourse, onCancel, onSubmitSuccess, serviceSlug }: CourseFormProps) {
  const isEdit = !!initialCourse?.id;
  const isBoarding = serviceSlug === "dog-boarding";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialCourse?.name || "");
  const [certifiedTrainer, setCertifiedTrainer] = useState(initialCourse?.certifiedTrainer || false);
  const [certifierName, setCertifierName] = useState(initialCourse?.certifierName || "");
  const [dedicatedField, setDedicatedField] = useState(initialCourse?.dedicatedField || false);
  const [trainingFieldDescription, setTrainingFieldDescription] = useState(initialCourse?.trainingFieldDescription || "");
  const [trainingFieldAddress, setTrainingFieldAddress] = useState(initialCourse?.trainingFieldAddress || "");
  const [trainingFieldGoogleBusinessProfile, setTrainingFieldGoogleBusinessProfile] = useState(initialCourse?.trainingFieldGoogleBusinessProfile || "");
  const [trainingFieldGoogleMapsLink, setTrainingFieldGoogleMapsLink] = useState(initialCourse?.trainingFieldGoogleMapsLink || "");
  const [parking, setParking] = useState(initialCourse?.parking || false);
  const [parkingDescription, setParkingDescription] = useState(initialCourse?.parkingDescription || "");
  const [details, setDetails] = useState(initialCourse?.details || "");
  const [termsOfParticipation, setTermsOfParticipation] = useState(initialCourse?.termsOfParticipation || "");
  const [price, setPrice] = useState(initialCourse?.price || "");
  const [priceType, setPriceType] = useState(initialCourse?.priceType || (itemNoun === "Boarding service" ? "night" : "course"));
  const [medicationAdministration, setMedicationAdministration] = useState(initialCourse?.medicationAdministration || false);
  const [medicationAdministrationDetails, setMedicationAdministrationDetails] = useState(initialCourse?.medicationAdministrationDetails || "");
  const [dailyWalks, setDailyWalks] = useState(initialCourse?.dailyWalks || 1);
  const [ownerCommunication, setOwnerCommunication] = useState(initialCourse?.ownerCommunication || false);
  const [ownerCommunicationDetails, setOwnerCommunicationDetails] = useState(initialCourse?.ownerCommunicationDetails || "");
  const [personalizedMealPlan, setPersonalizedMealPlan] = useState(initialCourse?.personalizedMealPlan || false);
  const [personalizedMealPlanDetails, setPersonalizedMealPlanDetails] = useState(initialCourse?.personalizedMealPlanDetails || "");
  
  // Boarding check-in and check-out times in 24-hour (hh:mm) format
  const [checkin, setCheckin] = useState(initialCourse?.checkin || "08:00");
  const [checkout, setCheckout] = useState(initialCourse?.checkout || "18:00");

  // FAQ Builder State
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(() => {
    if (initialCourse?.faq) {
      try {
        const parsed = JSON.parse(initialCourse.faq);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse FAQ initial value:", e);
      }
    }
    return [];
  });

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleUpdateFaq = (index: number, key: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index][key] = value;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };
  
  // Calculate if the form is dirty compared to the initial input values
  let initialFaqStr = "[]";
  if (initialCourse?.faq) {
    try {
      const parsed = JSON.parse(initialCourse.faq);
      if (Array.isArray(parsed)) {
        initialFaqStr = JSON.stringify(parsed);
      }
    } catch (e) {}
  }

  const isDirty = 
    name !== (initialCourse?.name || "") ||
    certifiedTrainer !== (initialCourse?.certifiedTrainer || false) ||
    certifierName !== (initialCourse?.certifierName || "") ||
    dedicatedField !== (initialCourse?.dedicatedField || false) ||
    trainingFieldDescription !== (initialCourse?.trainingFieldDescription || "") ||
    trainingFieldAddress !== (initialCourse?.trainingFieldAddress || "") ||
    trainingFieldGoogleBusinessProfile !== (initialCourse?.trainingFieldGoogleBusinessProfile || "") ||
    trainingFieldGoogleMapsLink !== (initialCourse?.trainingFieldGoogleMapsLink || "") ||
    parking !== (initialCourse?.parking || false) ||
    parkingDescription !== (initialCourse?.parkingDescription || "") ||
    details !== (initialCourse?.details || "") ||
    termsOfParticipation !== (initialCourse?.termsOfParticipation || "") ||
    price !== (initialCourse?.price || "") ||
    priceType !== (initialCourse?.priceType || (itemNoun === "Boarding service" ? "night" : "course")) ||
    medicationAdministration !== (initialCourse?.medicationAdministration || false) ||
    medicationAdministrationDetails !== (initialCourse?.medicationAdministrationDetails || "") ||
    dailyWalks !== (initialCourse?.dailyWalks || 1) ||
    ownerCommunication !== (initialCourse?.ownerCommunication || false) ||
    ownerCommunicationDetails !== (initialCourse?.ownerCommunicationDetails || "") ||
    personalizedMealPlan !== (initialCourse?.personalizedMealPlan || false) ||
    personalizedMealPlanDetails !== (initialCourse?.personalizedMealPlanDetails || "") ||
    checkin !== (initialCourse?.checkin || "08:00") ||
    checkout !== (initialCourse?.checkout || "18:00") ||
    JSON.stringify(faqs) !== initialFaqStr;

  // Safeguard: Ask before leaving page when there are unsaved changes
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmLeave) {
        return;
      }
    }
    onCancel();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(`${itemNoun} name is required.`);
      return;
    }

    setError(null);
    const formData = new FormData();
    if (isEdit && initialCourse?.id) {
      formData.append("id", initialCourse.id);
    }
    formData.append("organizationId", organizationId);
    formData.append("serviceId", serviceId);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("priceType", priceType);
    formData.append("certifiedTrainer", String(certifiedTrainer));
    formData.append("certifierName", certifierName);
    formData.append("dedicatedField", String(dedicatedField));
    formData.append("trainingFieldDescription", trainingFieldDescription);
    formData.append("trainingFieldAddress", trainingFieldAddress);
    formData.append("trainingFieldGoogleBusinessProfile", trainingFieldGoogleBusinessProfile);
    formData.append("trainingFieldGoogleMapsLink", trainingFieldGoogleMapsLink);
    formData.append("parking", String(parking));
    formData.append("parkingDescription", parkingDescription);
    formData.append("details", details);
    formData.append("termsOfParticipation", termsOfParticipation);
    formData.append("medicationAdministration", String(medicationAdministration));
    formData.append("medicationAdministrationDetails", medicationAdministrationDetails);
    formData.append("dailyWalks", String(dailyWalks));
    formData.append("ownerCommunication", String(ownerCommunication));
    formData.append("ownerCommunicationDetails", ownerCommunicationDetails);
    formData.append("personalizedMealPlan", String(personalizedMealPlan));
    formData.append("personalizedMealPlanDetails", personalizedMealPlanDetails);
    if (isBoarding) {
      formData.append("checkin", checkin);
      formData.append("checkout", checkout);
    }
    formData.append("faq", JSON.stringify(faqs));

    startTransition(async () => {
      const action = isEdit ? updateCourseAction : createCourseAction;
      const res = await action(null, formData);
      if (res?.success) {
        onSubmitSuccess();
      } else {
        setError(res?.error || `An error occurred while saving the ${itemNoun.toLowerCase()}.`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header and Back Button */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group self-start"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to {itemNoun}s List
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {isEdit ? `Edit ${itemNoun}: ${initialCourse?.name}` : `Create New ${itemNoun}`}
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure the specific {itemNoun.toLowerCase()} details, pricing structure, and facilities.
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
            <Label htmlFor="course-name">{itemNoun} Name</Label>
            <Input
              id="course-name"
              type="text"
              placeholder={
                itemNoun === "Dog Sport"
                  ? "e.g. Agility, IGP, Obedience"
                  : itemNoun === "Boarding service"
                  ? "e.g. Standard Room, VIP Cabin"
                  : "e.g. Puppy Socialization Class"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-card"
              required
            />
          </div>

          {/* Toggle groups */}
          <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
              {itemNoun === "Boarding service" ? "Facility Attributes" : "Trainer & Facility Attributes"}
            </h3>

            {/* Certified Trainer Toggle */}
            {itemNoun !== "Boarding service" && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-foreground">Certified Dog Trainer</span>
                      <p className="text-xs text-muted-foreground">
                        Enable if this {itemNoun.toLowerCase()} is coached by an officially certified trainer.
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
              </>
            )}

            {/* Dedicated Training Field Toggle */}
            {itemNoun !== "Boarding service" && (
              <>
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
                    <div className="space-y-4 pl-4 border-l-2 border-primary/20 transition-all duration-200">
                      <div className="space-y-2">
                        <Label>Training Field Description</Label>
                        <WysiwygEditor
                          value={trainingFieldDescription}
                          onChange={setTrainingFieldDescription}
                          placeholder="Explain field attributes, size, safety fences, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="training-field-address">Address</Label>
                        <Input
                          id="training-field-address"
                          type="text"
                          placeholder="e.g. 123 Canine Lane, Bucharest"
                          value={trainingFieldAddress}
                          onChange={(e) => setTrainingFieldAddress(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="training-field-gbp">Google Business Profile</Label>
                        <Input
                          id="training-field-gbp"
                          type="url"
                          placeholder="https://business.google.com/..."
                          value={trainingFieldGoogleBusinessProfile}
                          onChange={(e) => setTrainingFieldGoogleBusinessProfile(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="training-field-maps">Google Maps Link</Label>
                        <Input
                          id="training-field-maps"
                          type="url"
                          placeholder="https://maps.google.com/..."
                          value={trainingFieldGoogleMapsLink}
                          onChange={(e) => setTrainingFieldGoogleMapsLink(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-border/60" />
              </>
            )}

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

          {itemNoun === "Boarding service" && (
            <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                Boarding Details
              </h3>

              {/* Medication Administration Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-foreground">Medication Administration</span>
                    <p className="text-xs text-muted-foreground">
                      Can you administer medication or medical care?
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={medicationAdministration}
                    onClick={() => setMedicationAdministration(!medicationAdministration)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      medicationAdministration ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                        medicationAdministration ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {medicationAdministration && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20 transition-all duration-200">
                    <Label htmlFor="medication-details">Medication Administration Instructions</Label>
                    <Input
                      id="medication-details"
                      type="text"
                      placeholder="e.g. oral tablets, injections, schedule limitations"
                      value={medicationAdministrationDetails}
                      onChange={(e) => setMedicationAdministrationDetails(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                )}
              </div>

              <div className="h-px bg-border/60" />

              {/* Daily Walks Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="daily-walks">Daily Walks</Label>
                <select
                  id="daily-walks"
                  value={dailyWalks}
                  onChange={(e) => setDailyWalks(parseInt(e.target.value, 10))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-bold focus:outline-none"
                >
                  <option value={1}>1 walk per day</option>
                  <option value={2}>2 walks per day</option>
                  <option value={3}>3 walks per day</option>
                  <option value={4}>4 walks per day</option>
                </select>
              </div>

              <div className="h-px bg-border/60" />

              {/* Communication with the Owner Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-foreground">Communication with the Owner</span>
                    <p className="text-xs text-muted-foreground">
                      Will you provide regular photo/video updates to the owner?
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={ownerCommunication}
                    onClick={() => setOwnerCommunication(!ownerCommunication)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      ownerCommunication ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                        ownerCommunication ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {ownerCommunication && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20 transition-all duration-200">
                    <Label htmlFor="communication-details">Communication Updates Details</Label>
                    <Input
                      id="communication-details"
                      type="text"
                      placeholder="e.g. daily photos via WhatsApp, weekly email progress"
                      value={ownerCommunicationDetails}
                      onChange={(e) => setOwnerCommunicationDetails(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                )}
              </div>

              <div className="h-px bg-border/60" />

              {/* Personalized Meal Plan Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-foreground">Personalized Meal Plan</span>
                    <p className="text-xs text-muted-foreground">
                      Can you provide a customized meal plan or accommodate special diets?
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={personalizedMealPlan}
                    onClick={() => setPersonalizedMealPlan(!personalizedMealPlan)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      personalizedMealPlan ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                        personalizedMealPlan ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {personalizedMealPlan && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20 transition-all duration-200">
                    <Label htmlFor="meal-details">Meal Plan Details</Label>
                    <Input
                      id="meal-details"
                      type="text"
                      placeholder="e.g. BARF diet support, raw food storage, customized portions"
                      value={personalizedMealPlanDetails}
                      onChange={(e) => setPersonalizedMealPlanDetails(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                )}
              </div>

              {isBoarding && (
                <>
                  <div className="h-px bg-border/60" />

                  {/* Checkin / Checkout time pickers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkin">Check-in Time</Label>
                      <Input
                        id="checkin"
                        type="text"
                        list="time-options"
                        value={checkin}
                        onChange={(e) => setCheckin(e.target.value)}
                        pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                        placeholder="e.g. 08:00"
                        title="Please enter a valid time in 24-hour hh:mm format."
                        className="bg-background font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout">Check-out Time</Label>
                      <Input
                        id="checkout"
                        type="text"
                        list="time-options"
                        value={checkout}
                        onChange={(e) => setCheckout(e.target.value)}
                        pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                        placeholder="e.g. 18:00"
                        title="Please enter a valid time in 24-hour hh:mm format."
                        className="bg-background font-mono"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <datalist id="time-options">
                {timeOptions.map((time) => (
                  <option key={time} value={time} />
                ))}
              </datalist>
            </div>
          )}

          {/* Details & Terms Editors */}
          <div className="space-y-2">
            <Label>{itemNoun} Information and Details</Label>
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

          {/* FAQ Builder Section */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-bold">Frequently Asked Questions (FAQ)</Label>
              <p className="text-xs text-muted-foreground">
                Add Q&A pairs for clients regarding this {itemNoun.toLowerCase()}.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground bg-muted/5">
                  No FAQs added yet. Click "Add FAQ" below to start.
                </div>
              ) : (
                <div className="space-y-3" data-testid="faq-list">
                  {faqs.map((faq, index) => (
                    <div key={index} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          FAQ Item #{index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFaq(index)}
                          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Remove FAQ"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor={`faq-q-${index}`} className="text-xs font-semibold">Question</Label>
                          <Input
                            id={`faq-q-${index}`}
                            type="text"
                            placeholder="e.g. Is there a vaccination requirement?"
                            value={faq.question}
                            onChange={(e) => handleUpdateFaq(index, "question", e.target.value)}
                            className="bg-background h-8 text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`faq-a-${index}`} className="text-xs font-semibold">Answer</Label>
                          <textarea
                            id={`faq-a-${index}`}
                            placeholder="e.g. Yes, all dogs must have up-to-date DHPP and Rabies vaccines."
                            value={faq.answer}
                            onChange={(e) => handleUpdateFaq(index, "answer", e.target.value)}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFaq}
                className="w-full font-bold text-xs py-5 rounded-xl border-dashed border-2 border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                <Plus className="size-3.5 mr-1.5" />
                Add FAQ Item
              </Button>
            </div>
          </div>
        </div>

        {/* Column 2 - 36% Width */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90">
              Pricing Configuration
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-price">Price Amount</Label>
                <Input
                  id="course-price"
                  type="text"
                  placeholder="e.g. $150 or 500 RON"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-background text-lg font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-price-type">Billing Frequency</Label>
                <select
                  id="course-price-type"
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-bold focus:outline-none"
                >
                  {itemNoun === "Boarding service" ? (
                    <>
                      <option value="night">Per Night</option>
                      <option value="day">Per Day</option>
                      <option value="month">Per Month</option>
                      <option value="service">Per Boarding service</option>
                    </>
                  ) : (
                    <>
                      <option value="course">Per {itemNoun}</option>
                      <option value="month">Per Month</option>
                    </>
                  )}
                </select>
              </div>
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
              {isEdit ? "Save Changes" : `Create ${itemNoun}`}
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
