"use client";

import React from "react";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import { ArrowLeft, Loader2, AlertCircle, FileText, HelpCircle, DollarSign, MapPin, Calendar, FileCheck, Sliders, Footprints, X } from "lucide-react";
import { CourseGeneralTab } from "./course-form/course-general-tab";
import { CoursePricingTab } from "./course-form/course-pricing-tab";
import { CourseScheduleTab, DayScheduleGrid } from "./course-form/course-schedule-tab";
import { CourseCareTab } from "./course-form/course-care-tab";
import { CoursePlayYardTab } from "./course-form/course-play-yard-tab";
import { CourseLocationTab } from "./course-form/course-location-tab";
import { CourseFaqTab } from "./course-form/course-faq-tab";
import { TrainerAttributesCard } from "./course-form/sections/trainer-attributes-card";
import { AgeLimitsSection } from "./course-form/sections/age-limits-section";
import { SPOKEN_LANGUAGES_LIST } from "@/types/course";
import type {
  CoursePricingItem,
  ClosedPeriodItem,
  SpecialOpeningItem,
  DayKey,
  DayScheduleItem,
  CourseFormProps,
} from "./course-form/types";
import {
  useCourseForm,
  getComparableTimestamp,
  parseCoursePricings,
  parseClosedPeriods,
  parseSpecialOpenings,
  DEFAULT_WEEKLY_SCHEDULE,
  getInitialWeeklySchedule,
} from "./course-form/use-course-form";

export type {
  CoursePricingItem,
  ClosedPeriodItem,
  SpecialOpeningItem,
  DayKey,
  DayScheduleItem,
  CourseFormProps,
};

export {
  useCourseForm,
  getComparableTimestamp,
  parseCoursePricings,
  parseClosedPeriods,
  parseSpecialOpenings,
  DEFAULT_WEEKLY_SCHEDULE,
  getInitialWeeklySchedule,
};

/**
 * CourseForm Component
 *
 * Form rendering panel for creating or editing sub-service items (Training Courses, Dog Sports, Boarding, Grooming, Walking, Sitting).
 * Dog Sport, Dog Training, Dog Boarding, Dog Walking, and Dog Sitting services render a clean tabbed layout.
 * Grooming and other services render a responsive two-column layout.
 */
