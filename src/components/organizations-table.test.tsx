// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useActionState } from "react";
import { OrganizationsTable } from "./organizations-table";

vi.mock("@/app/actions/organizations", () => ({
  createOrganizationAction: vi.fn(),
  deleteOrganizationAction: vi.fn(),
  createOrganizationCategoryAction: vi.fn(),
  deleteOrganizationCategoryAction: vi.fn(),
  updateOrganizationCategoryAction: vi.fn(),
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

describe("OrganizationsTable Component", () => {
  const mockOrgs = [
    {
      id: "org1",
      name: "Sirius Rescue",
      email: "sirius@example.com",
      organizationCategory: "ngo",
      createdAt: new Date("2026-01-05"),
    },
    {
      id: "org2",
      name: "Blue Kennel",
      email: "kennel@example.com",
      organizationCategory: "dog_kennel",
      createdAt: new Date("2026-01-06"),
    },
    {
      id: "org3",
      name: "Dog Provider",
      email: "provider@example.com",
      organizationCategory: "dog_service_provider",
      createdAt: new Date("2026-01-07"),
    },
    {
      id: "org4",
      name: "Cyno Assoc",
      email: "cyno@example.com",
      organizationCategory: "cynological_association",
      createdAt: new Date("2026-01-08"),
    },
    {
      id: "org5",
      name: "Other Org",
      email: "other@example.com",
      organizationCategory: "unknown_category",
      createdAt: new Date("2026-01-09"),
    },
  ];

  const mockCategories = [
    {
      id: "ngo",
      name: "NGO",
      description: "Non-Governmental Organization",
    },
  ];

  it("should render organizations list, categories tab and details", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    expect(screen.getByText("Sirius Rescue")).toBeDefined();
    expect(screen.getByText("Blue Kennel")).toBeDefined();
    expect(screen.getByText("Dog Provider")).toBeDefined();
    expect(screen.getByPlaceholderText("Search by name or email...")).toBeDefined();
  });

  it("should toggle between Organizations List and Categories tabs", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    const categoriesTab = screen.getByRole("button", { name: /Categories/i });
    fireEvent.click(categoriesTab);

    // After switching, the categories table should be present
    expect(screen.getByPlaceholderText("Search categories...")).toBeDefined();
    expect(screen.getByText("ngo")).toBeDefined();

    // Toggle back to list
    const listTab = screen.getByRole("button", { name: /Organizations/i });
    fireEvent.click(listTab);
    expect(screen.getByPlaceholderText("Search by name or email...")).toBeDefined();
  });

  it("should filter results based on search input changes", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search by name or email...") as HTMLInputElement;
    
    // Search organization name
    fireEvent.change(searchInput, { target: { value: "Sirius" } });
    expect(screen.getByText("Sirius Rescue")).toBeDefined();

    // Search query with no match
    fireEvent.change(searchInput, { target: { value: "Unknown" } });
    expect(screen.queryByText("Sirius Rescue")).toBeNull();
  });

  it("should handle create organization modal input, visibility toggles, mismatch warning, and Cancel", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Open Modal
    fireEvent.click(screen.getByRole("button", { name: "Create Organization" }));
    expect(screen.getByText("Enter name and login credentials to create an organization profile.")).toBeDefined();

    // Fill in inputs
    const nameInput = screen.getByLabelText("Organization Name") as HTMLInputElement;
    const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirm Password") as HTMLInputElement;
    const categorySelect = screen.getByLabelText("Organization Category") as HTMLSelectElement;

    fireEvent.change(nameInput, { target: { value: "Golden Paw" } });
    fireEvent.change(emailInput, { target: { value: "info@goldenpaw.com" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.change(confirmInput, { target: { value: "different" } });
    fireEvent.change(categorySelect, { target: { value: "ngo" } });

    // Verify mismatch warning is shown
    expect(screen.getByText("Passwords do not match.")).toBeDefined();

    // Toggle password show/hide
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

    // Close via Cancel button
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Enter name and login credentials to create an organization profile.")).toBeNull();
  });

  it("should handle create organization modal X button close", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Open Modal
    fireEvent.click(screen.getByRole("button", { name: "Create Organization" }));
    expect(screen.getByText("Enter name and login credentials to create an organization profile.")).toBeDefined();

    // Close via X button
    const closeBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-x"));
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);

    expect(screen.queryByText("Enter name and login credentials to create an organization profile.")).toBeNull();
  });

  it("should open and cancel Delete organization modal via Cancel button", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Open Delete confirmation dialog
    const deleteBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-trash2"));
    expect(deleteBtn).toBeDefined();
    fireEvent.click(deleteBtn!);

    expect(screen.getByText("Are you sure you want to permanently delete this organization? This action cannot be undone.")).toBeDefined();

    // Click Cancel in delete modal
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Are you sure you want to permanently delete this organization? This action cannot be undone.")).toBeNull();
  });

  it("should open and cancel Delete organization modal via X button", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Open Delete confirmation dialog
    const deleteBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-trash2"));
    expect(deleteBtn).toBeDefined();
    fireEvent.click(deleteBtn!);

    expect(screen.getByText("Are you sure you want to permanently delete this organization? This action cannot be undone.")).toBeDefined();

    // Click X button
    const closeBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-x"));
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);

    expect(screen.queryByText("Are you sure you want to permanently delete this organization? This action cannot be undone.")).toBeNull();
  });

  it("should handle Category creation modal flow and cancellation via Cancel button", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Switch to Categories tab
    fireEvent.click(screen.getByRole("button", { name: /Categories/i }));

    // Open creation modal
    fireEvent.click(screen.getByRole("button", { name: "Add Category" }));
    expect(screen.getByText("Create a new dynamic category for partner organizations.")).toBeDefined();

    // Close via Cancel button
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Create a new dynamic category for partner organizations.")).toBeNull();
  });

  it("should handle Category creation modal flow and cancellation via X button", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Switch to Categories tab
    fireEvent.click(screen.getByRole("button", { name: /Categories/i }));

    // Open creation modal
    fireEvent.click(screen.getByRole("button", { name: "Add Category" }));
    expect(screen.getByText("Create a new dynamic category for partner organizations.")).toBeDefined();

    // Close via X button
    const closeBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-x"));
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);

    expect(screen.queryByText("Create a new dynamic category for partner organizations.")).toBeNull();
  });

  it("should handle Category edit modal flow and cancellation via Cancel button", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Switch to Categories tab
    fireEvent.click(screen.getByRole("button", { name: /Categories/i }));

    // Open Edit modal
    const editBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-pencil"));
    expect(editBtn).toBeDefined();
    fireEvent.click(editBtn!);

    expect(screen.getByText(/Update name and description details for category/i)).toBeDefined();

    // Close via Cancel button
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    expect(cancelBtn).toBeDefined();
    fireEvent.click(cancelBtn);

    expect(screen.queryByText(/Update name and description details for category/i)).toBeNull();
  });

  it("should handle Category edit modal flow and cancellation via X button", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Switch to Categories tab
    fireEvent.click(screen.getByRole("button", { name: /Categories/i }));

    // Open Edit modal
    const editBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-pencil"));
    expect(editBtn).toBeDefined();
    fireEvent.click(editBtn!);

    expect(screen.getByText(/Update name and description details for category/i)).toBeDefined();

    // Close via X button
    const closeBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-x"));
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);

    expect(screen.queryByText(/Update name and description details for category/i)).toBeNull();
  });

  it("should filter results on Categories tab based on search input changes", () => {
    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Switch to Categories tab
    fireEvent.click(screen.getByRole("button", { name: /Categories/i }));

    const searchInput = screen.getByPlaceholderText("Search categories...") as HTMLInputElement;

    // Search query with match
    fireEvent.change(searchInput, { target: { value: "ngo" } });
    expect(screen.getByText("ngo")).toBeDefined();

    // Search query with no match
    fireEvent.change(searchInput, { target: { value: "UnknownCategory" } });
    expect(screen.queryByText("ngo")).toBeNull();
  });

  it("should support paging navigation when lists are large", () => {
    const largeOrgs = Array.from({ length: 12 }, (_, i) => ({
      id: `org-${i}`,
      name: `Organization ${i}`,
      email: `org${i}@example.com`,
      organizationCategory: "ngo",
      createdAt: new Date("2026-01-01"),
    }));

    const { container } = render(
      <OrganizationsTable
        organizationList={largeOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Initial page text check
    expect(container.textContent).toContain("Showing 1–10 of 12 organizations");

    // Click next page button (ChevronRight inside button)
    const nextBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-chevron-right"));
    expect(nextBtn).toBeDefined();
    fireEvent.click(nextBtn!);

    expect(container.textContent).toContain("Showing 11–12 of 12 organizations");

    // Click previous page button (ChevronLeft inside button)
    const prevBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-chevron-left"));
    expect(prevBtn).toBeDefined();
    fireEvent.click(prevBtn!);
    expect(container.textContent).toContain("Showing 1–10 of 12 organizations");

    // Click page 2 button
    const pageTwoBtn = screen.getByRole("button", { name: "2" });
    fireEvent.click(pageTwoBtn);
    expect(container.textContent).toContain("Showing 11–12 of 12 organizations");
  });

  it("should support categories list pagination navigation", () => {
    const largeCategories = Array.from({ length: 12 }, (_, i) => ({
      id: `cat-${i}`,
      name: `Category ${i}`,
      description: `Description ${i}`,
    }));

    const { container } = render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={largeCategories}
      />
    );

    // Switch to Categories tab
    fireEvent.click(screen.getByRole("button", { name: /Categories/i }));

    // Initial page metrics
    expect(container.textContent).toContain("Showing 1–10 of 12 categories");

    // Click next page button
    const nextBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-chevron-right"));
    expect(nextBtn).toBeDefined();
    fireEvent.click(nextBtn!);

    expect(container.textContent).toContain("Showing 11–12 of 12 categories");

    // Click previous page button
    const prevBtn = screen.getAllByRole("button").find(btn => btn.querySelector("svg.lucide-chevron-left"));
    expect(prevBtn).toBeDefined();
    fireEvent.click(prevBtn!);
    expect(container.textContent).toContain("Showing 1–10 of 12 categories");

    // Click page 2 button
    const pageTwoBtn = screen.getByRole("button", { name: "2" });
    fireEvent.click(pageTwoBtn);
    expect(container.textContent).toContain("Showing 11–12 of 12 categories");
  });

  it("should trigger success effects when actions are completed successfully", async () => {
    vi.mocked(useActionState)
      .mockImplementationOnce(() => [{ success: true }, vi.fn(), false]) // create org
      .mockImplementationOnce(() => [{ success: true }, vi.fn(), false]) // create category
      .mockImplementationOnce(() => [{ success: true }, vi.fn(), false]) // delete category
      .mockImplementationOnce(() => [{ success: true }, vi.fn(), false]) // edit category
      .mockImplementationOnce(() => [{ success: true }, vi.fn(), false]); // delete org

    render(
      <OrganizationsTable
        organizationList={mockOrgs}
        organizationCategoryList={mockCategories}
      />
    );

    // Allow useEffect hook timeouts to resolve
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(screen.queryByText("Register Organization")).toBeNull();
  });
});
