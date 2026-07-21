// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React, { useActionState } from "react";
import { ServicesTable } from "./services-table";
import { deleteServiceAction } from "@/app/actions/services";

// Mock the server actions
vi.mock("@/app/actions/services", () => {
  const createServiceAction = vi.fn();
  const deleteServiceAction = vi.fn();
  (createServiceAction as any)._isCreate = true;
  (deleteServiceAction as any)._isDelete = true;

  return {
    createServiceAction,
    deleteServiceAction,
    reorderServicesAction: vi.fn(() => Promise.resolve({ success: true })),
    reorderCoursesAction: vi.fn(() => Promise.resolve({ success: true })),
  };
});

// Mock the config
vi.mock("@/config/dog-training", () => ({
  DOG_TRAINING_COURSES: [{ id: "course-basic", key: "basic", label: "Puppy Basics" }],
  getSortedCourses: vi.fn(() => [
    { id: "course-basic", key: "basic", label: "Puppy Basics" },
    { id: "course-group", key: "group", label: "Group Classes" },
  ]),
}));

// Mock next/navigation if needed
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

let mockCreateSuccess = false;
let mockDeleteSuccess = false;

// Mock react's useActionState
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: (action: any, initialState: unknown) => {
      const isDelete = action?._isDelete;
      
      let state = initialState;
      if (isDelete && mockDeleteSuccess) {
        state = { success: true };
      } else if (action?._isCreate && mockCreateSuccess) {
        state = { success: true };
      }

      const dispatch = vi.fn().mockImplementation((payload) => {
        action(null, payload);
      });
      return [state, dispatch, false];
    },
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
    mockCreateSuccess = false;
    mockDeleteSuccess = false;
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

  it("should close the create modal via the X button", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Open modal via "Add Service" header button
    fireEvent.click(screen.getByRole("button", { name: "Add Service" }));
    expect(screen.getByText(/Add Service Types to/)).toBeDefined();

    // Find and click the X close button (absolute positioned button in modal)
    const closeButtons = screen.getAllByRole("button");
    // The X close button is distinct from Cancel/Save - find it by looking for one that
    // closes the modal without being Cancel or Save Service
    const xBtn = closeButtons.find((btn) =>
      !btn.textContent?.includes("Cancel") &&
      !btn.textContent?.includes("Save Service") &&
      btn.querySelector("svg") &&
      btn.closest(".fixed")
    );
    expect(xBtn).toBeDefined();
    fireEvent.click(xBtn!);
    expect(screen.queryByText(/Add Service Types to/)).toBeNull();
  });

  it("should close the delete confirmation modal via the X button", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Open delete modal
    const trashButtons = screen.getAllByRole("button").filter((btn) => btn.querySelector("svg"));
    fireEvent.click(trashButtons[0]);
    expect(screen.getByText("Delete Service")).toBeDefined();

    // Find and click the X close button in the delete modal
    const modalXBtn = screen.getAllByRole("button").find((btn) =>
      !btn.textContent?.includes("Cancel") &&
      !btn.textContent?.includes("Delete") &&
      btn.closest(".fixed")
    );
    expect(modalXBtn).toBeDefined();
    fireEvent.click(modalXBtn!);
    expect(screen.queryByText("Delete Service")).toBeNull();
  });

  it("should open Add Service modal with All Categories filter active and show correct category", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Click main "Add Service" button (no filter active, defaults to first category)
    fireEvent.click(screen.getByRole("button", { name: "Add Service" }));

    // Should show modal with the first category (NGO)
    expect(screen.getByText(/Add Service Types to/)).toBeDefined();
    // Close
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  });

  it("should open Add Service modal with the correct category when a specific category filter is active", () => {
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Filter by Dog Kennel first
    const dogKennelFilter = screen.getByRole("button", { name: "Dog Kennel" });
    fireEvent.click(dogKennelFilter);

    // Now click main "Add Service" button
    fireEvent.click(screen.getByRole("button", { name: "Add Service" }));

    // The modal should open scoped to Dog Kennel
    expect(screen.getByText(/Add Service Types to/)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  });

  it("should render dog boarding icon and description", () => {
    const boardingServiceList = [
      { id: "s-boarding", name: "Dog Boarding", organizationCategory: "dog_kennel" },
      { id: "s-kennel", name: "Dog Kennel", organizationCategory: "dog_kennel" },
    ];

    render(
      <ServicesTable
        serviceList={boardingServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    expect(screen.getAllByText("Overnight lodging, meals, and secure room accommodations.").length).toBeGreaterThanOrEqual(1);
    // Both Dog Boarding and Dog Kennel should show boarding description
    expect(screen.getAllByText("Overnight lodging, meals, and secure room accommodations.").length).toBeGreaterThan(0);
  });

  it("should show 'No services defined' for a category with no matching services", () => {
    render(
      <ServicesTable
        serviceList={[]} // no services
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // All three categories should show empty state
    const emptyMsgs = screen.getAllByText("No services defined for this category.");
    expect(emptyMsgs.length).toBeGreaterThanOrEqual(1);
  });

  it("should handle drag start, drag over, and drag end on service elements", async () => {
    const { reorderServicesAction } = await import("@/app/actions/services");
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Find all service rows that are draggable
    const draggableServices = document.querySelectorAll("div[draggable='true']");
    expect(draggableServices.length).toBeGreaterThanOrEqual(2);

    // Trigger drag events
    const dataTransfer = { effectAllowed: "" };
    fireEvent.dragStart(draggableServices[0], { dataTransfer });
    fireEvent.dragOver(draggableServices[1]);
    fireEvent.dragEnd(draggableServices[0]);

    expect(reorderServicesAction).toHaveBeenCalled();
  });

  it("should render and handle drag start, drag over, and drag end on course elements", async () => {
    const { reorderCoursesAction } = await import("@/app/actions/services");
    
    // We need "Dog Training" in NGO category so that getSortedCourses is called and courses are rendered
    const testServiceList = [
      { id: "s-train", name: "Dog training", organizationCategory: "ngo", coursesOrder: "course-basic" }
    ];

    render(
      <ServicesTable
        serviceList={testServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Since we mocked getSortedCourses, the courses should be listed under Dog Training
    expect(screen.getByText("Courses (Drag to reorder)")).toBeDefined();
    
    // Find course row elements specifically using text
    const basicCourseRow = screen.getByText("Puppy Basics").closest("div[draggable='true']");
    const groupCourseRow = screen.getByText("Group Classes").closest("div[draggable='true']");
    expect(basicCourseRow).toBeDefined();
    expect(groupCourseRow).toBeDefined();

    const dataTransfer = { effectAllowed: "" };
    fireEvent.dragStart(basicCourseRow!, { dataTransfer });
    fireEvent.dragOver(groupCourseRow!);
    fireEvent.dragEnd(basicCourseRow!);

    expect(reorderCoursesAction).toHaveBeenCalled();
  });

  it("should close the create modal when state.success is true", async () => {
    mockCreateSuccess = true;
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Open the create modal
    fireEvent.click(screen.getByRole("button", { name: "Add Service" }));
    expect(screen.getByText(/Add Service Types to/)).toBeDefined();

    // Fill in the form and click save
    const walkingButton = screen.getByRole("button", { name: /Dog walking/ }).closest("button");
    fireEvent.click(walkingButton!);

    const saveBtn = screen.getByRole("button", { name: "Save Service" });
    fireEvent.click(saveBtn);

    // Wait for the modal to be closed because mockCreateSuccess is true
    await waitFor(() => {
      expect(screen.queryByText(/Add Service Types to/)).toBeNull();
    });
  });

  it("should close the delete modal when deleteState.success is true", async () => {
    mockDeleteSuccess = true;
    render(
      <ServicesTable
        serviceList={mockServiceList}
        organizationCategoryList={mockOrgCategoryList}
        serviceTypeList={mockServiceTypeList}
      />
    );

    // Click trash button
    const trashButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg")
    );
    fireEvent.click(trashButtons[0]);
    expect(screen.getByText("Delete Service")).toBeDefined();

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(confirmDeleteBtn);

    // Wait for the delete modal to be closed because mockDeleteSuccess is true
    await waitFor(() => {
      expect(screen.queryByText("Delete Service")).toBeNull();
    });
  });
});
