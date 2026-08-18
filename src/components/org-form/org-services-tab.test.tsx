// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { OrgServicesTab } from "./org-services-tab";
import { Organization, Service } from "./types";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("OrgServicesTab Component", () => {
  const dummyOrg: Organization = {
    id: "org-123",
    name: "Dog School SRL",
    email: "contact@dogschool.test",
    organizationCategory: "dog_school",
  };

  const dummyServices: Service[] = [
    {
      id: "srv-1",
      name: "Dog Training",
      slug: "dog-training",
      description: "Obedience classes",
      organizationCategory: "dog_school",
      coursesOrder: JSON.stringify(["basic_obedience"]),
    },
    {
      id: "srv-2",
      name: "Dog Boarding",
      slug: "dog-boarding",
      description: "Overnight stays",
      organizationCategory: "dog_school",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state message when servicesList is empty", () => {
    render(
      <OrgServicesTab
        organization={dummyOrg}
        servicesList={[]}
        isDashboard={false}
        enabledServiceIds={[]}
        enabledCourseIds={[]}
        expandedIds={[]}
        togglingServiceId={null}
        togglingCourseId={null}
        isPending={false}
        onToggleService={() => {}}
        onToggleCourse={() => {}}
        onToggleExpand={() => {}}
      />
    );

    expect(screen.getByText("No active services associated with this organization's category.")).toBeDefined();
  });

  it("renders active services and handles toggle service callbacks", () => {
    const onToggleService = vi.fn();
    render(
      <OrgServicesTab
        organization={dummyOrg}
        servicesList={dummyServices}
        isDashboard={false}
        enabledServiceIds={["srv-1"]}
        enabledCourseIds={[]}
        expandedIds={[]}
        togglingServiceId={null}
        togglingCourseId={null}
        isPending={false}
        onToggleService={onToggleService}
        onToggleCourse={() => {}}
        onToggleExpand={() => {}}
      />
    );

    expect(screen.getByText("Dog Training")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();

    // Toggle Dog Boarding
    const toggleSwitches = screen.getAllByRole("switch");
    fireEvent.click(toggleSwitches[1]);

    expect(onToggleService).toHaveBeenCalledWith("srv-2");
  });

  it("handles router push navigation for service Edit buttons in backoffice and dashboard modes", () => {
    // Backoffice mode
    const { rerender } = render(
      <OrgServicesTab
        organization={dummyOrg}
        servicesList={dummyServices}
        isDashboard={false}
        enabledServiceIds={["srv-1", "srv-2"]}
        enabledCourseIds={[]}
        expandedIds={[]}
        togglingServiceId={null}
        togglingCourseId={null}
        isPending={false}
        onToggleService={() => {}}
        onToggleCourse={() => {}}
        onToggleExpand={() => {}}
      />
    );

    const editBtns = screen.getAllByRole("button", { name: "Edit" });
    fireEvent.click(editBtns[0]);
    expect(pushMock).toHaveBeenCalledWith("/backoffice/organizations/services/dog-training/org-123");

    // Dashboard mode
    rerender(
      <OrgServicesTab
        organization={dummyOrg}
        servicesList={dummyServices}
        isDashboard={true}
        enabledServiceIds={["srv-1", "srv-2"]}
        enabledCourseIds={[]}
        expandedIds={[]}
        togglingServiceId={null}
        togglingCourseId={null}
        isPending={false}
        onToggleService={() => {}}
        onToggleCourse={() => {}}
        onToggleExpand={() => {}}
      />
    );

    const editBtnsDash = screen.getAllByRole("button", { name: "Edit" });
    fireEvent.click(editBtnsDash[0]);
    expect(pushMock).toHaveBeenCalledWith("/dashboard/services/dog-training");
  });
});
