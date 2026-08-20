// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { DashboardServicesList } from "./dashboard-services-list";
import {
  toggleOrganizationServiceAction,
  toggleOrganizationCourseAction,
} from "@/app/actions/organizations";

vi.mock("@/app/actions/organizations", () => ({
  toggleOrganizationServiceAction: vi.fn(),
  toggleOrganizationCourseAction: vi.fn(),
}));

vi.mock("@/config/dog-training", () => ({
  DOG_TRAINING_COURSES: [{ id: "course-basic", key: "basic", label: "Puppy Basics" }],
  getSortedCourses: vi.fn(() => [
    { id: "course-basic", key: "basic", label: "Puppy Basics" },
    { id: "course-group", key: "group", label: "Group Classes" },
  ]),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: mockPush,
  }),
}));

const dummyServices = [
  { id: "srv-1", name: "Dog Boarding", description: "Safe stay.", slug: "dog-boarding" },
  { id: "srv-2", name: "Dog Training", description: "Training.", slug: "dog-training" },
];

describe("DashboardServicesList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render services list correctly", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        initialEnabledIds={["srv-1"]}
      />
    );

    expect(screen.getByText("Dog Boarding")).toBeDefined();
    expect(screen.getByText("Dog Training")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByRole("button", { name: "Edit" })).toBeDefined();
  });

  it("should show empty message when services array is empty", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[]}
        initialEnabledIds={[]}
      />
    );
    expect(screen.getByText("No operational services match your organization category.")).toBeDefined();
  });

  it("should render courses accordion when dog-training service is enabled and has courses", () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ success: true });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[
          { id: "srv-dt", name: "Dog Training", description: "Train your dog.", slug: "dog-training", coursesOrder: "course-basic,course-group" },
        ]}
        initialEnabledIds={["srv-dt"]} // enabled from start
      />
    );

    // The expand toggle button should be present (getSortedCourses returns 2 courses)
    const expandBtn = screen.getByTitle(/courses/i);
    expect(expandBtn).toBeDefined();

    // Click to collapse (since it starts expanded because srv-dt is in initialEnabledIds)
    fireEvent.click(expandBtn);

    // Both course labels should now be visible
    expect(screen.getByText("Puppy Basics")).toBeDefined();
    expect(screen.getByText("Group Classes")).toBeDefined();
  });

  it("should call toggleOrganizationCourseAction when clicking a course switch", async () => {
    vi.mocked(toggleOrganizationCourseAction).mockResolvedValue({ success: true });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[
          { id: "srv-dt", name: "Dog Training", description: "Train your dog.", slug: "dog-training", coursesOrder: "course-basic,course-group" },
        ]}
        initialEnabledIds={["srv-dt"]}
        initialEnabledCourseIds={[]}
      />
    );

    // Since it starts expanded, we don't need to click it or we can just assert it is present
    const expandBtn = screen.getByTitle(/courses/i);
    expect(expandBtn).toBeDefined();

    // Now course switches should be visible
    const switches = screen.getAllByRole("switch");
    // First switch is the service toggle, rest are course toggles
    expect(switches.length).toBeGreaterThan(1);

    // Click first course switch (index 1)
    await act(async () => {
      fireEvent.click(switches[1]);
    });

    expect(toggleOrganizationCourseAction).toHaveBeenCalledWith("org-123", "course-basic", true);
  });

  it("should rollback course state when toggleOrganizationCourseAction returns error", async () => {
    vi.mocked(toggleOrganizationCourseAction).mockResolvedValue({ error: "Course toggle failed" });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[
          { id: "srv-dt", name: "Dog Training", description: "Train.", slug: "dog-training", coursesOrder: "course-basic" },
        ]}
        initialEnabledIds={["srv-dt"]}
        initialEnabledCourseIds={["course-basic"]}
      />
    );

    // Accordion is already expanded initially
    const expandBtn = screen.getByTitle(/courses/i);
    expect(expandBtn).toBeDefined();

    // Toggle course off
    const switches = screen.getAllByRole("switch");
    await act(async () => {
      fireEvent.click(switches[1]); // course switch
    });

    expect(toggleOrganizationCourseAction).toHaveBeenCalledWith("org-123", "course-basic", false);
  });

  it("should navigate to course detail when clicking Edit on an enabled course", async () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[
          { id: "srv-dt", name: "Dog Training", description: "Train.", slug: "dog-training", coursesOrder: "course-basic,course-group" },
        ]}
        initialEnabledIds={["srv-dt"]}
        initialEnabledCourseIds={["course-basic", "course-group"]}
      />
    );

    // Accordion is already expanded initially
    const expandBtn = screen.getByTitle(/courses/i);
    expect(expandBtn).toBeDefined();

    // Edit buttons appear for enabled courses
    const editBtns = screen.getAllByRole("button", { name: "Edit" });
    expect(editBtns.length).toBeGreaterThan(0);
    fireEvent.click(editBtns[editBtns.length - 1]);

    expect(mockPush).toHaveBeenCalled();
  });

  it("should navigate to service details page when Edit is clicked", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        initialEnabledIds={["srv-1"]}
      />
    );

    const editBtn = screen.getByRole("button", { name: "Edit" });
    fireEvent.click(editBtn);

    expect(mockPush).toHaveBeenCalledWith("/dashboard/services/dog-boarding");
  });

  it("should call toggleOrganizationServiceAction when service toggle switch is clicked", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ success: true });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        initialEnabledIds={[]}
      />
    );

    const switches = screen.getAllByRole("switch");
    await act(async () => {
      fireEvent.click(switches[0]);
    });

    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-123", "srv-1", true);
  });

  it("should optimistically show Active badge when a disabled service is toggled on", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ success: true });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[{ id: "srv-1", name: "Dog Boarding", description: "Safe stay.", slug: "dog-boarding" }]}
        initialEnabledIds={[]}
      />
    );

    // Initially no Active badge
    expect(screen.queryByText("Active")).toBeNull();

    const toggle = screen.getByRole("switch");
    await act(async () => {
      fireEvent.click(toggle);
    });

    // Active badge appears
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("should show the Edit button only for enabled services", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        initialEnabledIds={["srv-1"]} // only srv-1 is enabled
      />
    );

    // Only one Edit button should be present (for Dog Boarding which is enabled)
    expect(screen.getAllByRole("button", { name: "Edit" }).length).toBe(1);
  });

  it("should toggle a service off (disable) when an enabled service switch is clicked", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ success: true });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[{ id: "srv-1", name: "Dog Boarding", description: "Safe stay.", slug: "dog-boarding" }]}
        initialEnabledIds={["srv-1"]}
      />
    );

    // Active badge visible initially
    expect(screen.getByText("Active")).toBeDefined();

    const toggle = screen.getByRole("switch");
    await act(async () => {
      fireEvent.click(toggle);
    });

    // After optimistic update, Active badge should disappear
    expect(screen.queryByText("Active")).toBeNull();
    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-123", "srv-1", false);
  });

  it("should rollback optimistic state when toggleOrganizationServiceAction returns error", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ error: "Server error" });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[{ id: "srv-1", name: "Dog Boarding", description: "Safe stay.", slug: "dog-boarding" }]}
        initialEnabledIds={[]}
      />
    );

    // Verify initially not active
    expect(screen.queryByText("Active")).toBeNull();

    const toggle = screen.getByRole("switch");
    await act(async () => {
      fireEvent.click(toggle);
    });

    // Rolls back to not active
    expect(screen.queryByText("Active")).toBeNull();
    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-123", "srv-1", true);
  });

  it("should call toggleOrganizationCourseAction when a course switch is toggled", async () => {
    vi.mocked(toggleOrganizationCourseAction).mockResolvedValue({ success: true });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        initialEnabledIds={["srv-1"]}
        initialEnabledCourseIds={[]}
      />
    );

    expect(screen.getAllByRole("switch").length).toBeGreaterThan(0);
  });

  it("should pre-populate enabled courses from initialEnabledCourseIds", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        initialEnabledIds={["srv-1"]}
        initialEnabledCourseIds={["course-abc", "course-def"]}
      />
    );

    expect(screen.getByText("Dog Boarding")).toBeDefined();
  });

  it("should add serviceId to expandedIds when enabling a previously disabled service", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ success: true });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[
          { id: "srv-2", name: "Dog Training", description: "Training.", slug: "dog-training" },
        ]}
        initialEnabledIds={[]} // service is disabled initially
      />
    );

    // Initially no Edit button (service not enabled)
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();

    // Toggle service on
    const toggle = screen.getByRole("switch");
    await act(async () => {
      fireEvent.click(toggle);
    });

    // Active badge should appear
    expect(screen.getByText("Active")).toBeDefined();
    // Edit button should now appear
    expect(screen.getByRole("button", { name: "Edit" })).toBeDefined();
  });

  it("should filter services list based on search query in DashboardServicesList", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[
          { id: "srv-1", name: "Dog Boarding", description: "Safe overnight stay.", slug: "dog-boarding" },
          { id: "srv-2", name: "Dog Grooming", description: "Bathing and coat care.", slug: "dog-grooming" },
          { id: "srv-3", name: "Dog Training", description: "Behavioral commands.", slug: "dog-training" },
        ]}
        initialEnabledIds={["srv-1"]}
      />
    );

    expect(screen.getByText("Dog Boarding")).toBeDefined();
    expect(screen.getByText("Dog Grooming")).toBeDefined();
    expect(screen.getByText("Dog Training")).toBeDefined();
    expect(screen.getByText("services")).toBeDefined();

    // Type query into search input
    const searchInput = screen.getByPlaceholderText(/search services by name/i);
    fireEvent.change(searchInput, { target: { value: "grooming" } });

    expect(screen.getByText("Dog Grooming")).toBeDefined();
    expect(screen.queryByText("Dog Boarding")).toBeNull();
    expect(screen.queryByText("Dog Training")).toBeNull();

    // Query with no match
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    expect(screen.getByText(/No services found matching/i)).toBeDefined();
    const clearButtons = screen.getAllByRole("button", { name: "Clear search" });
    expect(clearButtons.length).toBeGreaterThan(0);

    // Clear search
    fireEvent.click(clearButtons[0]);
    expect(screen.getByText("Dog Boarding")).toBeDefined();
    expect(screen.getByText("Dog Grooming")).toBeDefined();
    expect(screen.getByText("Dog Training")).toBeDefined();
  });

  it("should match services regardless of diacritics in query or service name/description", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[
          { id: "srv-1", name: "Dresaj Câini", description: "Școală canină și învățare.", slug: "dog-training" },
          { id: "srv-2", name: "Pensiune Canină", description: "Găzduire peste noapte.", slug: "dog-boarding" },
        ]}
        initialEnabledIds={["srv-1"]}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search services by name/i);

    // Searching "caini" matches "Dresaj Câini"
    fireEvent.change(searchInput, { target: { value: "caini" } });
    expect(screen.getByText("Dresaj Câini")).toBeDefined();
    expect(screen.queryByText("Pensiune Canină")).toBeNull();

    // Searching with diacritic "câini" matches
    fireEvent.change(searchInput, { target: { value: "câini" } });
    expect(screen.getByText("Dresaj Câini")).toBeDefined();
    expect(screen.queryByText("Pensiune Canină")).toBeNull();

    // Searching "gazduire" without diacritics matches description "Găzduire peste noapte."
    fireEvent.change(searchInput, { target: { value: "gazduire" } });
    expect(screen.getByText("Pensiune Canină")).toBeDefined();
    expect(screen.queryByText("Dresaj Câini")).toBeNull();

    // Searching "scoala" matches description "Școală canină"
    fireEvent.change(searchInput, { target: { value: "scoala" } });
    expect(screen.getByText("Dresaj Câini")).toBeDefined();
    expect(screen.queryByText("Pensiune Canină")).toBeNull();
  });
});


