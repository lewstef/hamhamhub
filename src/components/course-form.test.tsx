// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { CourseForm } from "./course-form";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left" />,
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
});
