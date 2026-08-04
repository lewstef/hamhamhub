// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DatePickerInput } from "./date-picker-input";

describe("DatePickerInput Component", () => {
  it("should render manually editable text input with current Romanian date value", () => {
    const onChange = vi.fn();
    render(<DatePickerInput id="test-date" value="15.08.2026" onChange={onChange} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("15.08.2026");

    // Test manual typing in Romanian format
    fireEvent.change(input, { target: { value: "01.09.2026" } });
    expect(onChange).toHaveBeenCalledWith("01.09.2026");
  });

  it("should open calendar popover on button click and allow selecting a day in DD.MM.YYYY format", () => {
    const onChange = vi.fn();
    render(<DatePickerInput id="test-date" value="15.08.2026" onChange={onChange} />);

    // Popover hidden initially
    expect(screen.queryByTestId("calendar-popover")).toBeNull();

    // Click calendar button
    const calBtn = screen.getByLabelText("Open Calendar");
    fireEvent.click(calBtn);

    // Popover visible
    expect(screen.getByTestId("calendar-popover")).toBeDefined();
    expect(screen.getByText("August 2026")).toBeDefined();

    // Click day 20
    const day20Btn = screen.getByRole("button", { name: "20" });
    fireEvent.click(day20Btn);

    expect(onChange).toHaveBeenCalledWith("20.08.2026");
    // Popover closed after selection
    expect(screen.queryByTestId("calendar-popover")).toBeNull();
  });

  it("should navigate months using prev and next buttons in Romanian", () => {
    const onChange = vi.fn();
    render(<DatePickerInput id="test-date" value="15.08.2026" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Open Calendar"));
    expect(screen.getByText("August 2026")).toBeDefined();

    // Click Luna următoare (Next Month)
    fireEvent.click(screen.getByTitle("Luna următoare"));
    expect(screen.getByText("Septembrie 2026")).toBeDefined();

    // Click Luna anterioară (Previous Month) twice
    fireEvent.click(screen.getByTitle("Luna anterioară"));
    fireEvent.click(screen.getByTitle("Luna anterioară"));
    expect(screen.getByText("Iulie 2026")).toBeDefined();
  });

  it("should wrap year backwards from Ianuarie to Decembrie and forwards from Decembrie to Ianuarie", () => {
    const onChange = vi.fn();
    render(<DatePickerInput id="test-date" value="15.01.2026" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Open Calendar"));
    expect(screen.getByText("Ianuarie 2026")).toBeDefined();

    // Click Prev Month on January -> should wrap to Decembrie 2025
    fireEvent.click(screen.getByTitle("Luna anterioară"));
    expect(screen.getByText("Decembrie 2025")).toBeDefined();

    // Click Next Month on December -> should wrap to Ianuarie 2026
    fireEvent.click(screen.getByTitle("Luna următoare"));
    expect(screen.getByText("Ianuarie 2026")).toBeDefined();
  });
});
