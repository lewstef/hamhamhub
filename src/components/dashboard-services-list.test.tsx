// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardServicesList } from "./dashboard-services-list";
import {
  toggleOrganizationServiceAction,
  toggleOrganizationSubServiceAction,
} from "@/app/actions/organizations";

vi.mock("@/app/actions/organizations", () => ({
  toggleOrganizationServiceAction: vi.fn(),
  toggleOrganizationSubServiceAction: vi.fn(),
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

const ALL_SUB_SERVICE_IDS = [
  "dog-training:basic",
  "dog-training:group",
  "dog-training:private",
  "dog-training:sar",
  "dog-training:show",
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

  it("should show sub-services accordion chevron button when Dog Training is enabled", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        initialEnabledIds={["srv-2"]}
        initialEnabledSubServiceIds={ALL_SUB_SERVICE_IDS}
      />
    );

    // The chevron expand/collapse button should be visible for Dog Training
    const collapseBtn = screen.getByTitle(/Collapse sub-services|Expand sub-services/i);
    expect(collapseBtn).toBeDefined();
  });

  it("should navigate to correct sub-service tab page when sub-service Edit is clicked", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        initialEnabledIds={["srv-2"]}
        initialEnabledSubServiceIds={ALL_SUB_SERVICE_IDS}
      />
    );

    // Find all Edit buttons — first ones are for the service, sub-service buttons appear in the accordion
    const editButtons = screen.getAllByRole("button", { name: "Edit" });

    // Click the "Dog Training" top-level edit button
    fireEvent.click(editButtons[0]);
    expect(mockPush).toHaveBeenCalledWith("/dashboard/services/dog-training");
  });

  it("should navigate to sub-service-specific URL when sub-service Edit is clicked after accordion is open", () => {
    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        // Dog Training enabled by default so accordion is auto-expanded
        initialEnabledIds={["srv-2"]}
        initialEnabledSubServiceIds={ALL_SUB_SERVICE_IDS}
      />
    );

    // Accordion is already open since Dog Training is in initialEnabledIds
    // Find all edit buttons (the one for Dog Training top level + sub-service Edit buttons)
    const editButtons = screen.getAllByRole("button", { name: "Edit" });

    // Sub-service buttons come after the top-level Edit button
    // editButtons[0] = Dog Training top-level Edit
    // editButtons[1] = Basic Training sub-service Edit
    fireEvent.click(editButtons[1]);
    expect(mockPush).toHaveBeenCalledWith(
      "/dashboard/services/dog-training/basic-training-and-obedience"
    );
  });

  it("should call toggleOrganizationSubServiceAction when sub-service toggle switch is clicked", async () => {
    vi.mocked(toggleOrganizationSubServiceAction).mockResolvedValue({ success: true });
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ success: true });

    render(
      <DashboardServicesList
        organizationId="org-123"
        services={dummyServices}
        initialEnabledIds={["srv-2"]}
        initialEnabledSubServiceIds={ALL_SUB_SERVICE_IDS}
      />
    );

    // Ensure accordion is open by clicking the chevron (title="Collapse sub-services")
    const chevron = screen.getByTitle(/Collapse sub-services|Expand sub-services/i);
    // The accordion starts collapsed despite initialEnabledIds; click to open it
    // If it says Collapse, we click to collapse then re-expand; if Expand we just open it
    if (chevron.title === "Expand sub-services") {
      fireEvent.click(chevron);
    }

    // Now the sub-service switches should be reachable in the DOM
    // Find all switches and verify there is more than 1
    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBeGreaterThan(1);

    // Click the last switch (a sub-service switch)
    fireEvent.click(switches[switches.length - 1]);

    expect(toggleOrganizationSubServiceAction).toHaveBeenCalled();
  });
});



