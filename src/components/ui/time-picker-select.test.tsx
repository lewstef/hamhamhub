// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TimePickerSelect, getCheckinOptions, getCheckoutOptions } from "./time-picker-select";

describe("getCheckinOptions & getCheckoutOptions helper functions", () => {
  it("should return 48 30-minute interval options for check-in options", () => {
    const checkinOpts = getCheckinOptions();
    expect(checkinOpts.length).toBe(48);
    expect(checkinOpts[0]).toBe("00:00");
    expect(checkinOpts[47]).toBe("23:30");
  });

  it("should return checkout options starting strictly after the given checkin time", () => {
    const checkoutOpts = getCheckoutOptions("09:00");
    expect(checkoutOpts[0]).toBe("09:30");
    expect(checkoutOpts.includes("09:00")).toBe(false);
    expect(checkoutOpts.includes("08:30")).toBe(false);
  });

  it("should fall back to full options if checkin time is invalid or the last option", () => {
    const invalidOpts = getCheckoutOptions("invalid");
    expect(invalidOpts.length).toBe(48);

    const lastTimeOpts = getCheckoutOptions("23:30");
    expect(lastTimeOpts.length).toBe(48);
  });
});

describe("TimePickerSelect Component", () => {
  const options = ["08:00", "08:30", "09:00", "09:30"];

  it("should render input with value and placeholder", () => {
    render(
      <TimePickerSelect
        id="checkin-time"
        value="08:00"
        onChange={() => {}}
        options={options}
        placeholder="Select time"
      />
    );

    const input = screen.getByPlaceholderText("Select time") as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe("08:00");
  });

  it("should open options dropdown on input focus and toggle button click", () => {
    render(
      <TimePickerSelect
        id="checkin-time"
        value="08:00"
        onChange={() => {}}
        options={options}
      />
    );

    expect(screen.queryByRole("button", { name: "08:30" })).toBeNull();

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);

    expect(screen.getByRole("button", { name: "08:30" })).toBeDefined();
  });

  it("should call onChange and close dropdown when an option is clicked", () => {
    const handleChange = vi.fn();
    render(
      <TimePickerSelect
        id="checkin-time"
        value="08:00"
        onChange={handleChange}
        options={options}
      />
    );

    const toggleBtn = screen.getByLabelText("Toggle time options dropdown");
    fireEvent.click(toggleBtn);

    const option900 = screen.getByRole("button", { name: "09:00" });
    fireEvent.click(option900);

    expect(handleChange).toHaveBeenCalledWith("09:00");
    expect(screen.queryByRole("button", { name: "09:00" })).toBeNull();
  });

  it("should close dropdown when clicking outside", () => {
    render(
      <div>
        <span data-testid="outside">Outside</span>
        <TimePickerSelect
          id="checkin-time"
          value="08:00"
          onChange={() => {}}
          options={options}
        />
      </div>
    );

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    expect(screen.getByRole("button", { name: "08:30" })).toBeDefined();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("button", { name: "08:30" })).toBeNull();
  });

  it("should apply destructive styling when hasError is true", () => {
    render(
      <TimePickerSelect
        id="checkin-time"
        value="08:00"
        onChange={() => {}}
        options={options}
        hasError={true}
      />
    );

    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-destructive");
  });
});
