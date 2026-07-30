// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToggleSwitch } from "./toggle-switch";

describe("ToggleSwitch Component", () => {
  it("should render switch in unchecked state", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} aria-label="Enable Feature" />);

    const switchBtn = screen.getByRole("switch", { name: "Enable Feature" });
    expect(switchBtn).toBeDefined();
    expect(switchBtn.getAttribute("aria-checked")).toBe("false");
    expect(switchBtn.className).toContain("bg-muted-foreground/30");
  });

  it("should render switch in checked state", () => {
    render(<ToggleSwitch checked={true} onChange={() => {}} aria-label="Enable Feature" />);

    const switchBtn = screen.getByRole("switch", { name: "Enable Feature" });
    expect(switchBtn.getAttribute("aria-checked")).toBe("true");
    expect(switchBtn.className).toContain("bg-primary");
  });

  it("should invoke onChange with toggled boolean value when clicked", () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} aria-label="Enable Feature" />);

    const switchBtn = screen.getByRole("switch");
    fireEvent.click(switchBtn);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("should be disabled and not invoke onChange when disabled is true", () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} disabled={true} aria-label="Enable Feature" />);

    const switchBtn = screen.getByRole("switch");
    expect(switchBtn.hasAttribute("disabled")).toBe(true);

    fireEvent.click(switchBtn);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
