// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { ServiceTypePreviewForm } from "./service-type-preview-form";
import { ServiceType } from "@/config/service-types";

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left" />,
  Eye: () => <div data-testid="eye" />,
  CheckCircle2: () => <div data-testid="check-circle" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  Check: () => <div data-testid="check" />,
}));

describe("ServiceTypePreviewForm Component", () => {
  const dummyServiceType: ServiceType = {
    id: "grooming-123",
    name: "Dog grooming",
    description: "Professional bathing, clipping, and nail trimming.",
    applicableTo: ["dog_service_provider"],
    fields: [
      {
        name: "grooming_name",
        label: "Grooming Service Name",
        type: "text",
        placeholder: "e.g. Full Bath & Clip",
        required: true,
      },
      {
        name: "grooming_notes",
        label: "Special Instructions",
        type: "textarea",
        placeholder: "Any special handling notes...",
        required: false,
      },
      {
        name: "grooming_type",
        label: "Grooming Category",
        type: "select",
        options: ["Bathing", "Styling", "Nail Trim"],
        required: false,
      },
      {
        name: "sanitary_trim",
        label: "Sanitary Trim Included",
        type: "checkbox",
        placeholder: "Check if sanitary trim included",
        required: false,
      },
    ],
  };

  it("renders service type title, description, and input fields", () => {
    render(<ServiceTypePreviewForm serviceType={dummyServiceType} />);

    expect(screen.getByText("Configure Dog grooming Offer")).toBeDefined();
    expect(screen.getByText("Grooming Service Name")).toBeDefined();
    expect(screen.getByText("Special Instructions")).toBeDefined();
    expect(screen.getByText("Grooming Category")).toBeDefined();
    expect(screen.getByText("Sanitary Trim Included")).toBeDefined();
  });

  it("handles input changes and submits preview form successfully", async () => {
    render(<ServiceTypePreviewForm serviceType={dummyServiceType} />);

    const textInput = screen.getByPlaceholderText("e.g. Full Bath & Clip");
    fireEvent.change(textInput, { target: { value: "Full Spa Grooming" } });

    const textarea = screen.getByPlaceholderText("Any special handling notes...");
    fireEvent.change(textarea, { target: { value: "Handle gently with sensitive ears" } });

    const checkbox = screen.getByLabelText("Sanitary Trim Included") as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    const submitBtn = screen.getByRole("button", { name: "Validate & Submit Preview" });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText(/Preview submission successful/i)).toBeDefined();
  });
});
