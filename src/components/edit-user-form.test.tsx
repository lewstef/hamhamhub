// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useActionState } from "react";
import { EditUserForm } from "./edit-user-form";

vi.mock("@/app/actions/users", () => ({
  updateUserAction: vi.fn(),
  changeUserPasswordAction: vi.fn(),
}));

// Shim useActionState
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn((_action: unknown, initialState: unknown) => [
      initialState,
      vi.fn(),
      false,
    ]),
  };
});

describe("EditUserForm Component", () => {
  const mockUser = {
    id: "user-123",
    name: "Jane Smith",
    email: "jane@example.com",
  };

  it("should render General and Password tabs, defaulting to General tab view", () => {
    render(<EditUserForm user={mockUser} />);

    expect(screen.getByRole("button", { name: "General" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Password" })).toBeDefined();

    // Check input values under General tab
    const nameInput = screen.getByLabelText("Full Name") as HTMLInputElement;
    const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;

    expect(nameInput.value).toBe("Jane Smith");
    expect(emailInput.value).toBe("jane@example.com");
  });

  it("should switch to Password tab when clicked", () => {
    render(<EditUserForm user={mockUser} />);

    const passwordTab = screen.getByRole("button", { name: "Password" });
    fireEvent.click(passwordTab);

    // Verify Password fields are rendered
    expect(screen.getByLabelText("New Password")).toBeDefined();
    expect(screen.getByLabelText("Confirm New Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Change Password" })).toBeDefined();
  });

  it("should toggle password visibility on click", () => {
    render(<EditUserForm user={mockUser} />);

    // Switch to password tab
    fireEvent.click(screen.getByRole("button", { name: "Password" }));

    const passwordInput = screen.getByLabelText("New Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    // Click the toggle button inside the password row wrapper
    const toggleButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.getAttribute("type") === "button" && btn !== screen.getByRole("button", { name: "General" }) && btn !== screen.getByRole("button", { name: "Password" }));

    expect(toggleButtons.length).toBeGreaterThan(0);
    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe("password");

    // Click confirm password toggle
    const confirmInput = screen.getByLabelText("Confirm New Password") as HTMLInputElement;
    expect(confirmInput.type).toBe("password");
    fireEvent.click(toggleButtons[1]);
    expect(confirmInput.type).toBe("text");
    fireEvent.click(toggleButtons[1]);
    expect(confirmInput.type).toBe("password");

    // Click General tab button to test setActiveTab("general") click handler
    fireEvent.click(screen.getByRole("button", { name: "General" }));
    expect(screen.getByLabelText("Full Name")).toBeDefined();
  });

  it("should show mismatch warning when passwords do not match", () => {
    render(<EditUserForm user={mockUser} />);

    fireEvent.click(screen.getByRole("button", { name: "Password" }));

    const passwordInput = screen.getByLabelText("New Password") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirm New Password") as HTMLInputElement;

    fireEvent.change(passwordInput, { target: { value: "UserPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "UserPass456!" } });

    expect(screen.getByText("Passwords do not match.")).toBeDefined();
  });

  it("should show error banners when action state errors occur", () => {
    // Mock error state for general action
    vi.mocked(useActionState).mockImplementationOnce(
      (_action: unknown, _init: unknown) => [
        { error: "Email already taken" },
        vi.fn(),
        false,
      ]
    );

    render(<EditUserForm user={mockUser} />);
    expect(screen.getByText("Email already taken")).toBeDefined();
  });
});
