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

vi.mock("@/config/dog-training", () => ({
  getSortedCourses: vi.fn((order) =>
    order ? [{ id: "basic-obedience", label: "Basic Obedience", key: "basic-obedience" }] : []
  ),
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

    // Toggle Dog Boarding (index 0 is srv-1, index 1 is nested sub course, index 2 is srv-2)
    const toggleSwitches = screen.getAllByRole("switch");
    fireEvent.click(toggleSwitches[2]);

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

    // Click Edit on second service (Dog Boarding)
    if (editBtns[1]) {
      fireEvent.click(editBtns[1]);
      expect(pushMock).toHaveBeenCalledWith("/backoffice/organizations/services/dog-boarding/org-123");
    }

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

  it("handles expanding dog-training courses and toggling course checkboxes", () => {
    const onToggleExpand = vi.fn();
    const onToggleCourse = vi.fn();

    const { rerender } = render(
      <OrgServicesTab
        organization={dummyOrg}
        servicesList={dummyServices}
        isDashboard={false}
        enabledServiceIds={["srv-1"]}
        enabledCourseIds={["basic_obedience"]}
        expandedIds={[]}
        togglingServiceId={null}
        togglingCourseId={null}
        isPending={false}
        onToggleService={() => {}}
        onToggleCourse={onToggleCourse}
        onToggleExpand={onToggleExpand}
      />
    );

    // Click expand chevron
    const expandBtn = screen.getByTitle("Expand courses");
    fireEvent.click(expandBtn);
    expect(onToggleExpand).toHaveBeenCalledWith("srv-1");

    // Rerender as expanded
    rerender(
      <OrgServicesTab
        organization={dummyOrg}
        servicesList={dummyServices}
        isDashboard={false}
        enabledServiceIds={["srv-1"]}
        enabledCourseIds={["basic-obedience"]}
        expandedIds={["srv-1"]}
        togglingServiceId={null}
        togglingCourseId={null}
        isPending={false}
        onToggleService={() => {}}
        onToggleCourse={onToggleCourse}
        onToggleExpand={onToggleExpand}
      />
    );

    // Find course toggle switch in expanded view (index 0 is srv-1, index 1 is course sub, index 2 is srv-2)
    const courseSwitches = screen.getAllByRole("switch");
    expect(courseSwitches.length).toBeGreaterThan(2);
    fireEvent.click(courseSwitches[1]);
    expect(onToggleCourse).toHaveBeenCalledWith("basic-obedience");

    // Click Edit on subcourse
    const subEditBtns = screen.getAllByRole("button", { name: "Edit" });
    const subEdit = subEditBtns[subEditBtns.length - 1];
    fireEvent.click(subEdit);
    expect(pushMock).toHaveBeenCalledWith("/backoffice/organizations/services/dog-training/basic-obedience/org-123");
  });
});
