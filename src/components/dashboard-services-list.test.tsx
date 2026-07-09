// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardServicesList } from "./dashboard-services-list";
import { toggleOrganizationServiceAction } from "@/app/actions/organizations";

vi.mock("@/app/actions/organizations", () => ({
  toggleOrganizationServiceAction: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: mockPush,
  }),
}));

describe("DashboardServicesList Component", () => {
  const dummyServices = [
    { id: "srv-1", name: "Dog Boarding", description: "Safe stay.", slug: "dog-boarding" },
    { id: "srv-2", name: "Dog Training", description: "Training.", slug: "dog-training" },
  ];

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

  it("should call toggleOrganizationServiceAction when toggle switch is clicked", async () => {
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
