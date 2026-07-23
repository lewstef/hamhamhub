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
    expect(screen.getByPlaceholderText("e.g. Puppy Socialization Class")).toBeDefined();
    expect(screen.getByText("Course Information and Details")).toBeDefined();
    expect(screen.getByText("Create Course")).toBeDefined();
    expect(screen.getByText("Per Course")).toBeDefined();
  });

  it("should render Dog Sport dynamic terminology correctly", () => {
    render(
      <CourseForm
        organizationId="org-1"
        serviceId="srv-sport-dog-training"
        itemNoun="Dog Sport"
        onCancel={onCancel}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    expect(screen.getByText("Back to Dog Sports List")).toBeDefined();
    expect(screen.getByText("Create New Dog Sport")).toBeDefined();
    expect(screen.getByText("Dog Sport Name")).toBeDefined();
    expect(screen.getByPlaceholderText("e.g. Agility, IGP, Obedience")).toBeDefined();
    expect(screen.getByText("Dog Sport Information and Details")).toBeDefined();
    expect(screen.getByText("Create Dog Sport")).toBeDefined();
    expect(screen.getByText("Per Dog Sport")).toBeDefined();
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

    const priceInput = screen.getByLabelText("Price Amount");
    fireEvent.change(priceInput, { target: { value: "150" } });

    const select = screen.getByLabelText("Billing Frequency");
    fireEvent.change(select, { target: { value: "month" } });

    const submitBtn = screen.getByRole("button", { name: "Create Course" });
    
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
    expect(screen.getByText("Create Boarding service")).toBeDefined();

    // Boarding frequency options
    expect(screen.getByText("Per Night")).toBeDefined();
    expect(screen.getByText("Per Day")).toBeDefined();
    expect(screen.getByText("Per Month")).toBeDefined();
    expect(screen.getByText("Per Boarding service")).toBeDefined();

    // Training fields should not be present
    expect(screen.queryByText("Certified Dog Trainer")).toBeNull();
    expect(screen.queryByText("Dedicated Training Field")).toBeNull();
    // Parking is facility-related, should remain
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

    // Boarding details header
    expect(screen.getByText("Boarding Details")).toBeDefined();

    // Verify presence of daily walks dropdown and select walk value
    const walksSelect = screen.getByLabelText("Daily Walks") as HTMLSelectElement;
    expect(walksSelect).toBeDefined();
    expect(walksSelect.value).toBe("1");
    fireEvent.change(walksSelect, { target: { value: "3" } });
    expect(walksSelect.value).toBe("3");

    // Medication administration details input is hidden initially
    expect(screen.queryByLabelText("Medication Administration Instructions")).toBeNull();

    // Find and click the Medication Administration switch button
    const medicationSection = screen.getByText("Medication Administration").closest(".space-y-4");
    const medicationSwitch = medicationSection?.querySelector("button[role='switch']");
    expect(medicationSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(medicationSwitch!);
    });

    // Instructions input should be displayed now
    const medsInput = screen.getByLabelText("Medication Administration Instructions");
    expect(medsInput).toBeDefined();
    fireEvent.change(medsInput, { target: { value: "Give twice daily with wet food" } });

    // Communication with Owner details input is hidden initially
    expect(screen.queryByLabelText("Communication Updates Details")).toBeNull();

    // Find and click the Communication switch
    const commsSection = screen.getByText("Communication with the Owner").closest(".space-y-4");
    const commsSwitch = commsSection?.querySelector("button[role='switch']");
    expect(commsSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(commsSwitch!);
    });

    // Communication details input should display
    const commsInput = screen.getByLabelText("Communication Updates Details");
    expect(commsInput).toBeDefined();
    fireEvent.change(commsInput, { target: { value: "Photos via WhatsApp at 2pm" } });

    // Personalized Meal Plan details input is hidden initially
    expect(screen.queryByLabelText("Meal Plan Details")).toBeNull();

    // Find and click the Meal Plan switch
    const mealSection = screen.getByText("Personalized Meal Plan").closest(".space-y-4");
    const mealSwitch = mealSection?.querySelector("button[role='switch']");
    expect(mealSwitch).toBeDefined();
    await act(async () => {
      fireEvent.click(mealSwitch!);
    });

    // Meal Plan details input should display
    const mealInput = screen.getByLabelText("Meal Plan Details");
    expect(mealInput).toBeDefined();
    fireEvent.change(mealInput, { target: { value: "Raw diet raw food storage" } });

    // Check-in / Check-out time inputs and datalist
    const checkinInput = screen.getByLabelText("Check-in Time") as HTMLInputElement;
    const checkoutInput = screen.getByLabelText("Check-out Time") as HTMLInputElement;

    expect(checkinInput).toBeDefined();
    expect(checkinInput.value).toBe("08:00");
    expect(checkinInput.getAttribute("list")).toBe("time-options");
    expect(checkinInput.getAttribute("pattern")).toBe("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$");

    expect(checkoutInput).toBeDefined();
    expect(checkoutInput.value).toBe("18:00");
    expect(checkoutInput.getAttribute("list")).toBe("time-options");
    expect(checkoutInput.getAttribute("pattern")).toBe("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$");

    fireEvent.change(checkinInput, { target: { value: "09:30" } });
    expect(checkinInput.value).toBe("09:30");
  });

  it("should render Edit Course terminology and values in edit mode", () => {
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
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDefined();
    expect((screen.getByLabelText("Course Name") as HTMLInputElement).value).toBe("Agility Mastery");
    expect((screen.getByLabelText("Certifier Name") as HTMLInputElement).value).toBe("FCI");
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

    const submitBtn = screen.getByRole("button", { name: "Create Course" });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText("Course name is required.")).toBeDefined();
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

    const submitBtn = screen.getByRole("button", { name: "Create Course" });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText("Failed to create course")).toBeDefined();
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

    const submitBtn = screen.getByRole("button", { name: "Save Changes" });
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

    // Toggle Dedicated Field
    const fieldSwitch = screen.getByText("Dedicated Training Field").closest(".space-y-4")?.querySelector("button[role='switch']");
    expect(fieldSwitch).toBeDefined();
    expect(screen.queryByLabelText("Address")).toBeNull();
    await act(async () => {
      fireEvent.click(fieldSwitch!);
    });
    expect(screen.getByLabelText("Address")).toBeDefined();
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

    // Initial state: empty notice is shown
    expect(screen.getByText('No FAQs added yet. Click "Add FAQ" below to start.')).toBeDefined();

    // Click "Add FAQ Item"
    const addBtn = screen.getByRole("button", { name: "Add FAQ Item" });
    await act(async () => {
      fireEvent.click(addBtn);
    });

    // Empty notice should disappear, FAQ item inputs should be visible
    expect(screen.queryByText('No FAQs added yet. Click "Add FAQ" below to start.')).toBeNull();
    
    const questionInput = screen.getByLabelText("Question");
    const answerInput = screen.getByLabelText("Answer");

    // Edit Question and Answer
    fireEvent.change(questionInput, { target: { value: "Vaccine requirement?" } });
    fireEvent.change(answerInput, { target: { value: "Yes, up-to-date DHPP required." } });

    // Submit form and verify action call includes JSON faq string
    const nameInput = screen.getByLabelText("Course Name");
    fireEvent.change(nameInput, { target: { value: "Advanced Agility" } });

    const submitBtn = screen.getByRole("button", { name: "Create Course" });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createCourseAction).toHaveBeenCalled();
    const passedFormData = vi.mocked(createCourseAction).mock.calls[0][1];
    expect(passedFormData.get("faq")).toBe(
      JSON.stringify([{ question: "Vaccine requirement?", answer: "Yes, up-to-date DHPP required." }])
    );

    // Click "Remove FAQ" button and verify empty notice is back
    const removeBtn = screen.getByRole("button", { name: "Remove FAQ" });
    await act(async () => {
      fireEvent.click(removeBtn);
    });

    expect(screen.getByText('No FAQs added yet. Click "Add FAQ" below to start.')).toBeDefined();
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
    expect(screen.getByText("Puppyhood (8 Weeks to 5 Months)")).toBeDefined();
    expect(screen.getByText("Adolescence / Teenage Phase (5 Months to 12–18 Months)")).toBeDefined();
    expect(screen.getByText("Adulthood & Senior Years (1 Year +)")).toBeDefined();

    // Check puppyhood and teenage phases
    const puppyCheckbox = screen.getByText("Puppyhood (8 Weeks to 5 Months)").closest("label")?.querySelector("input[type='checkbox']") as HTMLInputElement;
    const teenCheckbox = screen.getByText("Adolescence / Teenage Phase (5 Months to 12–18 Months)").closest("label")?.querySelector("input[type='checkbox']") as HTMLInputElement;
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
    expect(screen.getByText("Per Grooming service")).toBeDefined();
    expect(screen.getByText("Per Session")).toBeDefined();
    expect(screen.getByText("Per Hour")).toBeDefined();
  });
});

