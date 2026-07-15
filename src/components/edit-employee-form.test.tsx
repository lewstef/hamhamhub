// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useActionState } from "react";
import { EditEmployeeForm } from "./edit-employee-form";

vi.mock("@/app/actions/employees", () => ({
  updateEmployeeAction: vi.fn(),
  changeEmployeePasswordAction: vi.fn(),
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

describe("EditEmployeeForm Component", () => {
  const mockEmployee = {
    id: "emp-123",
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    role: "employee" as const,
  };

  it("should render General and Password tabs, defaulting to General tab view", () => {
    render(<EditEmployeeForm employee={mockEmployee} />);

    expect(screen.getByRole("button", { name: "General" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Password" })).toBeDefined();

    // Check input values under General tab
    const nameInput = screen.getByLabelText("Full Name") as HTMLInputElement;
    const usernameInput = screen.getByLabelText("Username") as HTMLInputElement;
    const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;
    const roleSelect = screen.getByLabelText("Role") as HTMLSelectElement;

    expect(nameInput.value).toBe("John Doe");
    expect(usernameInput.value).toBe("johndoe");
    expect(emailInput.value).toBe("john@example.com");
    expect(roleSelect.value).toBe("employee");
  });

  it("should switch to Password tab when clicked", () => {
    render(<EditEmployeeForm employee={mockEmployee} />);

    const passwordTab = screen.getByRole("button", { name: "Password" });
    fireEvent.click(passwordTab);

    // Verify Password fields are rendered
    expect(screen.getByLabelText("New Password")).toBeDefined();
    expect(screen.getByLabelText("Confirm New Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Change Password" })).toBeDefined();
  });

  it("should toggle password visibility on click", () => {
    render(<EditEmployeeForm employee={mockEmployee} />);

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
    render(<EditEmployeeForm employee={mockEmployee} />);

    fireEvent.click(screen.getByRole("button", { name: "Password" }));

    const passwordInput = screen.getByLabelText("New Password") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirm New Password") as HTMLInputElement;

    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmInput, { target: { value: "Password456!" } });

    expect(screen.getByText("Passwords do not match.")).toBeDefined();
  });

  it("should show error banners when action state errors occur", () => {
    // Mock error state for general action
    vi.mocked(useActionState).mockImplementationOnce(
      (_action: unknown, _init: unknown) => [
        { error: "Username is already taken" },
        vi.fn(),
        false,
      ]
    );

    render(<EditEmployeeForm employee={mockEmployee} />);
    expect(screen.getByText("Username is already taken")).toBeDefined();
  });
});
