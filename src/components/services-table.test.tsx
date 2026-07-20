// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useActionState } from "react";
import { ServicesTable } from "./services-table";
import { deleteServiceAction } from "@/app/actions/services";

// Mock the server actions
vi.mock("@/app/actions/services", () => ({
  createServiceAction: vi.fn(),
  deleteServiceAction: vi.fn(),
}));

// Mock next/navigation if needed
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock react's useActionState
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn((action: any, initialState: unknown) => {
      const dispatch = vi.fn().mockImplementation((payload) => {
        action(null, payload);
      });
      return [initialState, dispatch, false];
    }),
  };
});

describe("ServicesTable Component", () => {
  const mockServiceList = [
    { id: "s1", name: "Dog training", organizationCategory: "ngo" },
    { id: "s2", name: "Dog boarding", organizationCategory: "dog_kennel" },
  ];

  const mockOrgCategoryList = [
    { id: "ngo", name: "NGO" },
    { id: "dog_kennel", name: "Dog Kennel" },
    { id: "dog_service_provider", name: "Dog service provider" },
  ];

  const mockServiceTypeList = [
    { id: "dog_training", name: "Dog training", description: "Behavioral training", applicableTo: ["ngo"], fields: [] },
    { id: "dog_boarding", name: "Dog boarding", description: "Overnight stays", applicableTo: ["dog_kennel"], fields: [] },
    { id: "dog_walking", name: "Dog walking", description: "Daily walks", applicableTo: ["dog_service_provider"], fields: [] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render page title and default services grouped by categories", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    expect(screen.getByText("Services Directory")).toBeDefined();
    // NGO section cards/buttons
    expect(screen.getAllByText("NGO").length).toBeGreaterThanOrEqual(2);
    // Dog Kennel cards/buttons
    expect(screen.getAllByText("Dog Kennel").length).toBeGreaterThanOrEqual(2);
    
    // Check if services are rendered
    expect(screen.getByText("Dog training")).toBeDefined();
    expect(screen.getByText("Dog boarding")).toBeDefined();
  });

  it("should filter categories when clicking category filter buttons", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Filter by "NGO" button
    const ngoButton = screen.getByRole("button", { name: "NGO" });
    fireEvent.click(ngoButton);

    // NGO card should remain
    expect(screen.getAllByText("NGO").length).toBeGreaterThanOrEqual(1);
    // Dog Kennel card should not be displayed (only the filter button remains, so count should be exactly 1)
    expect(screen.getAllByText("Dog Kennel").length).toBe(1);

    // Reset filter
    const allButton = screen.getByRole("button", { name: "All Categories" });
    fireEvent.click(allButton);
    expect(screen.getAllByText("Dog Kennel").length).toBeGreaterThanOrEqual(2);
  });

  it("should search services by search query", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search services by name...");
    fireEvent.change(searchInput, { target: { value: "boarding" } });

    // Boarding should remain
    expect(screen.getByText("Dog boarding")).toBeDefined();
    // Training should be hidden
    expect(screen.queryByText("Dog training")).toBeNull();
  });

  it("should open create service modal when clicking Add Service Type button", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Get the Add Service Type button inside the card or header
    const addButtons = screen.getAllByRole("button", { name: "Add Service Type" });
    expect(addButtons.length).toBeGreaterThan(0);

    // Click the first one (for NGO)
    fireEvent.click(addButtons[0]);

    // Modal title should appear (partial match using regex because it contains nested span)
    expect(screen.getByText(/Add Service Types to/)).toBeDefined();
    // NGO is both in the card header and inside the modal, so we expect multiple occurrences
    expect(screen.getAllByText("NGO").length).toBeGreaterThan(1);

    // Close modal
    const closeBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Add Service Types to/)).toBeNull();
  });

  it("should toggle selection of service types in create modal and submit", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Open modal for NGO
    const addButtons = screen.getAllByRole("button", { name: "Add Service Type" });
    fireEvent.click(addButtons[0]);

    // "Dog training" is already registered in mockServiceList for NGO, but it should not be disabled
    const trainingButton = screen.getByRole("button", { name: /Dog training/ }).closest("button");
    expect(trainingButton?.disabled).toBe(false);

    // "Dog walking" is not registered, so we can select it
    const walkingButton = screen.getByRole("button", { name: /Dog walking/ }).closest("button");
    expect(walkingButton?.disabled).toBe(false);

    // Toggle selection
    fireEvent.click(walkingButton!);
    // Click again to untoggle
    fireEvent.click(walkingButton!);
    // Toggle again to select for submission
    fireEvent.click(walkingButton!);

    // Ensure save button is enabled
    const saveBtn = screen.getByRole("button", { name: "Save Service" });
    expect(saveBtn).toBeDefined();
    expect((saveBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it("should open delete confirmation modal and cancel/confirm", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Trash button only appears on hover of service item in standard DOM, but it's rendered.
    // Let's find it.
    const trashButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg") // Has trash icon
    );
    expect(trashButtons.length).toBeGreaterThan(0);

    // Click trash button for first service
    fireEvent.click(trashButtons[0]);

    // Deletion confirmation modal should show up
    expect(screen.getByText("Delete Service")).toBeDefined();

    // Cancel deletion
    const cancelDeleteBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelDeleteBtn);
    expect(screen.queryByText("Delete Service")).toBeNull();
  });

  it("should call deleteServiceAction when deletion is confirmed", async () => {
    vi.mocked(deleteServiceAction).mockResolvedValue({ success: true } as any);

    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    const trashButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg")
    );
    fireEvent.click(trashButtons[0]);

    // Deletion confirmation modal should show up
    expect(screen.getByText("Delete Service")).toBeDefined();

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(confirmDeleteBtn);

    expect(deleteServiceAction).toHaveBeenCalled();
  });

  it("should show custom icon and descriptions based on service names", () => {
    const specialServiceList = [
      { id: "s-sport", name: "Dog Sports Training", organizationCategory: "ngo" },
      { id: "s-walking", name: "Dog Walking", organizationCategory: "dog_service_provider" },
      { id: "s-general", name: "Special Therapy Service", organizationCategory: "ngo" },
    ];

    render(
      <ServicesTable
        serviceList={specialServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    expect(screen.getByText("Advanced canine sports, agility, and competition coaching.")).toBeDefined();
    expect(screen.getByText("Outdoor exercise runs, safety walks, and park adventures.")).toBeDefined();
    expect(screen.getByText("General dog services and master allocations.")).toBeDefined();
  });
});
