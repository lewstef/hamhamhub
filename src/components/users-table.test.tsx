// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useActionState } from "react";
import { UsersTable } from "./users-table";

vi.mock("@/app/actions/users", () => ({
  createUserAction: vi.fn(),
  deleteUserAction: vi.fn(),
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

describe("UsersTable Component", () => {
  const mockUsers = [
    {
      id: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      createdAt: new Date("2026-01-10"),
    },
    {
      id: "u2",
      name: "Bob Jones",
      email: "bob@example.com",
      createdAt: new Date("2026-02-15"),
    },
  ];

  it("should render list of users and search box", () => {
    render(<UsersTable userList={mockUsers} />);

    expect(screen.getByPlaceholderText("Search users...")).toBeDefined();
    expect(screen.getByText("Alice Smith")).toBeDefined();
    expect(screen.getByText("Bob Jones")).toBeDefined();
    expect(screen.getByRole("button", { name: "Create User" })).toBeDefined();
  });

  it("should open the creation modal when Create User button is clicked", () => {
    render(<UsersTable userList={mockUsers} />);

    const createBtn = screen.getByRole("button", { name: "Create User" });
    fireEvent.click(createBtn);

    expect(screen.getByText("Register New User")).toBeDefined();
  });

  it("should filter the user list based on the search query", () => {
    render(<UsersTable userList={mockUsers} />);

    const searchInput = screen.getByPlaceholderText("Search users...") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "alice" } });

    expect(screen.getByText("Alice Smith")).toBeDefined();
    expect(screen.queryByText("Bob Jones")).toBeNull();
  });

  it("should handle create user modal inputs, eye visibility toggles, mismatch warning, and Cancel", () => {
    render(<UsersTable userList={mockUsers} />);

    // Open creation modal
    fireEvent.click(screen.getByRole("button", { name: "Create User" }));
    expect(screen.getByText("Register New User")).toBeDefined();

    // Fill in fields
    const nameInput = screen.getByLabelText("Full Name") as HTMLInputElement;
    const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirm Password") as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "David User" } });
    fireEvent.change(emailInput, { target: { value: "david@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.change(confirmInput, { target: { value: "different" } });

    // Mismatch warning
    expect(screen.getByText("Passwords do not match.")).toBeDefined();

    // Eye toggles
    const visibilityBtns = screen.getAllByRole("button").filter(btn => btn.querySelector("svg"));
    const eyeBtns = visibilityBtns.filter(btn => {
      const svg = btn.querySelector("svg");
      return svg && (svg.classList.contains("lucide-eye") || svg.classList.contains("lucide-eye-off"));
    });
    expect(eyeBtns.length).toBe(2);

    // Toggle show password
    fireEvent.click(eyeBtns[0]);
    // Toggle show confirm password
    fireEvent.click(eyeBtns[1]);

    // Cancel modal
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Register New User")).toBeNull();
  });

  it("should handle create user modal X button close", () => {
    render(<UsersTable userList={mockUsers} />);

    // Open creation modal
    fireEvent.click(screen.getByRole("button", { name: "Create User" }));
    expect(screen.getByText("Register New User")).toBeDefined();

    // Click the X button at the top-right of the Card to close
    const closeBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-x"));
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);

    expect(screen.queryByText("Register New User")).toBeNull();
  });

  it("should open and cancel the Delete confirmation modal via Cancel button", () => {
    render(<UsersTable userList={mockUsers} />);

    // Find delete buttons
    const trashButtons = screen.getAllByRole("button").filter(btn => btn.querySelector("svg.lucide-trash2"));
    expect(trashButtons.length).toBeGreaterThan(0);

    // Open delete confirmation modal
    fireEvent.click(trashButtons[0]);
    expect(screen.getByText("Delete User")).toBeDefined();

    // Click Cancel in delete modal
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Delete User")).toBeNull();
  });

  it("should open and cancel the Delete confirmation modal via X button", () => {
    render(<UsersTable userList={mockUsers} />);

    // Find delete buttons
    const trashButtons = screen.getAllByRole("button").filter(btn => btn.querySelector("svg.lucide-trash2"));
    expect(trashButtons.length).toBeGreaterThan(0);

    // Open delete confirmation modal
    fireEvent.click(trashButtons[0]);
    expect(screen.getByText("Delete User")).toBeDefined();

    // Click X button
    const closeBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-x"));
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);

    expect(screen.queryByText("Delete User")).toBeNull();
  });

  it("should support paging navigation when user list is large", () => {
    // Generate 12 user items to trigger pagination (> 10 items)
    const largeUsers = Array.from({ length: 12 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      createdAt: new Date("2026-01-01"),
    }));

    const { container } = render(<UsersTable userList={largeUsers} />);

    // Renders pagination metrics
    expect(container.textContent).toContain("Showing 1–10 of 12 users");

    // Click next page button (ChevronRight is inside button)
    const nextBtns = screen.getAllByRole("button").filter(btn => btn.querySelector("svg.lucide-chevron-right"));
    expect(nextBtns.length).toBeGreaterThan(0);
    fireEvent.click(nextBtns[0]);
    expect(container.textContent).toContain("Showing 11–12 of 12 users");

    // Click previous page button (ChevronLeft is inside button)
    const prevBtns = screen.getAllByRole("button").filter(btn => btn.querySelector("svg.lucide-chevron-left"));
    expect(prevBtns.length).toBeGreaterThan(0);
    fireEvent.click(prevBtns[0]);
    expect(container.textContent).toContain("Showing 1–10 of 12 users");

    // Click numeric page 2 button
    const pageTwoBtn = screen.getByRole("button", { name: "2" });
    fireEvent.click(pageTwoBtn);
    expect(container.textContent).toContain("Showing 11–12 of 12 users");
  });

  it("should trigger success actions for creation and deletion when state.success is true", async () => {
    vi.mocked(useActionState)
      .mockImplementationOnce(() => [{ success: true }, vi.fn(), false]) // create success
      .mockImplementationOnce(() => [{ success: true }, vi.fn(), false]); // delete success

    render(<UsersTable userList={mockUsers} />);

    // Wait for the useEffect success timer trigger
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(screen.queryByText("Register New User")).toBeNull();
  });
});
