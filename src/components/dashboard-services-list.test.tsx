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

const ALL_COURSE_IDS = [
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
});



