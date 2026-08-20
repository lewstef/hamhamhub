// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CourseGeneralTab } from "./course-general-tab";
import { CoursePricingTab } from "./course-pricing-tab";
import { CourseScheduleTab } from "./course-schedule-tab";
import { CourseLocationTab } from "./course-location-tab";
import { CourseCareTab } from "./course-care-tab";
import { CoursePlayYardTab } from "./course-play-yard-tab";
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

    it("renders Dog Sport disciplines including Mantrailing and Search & rescue", () => {
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
          itemNoun="Dog Sport"
          isDogWalking={false}
          isDogTraining={false}
          isDogSport={true}
          isDogSitter={false}
        />
      );

      expect(screen.getByText("Sport Discipline")).toBeDefined();
      expect(screen.getByRole("button", { name: "Agility" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Mantrailing" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Search & rescue" })).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: "Search & rescue" }));
      expect(onNameChange).toHaveBeenCalledWith("Search & rescue");
    });

    it("renders Dog Training topic presets and delivery format modes", () => {
      const onNameChange = vi.fn();
      const onTrainingFormatChange = vi.fn();

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
          trainingFormat="Group Class"
          onTrainingFormatChange={onTrainingFormatChange}
          ageLimitsEnabled={false}
          onAgeLimitsEnabledChange={vi.fn()}
          selectedAgeLimits={[]}
          onToggleAgeLimit={vi.fn()}
          itemNoun="Training course"
          isDogWalking={false}
          isDogTraining={true}
          isDogSport={false}
          isDogSitter={false}
        />
      );

      expect(screen.getByText("Course Topic / Specialization")).toBeDefined();
      expect(screen.getByRole("button", { name: "Puppy Socialization" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Truffle hunting" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Show handling" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Security & Protection" })).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: "Truffle hunting" }));
      expect(onNameChange).toHaveBeenCalledWith("Truffle hunting");

      expect(screen.getByText("Training Format / Delivery Mode")).toBeDefined();
      expect(screen.getByRole("button", { name: "Group Class" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Private 1-on-1 Session" })).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: "Private 1-on-1 Session" }));
      expect(onTrainingFormatChange).toHaveBeenCalledWith("Private 1-on-1 Session");
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

    it("renders Spoken Languages selector across dog services in General Tab and triggers toggle", () => {
      const onToggleLanguage = vi.fn();

      render(
        <CourseGeneralTab
          name="Basic Obedience"
          onNameChange={vi.fn()}
          details=""
          onDetailsChange={vi.fn()}
          certifiedTrainer={false}
          onCertifiedTrainerChange={vi.fn()}
          certifierName=""
          onCertifierNameChange={vi.fn()}
          trainerExperienceDescription=""
          onTrainerExperienceDescriptionChange={vi.fn()}
          spokenLanguages={["Romanian", "English"]}
          onToggleLanguage={onToggleLanguage}
          ageLimitsEnabled={false}
          onAgeLimitsEnabledChange={vi.fn()}
          selectedAgeLimits={[]}
          onToggleAgeLimit={vi.fn()}
          itemNoun="Training course"
          isDogWalking={false}
          isDogTraining={true}
        />
      );

      expect(screen.getByText("Spoken Languages")).toBeDefined();
      expect(screen.getByRole("button", { name: /Romanian/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /English/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Hungarian/i })).toBeDefined();

      const germanBtn = screen.getByRole("button", { name: /German/i });
      fireEvent.click(germanBtn);
      expect(onToggleLanguage).toHaveBeenCalledWith("German");
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

    it("renders and updates closed periods and special openings", () => {
      const onAddClosed = vi.fn();
      const onUpdateClosed = vi.fn();
      const onRemoveClosed = vi.fn();
      const onAddSpecial = vi.fn();
      const onUpdateSpecial = vi.fn();
      const onRemoveSpecial = vi.fn();

      render(
        <CourseScheduleTab
          isDogSport={true}
          scheduleOverlapError={null}
          weeklySchedule={DEFAULT_WEEKLY_SCHEDULE}
          onUpdateDaySchedule={vi.fn()}
          onCopyMonToWorkweek={vi.fn()}
          onCopyMonToAll={vi.fn()}
          closedPeriods={[
            { title: "Facility Maintenance", startDate: "01.09.2026", endDate: "05.09.2026" },
          ]}
          onAddClosedPeriod={onAddClosed}
          onUpdateClosedPeriod={onUpdateClosed}
          onRemoveClosedPeriod={onRemoveClosed}
          specialOpenings={[
            { title: "Open Day", startDate: "10.09.2026", endDate: "12.09.2026", checkin: "10:00", checkout: "16:00", note: "Free trial" },
          ]}
          onAddSpecialOpening={onAddSpecial}
          onUpdateSpecialOpening={onUpdateSpecial}
          onRemoveSpecialOpening={onRemoveSpecial}
        />
      );

      expect(screen.getByDisplayValue("Facility Maintenance")).toBeDefined();
      expect(screen.getByDisplayValue("Open Day")).toBeDefined();
      expect(screen.getByDisplayValue("Free trial")).toBeDefined();

      // Update closed period title
      fireEvent.change(screen.getByDisplayValue("Facility Maintenance"), {
        target: { value: "Annual Renovation" },
      });
      expect(onUpdateClosed).toHaveBeenCalledWith(0, "title", "Annual Renovation");

      // Update special opening title
      fireEvent.change(screen.getByDisplayValue("Open Day"), {
        target: { value: "Summer Dog Fest" },
      });
      expect(onUpdateSpecial).toHaveBeenCalledWith(0, "title", "Summer Dog Fest");

      // Update special opening note
      fireEvent.change(screen.getByDisplayValue("Free trial"), {
        target: { value: "Full day pass included" },
      });
      expect(onUpdateSpecial).toHaveBeenCalledWith(0, "note", "Full day pass included");

      // Remove closed period
      const removeButtons = screen.getAllByRole("button");
      const trashBtns = removeButtons.filter((btn) => btn.querySelector("svg") && btn.className.includes("text-destructive"));
      if (trashBtns[0]) fireEvent.click(trashBtns[0]);
      expect(onRemoveClosed).toHaveBeenCalledWith(0);

      // Add closed period
      fireEvent.click(screen.getByRole("button", { name: /Add Closed Period/i }));
      expect(onAddClosed).toHaveBeenCalled();

      // Add special opening
      fireEvent.click(screen.getByRole("button", { name: /Add Special Opening/i }));
      expect(onAddSpecial).toHaveBeenCalled();
    });

    it("renders day schedule checkboxes and handles toggle and notes", () => {
      const onUpdateDaySchedule = vi.fn();

      render(
        <CourseScheduleTab
          isDogSport={false}
          scheduleOverlapError="Overlapping schedule detected between Monday and Wednesday."
          weeklySchedule={[
            { day: "monday" as const, label: "Monday", enabled: true, checkin: "08:00", checkout: "18:00", note: "Morning dropoff only" },
            { day: "tuesday" as const, label: "Tuesday", enabled: false, checkin: "08:00", checkout: "18:00" },
          ]}
          onUpdateDaySchedule={onUpdateDaySchedule}
          onCopyMonToWorkweek={vi.fn()}
          onCopyMonToAll={vi.fn()}
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

      // Overlap error
      expect(screen.getByText("Overlapping schedule detected between Monday and Wednesday.")).toBeDefined();

      // Toggle Tuesday checkbox
      const tuesdayCheckbox = screen.getByRole("checkbox", { name: /Tuesday/i });
      fireEvent.click(tuesdayCheckbox);
      expect(onUpdateDaySchedule).toHaveBeenCalledWith("tuesday", "enabled", true);

      // Update Monday note
      const noteInput = screen.getByDisplayValue("Morning dropoff only");
      fireEvent.change(noteInput, { target: { value: "Late pickup available" } });
      expect(onUpdateDaySchedule).toHaveBeenCalledWith("monday", "note", "Late pickup available");
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

    it("renders schedule overlap alert when scheduleOverlapError is provided", () => {
      render(
        <CourseScheduleTab
          isDogSport={false}
          scheduleOverlapError="Overlap detected between special openings and closures."
          weeklySchedule={DEFAULT_WEEKLY_SCHEDULE}
          onUpdateDaySchedule={vi.fn()}
          onCopyMonToWorkweek={vi.fn()}
          onCopyMonToAll={vi.fn()}
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

      expect(screen.getByText("Overlap detected between special openings and closures.")).toBeDefined();
      expect(screen.getByText("Daily Operating Schedule")).toBeDefined();
    });

    it("renders closed periods, special openings, and copy schedule buttons and handles callbacks", () => {
      const onCopyMonToWorkweek = vi.fn();
      const onCopyMonToAll = vi.fn();
      const onAddClosedPeriod = vi.fn();
      const onUpdateClosedPeriod = vi.fn();
      const onRemoveClosedPeriod = vi.fn();
      const onAddSpecialOpening = vi.fn();
      const onUpdateSpecialOpening = vi.fn();
      const onRemoveSpecialOpening = vi.fn();

      render(
        <CourseScheduleTab
          isDogSport={false}
          weeklySchedule={DEFAULT_WEEKLY_SCHEDULE}
          onUpdateDaySchedule={vi.fn()}
          onCopyMonToWorkweek={onCopyMonToWorkweek}
          onCopyMonToAll={onCopyMonToAll}
          closedPeriods={[
            {
              title: "Christmas Holidays",
              startDate: "2026-12-24",
              endDate: "2026-12-26",
            },
          ]}
          onAddClosedPeriod={onAddClosedPeriod}
          onUpdateClosedPeriod={onUpdateClosedPeriod}
          onRemoveClosedPeriod={onRemoveClosedPeriod}
          specialOpenings={[
            {
              startDate: "2026-12-27",
              endDate: "2026-12-27",
              title: "Holiday Workshop",
              checkin: "10:00",
              checkout: "16:00",
              note: "Open for holiday training",
            },
          ]}
          onAddSpecialOpening={onAddSpecialOpening}
          onUpdateSpecialOpening={onUpdateSpecialOpening}
          onRemoveSpecialOpening={onRemoveSpecialOpening}
        />
      );

      // Copy buttons
      const copyWorkweekBtn = screen.getByRole("button", { name: /copy mon to mon/i });
      fireEvent.click(copyWorkweekBtn);
      expect(onCopyMonToWorkweek).toHaveBeenCalledTimes(1);

      const copyAllBtn = screen.getByRole("button", { name: /copy mon to all/i });
      fireEvent.click(copyAllBtn);
      expect(onCopyMonToAll).toHaveBeenCalledTimes(1);

      // Closed period
      expect(screen.getByDisplayValue("Christmas Holidays")).toBeDefined();
      const reasonInput = screen.getByPlaceholderText(/e\.g\. Summer Vacation/i);
      fireEvent.change(reasonInput, { target: { value: "Winter Holidays" } });
      expect(onUpdateClosedPeriod).toHaveBeenCalledWith(0, "title", "Winter Holidays");

      const removeClosedBtn = screen.getByTitle("Remove Closed Period");
      fireEvent.click(removeClosedBtn);
      expect(onRemoveClosedPeriod).toHaveBeenCalledWith(0);

      const addClosedBtn = screen.getByRole("button", { name: /add closed period/i });
      fireEvent.click(addClosedBtn);
      expect(onAddClosedPeriod).toHaveBeenCalledTimes(1);

      // Special opening
      expect(screen.getByDisplayValue("Holiday Workshop")).toBeDefined();
      const titleInput = screen.getByPlaceholderText(/e\.g\. Christmas Special Session/i);
      fireEvent.change(titleInput, { target: { value: "Agility Special" } });
      expect(onUpdateSpecialOpening).toHaveBeenCalledWith(0, "title", "Agility Special");

      const noteInput = screen.getByPlaceholderText(/Special Christmas session open/i);
      fireEvent.change(noteInput, { target: { value: "All breeds welcome" } });
      expect(onUpdateSpecialOpening).toHaveBeenCalledWith(0, "note", "All breeds welcome");

      const removeSpecialBtn = screen.getByTitle("Remove Special Opening");
      fireEvent.click(removeSpecialBtn);
      expect(onRemoveSpecialOpening).toHaveBeenCalledWith(0);

      const addSpecialBtn = screen.getByRole("button", { name: /add special opening/i });
      fireEvent.click(addSpecialBtn);
      expect(onAddSpecialOpening).toHaveBeenCalledTimes(1);
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

    it("handles webcam, owner communication, meal plan, walks, and details changes", () => {
      const onDailyWalksChange = vi.fn();
      const onMedicationChange = vi.fn();
      const onMedicationDetailsChange = vi.fn();
      const onSurveillanceChange = vi.fn();
      const onSurveillanceDetailsChange = vi.fn();
      const onWebCamChange = vi.fn();
      const onWebCamDetailsChange = vi.fn();
      const onOwnerCommunicationChange = vi.fn();
      const onOwnerCommunicationDetailsChange = vi.fn();
      const onMealPlanChange = vi.fn();
      const onMealPlanDetailsChange = vi.fn();

      render(
        <CourseCareTab
          isDogWalking={false}
          dailyWalks={2}
          onDailyWalksChange={onDailyWalksChange}
          medicationAdministration={true}
          onMedicationAdministrationChange={onMedicationChange}
          medicationAdministrationDetails="Oral tablets"
          onMedicationAdministrationDetailsChange={onMedicationDetailsChange}
          surveillance247={true}
          onSurveillance247Change={onSurveillanceChange}
          surveillance247Details="Guard on site"
          onSurveillance247DetailsChange={onSurveillanceDetailsChange}
          webCam={true}
          onWebCamChange={onWebCamChange}
          webCamDetails="Live 1080p stream"
          onWebCamDetailsChange={onWebCamDetailsChange}
          ownerCommunication={true}
          onOwnerCommunicationChange={onOwnerCommunicationChange}
          ownerCommunicationDetails="WhatsApp photos"
          onOwnerCommunicationDetailsChange={onOwnerCommunicationDetailsChange}
          personalizedMealPlan={true}
          onPersonalizedMealPlanChange={onMealPlanChange}
          personalizedMealPlanDetails="BARF diet supported"
          onPersonalizedMealPlanDetailsChange={onMealPlanDetailsChange}
        />
      );

      // Change daily walks
      const walksSelect = document.getElementById("daily-walks") as HTMLSelectElement;
      expect(walksSelect).toBeDefined();
      fireEvent.change(walksSelect, { target: { value: "4" } });
      expect(onDailyWalksChange).toHaveBeenCalledWith(4);

      // Change medication details
      fireEvent.change(screen.getByDisplayValue("Oral tablets"), {
        target: { value: "Pills and drops" },
      });
      expect(onMedicationDetailsChange).toHaveBeenCalledWith("Pills and drops");

      // Change webcam details
      fireEvent.change(screen.getByDisplayValue("Live 1080p stream"), {
        target: { value: "HD stream 24/7" },
      });
      expect(onWebCamDetailsChange).toHaveBeenCalledWith("HD stream 24/7");

      // Change meal plan details
      fireEvent.change(screen.getByDisplayValue("BARF diet supported"), {
        target: { value: "Raw food diet" },
      });
      expect(onMealPlanDetailsChange).toHaveBeenCalledWith("Raw food diet");
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

      // Change max pets
      const maxPetsSelect = document.getElementById("max-pets") as HTMLSelectElement;
      if (maxPetsSelect) {
        fireEvent.change(maxPetsSelect, { target: { value: "3" } });
        expect(onMaxPetsChange).toHaveBeenCalledWith(3);
      }

      // Change emergency details
      const emergencyDetails = screen.getByDisplayValue("Vehicle ready 24/7");
      fireEvent.change(emergencyDetails, { target: { value: "24/7 Pet Ambulance" } });

      // Change additional pet policy
      const petPolicy = screen.getByDisplayValue("+25 RON/hr for second dog");
      fireEvent.change(petPolicy, { target: { value: "+30 RON" } });
    });

    it("renders with fallback handlers when optional callbacks are undefined", () => {
      render(
        <CourseCareTab
          isDogWalking={false}
          isDogSitter={true}
          dailyWalks={1}
          onDailyWalksChange={undefined}
          medicationAdministration={true}
          onMedicationAdministrationChange={undefined}
          medicationAdministrationDetails="Meds"
          onMedicationAdministrationDetailsChange={undefined}
          surveillance247={true}
          onSurveillance247Change={undefined}
          surveillance247Details="Guard"
          onSurveillance247DetailsChange={undefined}
          webCam={true}
          onWebCamChange={undefined}
          webCamDetails="Cam"
          onWebCamDetailsChange={undefined}
          ownerCommunication={true}
          onOwnerCommunicationChange={undefined}
          ownerCommunicationDetails="SMS"
          onOwnerCommunicationDetailsChange={undefined}
          personalizedMealPlan={true}
          onPersonalizedMealPlanChange={undefined}
          personalizedMealPlanDetails="Food"
          onPersonalizedMealPlanDetailsChange={undefined}
          emergencyVetTransport={true}
          onEmergencyVetTransportChange={undefined}
          emergencyVetTransportDetails="Van"
          onEmergencyVetTransportDetailsChange={undefined}
          maxPetsPerVisit={1}
          onMaxPetsPerVisitChange={undefined}
          additionalPetPolicy="Policy"
          onAdditionalPetPolicyChange={undefined}
        />
      );

      // Trigger fallbacks
      const switches = screen.getAllByRole("switch");
      switches.forEach((s) => fireEvent.click(s));

      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((inp) => fireEvent.change(inp, { target: { value: "Updated" } }));
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

      const onCertifierNameChange = vi.fn();
      const onExpChange = vi.fn();
      const { rerender } = render(
        <TrainerAttributesCard
          itemNoun="Course"
          certifiedTrainer={true}
          onCertifiedTrainerChange={vi.fn()}
          certifierName="Initial Name"
          onCertifierNameChange={onCertifierNameChange}
          trainerExperienceDescription="Initial Exp"
          onTrainerExperienceDescriptionChange={onExpChange}
        />
      );
      fireEvent.change(screen.getByDisplayValue("Initial Name"), { target: { value: "New Certifier" } });
      expect(onCertifierNameChange).toHaveBeenCalledWith("New Certifier");
      fireEvent.change(screen.getByDisplayValue("Initial Exp"), { target: { value: "New Exp" } });
      expect(onExpChange).toHaveBeenCalledWith("New Exp");
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
          dogSizesEnabled={true}
          onDogSizesEnabledChange={vi.fn()}
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

  describe("CoursePlayYardTab", () => {
    it("renders Play Yard, Dog Pool, and Socialization Policy fields and handles toggles and inputs", () => {
      const onPlayYardChange = vi.fn();
      const onPlayYardDetailsChange = vi.fn();
      const onPoolChange = vi.fn();
      const onPoolDetailsChange = vi.fn();
      const onSocializationPolicyChange = vi.fn();

      render(
        <CoursePlayYardTab
          playYard={true}
          onPlayYardChange={onPlayYardChange}
          playYardDetails="500 sqm fenced grass area"
          onPlayYardDetailsChange={onPlayYardDetailsChange}
          pool={true}
          onPoolChange={onPoolChange}
          poolDetails="Canine inground swimming pool with ramp"
          onPoolDetailsChange={onPoolDetailsChange}
          socializationPolicy="Temperament test required before group play"
          onSocializationPolicyChange={onSocializationPolicyChange}
        />
      );

      expect(screen.getByText("Play Yard & Socialization Areas")).toBeDefined();
      expect(screen.getByText("Fenced Outdoor Play Yard & Exercise Area")).toBeDefined();
      expect(screen.getByDisplayValue("500 sqm fenced grass area")).toBeDefined();
      expect(screen.getByText("Dog Swimming Pool & Splash Area")).toBeDefined();
      expect(screen.getByDisplayValue("Canine inground swimming pool with ramp")).toBeDefined();
      expect(screen.getByText("Socialization & Group Play Policy")).toBeDefined();
      expect(screen.getByDisplayValue("Temperament test required before group play")).toBeDefined();

      // Change socialization policy
      fireEvent.change(screen.getByDisplayValue("Temperament test required before group play"), {
        target: { value: "Updated policy" },
      });
      expect(onSocializationPolicyChange).toHaveBeenCalledWith("Updated policy");
    });
  });

  describe("CourseCareTab (Boarding and Walking Modes)", () => {
    it("renders Boarding care tab with webcam, meal plan, and surveillance", () => {
      render(
        <CourseCareTab
          isDogWalking={false}
          isDogSitter={false}
          dailyWalks={2}
          onDailyWalksChange={vi.fn()}
          medicationAdministration={true}
          onMedicationAdministrationChange={vi.fn()}
          medicationAdministrationDetails="Oral tablets"
          onMedicationAdministrationDetailsChange={vi.fn()}
          surveillance247={true}
          onSurveillance247Change={vi.fn()}
          surveillance247Details="24/7 staff"
          onSurveillance247DetailsChange={vi.fn()}
          webCam={true}
          onWebCamChange={vi.fn()}
          webCamDetails="Live 1080p stream"
          onWebCamDetailsChange={vi.fn()}
          ownerCommunication={true}
          onOwnerCommunicationChange={vi.fn()}
          ownerCommunicationDetails="Daily photo updates"
          onOwnerCommunicationDetailsChange={vi.fn()}
          personalizedMealPlan={true}
          onPersonalizedMealPlanChange={vi.fn()}
          personalizedMealPlanDetails="BARF diet supported"
          onPersonalizedMealPlanDetailsChange={vi.fn()}
        />
      );

      expect(screen.getByText("Daily Walks")).toBeDefined();
      expect(screen.getByText("24/7 Surveillance")).toBeDefined();
      expect(screen.getByText("Webcam")).toBeDefined();
      expect(screen.getByText("Personalized Meal Plan")).toBeDefined();
    });

    it("renders Walking care tab with Key Access and Post-Walk Feeding", () => {
      render(
        <CourseCareTab
          isDogWalking={true}
          isDogSitter={false}
          dailyWalks={1}
          onDailyWalksChange={vi.fn()}
          medicationAdministration={true}
          onMedicationAdministrationChange={vi.fn()}
          medicationAdministrationDetails="Lockbox code 1234"
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
          ownerCommunicationDetails="GPS walk map report"
          onOwnerCommunicationDetailsChange={vi.fn()}
          personalizedMealPlan={true}
          onPersonalizedMealPlanChange={vi.fn()}
          personalizedMealPlanDetails="Post-walk kibble"
          onPersonalizedMealPlanDetailsChange={vi.fn()}
        />
      );

      expect(screen.getByText("Key Access & Home Entry Protocol")).toBeDefined();
      expect(screen.getByText("Post-Walk Feeding & Treat Customization")).toBeDefined();
      expect(screen.getByText("GPS Route Tracking & Post-Walk Reports")).toBeDefined();
    });

    it("renders Dog Sitter care tab with Non-Smoker and Plant Watering", () => {
      const onNonSmokerChange = vi.fn();
      const onPlantWateringChange = vi.fn();
      const onPlantWateringDetailsChange = vi.fn();

      render(
        <CourseCareTab
          isDogWalking={false}
          isDogSitter={true}
          nonSmoker={true}
          onNonSmokerChange={onNonSmokerChange}
          plantWatering={true}
          onPlantWateringChange={onPlantWateringChange}
          plantWateringDetails="Daily plant watering"
          onPlantWateringDetailsChange={onPlantWateringDetailsChange}
          medicationAdministration={false}
          onMedicationAdministrationChange={vi.fn()}
        />
      );

      expect(screen.getByText("Non-Smoker Sitter")).toBeDefined();
      expect(screen.getByText("Plant & Garden Watering")).toBeDefined();
    });
  });
});