export function CourseForm(props: CourseFormProps) {
  const {
    itemNoun,
    initialCourse,
    onCancel,
  } = props;

  const {
    isEdit,
    isBoarding,
    isGrooming,
    isDogSport,
    isDogTraining,
    isDogWalking,
    isDogSitter,
    isTabbedLayout,
    cityName,
    cartiereList,
    activeTab,
    setActiveTab,
    isPending,
    error,
    name,
    setName,
    certifiedTrainer,
    setCertifiedTrainer,
    certifierName,
    setCertifierName,
    trainerExperienceDescription,
    setTrainerExperienceDescription,
    veterinaryTraining,
    setVeterinaryTraining,
    veterinaryTrainingCertifier,
    setVeterinaryTrainingCertifier,
    veterinaryTrainingDetails,
    setVeterinaryTrainingDetails,
    ageLimitsEnabled,
    setAgeLimitsEnabled,
    selectedAgeLimits,
    setSelectedAgeLimits,
    handleToggleAgeLimit,
    dogSizesEnabled,
    setDogSizesEnabled,
    selectedDogSizes,
    setSelectedDogSizes,
    dedicatedField,
    setDedicatedField,
    trainingFieldDescription,
    setTrainingFieldDescription,
    trainingFieldAddress,
    setTrainingFieldAddress,
    trainingFieldGoogleBusinessProfile,
    setTrainingFieldGoogleBusinessProfile,
    trainingFieldGoogleMapsLink,
    setTrainingFieldGoogleMapsLink,
    parking,
    setParking,
    parkingDescription,
    setParkingDescription,
    details,
    setDetails,
    termsOfParticipation,
    setTermsOfParticipation,
    pricings,
    handleAddPriceTier,
    handleUpdatePriceTier,
    requestRemovePriceTier,
    medicationAdministration,
    setMedicationAdministration,
    medicationAdministrationDetails,
    setMedicationAdministrationDetails,
    surveillance247,
    setSurveillance247,
    surveillance247Details,
    setSurveillance247Details,
    webCam,
    setWebCam,
    webCamDetails,
    setWebCamDetails,
    dailyWalks,
    setDailyWalks,
    ownerCommunication,
    setOwnerCommunication,
    ownerCommunicationDetails,
    setOwnerCommunicationDetails,
    personalizedMealPlan,
    setPersonalizedMealPlan,
    personalizedMealPlanDetails,
    setPersonalizedMealPlanDetails,
    emergencyVetTransport,
    setEmergencyVetTransport,
    emergencyVetTransportDetails,
    setEmergencyVetTransportDetails,
    plantWatering,
    setPlantWatering,
    plantWateringDetails,
    setPlantWateringDetails,
    nonSmoker,
    setNonSmoker,
    selectedLanguages,
    handleToggleLanguage,
    maxPetsPerVisit,
    setMaxPetsPerVisit,
    additionalPetPolicy,
    setAdditionalPetPolicy,
    playYard,
    setPlayYard,
    playYardDetails,
    setPlayYardDetails,
    pool,
    setPool,
    poolDetails,
    setPoolDetails,
    socializationPolicy,
    setSocializationPolicy,
    trainingFormat,
    setTrainingFormat,
    maxDogsPerGroup,
    setMaxDogsPerGroup,
    indoorFacility,
    setIndoorFacility,
    indoorFacilityDescription,
    setIndoorFacilityDescription,
    weeklySchedule,
    handleUpdateDaySchedule,
    handleCopyMonToWorkweek,
    handleCopyMonToAll,
    closedPeriods,
    handleAddClosedPeriod,
    handleUpdateClosedPeriod,
    requestRemoveClosedPeriod,
    specialOpenings,
    handleAddSpecialOpening,
    handleUpdateSpecialOpening,
    requestRemoveSpecialOpening,
    coverageData,
    handlePrimaryCartiereChange,
    handleAddSecondaryZone,
    handleSecondaryCityChange,
    handleSecondaryCartiereChange,
    requestRemoveSecondaryZone,
    faqs,
    handleAddFaq,
    handleUpdateFaq,
    requestRemoveFaq,
    removeConfirm,
    setRemoveConfirm,
    confirmRemoveItem,
    scheduleOverlapError,
    handleSubmit,
    handleCancel,
  } = useCourseForm(props);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header and Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border/60">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group self-start cursor-pointer"
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

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-10 px-5 font-semibold text-xs rounded-xl"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="font-bold h-10 px-6 text-xs rounded-xl shadow-md shadow-primary/10"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit ? "Save Changes" : `Create ${itemNoun}`}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-semibold">
          <AlertCircle className="size-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation (tabbed layout only) */}
      {isTabbedLayout && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
          {(
            [
              { key: "general" as const, label: "General", Icon: FileText, hasError: false },
              { key: "terms" as const, label: isBoarding ? "Terms" : "Terms of participation", Icon: FileCheck, hasError: false },
              { key: "pricing" as const, label: "Pricing", Icon: DollarSign, hasError: false },
              { key: "schedule" as const, label: "Schedule", Icon: Calendar, hasError: !!scheduleOverlapError },
              { key: "location" as const, label: "Coverage zones", Icon: MapPin, hasError: false },
              { key: "faq" as const, label: "FAQ", Icon: HelpCircle, hasError: false },
              ...((isBoarding || isDogSitter) ? [{ key: "others" as const, label: "Care & facilities", Icon: Sliders, hasError: false }] : []),
              ...(isBoarding ? [{ key: "playYard" as const, label: "Play yard & socialization", Icon: Footprints, hasError: false }] : []),
            ]
          ).map(({ key, label, Icon, hasError }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === key
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
              {hasError && (
                <span className="size-2 rounded-full bg-destructive animate-pulse" title="Overlap Conflict Detected" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── TABBED LAYOUT ────────────────────────────────────── */}
      {isTabbedLayout ? (
        <div className="space-y-6 min-h-[400px]">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <CourseGeneralTab
              name={name}
              onNameChange={setName}
              details={details}
              onDetailsChange={setDetails}
              certifiedTrainer={certifiedTrainer}
              onCertifiedTrainerChange={setCertifiedTrainer}
              certifierName={certifierName}
              onCertifierNameChange={setCertifierName}
              trainerExperienceDescription={trainerExperienceDescription}
              onTrainerExperienceDescriptionChange={setTrainerExperienceDescription}
              veterinaryTraining={veterinaryTraining}
              onVeterinaryTrainingChange={setVeterinaryTraining}
              veterinaryTrainingCertifier={veterinaryTrainingCertifier}
              onVeterinaryTrainingCertifierChange={setVeterinaryTrainingCertifier}
              veterinaryTrainingDetails={veterinaryTrainingDetails}
              onVeterinaryTrainingDetailsChange={setVeterinaryTrainingDetails}
              trainingFormat={trainingFormat}
              onTrainingFormatChange={setTrainingFormat}
              maxDogsPerGroup={maxDogsPerGroup}
              onMaxDogsPerGroupChange={setMaxDogsPerGroup}
              spokenLanguages={selectedLanguages}
              onToggleLanguage={handleToggleLanguage}
              ageLimitsEnabled={ageLimitsEnabled}
              onAgeLimitsEnabledChange={setAgeLimitsEnabled}
              selectedAgeLimits={selectedAgeLimits}
              onToggleAgeLimit={handleToggleAgeLimit}
              itemNoun={itemNoun}
              isDogWalking={isDogWalking}
              isDogTraining={isDogTraining}
              isDogSport={isDogSport}
              isDogSitter={isDogSitter}
              hideAgeLimits={isTabbedLayout}
            />
          )}

          {/* TAB 2: TERMS OF PARTICIPATION */}
          {activeTab === "terms" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                  Age Limits &amp; Prerequisites
                </h3>
                <AgeLimitsSection
                  itemNoun={itemNoun}
                  ageLimitsEnabled={ageLimitsEnabled}
                  onAgeLimitsEnabledChange={setAgeLimitsEnabled}
                  selectedAgeLimits={selectedAgeLimits}
                  onSelectedAgeLimitsChange={setSelectedAgeLimits}
                  showDogSizes={isDogWalking || isDogSitter || isBoarding || isDogTraining || isDogSport}
                  dogSizesEnabled={dogSizesEnabled}
                  onDogSizesEnabledChange={setDogSizesEnabled}
                  selectedDogSizes={selectedDogSizes}
                  onSelectedDogSizesChange={setSelectedDogSizes}
                />
              </div>

              <div className="space-y-2">
                <Label>{isBoarding ? "Terms" : "Terms of Participation"}</Label>
                <WysiwygEditor
                  value={termsOfParticipation}
                  onChange={setTermsOfParticipation}
                  placeholder="List prerequisites, mandatory vaccine records, age limits, discipline rules..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <CoursePricingTab
                itemNoun={itemNoun}
                isBoarding={isBoarding}
                isGrooming={isGrooming}
                pricings={pricings}
                onAdd={handleAddPriceTier}
                onUpdate={handleUpdatePriceTier}
                onRemove={requestRemovePriceTier}
                isDogWalking={isDogWalking}
                isDogSitter={isDogSitter}
              />
            </div>
          )}

          {/* TAB 4: SCHEDULE */}
          {activeTab === "schedule" && (
            <CourseScheduleTab
              isDogSport={isDogSport}
              scheduleOverlapError={scheduleOverlapError}
              weeklySchedule={weeklySchedule}
              onUpdateDaySchedule={handleUpdateDaySchedule}
              onCopyMonToWorkweek={handleCopyMonToWorkweek}
              onCopyMonToAll={handleCopyMonToAll}
              closedPeriods={closedPeriods}
              onAddClosedPeriod={handleAddClosedPeriod}
              onUpdateClosedPeriod={handleUpdateClosedPeriod}
              onRemoveClosedPeriod={requestRemoveClosedPeriod}
              specialOpenings={specialOpenings}
              onAddSpecialOpening={handleAddSpecialOpening}
              onUpdateSpecialOpening={handleUpdateSpecialOpening}
              onRemoveSpecialOpening={requestRemoveSpecialOpening}
            />
          )}

          {/* TAB 5: LOCATION */}
          {activeTab === "location" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5">
                <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">
                    {(isDogWalking || isDogSitter) ? "Coverage zones" : "Location & Map Details"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {(isDogWalking || isDogSitter)
                      ? `Configure specific neighborhoods and coverage zones in your city where ${isDogSitter ? "dog sitting" : "dog walking"} services are provided.`
                      : "Provide location details, business profile, map links, and parking information for clients."}
                  </p>
                </div>
                <CourseLocationTab
                  layout="tabbed"
                  isBoarding={isBoarding}
                  isDogWalking={isDogWalking}
                  isDogSitter={isDogSitter}
                  cityName={cityName}
                  cartiereList={cartiereList}
                  selectedCartiere={coverageData.primary}
                  onSelectedCartiereChange={handlePrimaryCartiereChange}
                  secondaryZones={coverageData.secondary}
                  onAddSecondaryZone={handleAddSecondaryZone}
                  onRemoveSecondaryZone={requestRemoveSecondaryZone}
                  onSecondaryCityChange={handleSecondaryCityChange}
                  onSecondaryCartiereChange={handleSecondaryCartiereChange}
                  hideDedicatedField={isDogWalking || isDogSitter}
                  hideParking={isDogWalking || isDogSitter}
                  dedicatedField={dedicatedField}
                  onDedicatedFieldChange={setDedicatedField}
                  trainingFieldDescription={trainingFieldDescription}
                  onTrainingFieldDescriptionChange={setTrainingFieldDescription}
                  trainingFieldAddress={trainingFieldAddress}
                  onTrainingFieldAddressChange={setTrainingFieldAddress}
                  trainingFieldGoogleBusinessProfile={trainingFieldGoogleBusinessProfile}
                  onGbpChange={setTrainingFieldGoogleBusinessProfile}
                  trainingFieldGoogleMapsLink={trainingFieldGoogleMapsLink}
                  onMapsChange={setTrainingFieldGoogleMapsLink}
                  indoorFacility={indoorFacility}
                  onIndoorFacilityChange={setIndoorFacility}
                  indoorFacilityDescription={indoorFacilityDescription}
                  onIndoorFacilityDescriptionChange={setIndoorFacilityDescription}
                  parking={parking}
                  onParkingChange={setParking}
                  parkingDescription={parkingDescription}
                  onParkingDescriptionChange={setParkingDescription}
                />
              </div>
            </div>
          )}

          {/* TAB 6: FAQ */}
          {activeTab === "faq" && (
            <CourseFaqTab
              itemNoun={itemNoun}
              faqs={faqs}
              onAdd={handleAddFaq}
              onUpdate={handleUpdateFaq}
              onRemove={requestRemoveFaq}
            />
          )}

          {/* TAB 7: OTHERS (Boarding Details & Care Amenities) */}
          {activeTab === "others" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5">
                <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">Care &amp; Facilities</h3>
                  <p className="text-xs text-muted-foreground">
                    {isDogSitter
                      ? "Configure medication administration, emergency vet transport, multi-pet policy, and owner photo updates."
                      : "Configure specialized boarding amenities, webcam access, meal customization, and owner updates."}
                  </p>
                </div>
                <CourseCareTab
                  isDogWalking={isDogWalking}
                  isDogSitter={isDogSitter}
                  dailyWalks={dailyWalks}
                  onDailyWalksChange={setDailyWalks}
                  medicationAdministration={medicationAdministration}
                  onMedicationAdministrationChange={setMedicationAdministration}
                  medicationAdministrationDetails={medicationAdministrationDetails}
                  onMedicationAdministrationDetailsChange={setMedicationAdministrationDetails}
                  surveillance247={surveillance247}
                  onSurveillance247Change={setSurveillance247}
                  surveillance247Details={surveillance247Details}
                  onSurveillance247DetailsChange={setSurveillance247Details}
                  webCam={webCam}
                  onWebCamChange={setWebCam}
                  webCamDetails={webCamDetails}
                  onWebCamDetailsChange={setWebCamDetails}
                  ownerCommunication={ownerCommunication}
                  onOwnerCommunicationChange={setOwnerCommunication}
                  ownerCommunicationDetails={ownerCommunicationDetails}
                  onOwnerCommunicationDetailsChange={setOwnerCommunicationDetails}
                  personalizedMealPlan={personalizedMealPlan}
                  onPersonalizedMealPlanChange={setPersonalizedMealPlan}
                  personalizedMealPlanDetails={personalizedMealPlanDetails}
                  onPersonalizedMealPlanDetailsChange={setPersonalizedMealPlanDetails}
                  emergencyVetTransport={emergencyVetTransport}
                  onEmergencyVetTransportChange={setEmergencyVetTransport}
                  emergencyVetTransportDetails={emergencyVetTransportDetails}
                  onEmergencyVetTransportDetailsChange={setEmergencyVetTransportDetails}
                  plantWatering={plantWatering}
                  onPlantWateringChange={setPlantWatering}
                  plantWateringDetails={plantWateringDetails}
                  onPlantWateringDetailsChange={setPlantWateringDetails}
                  nonSmoker={nonSmoker}
                  onNonSmokerChange={setNonSmoker}
                  maxPetsPerVisit={maxPetsPerVisit}
                  onMaxPetsPerVisitChange={setMaxPetsPerVisit}
                  additionalPetPolicy={additionalPetPolicy}
                  onAdditionalPetPolicyChange={setAdditionalPetPolicy}
                />
              </div>
            </div>
          )}

          {/* TAB 8: PLAY YARD & SOCIALIZATION (Boarding only) */}
          {activeTab === "playYard" && isBoarding && (
            <CoursePlayYardTab
              playYard={playYard}
              onPlayYardChange={setPlayYard}
              playYardDetails={playYardDetails}
              onPlayYardDetailsChange={setPlayYardDetails}
              pool={pool}
              onPoolChange={setPool}
              poolDetails={poolDetails}
              onPoolDetailsChange={setPoolDetails}
              socializationPolicy={socializationPolicy}
              onSocializationPolicyChange={setSocializationPolicy}
            />
          )}

          {/* Bottom Action Buttons (tabbed layout) */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 px-6 font-semibold"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="font-bold h-11 px-8 shadow-md shadow-primary/10"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4.5 animate-spin" />}
              {isEdit ? "Save Changes" : `Create ${itemNoun}`}
            </Button>
          </div>
        </div>
      ) : (
        /* ── FLAT LAYOUT (Grooming and other non-tabbed services) ── */
        <div className="grid grid-cols-1 lg:grid-cols-[64%_36%] gap-6">
          {/* Column 1 — 64% Width */}
          <div className="space-y-6">
            {/* Sitting Type Preset Selector (flat mode) */}
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
                        onClick={() => setName(preset)}
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

            <div className="space-y-2">
              <Label htmlFor="course-name">{itemNoun} Name</Label>
              <Input
                id="course-name"
                type="text"
                placeholder={
                  itemNoun === "Boarding service"
                    ? "e.g. Standard Room, VIP Cabin"
                    : isDogSitter || itemNoun === "Sitting service"
                    ? "e.g. In-Home Sitting, Daytime Visit, Overnight Care"
                    : isDogWalking || itemNoun === "Dog Walking" || itemNoun === "Walking service"
                    ? "e.g. Standard Neighborhood Walk, 60-Min Adventure Walk"
                    : isGrooming
                    ? "e.g. Full Grooming & Bath"
                    : isDogTraining || itemNoun === "Training course"
                    ? "e.g. Puppy Socialization Class, Basic Obedience"
                    : "e.g. Agility, IGP, Obedience"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card"
                required
              />
            </div>

            {/* Trainer & Facility Attributes card (not for grooming) */}
            {!isGrooming && (
              <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                  {itemNoun === "Boarding service" ? "Facility Attributes" : "Trainer & Facility Attributes"}
                </h3>

                {itemNoun !== "Boarding service" && (
                  <>
                    <TrainerAttributesCard
                      itemNoun={itemNoun}
                      bare
                      certifiedTrainer={certifiedTrainer}
                      onCertifiedTrainerChange={setCertifiedTrainer}
                      certifierName={certifierName}
                      onCertifierNameChange={setCertifierName}
                      trainerExperienceDescription={trainerExperienceDescription}
                      onTrainerExperienceDescriptionChange={setTrainerExperienceDescription}
                    />

                    <div className="h-px bg-border/40" />

                    {/* Age Limits */}
                    <AgeLimitsSection
                      itemNoun={itemNoun}
                      ageLimitsEnabled={ageLimitsEnabled}
                      onAgeLimitsEnabledChange={setAgeLimitsEnabled}
                      selectedAgeLimits={selectedAgeLimits}
                      onSelectedAgeLimitsChange={setSelectedAgeLimits}
                      showDogSizes={isDogWalking || isDogSitter || isBoarding || isDogTraining || isDogSport}
                      dogSizesEnabled={dogSizesEnabled}
                      onDogSizesEnabledChange={setDogSizesEnabled}
                      selectedDogSizes={selectedDogSizes}
                      onSelectedDogSizesChange={setSelectedDogSizes}
                    />

                    <div className="h-px bg-border/60" />

                    {/* Dedicated Training Field */}
                    <BooleanToggleField
                      label="Dedicated Training Field"
                      description="Does the class run on a fully closed, dedicated training field?"
                      checked={dedicatedField}
                      onChange={setDedicatedField}
                    >
                      <div className="space-y-4">
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
                    </BooleanToggleField>

                    <div className="h-px bg-border/60" />
                  </>
                )}

                {/* Parking (all non-grooming services) */}
                <BooleanToggleField
                  label="Parking"
                  description="Is parking available on site or nearby?"
                  checked={parking}
                  onChange={setParking}
                >
                  <WysiwygEditor
                    value={parkingDescription}
                    onChange={setParkingDescription}
                    placeholder="Details about parking capacity, location, fee..."
                  />
                </BooleanToggleField>
              </div>
            )}

            {/* Boarding Details (boarding-only section in flat mode) */}
            {itemNoun === "Boarding service" && (
              <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                  Care &amp; Facilities
                </h3>
                <CourseCareTab
                  isDogWalking={isDogWalking}
                  dailyWalks={dailyWalks}
                  onDailyWalksChange={setDailyWalks}
                  medicationAdministration={medicationAdministration}
                  onMedicationAdministrationChange={setMedicationAdministration}
                  medicationAdministrationDetails={medicationAdministrationDetails}
                  onMedicationAdministrationDetailsChange={setMedicationAdministrationDetails}
                  surveillance247={surveillance247}
                  onSurveillance247Change={setSurveillance247}
                  surveillance247Details={surveillance247Details}
                  onSurveillance247DetailsChange={setSurveillance247Details}
                  webCam={webCam}
                  onWebCamChange={setWebCam}
                  webCamDetails={webCamDetails}
                  onWebCamDetailsChange={setWebCamDetails}
                  ownerCommunication={ownerCommunication}
                  onOwnerCommunicationChange={setOwnerCommunication}
                  ownerCommunicationDetails={ownerCommunicationDetails}
                  onOwnerCommunicationDetailsChange={setOwnerCommunicationDetails}
                  personalizedMealPlan={personalizedMealPlan}
                  onPersonalizedMealPlanChange={setPersonalizedMealPlan}
                  personalizedMealPlanDetails={personalizedMealPlanDetails}
                  onPersonalizedMealPlanDetailsChange={setPersonalizedMealPlanDetails}
                />
                {isBoarding && (
                  <>
                    <div className="h-px bg-border/60" />
                    <div className="space-y-4">
                      <DayScheduleGrid
                        weeklySchedule={weeklySchedule}
                        useSportLabels={isDogSport}
                        onUpdate={handleUpdateDaySchedule}
                        onCopyMonToWorkweek={handleCopyMonToWorkweek}
                        onCopyMonToAll={handleCopyMonToAll}
                      />
                    </div>
                  </>
                )}
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

            {/* Spoken Languages Selector (flat mode) */}
            <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-muted/20">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold text-foreground">Spoken Languages</Label>
                <span className="text-[11px] text-muted-foreground">Select the languages staff / instructors can comfortably communicate in with pet owners</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {SPOKEN_LANGUAGES_LIST.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleToggleLanguage(lang)}
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

            <div className="space-y-2">
              <Label>{isBoarding ? "Terms" : "Terms of Participation"}</Label>
              <WysiwygEditor
                value={termsOfParticipation}
                onChange={setTermsOfParticipation}
                placeholder="List prerequisites, mandatory vaccine records, age, etc."
              />
            </div>

            <CourseFaqTab
              itemNoun={itemNoun}
              faqs={faqs}
              onAdd={handleAddFaq}
              onUpdate={handleUpdateFaq}
              onRemove={requestRemoveFaq}
              compact
            />
          </div>

          {/* Column 2 — 36% Width */}
          <div className="space-y-6">
            <CoursePricingTab
              itemNoun={itemNoun}
              isBoarding={isBoarding}
              isGrooming={isGrooming}
              pricings={pricings}
              onAdd={handleAddPriceTier}
              onUpdate={handleUpdatePriceTier}
              onRemove={requestRemovePriceTier}
              compact
              isDogSitter={isDogSitter}
            />

            {/* Submit Actions */}
            <div className="space-y-3">
              {(error || scheduleOverlapError) && (
                <div
                  data-testid="bottom-submit-notification"
                  className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2.5 text-xs font-semibold shadow-sm animate-in fade-in duration-150"
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error || scheduleOverlapError}</span>
                </div>
              )}

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
        </div>
      )}

      {/* Safety Confirmation Guard Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              type="button"
              onClick={() => setRemoveConfirm(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <div className="space-y-1.5 pt-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="size-4 text-destructive shrink-0" />
                {removeConfirm.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {removeConfirm.description}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRemoveConfirm(null)}
                className="rounded-xl h-9 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={confirmRemoveItem}
                className="rounded-xl h-9 text-xs font-semibold"
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
