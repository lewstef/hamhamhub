// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CourseGeneralTab } from "./course-general-tab";
import { CoursePricingTab } from "./course-pricing-tab";
import { CourseScheduleTab } from "./course-schedule-tab";
import { CourseLocationTab } from "./course-location-tab";
import { CourseCareTab } from "./course-care-tab";
import { CourseFaqTab } from "./course-faq-tab";
import { AgeLimitsSection } from "./sections/age-limits-section";
import { TrainerAttributesCard } from "./sections/trainer-attributes-card";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/app/actions/courses", () => ({
  createCourseAction: vi.fn().mockResolvedValue({ success: true, course: { id: "new-course-1" } }),
  updateCourseAction: vi.fn().mockResolvedValue({ success: true, course: { id: "updated-course-1" } }),
}));

vi.mock("@/app/actions/cartier-request", () => ({
  requestNewCartierAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/app/actions/organizations", () => ({
  requestNewCartierAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/components/wysiwyg-editor", () => ({
  WysiwygEditor: ({ value, onChange, placeholder }: any) => (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="wysiwyg-mock"
    />
  ),
}));

const DEFAULT_WEEKLY_SCHEDULE = [
  { day: "monday" as const, label: "Monday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "tuesday" as const, label: "Tuesday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "wednesday" as const, label: "Wednesday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "thursday" as const, label: "Thursday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "friday" as const, label: "Friday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "saturday" as const, label: "Saturday", enabled: true, checkin: "09:00", checkout: "16:00" },
  { day: "sunday" as const, label: "Sunday", enabled: true, checkin: "09:00", checkout: "16:00" },
];

describe("CourseForm Subcomponents Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CourseGeneralTab", () => {
    it("renders course name and details input with certified trainer toggle", () => {
      const onNameChange = vi.fn();
      const onDetailsChange = vi.fn();
      const onCertifiedTrainerChange = vi.fn();

      render(
        <CourseGeneralTab
          name="Agility Foundations"
          onNameChange={onNameChange}
          details="Foundational agility training for dogs of all sizes."
          onDetailsChange={onDetailsChange}
          certifiedTrainer={true}
          onCertifiedTrainerChange={onCertifiedTrainerChange}
          certifierName="FCI Dog Trainer License"
          onCertifierNameChange={vi.fn()}
          trainerExperienceDescription="Over 10 years of agility coaching experience."
          onTrainerExperienceDescriptionChange={vi.fn()}
          ageLimitsEnabled={false}
          onAgeLimitsEnabledChange={vi.fn()}
          selectedAgeLimits={[]}
          onToggleAgeLimit={vi.fn()}
          itemNoun="Course"
          isDogWalking={false}
          isDogTraining={true}
          isDogSitter={false}
        />
      );

      expect(screen.getByDisplayValue("Agility Foundations")).toBeDefined();
      expect(screen.getByDisplayValue("FCI Dog Trainer License")).toBeDefined();
    });

    it("renders Sitting Type presets for sitting service", () => {
      const onNameChange = vi.fn();

      render(
        <CourseGeneralTab
          name=""
          onNameChange={onNameChange}
          details=""
          onDetailsChange={vi.fn()}
          certifiedTrainer={false}
          onCertifiedTrainerChange={vi.fn()}
          certifierName=""
          onCertifierNameChange={vi.fn()}
          trainerExperienceDescription=""
          onTrainerExperienceDescriptionChange={vi.fn()}
          ageLimitsEnabled={false}
          onAgeLimitsEnabledChange={vi.fn()}
          selectedAgeLimits={[]}
          onToggleAgeLimit={vi.fn()}
          itemNoun="Sitting service"
          isDogWalking={false}
          isDogTraining={false}
          isDogSitter={true}
        />
      );

      expect(screen.getByText("Sitting Type")).toBeDefined();
      expect(screen.getByRole("button", { name: "Daytime visit with walk" })).toBeDefined();
      const daytimeBtn = screen.getByRole("button", { name: "Daytime visit" });
      fireEvent.click(daytimeBtn);

      expect(onNameChange).toHaveBeenCalledWith("Daytime visit");
    });

    it("renders Veterinary Training toggle for Sitting service and handles callbacks", () => {
      const onVetChange = vi.fn();
      const onVetCertifierChange = vi.fn();

      render(
        <CourseGeneralTab
          name="Day Sitting"
          onNameChange={vi.fn()}
          details=""
          onDetailsChange={vi.fn()}
          certifiedTrainer={false}
          onCertifiedTrainerChange={vi.fn()}
          certifierName=""
          onCertifierNameChange={vi.fn()}
          trainerExperienceDescription=""
          onTrainerExperienceDescriptionChange={vi.fn()}
          veterinaryTraining={true}
          onVeterinaryTrainingChange={onVetChange}
          veterinaryTrainingCertifier="USAMV Diploma"
          onVeterinaryTrainingCertifierChange={onVetCertifierChange}
          veterinaryTrainingDetails="Clinical nurse background"
          onVeterinaryTrainingDetailsChange={vi.fn()}
          ageLimitsEnabled={false}
          onAgeLimitsEnabledChange={vi.fn()}
          selectedAgeLimits={[]}
          onToggleAgeLimit={vi.fn()}
          itemNoun="Sitting service"
          isDogWalking={false}
          isDogTraining={false}
          isDogSitter={true}
        />
      );

      expect(screen.getByText("Veterinary Training")).toBeDefined();
      expect(screen.getByDisplayValue("USAMV Diploma")).toBeDefined();
    });
  });

  describe("CoursePricingTab", () => {
    it("renders pricing tiers and handles add and update callbacks", () => {
      const onAdd = vi.fn();
      const onUpdate = vi.fn();
      const onRemove = vi.fn();

      render(
        <CoursePricingTab
          itemNoun="Course"
          isBoarding={false}
          isGrooming={false}
          pricings={[
            { amount: "150", type: "course", label: "Standard Tier" },
            { amount: "250", type: "course", label: "VIP Tier" },
          ]}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onRemove={onRemove}
          isDogWalking={false}
        />
      );

      expect(screen.getByDisplayValue("150")).toBeDefined();
      expect(screen.getByDisplayValue("250")).toBeDefined();
      expect(screen.getByDisplayValue("Standard Tier")).toBeDefined();

      const addBtn = screen.getByRole("button", { name: /add price tier/i });
      fireEvent.click(addBtn);
      expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it("renders Sitting service 1h to 12h billing frequency options", () => {
      render(
        <CoursePricingTab
          itemNoun="Sitting service"
          isBoarding={false}
          isGrooming={false}
          pricings={[{ amount: "50", type: "1h", label: "" }]}
          onAdd={vi.fn()}
          onUpdate={vi.fn()}
          onRemove={vi.fn()}
          isDogWalking={false}
          isDogSitter={true}
        />
      );

      expect(screen.getAllByText("1h").length).toBeGreaterThan(0);
      expect(screen.getAllByText("12h").length).toBeGreaterThan(0);
      expect(screen.queryByText("Per Month")).toBeNull();
      expect(screen.queryByText("Per Session")).toBeNull();
    });
  });

  describe("CourseScheduleTab & DayScheduleGrid", () => {
    it("renders weekly schedule table and preset copy buttons", () => {
      const onUpdateDaySchedule = vi.fn();
      const onCopyMonToWorkweek = vi.fn();
      const onCopyMonToAll = vi.fn();

      render(
        <CourseScheduleTab
          isDogSport={true}
          scheduleOverlapError={null}
          weeklySchedule={DEFAULT_WEEKLY_SCHEDULE}
          onUpdateDaySchedule={onUpdateDaySchedule}
          onCopyMonToWorkweek={onCopyMonToWorkweek}
          onCopyMonToAll={onCopyMonToAll}
          closedPeriods={[]}
          onAddClosedPeriod={vi.fn()}
          onUpdateClosedPeriod={vi.fn()}
          onRemoveClosedPeriod={vi.fn()}
          specialOpenings={[]}
          onAddSpecialOpening={vi.fn()}
          onUpdateSpecialOpening={vi.fn()}
          onRemoveSpecialOpening={vi.fn()}
        />
      );

      expect(screen.getByText("Schedule")).toBeDefined();

      const copyWorkweekBtn = screen.getByRole("button", { name: /copy mon to mon/i });
      fireEvent.click(copyWorkweekBtn);
      expect(onCopyMonToWorkweek).toHaveBeenCalledTimes(1);

      const copyAllBtn = screen.getByRole("button", { name: /copy mon to all/i });
      fireEvent.click(copyAllBtn);
      expect(onCopyMonToAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("CourseLocationTab", () => {
    it("renders cartiere selector and secondary coverage zones", () => {
      const onSelectedCartiereChange = vi.fn();
      const onAddSecondaryZone = vi.fn();

      render(
        <CourseLocationTab
          layout="tabbed"
          isBoarding={false}
          isDogWalking={true}
          isDogSitter={false}
          cityName="Cluj-Napoca"
          cartiereList={["Mănăștur", "Gheorgheni", "Mărăști", "Zorilor"]}
          selectedCartiere={["Mănăștur", "Zorilor"]}
          onSelectedCartiereChange={onSelectedCartiereChange}
          secondaryZones={[]}
          onAddSecondaryZone={onAddSecondaryZone}
          onRemoveSecondaryZone={vi.fn()}
          onSecondaryCityChange={vi.fn()}
          onSecondaryCartiereChange={vi.fn()}
          hideDedicatedField={true}
          hideParking={true}
          dedicatedField={false}
          onDedicatedFieldChange={vi.fn()}
          trainingFieldDescription=""
          onTrainingFieldDescriptionChange={vi.fn()}
          trainingFieldAddress=""
          onTrainingFieldAddressChange={vi.fn()}
          trainingFieldGoogleBusinessProfile=""
          onGbpChange={vi.fn()}
          trainingFieldGoogleMapsLink=""
          onMapsChange={vi.fn()}
          parking={false}
          onParkingChange={vi.fn()}
          parkingDescription=""
          onParkingDescriptionChange={vi.fn()}
        />
      );

      expect(screen.getByText("Neighborhood Coverage Zones (Cartiere)")).toBeDefined();
      expect(screen.getByText("Secondary Coverage Zones")).toBeDefined();

      const addSecBtn = screen.getByRole("button", { name: /add secondary coverage zone/i });
      fireEvent.click(addSecBtn);
      expect(onAddSecondaryZone).toHaveBeenCalledTimes(1);
    });
  });

  describe("CourseCareTab", () => {
    it("renders boarding and care amenities toggles", () => {
      const onMedicationAdministrationChange = vi.fn();
      const onSurveillance247Change = vi.fn();

      render(
        <CourseCareTab
          isDogWalking={false}
          dailyWalks={3}
          onDailyWalksChange={vi.fn()}
          medicationAdministration={true}
          onMedicationAdministrationChange={onMedicationAdministrationChange}
          medicationAdministrationDetails="Can administer oral pills and insulin injections."
          onMedicationAdministrationDetailsChange={vi.fn()}
          surveillance247={true}
          onSurveillance247Change={onSurveillance247Change}
          surveillance247Details="Continuous 24/7 night staff and perimeter sensors."
          onSurveillance247DetailsChange={vi.fn()}
          webCam={false}
          onWebCamChange={vi.fn()}
          webCamDetails=""
          onWebCamDetailsChange={vi.fn()}
          ownerCommunication={false}
          onOwnerCommunicationChange={vi.fn()}
          ownerCommunicationDetails=""
          onOwnerCommunicationDetailsChange={vi.fn()}
          personalizedMealPlan={false}
          onPersonalizedMealPlanChange={vi.fn()}
          personalizedMealPlanDetails=""
          onPersonalizedMealPlanDetailsChange={vi.fn()}
        />
      );

      expect(screen.getByText("Medication Administration")).toBeDefined();
      expect(screen.getByText("24/7 Surveillance")).toBeDefined();
    });

    it("renders Sitting mode care fields: Medication, Emergency Vet Transport, Multi-Pet, and Communication", () => {
      const onEmergencyChange = vi.fn();
      const onMaxPetsChange = vi.fn();

      render(
        <CourseCareTab
          isDogWalking={false}
          isDogSitter={true}
          dailyWalks={1}
          onDailyWalksChange={vi.fn()}
          medicationAdministration={true}
          onMedicationAdministrationChange={vi.fn()}
          medicationAdministrationDetails="Oral tablets with meals"
          onMedicationAdministrationDetailsChange={vi.fn()}
          surveillance247={false}
          onSurveillance247Change={vi.fn()}
          surveillance247Details=""
          onSurveillance247DetailsChange={vi.fn()}
          webCam={false}
          onWebCamChange={vi.fn()}
          webCamDetails=""
          onWebCamDetailsChange={vi.fn()}
          ownerCommunication={true}
          onOwnerCommunicationChange={vi.fn()}
          ownerCommunicationDetails="Daily photo updates via WhatsApp"
          onOwnerCommunicationDetailsChange={vi.fn()}
          personalizedMealPlan={false}
          onPersonalizedMealPlanChange={vi.fn()}
          personalizedMealPlanDetails=""
          onPersonalizedMealPlanDetailsChange={vi.fn()}
          emergencyVetTransport={true}
          onEmergencyVetTransportChange={onEmergencyChange}
          emergencyVetTransportDetails="Vehicle ready 24/7"
          onEmergencyVetTransportDetailsChange={vi.fn()}
          maxPetsPerVisit={2}
          onMaxPetsPerVisitChange={onMaxPetsChange}
          additionalPetPolicy="+25 RON/hr for second dog"
          onAdditionalPetPolicyChange={vi.fn()}
        />
      );

      expect(screen.getByText("Medication Administration")).toBeDefined();
      expect(screen.getByText("Emergency Vet Transport & First Aid")).toBeDefined();
      expect(screen.getByText("Maximum Pets Per Visit / Booking")).toBeDefined();
      expect(screen.getByText("Additional Pet Policy & Rates")).toBeDefined();
      expect(screen.getByText("Communication with the Owner")).toBeDefined();
      expect(screen.queryByLabelText("Daily Walks")).toBeNull();
      expect(screen.queryByText("24/7 Surveillance")).toBeNull();
      expect(screen.queryByText("Webcam")).toBeNull();
    });
  });

  describe("CourseFaqTab", () => {
    it("renders FAQ list with Add FAQ button and handles interaction", () => {
      const onAdd = vi.fn();
      const onUpdate = vi.fn();
      const onRemove = vi.fn();

      render(
        <CourseFaqTab
          itemNoun="Course"
          faqs={[
            { question: "What should I bring?", answer: "Treats, leash, and vaccination booklet." },
          ]}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(screen.getByDisplayValue("What should I bring?")).toBeDefined();

      const addBtn = screen.getByRole("button", { name: /add faq item/i });
      fireEvent.click(addBtn);
      expect(onAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe("AgeLimitsSection & TrainerAttributesCard", () => {
    it("renders age limits presets and trainer certification options", () => {
      const onAgeLimitsEnabledChange = vi.fn();
      const onSelectedAgeLimitsChange = vi.fn();
      const onCertifiedTrainerChange = vi.fn();

      render(
        <div>
          <AgeLimitsSection
            itemNoun="Course"
            ageLimitsEnabled={true}
            onAgeLimitsEnabledChange={onAgeLimitsEnabledChange}
            selectedAgeLimits={["puppy"]}
            onSelectedAgeLimitsChange={onSelectedAgeLimitsChange}
          />
          <TrainerAttributesCard
            itemNoun="Course"
            certifiedTrainer={true}
            onCertifiedTrainerChange={onCertifiedTrainerChange}
            certifierName="Romanian Kennel Club (AChR)"
            onCertifierNameChange={vi.fn()}
            trainerExperienceDescription="Certified FCI judge and obedience instructor."
            onTrainerExperienceDescriptionChange={vi.fn()}
          />
        </div>
      );

      expect(screen.getByText("Age Limits & Restrictions")).toBeDefined();
      expect(screen.getByText("Puppy (2-6 mos)")).toBeDefined();
      expect(screen.getByText("Trainer Attributes")).toBeDefined();
      expect(screen.getByText("Certified Dog Trainer")).toBeDefined();
      expect(screen.getByDisplayValue("Romanian Kennel Club (AChR)")).toBeDefined();
    });

    it("renders Accepted Dog Sizes with Small, Medium, Large, Giant options and handles toggling", () => {
      const onSelectedDogSizesChange = vi.fn();

      render(
        <AgeLimitsSection
          itemNoun="Sitting service"
          ageLimitsEnabled={false}
          onAgeLimitsEnabledChange={vi.fn()}
          selectedAgeLimits={[]}
          onSelectedAgeLimitsChange={vi.fn()}
          showDogSizes={true}
          selectedDogSizes={["Small", "Medium"]}
          onSelectedDogSizesChange={onSelectedDogSizesChange}
        />
      );

      expect(screen.getByText("Accepted Dog Sizes")).toBeDefined();
      expect(screen.getByRole("button", { name: "Small" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Medium" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Large" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Giant" })).toBeDefined();

      // Click Large to add
      fireEvent.click(screen.getByRole("button", { name: "Large" }));
      expect(onSelectedDogSizesChange).toHaveBeenCalledWith(["Small", "Medium", "Large"]);

      // Click Small to remove
      fireEvent.click(screen.getByRole("button", { name: "Small" }));
      expect(onSelectedDogSizesChange).toHaveBeenCalledWith(["Medium"]);
    });
  });
});
