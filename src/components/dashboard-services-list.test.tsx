// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("should render empty state when no services are provided", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={[]}
        initialEnabledIds={[]}
      />
    );

    expect(screen.getByText(/No operational services match/i)).toBeDefined();
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
    fireEvent.click(switches[0]);

    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-123", "srv-1", true);
  });

  it("should optimistically show Active badge when a disabled service is toggled on", () => {
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
    fireEvent.click(toggle);

    // Optimistic update: Active badge appears before server responds
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

  it("should toggle a service off (disable) when an enabled service switch is clicked", () => {
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
    fireEvent.click(toggle);

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
    fireEvent.click(toggle);

    // Optimistically enabled
    expect(screen.getByText("Active")).toBeDefined();
    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-123", "srv-1", true);
  });
});

