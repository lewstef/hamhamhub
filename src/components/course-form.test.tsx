// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { CourseForm } from "./course-form";
import { parseCoverageZones } from "@/types/course";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";
import { createMockCourse } from "@/testing/mock-factories";

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left" />,
  Loader2: () => <div data-testid="loader" />,
  AlertCircle: () => <div data-testid="alert-circle" />,
  Plus: () => <div data-testid="plus" />,
  Trash2: () => <div data-testid="trash2" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  FileText: () => <div data-testid="file-text" />,
  Globe: () => <div data-testid="globe" />,
  HelpCircle: () => <div data-testid="help-circle" />,
  DollarSign: () => <div data-testid="dollar-sign" />,
  Sliders: () => <div data-testid="sliders" />,
  MapPin: () => <div data-testid="map-pin" />,
  Calendar: () => <div data-testid="calendar" />,
  FileCheck: () => <div data-testid="file-check" />,
  Footprints: () => <div data-testid="footprints" />,
  X: () => <div data-testid="x-icon" />,
  CheckCircle2: () => <div data-testid="check-circle2" />,
  Search: () => <div data-testid="search" />,
  Check: () => <div data-testid="check" />,
}));

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/app/actions/courses", () => ({
  createCourseAction: vi.fn(),
  updateCourseAction: vi.fn(),
}));

