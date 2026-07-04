// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PasswordStrength } from "./password-strength";

describe("PasswordStrength Component", () => {
  it("should render nothing when password is empty", () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container.firstChild).toBeNull();
  });

  it("should evaluate strength correctly based on complexity rules", () => {
    // 1 check met (length >= 6): Very Weak
    const { rerender } = render(<PasswordStrength password="weakpw" />);
    expect(screen.getByText("Very Weak")).toBeDefined();

    // 2 checks met (length >= 6 + number): Weak
    rerender(<PasswordStrength password="weakpw1" />);
    expect(screen.getByText("Weak")).toBeDefined();

    // 3 checks met (length >= 6 + number + uppercase): Medium
    rerender(<PasswordStrength password="Weakpw1" />);
    expect(screen.getByText("Medium")).toBeDefined();

    // 4 checks met (length >= 6 + number + uppercase + special): Strong
    rerender(<PasswordStrength password="Weakpw1!" />);
    expect(screen.getByText("Strong")).toBeDefined();
  });

  it("should show correct requirements checks", () => {
    render(<PasswordStrength password="abc" />);
    
    // "At least 6 characters" should be incomplete, others too because password is "abc"
    // Since password is less than 6 chars, score is 0, labels are not met
    expect(screen.getByText("At least 6 characters")).toBeDefined();
    expect(screen.getByText("At least one uppercase letter")).toBeDefined();
    expect(screen.getByText("At least one number (0-9)")).toBeDefined();
    expect(screen.getByText("At least one special character")).toBeDefined();
  });
});
