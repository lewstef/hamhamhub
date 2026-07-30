// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { CourseForm } from "./course-form";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left" />,
  Loader2: () => <div data-testid="loader" />,
  AlertCircle: () => <div data-testid="alert-circle" />,
  Plus: () => <div data-testid="plus" />,
  Trash2: () => <div data-testid="trash2" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  FileText: () => <div data-testid="file-text" />,
  HelpCircle: () => <div data-testid="help-circle" />,
  DollarSign: () => <div data-testid="dollar-sign" />,
  Sliders: () => <div data-testid="sliders" />,
  MapPin: () => <div data-testid="map-pin" />,
  Calendar: () => <div data-testid="calendar" />,
  FileCheck: () => <div data-testid="file-check" />,
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
    expect(screen.getByRole("button", { name: "Location" })).toBeDefined();
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

    // Switch to Location tab (contains Address, GBP, Maps, Dedicated Training Field, and Dedicated Parking)
    fireEvent.click(screen.getByRole("button", { name: "Location" }));
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

    const priceInput = screen.getByLabelText("Price Amount");
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
    // Parking is facility-related, should remain in Location tab
    fireEvent.click(screen.getByRole("button", { name: "Location" }));
    expect(screen.getByText("Parking")).toBeDefined();
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
    expect((screen.getByLabelText("Price Amount") as HTMLInputElement).value).toBe("200");
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

    // Toggle Dedicated Field (in Location tab)
    const locationTab = screen.getByText("Location");
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

    // Click "Remove FAQ" button and verify empty notice is back
    const removeBtn = screen.getByRole("button", { name: "Remove FAQ" });
    await act(async () => {
      fireEvent.click(removeBtn);
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
    const ageLimitsSwitch = screen.getByText("Age Limits").closest(".space-y-4")?.querySelector("button[role='switch']");
    expect(ageLimitsSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(ageLimitsSwitch!);
    });

    // Option phase checkboxes should be visible
    expect(screen.getByText("Select Age Phases")).toBeDefined();
    expect(screen.getByText("Puppy (Up to 9 months)")).toBeDefined();
    expect(screen.getByText("Junior (9 to 18 months)")).toBeDefined();
    expect(screen.getByText("Adult (18 months to 8 years)")).toBeDefined();
    expect(screen.getByText("Senior (8+ years)")).toBeDefined();

    // Check puppy and junior phases
    const puppyCheckbox = screen.getByText("Puppy (Up to 9 months)").closest("label")?.querySelector("input[type='checkbox']") as HTMLInputElement;
    const teenCheckbox = screen.getByText("Junior (9 to 18 months)").closest("label")?.querySelector("input[type='checkbox']") as HTMLInputElement;
    expect(puppyCheckbox).toBeDefined();
    expect(teenCheckbox).toBeDefined();

    expect(puppyCheckbox.checked).toBe(false);
    await act(async () => {
      fireEvent.click(puppyCheckbox);
    });
    expect(puppyCheckbox.checked).toBe(true);

    await act(async () => {
      fireEvent.click(teenCheckbox);
    });
    expect(teenCheckbox.checked).toBe(true);
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

    // Verify Grooming billing frequency options
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

    // 2. Location Tab: Fill Address and Maps links
    fireEvent.click(screen.getByRole("button", { name: "Location" }));
    const addressInput = screen.getByLabelText("Address");
    fireEvent.change(addressInput, { target: { value: "Str. Canine 15, Cluj" } });

    const gbpInput = screen.getByLabelText("Google Business Profile");
    fireEvent.change(gbpInput, { target: { value: "https://business.google.com/site/mondioring" } });

    const mapsInput = screen.getByLabelText("Google Maps Link");
    fireEvent.change(mapsInput, { target: { value: "https://maps.google.com/place/mondioring" } });

    // 3. Pricing Tab: Fill Price Amount and Billing Frequency
    fireEvent.click(screen.getByRole("button", { name: "Pricing" }));
    const priceInput = screen.getByLabelText("Price Amount");
    fireEvent.change(priceInput, { target: { value: "400 RON" } });

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
    expect(passedFormData.get("price")).toBe("400 RON");
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

    // Fill Location tab
    fireEvent.click(screen.getByRole("button", { name: "Location" }));
    const addressInput = screen.getByLabelText("Address") as HTMLInputElement;
    fireEvent.change(addressInput, { target: { value: "Timisoara Field 4" } });

    // Switch to Schedule tab
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    expect(screen.getAllByText("Schedule")[1]).toBeDefined();

    // Navigate back to General tab — Name should be preserved
    fireEvent.click(screen.getByRole("button", { name: "General" }));
    expect((screen.getByLabelText("Dog Sport Name") as HTMLInputElement).value).toBe("IGP Tracking");

    // Navigate back to Location tab — Address should be preserved
    fireEvent.click(screen.getByRole("button", { name: "Location" }));
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
    const price1 = screen.getByLabelText("Price Amount");
    fireEvent.change(price1, { target: { value: "200 RON" } });

    // Click Add Price Tier
    const addTierBtn = screen.getByRole("button", { name: "Add Price Tier" });
    fireEvent.click(addTierBtn);

    expect(screen.getByText("Price Option #2")).toBeDefined();

    // Fill tier 2
    const price2 = screen.getByLabelText("Price Amount", { selector: "#course-price-1" });
    fireEvent.change(price2, { target: { value: "800 RON" } });

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
    expect(priceJsonStr).toContain("200 RON");
    expect(priceJsonStr).toContain("800 RON");
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
});