vi.mock("@/app/actions/organizations", () => ({
  requestNewCartierAction: vi.fn(),
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

describe("CourseForm Component", () => {
  const onCancel = vi.fn();
  const onSubmitSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(React, "useTransition").mockImplementation((() => [
      false,
      (fn: () => void) => {
        fn();
      },
    ]) as any);
  });

  it("should render Course dynamic terminology correctly", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    expect(screen.getByText("Back to Courses List")).toBeDefined();
    expect(screen.getByText("Create New Course")).toBeDefined();
    expect(screen.getByText("Course Name")).toBeDefined();
    expect(screen.getByPlaceholderText("e.g. Agility, IGP, Obedience")).toBeDefined();
    expect(screen.getByText("Course Information and Details")).toBeDefined();
    expect(screen.getAllByText("Create Course")[0]).toBeDefined();
  });

  it("should render Dog Sport dynamic terminology and 6-tab navigation correctly", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport-dog-training"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Verify 6 Tab buttons
    expect(screen.getByRole("button", { name: "General" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Terms of participation" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Pricing" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Schedule" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Coverage zones" })).toBeDefined();
    expect(screen.getByRole("button", { name: "FAQ" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Others" })).toBeNull();

    // General tab content initially visible
    expect(screen.getByText("Back to Dog Sports List")).toBeDefined();
    expect(screen.getByText("Create New Dog Sport")).toBeDefined();
    expect(screen.getByText("Dog Sport Name")).toBeDefined();
    expect(screen.getByPlaceholderText("e.g. Agility, IGP, Obedience")).toBeDefined();
    expect(screen.getByText("Dog Sport Information and Details")).toBeDefined();
    expect(screen.getAllByText("Create Dog Sport")[0]).toBeDefined();

    // Switch to Terms of participation tab
    fireEvent.click(screen.getByRole("button", { name: "Terms of participation" }));
    expect(screen.getByText("Age Limits & Prerequisites")).toBeDefined();
    expect(screen.getByText("Terms of Participation")).toBeDefined();

    // Switch to Pricing tab
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));
    expect(screen.getByText("Pricing Structure")).toBeDefined();
    expect(screen.getAllByText("Per Dog Sport")[0]).toBeDefined();

    // Switch to Schedule tab
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    expect(screen.getAllByText("Schedule")[1]).toBeDefined();
    expect(screen.getByText("Copy Mon to Mon–Fri")).toBeDefined();

    // Switch to Coverage zones tab (contains Address, GBP, Maps, Dedicated Training Field, and Dedicated Parking)
    fireEvent.click(screen.getByRole("button", { name: "Coverage zones" }));
    expect(screen.getByText("Location & Map Details")).toBeDefined();
    expect(screen.getByLabelText("Address")).toBeDefined();
    expect(screen.getByLabelText("Google Business Profile")).toBeDefined();
    expect(screen.getByLabelText("Google Maps Link")).toBeDefined();
    expect(screen.getByText("Dedicated Training Field")).toBeDefined();
    expect(screen.getByText("Dedicated Parking")).toBeDefined();

    // Switch to FAQ tab (last position)
    fireEvent.click(screen.getByRole("button", { name: "FAQ" }));
    expect(screen.getByText("Add FAQ Item")).toBeDefined();
    expect(screen.queryByText("Care & Sport Amenities")).toBeNull();
  });

  it("should select priceType correctly and trigger createCourseAction on submit", async () => {
    vi.mocked(createCourseAction).mockResolvedValue({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    const nameInput = screen.getByLabelText("Course Name");
    fireEvent.change(nameInput, { target: { value: "Obedience 101" } });

    const pricingTab = screen.getByText("Pricing");
    await act(async () => {
      fireEvent.click(pricingTab);
    });

    const priceInput = screen.getByLabelText(/Price Amount/);
    fireEvent.change(priceInput, { target: { value: "150" } });

    const select = screen.getByLabelText("Billing Frequency");
    fireEvent.change(select, { target: { value: "month" } });

    const submitBtn = screen.getAllByRole("button", { name: "Create Course" })[0];
    
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    expect(passedFormData.get("name")).toBe("Obedience 101");
    expect(passedFormData.get("price")).toBe("150");
    expect(passedFormData.get("priceType")).toBe("month");
    expect(passedFormData.get("serviceId")).toBe("srv-dog-training");
  });

  it("should render Boarding service dynamic terminology and hide training sections correctly", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-boarding"
        itemNoun="Boarding service"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    expect(screen.getByText("Back to Boarding services List")).toBeDefined();
    expect(screen.getByText("Create New Boarding service")).toBeDefined();
    expect(screen.getByText("Boarding service Name")).toBeDefined();
    expect(screen.getByPlaceholderText("e.g. Standard Room, VIP Cabin")).toBeDefined();
    expect(screen.getByText("Boarding service Information and Details")).toBeDefined();
    expect(screen.getAllByText("Create Boarding service")[0]).toBeDefined();

    // Boarding frequency options (Pricing tab)
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));
    expect(screen.getAllByText("Per Night")[0]).toBeDefined();
    expect(screen.getAllByText("Per Day")[0]).toBeDefined();
    expect(screen.getAllByText("Per Half Day")[0]).toBeDefined();
    expect(screen.getAllByText("Per Month")[0]).toBeDefined();
    expect(screen.getAllByText("Per Boarding service")[0]).toBeDefined();

    // Training fields should not be present
    expect(screen.queryByText("Certified Dog Trainer")).toBeNull();
    expect(screen.queryByText("Dedicated Training Field")).toBeNull();
    // Parking is facility-related, should remain in Coverage zones tab
    fireEvent.click(screen.getByRole("button", { name: "Coverage zones" }));
    expect(screen.getByText("Parking")).toBeDefined();
  });

  it("should omit Age Limits & Restrictions on General tab for Dog Training but render it on Terms tab with Accepted Dog Sizes", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        serviceSlug="dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // On General tab, Age Limits & Restrictions should be omitted
    expect(screen.queryByText("Age Limits & Restrictions")).toBeNull();

    // Verify Course Topic presets are present on General tab
    expect(screen.getByText("Course Topic / Specialization")).toBeDefined();
    expect(screen.getByRole("button", { name: "Puppy Socialization" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Basic Obedience" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Truffle hunting" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Show handling" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Security & Protection" })).toBeDefined();

    // Click Truffle hunting preset and verify Course Name is auto-populated
    fireEvent.click(screen.getByRole("button", { name: "Truffle hunting" }));
    expect((screen.getByLabelText("Course Name") as HTMLInputElement).value).toBe("Truffle hunting");

    // Verify Training Format / Delivery Mode selector is present on General tab
    expect(screen.getByText("Training Format / Delivery Mode")).toBeDefined();
    expect(screen.getByRole("button", { name: "Group Class" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Private 1-on-1 Session" })).toBeDefined();
    expect(screen.getByRole("button", { name: "In-Home Training" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Board & Train" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Online Consultation" })).toBeDefined();

    // Select Group Class and enter max dogs
    fireEvent.click(screen.getByRole("button", { name: "Group Class" }));
    expect(screen.getByLabelText("Maximum Dogs Per Group")).toBeDefined();
    fireEvent.change(screen.getByLabelText("Maximum Dogs Per Group"), { target: { value: "6" } });
    expect((screen.getByLabelText("Maximum Dogs Per Group") as HTMLInputElement).value).toBe("6");

    // Click Terms tab
    fireEvent.click(screen.getByRole("button", { name: /Terms/ }));

    // On Terms tab, Age Limits & Restrictions and Accepted Dog Sizes should be present
    expect(screen.getByText("Age Limits & Restrictions")).toBeDefined();
    expect(screen.getByText("Accepted Dog Sizes")).toBeDefined();

    // Toggle on Accepted Dog Sizes
    const sizesSection = screen.getByText("Accepted Dog Sizes").closest(".space-y-4");
    const sizesSwitch = sizesSection?.querySelector("button[role='switch']");
    expect(sizesSwitch).toBeDefined();
    if (sizesSwitch) {
      await act(async () => {
        fireEvent.click(sizesSwitch);
      });
      expect(screen.getByRole("button", { name: "Small" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Medium" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Large" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Giant" })).toBeDefined();
    }

    // Click Location tab
    fireEvent.click(screen.getByRole("button", { name: "Coverage zones" }));

    // Verify Indoor / Covered Training Hall toggle is present
    expect(screen.getByText("Indoor / Covered Training Hall")).toBeDefined();
    const indoorSection = screen.getByText("Indoor / Covered Training Hall").closest(".space-y-4");
    const indoorSwitch = indoorSection?.querySelector("button[role='switch']");
    expect(indoorSwitch).toBeDefined();
    if (indoorSwitch) {
      await act(async () => {
        fireEvent.click(indoorSwitch);
      });
      expect(screen.getByPlaceholderText("e.g. 200 sqm heated indoor arena, non-slip rubber agility flooring, winter heating & summer air conditioning, full agility mirror...")).toBeDefined();
    }
  });

  it("should render Sport Discipline presets on General tab, Accepted Dog Sizes on Terms tab, and Indoor Hall on Location tab for Dog Sport", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-sport"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // On General tab, Age Limits & Restrictions should be omitted
    expect(screen.queryByText("Age Limits & Restrictions")).toBeNull();

    // Verify Sport Discipline presets
    expect(screen.getByText("Sport Discipline")).toBeDefined();
    expect(screen.getByRole("button", { name: "Agility" })).toBeDefined();
    expect(screen.getByRole("button", { name: "IGP / Schutzhund" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Mondioring" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Ring" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Dog dancing" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Mantrailing" })).toBeDefined();

    // Click Mondioring preset and verify name input updates
    fireEvent.click(screen.getByRole("button", { name: "Mondioring" }));
    expect((screen.getByPlaceholderText("e.g. Agility, IGP, Obedience") as HTMLInputElement).value).toBe("Mondioring");

    // Click Dog dancing preset and verify name input updates
    fireEvent.click(screen.getByRole("button", { name: "Dog dancing" }));
    expect((screen.getByPlaceholderText("e.g. Agility, IGP, Obedience") as HTMLInputElement).value).toBe("Dog dancing");

    // Click Terms tab
    fireEvent.click(screen.getByRole("button", { name: /Terms/ }));

    // On Terms tab, Age Limits & Restrictions and Accepted Dog Sizes should be present
    expect(screen.getByText("Age Limits & Restrictions")).toBeDefined();
    expect(screen.getByText("Accepted Dog Sizes")).toBeDefined();

    // Toggle on Accepted Dog Sizes
    const sportSizesSection = screen.getByText("Accepted Dog Sizes").closest(".space-y-4");
    const sportSizesSwitch = sportSizesSection?.querySelector("button[role='switch']");
    expect(sportSizesSwitch).toBeDefined();
    if (sportSizesSwitch) {
      await act(async () => {
        fireEvent.click(sportSizesSwitch);
      });
      expect(screen.getByRole("button", { name: "Small" })).toBeDefined();
    }

    // Click Location tab
    fireEvent.click(screen.getByRole("button", { name: "Coverage zones" }));

    // Verify Indoor / Covered Training Hall toggle is present
    expect(screen.getByText("Indoor / Covered Training Hall")).toBeDefined();
  });

  it("should render correct placeholder for Sitting service name and details", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-sitting"
        itemNoun="Sitting service"
        serviceSlug="dog-sitting"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    expect(
      screen.getByPlaceholderText("e.g. In-Home Sitting, Daytime Visit, Overnight Care")
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText(
        "Describe what the sitting service includes (feeding, playtime, supervision, home visits)..."
      )
    ).toBeDefined();

    // Verify Sitting Type presets are rendered and interactive
    expect(screen.getByText("Sitting Type")).toBeDefined();
    const inHomePresetBtn = screen.getByRole("button", { name: "In home sitting" });
    const daytimePresetBtn = screen.getByRole("button", { name: "Daytime visit" });
    const daytimeWalkPresetBtn = screen.getByRole("button", { name: "Daytime visit with walk" });
    const overnightPresetBtn = screen.getByRole("button", { name: "Overnight stay" });
    expect(inHomePresetBtn).toBeDefined();
    expect(daytimePresetBtn).toBeDefined();
    expect(daytimeWalkPresetBtn).toBeDefined();
    expect(overnightPresetBtn).toBeDefined();

    // Click In home sitting preset
    fireEvent.click(inHomePresetBtn);
    expect(screen.getByDisplayValue("In home sitting")).toBeDefined();

    // Click Daytime visit with walk preset
    fireEvent.click(daytimeWalkPresetBtn);
    expect(screen.getByDisplayValue("Daytime visit with walk")).toBeDefined();

    // Click Overnight stay preset
    fireEvent.click(overnightPresetBtn);
    expect(screen.getByDisplayValue("Overnight stay")).toBeDefined();

    // Click Pricing Tab
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));

    // Sitting frequency options should include 1h up to 12h
    expect(screen.getAllByText("1h").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2h").length).toBeGreaterThan(0);
    expect(screen.getAllByText("6h").length).toBeGreaterThan(0);
    expect(screen.getAllByText("12h").length).toBeGreaterThan(0);

    // Standard options should be omitted for Sitting service
    expect(screen.queryByText("Per Month")).toBeNull();
    expect(screen.queryByText("Per Session")).toBeNull();
    expect(screen.queryByText("Per Day")).toBeNull();
    expect(screen.queryByText("Per Hour")).toBeNull();

    // Click Care & facilities tab
    fireEvent.click(screen.getByRole("button", { name: "Care & facilities" }));

    // Verify Sitting Care amenities: Medication, Emergency Vet Transport, Multi-Pet Accommodation, Communication
    expect(screen.getByText("Medication Administration")).toBeDefined();
    expect(screen.getByText("Emergency Vet Transport & First Aid")).toBeDefined();
    expect(screen.getByText("Maximum Pets Per Visit / Booking")).toBeDefined();
    expect(screen.getByText("Additional Pet Policy & Rates")).toBeDefined();
    expect(screen.getByText("Communication with the Owner")).toBeDefined();

    // Verify Boarding-only fields are omitted in Sitting mode
    expect(screen.queryByLabelText("Daily Walks")).toBeNull();
    expect(screen.queryByText("24/7 Surveillance")).toBeNull();
    expect(screen.queryByText("Webcam")).toBeNull();

    // Verify Veterinary Training field is rendered on General tab
    fireEvent.click(screen.getByRole("button", { name: "General" }));
    expect(screen.getByText("Veterinary Training")).toBeDefined();
    const vetToggle = screen.getAllByRole("switch").find((s) =>
      s.closest("div")?.textContent?.includes("Veterinary Training")
    );
    expect(vetToggle).toBeDefined();
    if (vetToggle) {
      fireEvent.click(vetToggle);
      expect(screen.getByPlaceholderText("e.g. USAMV, Veterinary Technician Certification, Vet Assistant Diploma")).toBeDefined();
    }

    // Verify Accepted Dog Sizes is rendered on Terms tab
    fireEvent.click(screen.getByRole("button", { name: "Terms of participation" }));
    expect(screen.getByText("Accepted Dog Sizes")).toBeDefined();
    const sittingSizesSection = screen.getByText("Accepted Dog Sizes").closest(".space-y-4");
    const sittingSizesSwitch = sittingSizesSection?.querySelector("button[role='switch']");
    expect(sittingSizesSwitch).toBeDefined();
    if (sittingSizesSwitch) {
      await act(async () => {
        fireEvent.click(sittingSizesSwitch);
      });
      expect(screen.getByRole("button", { name: "Small" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Medium" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Large" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Giant" })).toBeDefined();
    }
  });

  it("should render and manage boarding service custom fields correctly", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-boarding"
        itemNoun="Boarding service"
        serviceSlug="dog-boarding"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Verify Age Limits & Restrictions is omitted on General tab for Boarding
    expect(screen.queryByText("Age Limits & Restrictions")).toBeNull();

    // Click Care & facilities tab to access Boarding Details
    fireEvent.click(screen.getByRole("button", { name: "Care & facilities" }));

    // Boarding details header
    expect(screen.getByText("Care & Facilities")).toBeDefined();

    // Verify presence of daily walks dropdown and select walk value
    const walksSelect = screen.getByLabelText("Daily Walks") as HTMLSelectElement;
    expect(walksSelect).toBeDefined();
    expect(walksSelect.value).toBe("1");
    fireEvent.change(walksSelect, { target: { value: "3" } });
    expect(walksSelect.value).toBe("3");

    // Medication administration details input is hidden initially
    expect(screen.queryByPlaceholderText("e.g. oral tablets, injections, schedule limitations")).toBeNull();

    // Find and click the Medication Administration switch button
    const medicationSection = screen.getByText("Medication Administration").closest(".space-y-4");
    const medicationSwitch = medicationSection?.querySelector("button[role='switch']");
    expect(medicationSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(medicationSwitch!);
    });

    // Instructions input should be displayed now
    const medsInput = screen.getByPlaceholderText("e.g. oral tablets, injections, schedule limitations");
    expect(medsInput).toBeDefined();
    fireEvent.change(medsInput, { target: { value: "Give twice daily with wet food" } });

    // 24/7 Surveillance details input is hidden initially
    expect(screen.queryByPlaceholderText("e.g. 24/7 on-site staff supervision, live CCTV camera monitoring, night security protocol")).toBeNull();

    // Find and click the 24/7 Surveillance switch button
    const surveillanceSection = screen.getByText("24/7 Surveillance").closest(".space-y-4");
    const surveillanceSwitch = surveillanceSection?.querySelector("button[role='switch']");
    expect(surveillanceSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(surveillanceSwitch!);
    });

    // Surveillance details input should be displayed now
    const surveillanceInput = screen.getByPlaceholderText("e.g. 24/7 on-site staff supervision, live CCTV camera monitoring, night security protocol");
    expect(surveillanceInput).toBeDefined();
    fireEvent.change(surveillanceInput, { target: { value: "24/7 CCTV monitoring" } });

    // Web cam details input is hidden initially
    expect(screen.queryByPlaceholderText("e.g. live stream link provided upon check-in, 24/7 access")).toBeNull();

    // Find and click the Webcam switch button
    const webcamSection = screen.getByText("Webcam").closest(".space-y-4");
    const webcamSwitch = webcamSection?.querySelector("button[role='switch']");
    expect(webcamSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(webcamSwitch!);
    });

    // Web cam instructions input should be displayed now
    const webcamInput = screen.getByPlaceholderText("e.g. live stream link provided upon check-in, 24/7 access");
    expect(webcamInput).toBeDefined();
    fireEvent.change(webcamInput, { target: { value: "Live stream access link" } });

    // Communication with Owner details input is hidden initially
    expect(screen.queryByPlaceholderText("e.g. daily photos via WhatsApp, weekly email progress")).toBeNull();

    // Find and click the Communication switch
    const commsSection = screen.getByText("Communication with the Owner").closest(".space-y-4");
    const commsSwitch = commsSection?.querySelector("button[role='switch']");
    expect(commsSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(commsSwitch!);
    });

    // Communication details input should display
    const commsInput = screen.getByPlaceholderText("e.g. daily photos via WhatsApp, weekly email progress");
    expect(commsInput).toBeDefined();
    fireEvent.change(commsInput, { target: { value: "Photos via WhatsApp at 2pm" } });

    // Personalized Meal Plan details input is hidden initially
    expect(screen.queryByPlaceholderText("e.g. BARF diet support, raw food storage, customized portions")).toBeNull();

    // Find and click the Meal Plan switch
    const mealSection = screen.getByText("Personalized Meal Plan").closest(".space-y-4");
    const mealSwitch = mealSection?.querySelector("button[role='switch']");
    expect(mealSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(mealSwitch!);
    });

    // Meal Plan details input should display
    const mealInput = screen.getByPlaceholderText("e.g. BARF diet support, raw food storage, customized portions");
    expect(mealInput).toBeDefined();
    fireEvent.change(mealInput, { target: { value: "Raw diet raw food storage" } });

    // Emergency Vet Transport toggle in Boarding Care tab
    expect(screen.getByText("Emergency Vet Transport & First Aid")).toBeDefined();
    const vetTransportSection = screen.getByText("Emergency Vet Transport & First Aid").closest(".space-y-4");
    const vetTransportSwitch = vetTransportSection?.querySelector("button[role='switch']");
    expect(vetTransportSwitch).toBeDefined();
    if (vetTransportSwitch) {
      await act(async () => {
        fireEvent.click(vetTransportSwitch);
      });
      expect(screen.getByPlaceholderText("e.g. Pet first-aid certified staff on-site 24/7, direct partnership with local 24-hour veterinary emergency hospital, dedicated emergency transport vehicle on standby...")).toBeDefined();
    }

    // Switch to Terms tab and check Accepted Dog Sizes
    fireEvent.click(screen.getByRole("button", { name: "Terms" }));
    expect(screen.getByText("Accepted Dog Sizes")).toBeDefined();
    const boardingSizesSection = screen.getByText("Accepted Dog Sizes").closest(".space-y-4");
    const boardingSizesSwitch = boardingSizesSection?.querySelector("button[role='switch']");
    expect(boardingSizesSwitch).toBeDefined();
    if (boardingSizesSwitch) {
      await act(async () => {
        fireEvent.click(boardingSizesSwitch);
      });
      expect(screen.getByRole("button", { name: "Small" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Medium" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Large" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Giant" })).toBeDefined();
    }

    // Switch to Play yard & socialization tab
    fireEvent.click(screen.getByRole("button", { name: "Play yard & socialization" }));
    expect(screen.getByText("Play Yard & Socialization Areas")).toBeDefined();
    expect(screen.getByText("Fenced Outdoor Play Yard & Exercise Area")).toBeDefined();
    expect(screen.getByText("Socialization & Group Play Policy")).toBeDefined();

    // Toggle Play Yard switch
    const playYardSection = screen.getByText("Fenced Outdoor Play Yard & Exercise Area").closest(".space-y-4");
    const playYardSwitch = playYardSection?.querySelector("button[role='switch']");
    expect(playYardSwitch).toBeDefined();
    if (playYardSwitch) {
      await act(async () => {
        fireEvent.click(playYardSwitch);
      });
      expect(screen.getByPlaceholderText("e.g. 500 sqm natural grass play area, 2-meter secure double fencing, splash pads, agility tunnel and enrichment toys...")).toBeDefined();
    }

    // Toggle Pool switch
    expect(screen.getByText("Dog Swimming Pool & Splash Area")).toBeDefined();
    const poolSection = screen.getByText("Dog Swimming Pool & Splash Area").closest(".space-y-4");
    const poolSwitch = poolSection?.querySelector("button[role='switch']");
    expect(poolSwitch).toBeDefined();
    if (poolSwitch) {
      await act(async () => {
        fireEvent.click(poolSwitch);
      });
      expect(screen.getByPlaceholderText("e.g. Inground canine pool with gentle ramp entry, filtered and chlorine-free water, canine life jackets provided, 1-on-1 staff supervision at all times, seasonal availability (May-Sept)...")).toBeDefined();
    }

    // Switch to Schedule tab for Daily Operating Schedule section
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    expect(screen.getByText("Daily Operating Schedule")).toBeDefined();
    expect(screen.getByText("Copy Mon to Mon–Fri")).toBeDefined();
    expect(screen.getByText("Copy Mon to All")).toBeDefined();

    const checkinInputs = screen.getAllByLabelText("Check-in Time") as HTMLInputElement[];
    const checkoutInputs = screen.getAllByLabelText("Check-out Time") as HTMLInputElement[];

    expect(checkinInputs.length).toBe(7);
    expect(checkoutInputs.length).toBe(7);

    // Monday default
    expect(checkinInputs[0].value).toBe("08:00");
    expect(checkoutInputs[0].value).toBe("18:00");

    // Saturday default
    expect(checkinInputs[5].value).toBe("09:00");
    expect(checkoutInputs[5].value).toBe("16:00");

    // Test updating Monday and using "Copy Mon to All" button
    fireEvent.change(checkinInputs[0], { target: { value: "07:30" } });
    expect(checkinInputs[0].value).toBe("07:30");

    fireEvent.click(screen.getByText("Copy Mon to All"));
    expect(checkinInputs[5].value).toBe("07:30");
  });

  it("should show validation error when check-out time is before or equal to check-in time", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-boarding"
        itemNoun="Boarding service"
        serviceSlug="dog-boarding"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    const checkinInputs = screen.getAllByLabelText("Check-in Time") as HTMLInputElement[];
    const checkoutInputs = screen.getAllByLabelText("Check-out Time") as HTMLInputElement[];

    fireEvent.change(checkinInputs[0], { target: { value: "18:00" } });
    fireEvent.change(checkoutInputs[0], { target: { value: "08:00" } });

    expect(screen.getByText("Check-out time cannot be before or equal to check-in time.")).toBeDefined();
  });

  it("should render Edit Course terminology and values in edit mode", async () => {
    const initialCourse = {
      id: "course-123",
      name: "Agility Mastery",
      certifiedTrainer: true,
      certifierName: "FCI",
      dedicatedField: true,
      trainingFieldDescription: "Grassy field",
      trainingFieldAddress: "123 Field Way",
      parking: true,
      parkingDescription: "Free parking",
      details: "<p>Advanced agility classes</p>",
      termsOfParticipation: "<p>Dogs must be 1+ year old</p>",
      price: "200",
      priceType: "course",
    };

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        initialCourse={initialCourse}
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    expect(screen.getByText("Edit Course: Agility Mastery")).toBeDefined();
    expect(screen.getAllByRole("button", { name: "Save Changes" })[0]).toBeDefined();
    expect((screen.getByLabelText("Course Name") as HTMLInputElement).value).toBe("Agility Mastery");
    expect((screen.getByLabelText("Certifier Name") as HTMLInputElement).value).toBe("FCI");

    const pricingTab = screen.getByText("Pricing");
    await act(async () => {
      fireEvent.click(pricingTab);
    });
    expect((screen.getByLabelText(/Price Amount/) as HTMLInputElement).value).toBe("200");
  });

  it("should trigger onCancel when Back button is clicked", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    const backBtn = screen.getByText("Back to Courses List");
    fireEvent.click(backBtn);
    expect(onCancel).toHaveBeenCalled();
  });

  it("should show local validation error when course name is empty", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    const nameInput = screen.getByLabelText("Course Name");
    fireEvent.change(nameInput, { target: { value: "   " } });

    const submitBtn = screen.getAllByRole("button", { name: "Create Course" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getAllByText("Course name is required.")[0]).toBeDefined();
  });

  it("should show server action error when submission fails", async () => {
    vi.mocked(createCourseAction).mockResolvedValue({ error: "Failed to create course" });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    const nameInput = screen.getByLabelText("Course Name");
    fireEvent.change(nameInput, { target: { value: "Fail Course" } });

    const submitBtn = screen.getAllByRole("button", { name: "Create Course" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getAllByText("Failed to create course")[0]).toBeDefined();
  });

  it("should trigger onSubmitSuccess after successful edit/update", async () => {
    vi.mocked(updateCourseAction).mockResolvedValue({ success: true });

    const initialCourse = {
      id: "course-123",
      name: "Existing Course",
      certifiedTrainer: false,
      dedicatedField: false,
      parking: false,
    };

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        initialCourse={initialCourse}
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    const nameInput = screen.getByLabelText("Course Name");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    const submitBtn = screen.getAllByRole("button", { name: "Save Changes" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(updateCourseAction).toHaveBeenCalled();
    expect(onSubmitSuccess).toHaveBeenCalled();
  });

  it("should expand certifiedTrainer and dedicatedField inputs when toggled on", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Initial state: certifierName is not visible
    expect(screen.queryByLabelText("Certifier Name")).toBeNull();
    
    // Toggle Certified Trainer
    const trainerSwitch = screen.getByText("Certified Dog Trainer").closest(".space-y-4")?.querySelector("button[role='switch']");
    expect(trainerSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(trainerSwitch!);
    });

    expect(screen.getByLabelText("Certifier Name")).toBeDefined();

    // Toggle Dedicated Field (in Coverage zones tab)
    const locationTab = screen.getByRole("button", { name: "Coverage zones" });
    await act(async () => {
      fireEvent.click(locationTab);
    });

    expect(screen.getByLabelText("Address")).toBeDefined();
    expect(screen.queryByText("Training Field Description")).toBeNull();
    const fieldSwitch = screen.getByText("Dedicated Training Field").closest(".space-y-4")?.querySelector("button[role='switch']");
    expect(fieldSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(fieldSwitch!);
    });
    expect(screen.getByText("Training Field Description")).toBeDefined();
  });

  it("should manage adding, editing, and deleting FAQs in the builder", async () => {
    vi.mocked(createCourseAction).mockResolvedValue({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Switch to FAQ tab
    const faqTab = screen.getByText("FAQ");
    await act(async () => {
      fireEvent.click(faqTab);
    });

    // Initial state: empty notice is shown
    expect(screen.getByText('No FAQs added yet. Click "Add FAQ Item" below to start.')).toBeDefined();

    // Click "Add FAQ Item"
    const addBtn = screen.getByRole("button", { name: "Add FAQ Item" });
    await act(async () => {
      fireEvent.click(addBtn);
    });

    // Empty notice should disappear, FAQ item inputs should be visible
    expect(screen.queryByText('No FAQs added yet. Click "Add FAQ Item" below to start.')).toBeNull();
    
    const questionInput = screen.getByLabelText("Question");
    const answerInput = screen.getByPlaceholderText("e.g. Yes, all dogs must have up-to-date DHPP and Rabies vaccines.");

    // Edit Question and Answer
    fireEvent.change(questionInput, { target: { value: "Vaccine requirement?" } });
    fireEvent.change(answerInput, { target: { value: "Yes, up-to-date DHPP required." } });

    // Switch back to General tab to enter Course Name
    const generalTab = screen.getByText("General");
    await act(async () => {
      fireEvent.click(generalTab);
    });

    // Submit form and verify action call includes JSON faq string
    const nameInput = screen.getByLabelText("Course Name");
    fireEvent.change(nameInput, { target: { value: "Advanced Agility" } });

    const submitBtn = screen.getAllByRole("button", { name: "Create Course" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    expect(passedFormData.get("faq")).toBe(
      JSON.stringify([{ question: "Vaccine requirement?", answer: "Yes, up-to-date DHPP required." }])
    );

    // Switch back to FAQ tab to remove item
    const faqTabAgain = screen.getByText("FAQ");
    await act(async () => {
      fireEvent.click(faqTabAgain);
    });

    // Click "Remove FAQ" button and confirm in safety guard modal
    const removeBtn = screen.getByRole("button", { name: "Remove FAQ" });
    await act(async () => {
      fireEvent.click(removeBtn);
    });

    const confirmBtn = screen.getByRole("button", { name: "Confirm Remove" });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(screen.getByText('No FAQs added yet. Click "Add FAQ Item" below to start.')).toBeDefined();
  });

  it("should trigger onCancel when Back button is clicked with no changes", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    const backBtn = screen.getByRole("button", { name: "Back to Courses List" });
    await act(async () => {
      fireEvent.click(backBtn);
    });

    expect(onCancel).toHaveBeenCalled();
  });

  it("should prompt user when clicking Back button with unsaved changes", async () => {
    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(false);

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Edit name input to make form dirty
    const nameInput = screen.getByLabelText("Course Name");
    fireEvent.change(nameInput, { target: { value: "Dirty Agility" } });

    const backBtn = screen.getByRole("button", { name: "Back to Courses List" });
    await act(async () => {
      fireEvent.click(backBtn);
    });

    // Confirm dialog should be called
    expect(window.confirm).toHaveBeenCalledWith("You have unsaved changes. Are you sure you want to leave?");
    expect(onCancel).not.toHaveBeenCalled();

    // Confirm the leaving prompt
    window.confirm = vi.fn().mockReturnValue(true);
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(onCancel).toHaveBeenCalled();

    window.confirm = originalConfirm;
  });

  it("should render and manage Age Limits toggles and checkboxes correctly", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Switch to Terms of participation tab
    const termsTab = screen.getByText("Terms of participation");
    await act(async () => {
      fireEvent.click(termsTab);
    });

    // Verify age limits details checkbox options are hidden initially
    expect(screen.queryByText("Select Age Phases")).toBeNull();

    // Toggle Age Limits switch
    const ageLimitsSwitch = screen.getByText("Age Limits & Restrictions").closest(".space-y-4")?.querySelector("button[role='switch']");
    expect(ageLimitsSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(ageLimitsSwitch!);
    });

    // Option phase pill buttons should be visible
    expect(screen.getByText("Allowed Dog Age Groups")).toBeDefined();
    const puppyButton = screen.getByRole("button", { name: "Puppy (2-6 mos)" });
    const teenButton = screen.getByRole("button", { name: "Junior (6-12 mos)" });
    expect(puppyButton).toBeDefined();
    expect(teenButton).toBeDefined();

    await act(async () => {
      fireEvent.click(puppyButton);
    });
    expect(puppyButton.className).toContain("bg-primary");

    await act(async () => {
      fireEvent.click(teenButton);
    });
    expect(teenButton.className).toContain("bg-primary");
  });

  it("should render clean Grooming service form without trainer and facility attribute toggles", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-grooming"
        itemNoun="Grooming service"
        serviceSlug="dog-grooming"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    expect(screen.getByText("Create New Grooming service")).toBeDefined();
    expect(screen.queryByText("Certified Dog Trainer")).toBeNull();
    expect(screen.queryByText("Trainer & Facility Attributes")).toBeNull();
    expect(screen.queryByText("Facility Attributes")).toBeNull();
    expect(screen.queryByText("Boarding Details")).toBeNull();

    // Verify Tab 2 (Terms of participation) does not render Age Limits or Accepted Dog Sizes for Grooming
    fireEvent.click(screen.getByRole("button", { name: "Terms of participation" }));
    expect(screen.queryByText("Age Limits & Prerequisites")).toBeNull();
    expect(screen.queryByText("Age Limits & Restrictions")).toBeNull();
    expect(screen.queryByText("Accepted Dog Sizes")).toBeNull();

    // Verify Grooming billing frequency options on Pricing tab
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));
    const select = screen.getByLabelText("Billing Frequency") as HTMLSelectElement;
    expect(select).toBeDefined();
    expect(screen.getAllByText("Per Grooming service")[0]).toBeDefined();
    expect(screen.getByText("Per Session")).toBeDefined();
    expect(screen.getByText("Per Hour")).toBeDefined();
  });

  it("should handle Copy Mon to Mon-Fri and Copy Mon to All preset buttons in Boarding service schedule", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-boarding"
        itemNoun="Boarding service"
        serviceSlug="dog-boarding"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    const copyMonFriBtn = screen.getByRole("button", { name: "Copy Mon to Mon–Fri" });
    await act(async () => {
      fireEvent.click(copyMonFriBtn);
    });

    const copyMonAllBtn = screen.getByRole("button", { name: "Copy Mon to All" });
    await act(async () => {
      fireEvent.click(copyMonAllBtn);
    });

    expect(copyMonAllBtn).toBeDefined();
  });

  it("should handle field edits and form submission across 6 tabs in Dog Sports Training mode", async () => {
    vi.mocked(createCourseAction).mockResolvedValue({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport-dog-training"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // 1. General Tab: Fill Name and enable Certified Trainer
    const nameInput = screen.getByLabelText("Dog Sport Name");
    fireEvent.change(nameInput, { target: { value: "Mondioring Level 1" } });

    const certifiedTrainerToggle = screen.getAllByRole("switch")[0];
    await act(async () => {
      fireEvent.click(certifiedTrainerToggle);
    });

    const certifierInput = screen.getByLabelText("Certifier Name");
    fireEvent.change(certifierInput, { target: { value: "FCI World Body" } });

    // 2. Coverage zones Tab: Fill Address and Maps links
    fireEvent.click(screen.getByRole("button", { name: "Coverage zones" }));
    const addressInput = screen.getByLabelText("Address");
    fireEvent.change(addressInput, { target: { value: "Str. Canine 15, Cluj" } });

    const gbpInput = screen.getByLabelText("Google Business Profile");
    fireEvent.change(gbpInput, { target: { value: "https://business.google.com/site/mondioring" } });

    const mapsInput = screen.getByLabelText("Google Maps Link");
    fireEvent.change(mapsInput, { target: { value: "https://maps.google.com/place/mondioring" } });

    // 3. Pricing Tab: Fill Price Amount and Billing Frequency
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));
    const priceInput = screen.getByLabelText(/Price Amount/);
    fireEvent.change(priceInput, { target: { value: "400" } });

    const select = screen.getByLabelText("Billing Frequency");
    fireEvent.change(select, { target: { value: "month" } });

    // Submit form via action button
    const submitBtn = screen.getAllByRole("button", { name: "Create Dog Sport" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    expect(passedFormData.get("name")).toBe("Mondioring Level 1");
    expect(passedFormData.get("certifiedTrainer")).toBe("true");
    expect(passedFormData.get("certifierName")).toBe("FCI World Body");
    expect(passedFormData.get("trainerExperienceDescription")).toBeDefined();
    expect(passedFormData.get("trainingFieldAddress")).toBe("Str. Canine 15, Cluj");
    expect(passedFormData.get("trainingFieldGoogleBusinessProfile")).toBe("https://business.google.com/site/mondioring");
    expect(passedFormData.get("trainingFieldGoogleMapsLink")).toBe("https://maps.google.com/place/mondioring");
    expect(passedFormData.get("price")).toBe("400");
    expect(passedFormData.get("priceType")).toBe("month");
    expect(onSubmitSuccess).toHaveBeenCalled();
  });

  it("should persist entered inputs when navigating back and forth between tabs in Dog Sports mode", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport-dog-training"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Fill Name in General tab
    const nameInput = screen.getByLabelText("Dog Sport Name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "IGP Tracking" } });

    // Fill Coverage zones tab
    fireEvent.click(screen.getByRole("button", { name: "Coverage zones" }));
    const addressInput = screen.getByLabelText("Address") as HTMLInputElement;
    fireEvent.change(addressInput, { target: { value: "Timisoara Field 4" } });

    // Switch to Schedule tab
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    expect(screen.getAllByText("Schedule")[1]).toBeDefined();

    // Navigate back to General tab — Name should be preserved
    fireEvent.click(screen.getByRole("button", { name: "General" }));
    expect((screen.getByLabelText("Dog Sport Name") as HTMLInputElement).value).toBe("IGP Tracking");

    // Navigate back to Coverage zones tab — Address should be preserved
    fireEvent.click(screen.getByRole("button", { name: "Coverage zones" }));
    expect((screen.getByLabelText("Address") as HTMLInputElement).value).toBe("Timisoara Field 4");
  });

  it("should support adding, updating, and removing multi-pricing tiers", async () => {
    vi.mocked(createCourseAction).mockResolvedValueOnce({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport-dog-training"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Set Name
    const nameInput = screen.getByLabelText("Dog Sport Name");
    fireEvent.change(nameInput, { target: { value: "Agility Multi Pricing" } });

    // Go to Pricing tab
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));
    expect(screen.getByText("Price Option #1")).toBeDefined();

    // Fill tier 1
    const price1 = screen.getByLabelText(/Price Amount/);
    fireEvent.change(price1, { target: { value: "200" } });

    // Click Add Price Tier
    const addTierBtn = screen.getByRole("button", { name: "Add Price Tier" });
    fireEvent.click(addTierBtn);

    expect(screen.getByText("Price Option #2")).toBeDefined();

    // Fill tier 2
    const price2 = screen.getByLabelText(/Price Amount/, { selector: "#course-price-1" });
    fireEvent.change(price2, { target: { value: "800" } });

    const label2 = screen.getByLabelText("Label / Title (Optional)", { selector: "#course-price-label-1" });
    fireEvent.change(label2, { target: { value: "Monthly Pass" } });

    // Submit form
    const submitBtn = screen.getAllByRole("button", { name: "Create Dog Sport" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    const priceJsonStr = passedFormData.get("price") as string;
    expect(priceJsonStr).toContain("200");
    expect(priceJsonStr).toContain("800");
    expect(priceJsonStr).toContain("Monthly Pass");
  });

  it("should support adding and submitting closed periods in schedule", async () => {
    vi.mocked(createCourseAction).mockResolvedValueOnce({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport-dog-training"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Set Name
    const nameInput = screen.getByLabelText("Dog Sport Name");
    fireEvent.change(nameInput, { target: { value: "Summer Dog Sport" } });

    // Go to Schedule tab
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    expect(screen.getByText("Closed Periods & Special Closures")).toBeDefined();

    // Add closed period
    const addClosedBtn = screen.getByRole("button", { name: "Add Closed Period" });
    fireEvent.click(addClosedBtn);

    expect(screen.getByText("Closed Period #1")).toBeDefined();

    const titleInput = screen.getByLabelText("Closure Reason / Title");
    fireEvent.change(titleInput, { target: { value: "Summer Break" } });

    const startInput = screen.getByLabelText("Start Date");
    fireEvent.change(startInput, { target: { value: "2026-08-01" } });

    const endInput = screen.getByLabelText("End Date");
    fireEvent.change(endInput, { target: { value: "2026-08-15" } });

    // Submit form
    const submitBtn = screen.getAllByRole("button", { name: "Create Dog Sport" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    const scheduleJsonStr = passedFormData.get("schedule") as string;
    expect(scheduleJsonStr).toContain("Summer Break");
    expect(scheduleJsonStr).toContain("2026-08-01");
    expect(scheduleJsonStr).toContain("2026-08-15");
  });

  it("should support adding and submitting special opening dates in schedule", async () => {
    vi.mocked(createCourseAction).mockResolvedValueOnce({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport-dog-training"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Set Name
    const nameInput = screen.getByLabelText("Dog Sport Name");
    fireEvent.change(nameInput, { target: { value: "Special Workshop Sport" } });

    // Go to Schedule tab
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    expect(screen.getByText("Special Openings & Extra Working Dates")).toBeDefined();

    // Add special opening
    const addSpecialBtn = screen.getByRole("button", { name: "Add Special Opening" });
    fireEvent.click(addSpecialBtn);

    expect(screen.getByText("Special Opening #1")).toBeDefined();

    const titleInput = screen.getByLabelText("Opening Reason / Event Title");
    fireEvent.change(titleInput, { target: { value: "Christmas Special Session" } });

    const startInput = screen.getByLabelText("Start Date", { selector: "#special-opening-start-0" });
    fireEvent.change(startInput, { target: { value: "20.12.2026" } });

    const endInput = screen.getByLabelText("End Date", { selector: "#special-opening-end-0" });
    fireEvent.change(endInput, { target: { value: "20.12.2026" } });

    // Submit form
    const submitBtn = screen.getAllByRole("button", { name: "Create Dog Sport" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    const scheduleJsonStr = passedFormData.get("schedule") as string;
    expect(scheduleJsonStr).toContain("Christmas Special Session");
    expect(scheduleJsonStr).toContain("20.12.2026");
  });

  it("should show error when a closed period overlaps with a special opening period", async () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport-dog-training"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Set Name
    fireEvent.change(screen.getByLabelText("Dog Sport Name"), { target: { value: "Overlap Test" } });

    // Go to Schedule tab
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

    // Add Closed Period: 15.08.2026 to 20.08.2026
    fireEvent.click(screen.getByRole("button", { name: "Add Closed Period" }));
    fireEvent.change(screen.getByLabelText("Closure Reason / Title"), { target: { value: "Summer Break" } });
    fireEvent.change(screen.getByLabelText("Start Date", { selector: "#closed-period-start-0" }), { target: { value: "15.08.2026" } });
    fireEvent.change(screen.getByLabelText("End Date", { selector: "#closed-period-end-0" }), { target: { value: "20.08.2026" } });

    // Add Special Opening: 18.08.2026 to 22.08.2026 (Overlaps on 18-20 Aug!)
    fireEvent.click(screen.getByRole("button", { name: "Add Special Opening" }));
    fireEvent.change(screen.getByLabelText("Opening Reason / Event Title"), { target: { value: "Special Open Day" } });
    fireEvent.change(screen.getByLabelText("Start Date", { selector: "#special-opening-start-0" }), { target: { value: "18.08.2026" } });
    fireEvent.change(screen.getByLabelText("End Date", { selector: "#special-opening-end-0" }), { target: { value: "22.08.2026" } });

    // Live notification banner should be rendered immediately inside Schedule tab
    expect(screen.getByTestId("schedule-overlap-notification")).toBeDefined();

    // Submit form
    const submitBtn = screen.getAllByRole("button", { name: "Create Dog Sport" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Should NOT call action and should display overlap error
    expect(createCourseAction).not.toHaveBeenCalled();
    expect(screen.getAllByText(/overlaps with special opening/)[0]).toBeDefined();
  });

  it("should allow adding optional notes to schedule items", async () => {
    vi.mocked(createCourseAction).mockResolvedValueOnce({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport-dog-training"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Set Name
    fireEvent.change(screen.getByLabelText("Dog Sport Name"), { target: { value: "Agility Advanced" } });

    // Go to Schedule tab
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

    // Add note to Monday schedule
    const mondayNoteInput = screen.getByLabelText(/Note/i, { selector: "#note-monday" });
    fireEvent.change(mondayNoteInput, { target: { value: "Evening group session" } });

    // Submit form
    const submitBtn = screen.getAllByRole("button", { name: "Create Dog Sport" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    const scheduleJsonStr = passedFormData.get("schedule") as string;
    expect(scheduleJsonStr).toContain("Evening group session");
  });

  it("should parse legacy and structured coverageZones JSON strings correctly", () => {
    // Legacy array string
    const legacyParsed = parseCoverageZones(JSON.stringify(["Mănăștur", "Gheorgheni"]));
    expect(legacyParsed).toEqual({
      primary: ["Mănăștur", "Gheorgheni"],
      secondary: [],
    });

    // Structured object JSON
    const structuredParsed = parseCoverageZones(
      JSON.stringify({
        primary: ["Centru"],
        secondary: [{ city: "Timișoara", cartiere: ["Iosefin", "Fabric"] }],
      })
    );
    expect(structuredParsed).toEqual({
      primary: ["Centru"],
      secondary: [{ city: "Timișoara", cartiere: ["Iosefin", "Fabric"] }],
    });

    // Empty / null fallback
    expect(parseCoverageZones(null)).toEqual({ primary: [], secondary: [] });
  });

  it("should render Primary and Secondary Coverage Zones for Dog Walking service mode", async () => {
    vi.mocked(createCourseAction).mockResolvedValueOnce({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-walking"
        itemNoun="Walking service"
        serviceSlug="dog-walking"
        orgCity="Cluj-Napoca"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Name input
    fireEvent.change(screen.getByLabelText("Walking service Name"), { target: { value: "30 Min Dog Walk" } });

    // Switch to Coverage zones tab
    fireEvent.click(screen.getByRole("button", { name: "Coverage zones" }));

    // Verify Primary city field is pre-filled and disabled
    expect(screen.getByDisplayValue("Cluj-Napoca")).toBeDefined();
    expect(screen.getByText("Neighborhood Coverage Zones (Cartiere)")).toBeDefined();

    // Select primary cartier
    const manasturBtn = screen.getByText("Mănăștur");
    fireEvent.click(manasturBtn);

    // Add Secondary Coverage Zone
    const addSecBtn = screen.getByRole("button", { name: "Add Secondary Coverage Zone" });
    fireEvent.click(addSecBtn);

    expect(screen.getByText("Secondary Coverage Zones")).toBeDefined();
    expect(screen.getAllByText("Select Secondary City")[0]).toBeDefined();

    // Submit form
    const submitBtn = screen.getAllByRole("button", { name: "Create Walking service" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    const coverageJsonStr = passedFormData.get("coverageZones") as string;
    expect(coverageJsonStr).toContain("Mănăștur");
  });

  it("should render and submit tabbed form layout for Dog Grooming service mode", async () => {
    vi.mocked(createCourseAction).mockResolvedValueOnce({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-grooming"
        itemNoun="Grooming service"
        serviceSlug="dog-grooming"
        orgCity="Bucharest"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Name input on General tab
    fireEvent.change(screen.getByLabelText("Grooming service Name"), {
      target: { value: "Full Bath & Haircut" },
    });

    // Switch to Pricing tab to set price
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));
    const priceInput = screen.getByLabelText(/Price Amount/);
    fireEvent.change(priceInput, { target: { value: "120" } });

    // Submit form
    const submitBtn = screen.getAllByRole("button", { name: "Create Grooming service" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    expect(passedFormData.get("name")).toBe("Full Bath & Haircut");
    expect(passedFormData.get("price")).toBe("120");
    expect(passedFormData.get("priceType")).toBe("service");
  });

  it("should update and remove multiple pricing tiers in tabbed mode", async () => {
    vi.mocked(createCourseAction).mockResolvedValueOnce({ success: true });

    const { container } = render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        serviceSlug="dog-training"
        orgCity="Cluj-Napoca"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Enter Course Name
    fireEvent.change(screen.getByLabelText("Course Name"), {
      target: { value: "Agility Pro" },
    });

    // Navigate to Pricing Tab
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));

    // Update Price 0
    fireEvent.change(screen.getByLabelText("Price Amount (lei)"), {
      target: { value: "200" },
    });

    // Add another price tier (empty)
    fireEvent.click(screen.getByRole("button", { name: /Add Price Tier/i }));
    expect(screen.getByText("Price Option #2")).toBeDefined();

    // Populate price option #2
    const secondPriceInput = document.getElementById("course-price-1") as HTMLInputElement;
    if (secondPriceInput) {
      fireEvent.change(secondPriceInput, { target: { value: "350" } });
    }

    // Remove price option #2 (has data -> modal opens)
    const removePriceBtns = screen.getAllByTitle("Remove Price Option");
    if (removePriceBtns.length > 0) {
      fireEvent.click(removePriceBtns[removePriceBtns.length - 1]);
      fireEvent.click(screen.getByRole("button", { name: "Confirm Remove" }));
    }

    // Submit form
    const formEl = container.querySelector("form")!;
    await act(async () => {
      fireEvent.submit(formEl);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    expect(passedFormData.get("name")).toBe("Agility Pro");
    expect(passedFormData.get("price")).toBe("200");
  });

  it("should render non-grooming flat layout mode with Trainer attributes, dedicated field, and parking", async () => {
    vi.mocked(createCourseAction).mockResolvedValueOnce({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-special"
        itemNoun="Special Service"
        serviceSlug="other-special"
        orgCity="Bucharest"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    expect(screen.getByText("Trainer & Facility Attributes")).toBeDefined();
    expect(screen.getByText("Dedicated Training Field")).toBeDefined();
    expect(screen.getByText("Parking")).toBeDefined();

    fireEvent.change(screen.getByLabelText("Special Service Name"), {
      target: { value: "Canine Behavior Assessment" },
    });

    const priceInput = screen.getByLabelText("Price Amount (lei)");
    fireEvent.change(priceInput, { target: { value: "180" } });

    const submitBtn = screen.getAllByRole("button", { name: "Create Special Service" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    expect(passedFormData.get("name")).toBe("Canine Behavior Assessment");
    expect(passedFormData.get("price")).toBe("180");
  });

  it("should render grooming service in tabbed mode and handle cancel and action failure", async () => {
    vi.mocked(createCourseAction).mockResolvedValueOnce({ error: "Course name exists" });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-grooming"
        itemNoun="Grooming Package"
        serviceSlug="dog-grooming"
        orgCity="Cluj-Napoca"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Verify all 6 tabs are present for Grooming (General, Terms, Pricing, Schedule, Coverage zones, FAQ)
    expect(screen.getByRole("button", { name: /^general$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /terms/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /pricing/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /schedule/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /coverage zones/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^faq$/i })).toBeDefined();

    // Cancel button
    const cancelBtn = screen.getAllByRole("button", { name: "Cancel" })[0];
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalled();

    // Fill name on General tab
    fireEvent.change(screen.getByLabelText("Grooming Package Name"), {
      target: { value: "Full Spa & Bath" },
    });

    // Switch to Pricing tab and set price
    const pricingTabBtn = screen.getByRole("button", { name: /pricing/i });
    fireEvent.click(pricingTabBtn);

    fireEvent.change(screen.getByLabelText("Price Amount (lei)"), {
      target: { value: "150" },
    });

    const submitBtn = screen.getAllByRole("button", { name: "Create Grooming Package" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    expect(onSubmitSuccess).not.toHaveBeenCalled();
    expect(screen.getAllByText("Course name exists")[0]).toBeDefined();
  });

  it("should handle secondary zones city and cartiere changes in dog walking mode", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-walking"
        itemNoun="Walking Route"
        serviceSlug="dog-walking"
        orgCity="Cluj-Napoca"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Switch to coverage tab
    const coverageTabBtn = screen.getByRole("button", { name: /coverage/i });
    fireEvent.click(coverageTabBtn);

    // Add secondary zone
    const addSecondaryBtn = screen.getByRole("button", { name: /add secondary coverage zone/i });
    fireEvent.click(addSecondaryBtn);

    // Select secondary city
    const secSelects = screen.getAllByRole("button", { name: /select secondary city/i });
    if (secSelects.length > 0) {
      fireEvent.click(secSelects[0]);
    }

    // Remove secondary zone
    const removeZoneBtn = screen.getByRole("button", { name: /remove zone/i });
    fireEvent.click(removeZoneBtn);
  });

  it("should validate empty name and invalid price amounts on submit", async () => {
    const { container } = render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-training"
        itemNoun="Course"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Empty name submit
    const formEl = container.querySelector("form")!;
    fireEvent.submit(formEl);
    expect(screen.getByText("Course name is required.")).toBeDefined();

    // Fill valid name
    fireEvent.change(screen.getByLabelText("Course Name"), {
      target: { value: "Agility Mastery" },
    });

    // Go to pricing tab
    fireEvent.click(screen.getByRole("button", { name: /pricing/i }));

    // Set invalid zero price on the first pricing tier
    const priceInput = container.querySelector('input[id^="course-price-"]') as HTMLInputElement;
    if (priceInput) {
      fireEvent.change(priceInput, { target: { value: "0" } });
    }

    fireEvent.submit(formEl);
    expect(screen.getByText(/Price amount for option #1 must be a positive number in lei/i)).toBeDefined();
  });

  it("should handle sitting presets selection in dog sitter service mode", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-dog-sitter"
        itemNoun="Sitting service"
        serviceSlug="dog-sitter"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Click sitting preset button
    const presetBtn = screen.getByRole("button", { name: "In home sitting" });
    expect(presetBtn).toBeDefined();
    fireEvent.click(presetBtn);

    const nameInput = screen.getByLabelText("Sitting service Name") as HTMLInputElement;
    expect(nameInput.value).toBe("In home sitting");

    // Click another preset
    const dayVisitBtn = screen.getByRole("button", { name: "Daytime visit" });
    fireEvent.click(dayVisitBtn);
    expect(nameInput.value).toBe("Daytime visit");
  });

  it("should render flat grooming form and submit successfully", async () => {
    vi.mocked(createCourseAction).mockResolvedValue({ success: true });

    vi.mocked(createCourseAction).mockResolvedValueOnce({ success: true });
    const { container } = render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-grooming"
        itemNoun="Grooming service"
        serviceSlug="dog-grooming"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Set name on General tab
    const nameInput = screen.getByLabelText("Grooming service Name");
    fireEvent.change(nameInput, { target: { value: "Full Grooming & Bath" } });

    // Switch to Pricing tab and set price
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));
    const priceInput = screen.getByLabelText(/Price Amount/);
    fireEvent.change(priceInput, { target: { value: "120" } });

    // Submit form
    const formEl = container.querySelector("form")!;
    await act(async () => {
      fireEvent.submit(formEl);
    });

    expect(createCourseAction).toHaveBeenCalled();
    expect(onSubmitSuccess).toHaveBeenCalled();
  });

  it("should render flat non-grooming mode and update dedicated field, parking, and description inputs", () => {
    const { container } = render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-custom"
        itemNoun="Custom service"
        serviceSlug="custom-other"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Dedicated Field toggle
    const switches = screen.getAllByRole("switch");
    if (switches.length > 0) {
      fireEvent.click(switches[0]);
    }

    // Set dedicated field address if rendered
    const addressInput = container.querySelector("#training-field-address");
    if (addressInput) {
      fireEvent.change(addressInput, { target: { value: "Canine Park 4" } });
    }

    // Set GBP link
    const gbpInput = container.querySelector("#training-field-gbp");
    if (gbpInput) {
      fireEvent.change(gbpInput, { target: { value: "https://business.google.com/test" } });
    }

    // Set Maps link
    const mapsInput = container.querySelector("#training-field-maps");
    if (mapsInput) {
      fireEvent.change(mapsInput, { target: { value: "https://maps.google.com/test" } });
    }

    // Toggle Parking
    if (switches.length > 1) {
      fireEvent.click(switches[1]);
    }
  });

  it("should handle safety remove confirmation modal for FAQs and pricing tiers", async () => {
    const { container } = render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-training"
        itemNoun="Training course"
        serviceSlug="dog-training"
        initialCourse={createMockCourse({
          id: "c-1",
          name: "Puppy Class",
          faq: JSON.stringify([
            { question: "What age?", answer: "At least 3 months" },
            { question: "Vaccines needed?", answer: "Full rabies" },
          ]),
          price: JSON.stringify([
            { amount: "100", type: "course", label: "Option 1" },
            { amount: "200", type: "course", label: "Option 2" },
          ]),
        })}
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Go to FAQ tab
    fireEvent.click(screen.getByRole("button", { name: "FAQ" }));

    // Click remove on the first FAQ
    const faqRemoveBtns = screen.getAllByTitle("Remove FAQ");
    fireEvent.click(faqRemoveBtns[0]);

    // Safety modal is displayed
    expect(screen.getByText("Remove FAQ Item")).toBeDefined();

    // Cancel modal
    const cancelModalBtns = screen.getAllByRole("button", { name: "Cancel" });
    fireEvent.click(cancelModalBtns[cancelModalBtns.length - 1]);
    expect(screen.queryByText("Remove FAQ Item")).toBeNull();

    // Open remove modal again and confirm removal
    fireEvent.click(screen.getAllByTitle("Remove FAQ")[0]);
    const confirmBtn = screen.getByRole("button", { name: "Confirm Remove" });
    fireEvent.click(confirmBtn);
    expect(screen.queryByDisplayValue("What age?")).toBeNull();

    // Switch to Pricing tab
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));

    // Click remove on first price tier
    const removePriceBtns = screen.getAllByTitle("Remove Price Option");
    if (removePriceBtns.length > 0) {
      fireEvent.click(removePriceBtns[0]);
      expect(screen.getByText("Remove Price Option")).toBeDefined();

      // Close modal using top-right × button
      const closeX = document.querySelector(".fixed button.absolute") as HTMLButtonElement;
      if (closeX) {
        fireEvent.click(closeX);
      }
      expect(screen.queryByText("Remove Price Option")).toBeNull();

      // Open remove modal again and confirm
      fireEvent.click(screen.getAllByTitle("Remove Price Option")[0]);
      fireEvent.click(screen.getByRole("button", { name: "Confirm Remove" }));
      expect(screen.queryByDisplayValue("100")).toBeNull();
    }
  });

  it("handles flat sitting service presets and error alert banner", async () => {
    vi.mocked(createCourseAction).mockResolvedValue({ error: "Invalid pricing amount" });

    const { container } = render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sitting"
        itemNoun="Sitting service"
        serviceSlug="other-sitting"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Click Sitting type preset
    const presetBtn = screen.getByRole("button", { name: "In home sitting" });
    fireEvent.click(presetBtn);

    const nameInput = screen.getByLabelText("Sitting service Name") as HTMLInputElement;
    expect(nameInput.value).toBe("In home sitting");

    // Submit form to trigger error
    const formEl = container.querySelector("form")!;
    await act(async () => {
      fireEvent.submit(formEl);
    });

    expect(screen.getByText("Invalid pricing amount")).toBeDefined();
  });

  it("handles Dog Sport discipline quick-presets (e.g. Mantrailing, Search & rescue)", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport"
        itemNoun="Dog Sport"
        serviceSlug="sport-dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    const mantrailingBtn = screen.getByRole("button", { name: "Mantrailing" });
    fireEvent.click(mantrailingBtn);
    const nameInput = screen.getByLabelText("Dog Sport Name") as HTMLInputElement;
    expect(nameInput.value).toBe("Mantrailing");

    const searchRescueBtn = screen.getByRole("button", { name: "Search & rescue" });
    fireEvent.click(searchRescueBtn);
    expect(nameInput.value).toBe("Search & rescue");
  });

  it("handles Dog Training topic presets and delivery format selection and submits formData", async () => {
    vi.mocked(createCourseAction).mockResolvedValue({ success: true });

    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-training"
        itemNoun="Training course"
        serviceSlug="dog-training"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    // Click Show handling preset
    fireEvent.click(screen.getByRole("button", { name: "Show handling" }));
    const nameInput = screen.getByLabelText("Training course Name") as HTMLInputElement;
    expect(nameInput.value).toBe("Show handling");

    // Select Private 1-on-1 Session format
    fireEvent.click(screen.getByRole("button", { name: "Private 1-on-1 Session" }));

    // Toggle Spoken Languages
    const hungarianBtn = screen.getByRole("button", { name: /Hungarian/i });
    fireEvent.click(hungarianBtn);

    // Submit
    const submitBtn = screen.getAllByRole("button", { name: "Create Training course" })[0];
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    expect(passedFormData.get("name")).toBe("Show handling");
    expect(passedFormData.get("trainingFormat")).toBe("Private 1-on-1 Session");
    expect(passedFormData.get("spokenLanguages")).toContain("Hungarian");
  });
});




