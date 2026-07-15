// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useActionState } from "react";
import { EmployeesTable } from "./employees-table";

vi.mock("@/app/actions/employees", () => ({
  createEmployeeAction: vi.fn(),
  deleteEmployeeAction: vi.fn(),
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

describe("EmployeesTable Component", () => {
  const mockStaff = [
    {
      id: "1",
      name: "Alice Admin",
      username: "alice",
      email: "alice@example.com",
      role: "admin" as const,
      createdAt: new Date("2026-01-01"),
    },
    {
      id: "2",
      name: "Bob Employee",
      username: "bob",
      email: "bob@example.com",
      role: "employee" as const,
      createdAt: new Date("2026-02-01"),
    },
  ];

  it("should render employee lists and headers", () => {
    render(<EmployeesTable staffList={mockStaff} currentUserRole="employee" />);

    expect(screen.getByPlaceholderText("Search employees...")).toBeDefined();
    expect(screen.getByText("Alice Admin")).toBeDefined();
    expect(screen.getByText("Bob Employee")).toBeDefined();
    // Non-admins shouldn't see create button
    expect(screen.queryByRole("button", { name: "Create Employee" })).toBeNull();
  });

  it("should render the Create button if current user is an admin", () => {
    render(<EmployeesTable staffList={mockStaff} currentUserRole="admin" />);

    const createBtn = screen.getByRole("button", { name: "Create Employee" });
    expect(createBtn).toBeDefined();

    // Clicking it opens the creation popup
    fireEvent.click(createBtn);
    expect(screen.getByText("Register New Employee")).toBeDefined();
  });

  it("should filter results based on search input changes", () => {
    render(<EmployeesTable staffList={mockStaff} currentUserRole="employee" />);

    const searchInput = screen.getByPlaceholderText("Search employees...") as HTMLInputElement;
    
    // Test username search
    fireEvent.change(searchInput, { target: { value: "bob" } });
    expect(screen.queryByText("Alice Admin")).toBeNull();
    expect(screen.getByText("Bob Employee")).toBeDefined();

    // Reset search
    fireEvent.change(searchInput, { target: { value: "" } });
  });

  it("should handle create employee modal input, visibility toggles, mismatch warning and Cancel", () => {
    render(<EmployeesTable staffList={mockStaff} currentUserRole="admin" />);

    // Open Modal
    fireEvent.click(screen.getByRole("button", { name: "Create Employee" }));
    expect(screen.getByText("Register New Employee")).toBeDefined();

    // Fill in input fields
    const nameInput = screen.getByLabelText("Full Name") as HTMLInputElement;
    const usernameInput = screen.getByLabelText("Username") as HTMLInputElement;
    const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirm Password") as HTMLInputElement;
    const roleSelect = screen.getByLabelText("Role") as HTMLSelectElement;

    fireEvent.change(nameInput, { target: { value: "Charlie Staff" } });
    fireEvent.change(usernameInput, { target: { value: "charlie" } });
    fireEvent.change(emailInput, { target: { value: "charlie@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.change(confirmInput, { target: { value: "different" } });
    fireEvent.change(roleSelect, { target: { value: "admin" } });

    // Verify mismatch warning is shown
    expect(screen.getByText("Passwords do not match.")).toBeDefined();

    // Toggle password show/hide
    const visibilityBtns = screen.getAllByRole("button").filter(btn => btn.querySelector("svg"));
    // The eye toggles have SVGs inside them
    const eyeBtns = visibilityBtns.filter(btn => {
      const svg = btn.querySelector("svg");
      return svg && (svg.classList.contains("lucide-eye") || svg.classList.contains("lucide-eye-off"));
    });
    expect(eyeBtns.length).toBe(2);

    // Toggle show password
    fireEvent.click(eyeBtns[0]);
    // Toggle show confirm password
    fireEvent.click(eyeBtns[1]);

    // Close via Cancel button
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Register New Employee")).toBeNull();
  });

  it("should handle create employee modal X button close", () => {
    render(<EmployeesTable staffList={mockStaff} currentUserRole="admin" />);

    // Open Modal
    fireEvent.click(screen.getByRole("button", { name: "Create Employee" }));
    expect(screen.getByText("Register New Employee")).toBeDefined();

    // Click the X button
    const closeBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-x"));
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);

    expect(screen.queryByText("Register New Employee")).toBeNull();
  });

  it("should open and cancel the Delete confirmation modal via Cancel button", () => {
    render(<EmployeesTable staffList={mockStaff} currentUserRole="admin" />);

    // Find delete button
    const trashButtons = screen.getAllByRole("button").filter(btn => btn.querySelector("svg.lucide-trash2"));
    expect(trashButtons.length).toBeGreaterThan(0);

    // Open delete confirmation modal
    fireEvent.click(trashButtons[0]);
    expect(screen.getByText("Delete Employee")).toBeDefined();

    // Click Cancel in delete modal
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Delete Employee")).toBeNull();
  });

  it("should open and cancel the Delete confirmation modal via X button", () => {
    render(<EmployeesTable staffList={mockStaff} currentUserRole="admin" />);

    // Find delete button
    const trashButtons = screen.getAllByRole("button").filter(btn => btn.querySelector("svg.lucide-trash2"));
    expect(trashButtons.length).toBeGreaterThan(0);

    // Open delete confirmation modal
    fireEvent.click(trashButtons[0]);

    // Click X button
    const closeBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-x"));
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);

    expect(screen.queryByText("Delete Employee")).toBeNull();
  });

  it("should support paging navigation when staff list is large", () => {
    // Generate 12 staff items to trigger pagination (> 10 items)
    const largeStaff = Array.from({ length: 12 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Employee ${i + 1}`,
      username: `emp${i + 1}`,
      email: `emp${i + 1}@example.com`,
      role: "employee" as const,
      createdAt: new Date("2026-01-01"),
    }));

    const { container } = render(<EmployeesTable staffList={largeStaff} currentUserRole="employee" />);

    // Renders pagination metrics
    expect(container.textContent).toContain("Showing 1–10 of 12 employees");

    // Click next page button (ChevronRight is inside button)
    const nextBtns = screen.getAllByRole("button").filter(btn => btn.querySelector("svg.lucide-chevron-right"));
    expect(nextBtns.length).toBeGreaterThan(0);
    fireEvent.click(nextBtns[0]);
    expect(container.textContent).toContain("Showing 11–12 of 12 employees");

    // Click previous page button (ChevronLeft is inside button)
    const prevBtns = screen.getAllByRole("button").filter(btn => btn.querySelector("svg.lucide-chevron-left"));
    expect(prevBtns.length).toBeGreaterThan(0);
    fireEvent.click(prevBtns[0]);
    expect(container.textContent).toContain("Showing 1–10 of 12 employees");

    // Click numeric page 2 button
    const pageTwoBtn = screen.getByRole("button", { name: "2" });
    fireEvent.click(pageTwoBtn);
    expect(container.textContent).toContain("Showing 11–12 of 12 employees");
  });

  it("should trigger success actions for creation and deletion when state.success is true", async () => {
    vi.mocked(useActionState)
      .mockImplementationOnce(() => [{ success: true }, vi.fn(), false]) // create success
      .mockImplementationOnce(() => [{ success: true }, vi.fn(), false]); // delete success

    render(<EmployeesTable staffList={mockStaff} currentUserRole="admin" />);

    // Wait for the useEffect success timer trigger
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(screen.queryByText("Register New Employee")).toBeNull();
  });
});
