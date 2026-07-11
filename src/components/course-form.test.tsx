// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { CourseForm } from "./course-form";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";

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
});
