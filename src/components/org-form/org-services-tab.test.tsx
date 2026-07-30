// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OrgServicesTab } from "./org-services-tab";

// Mock next/navigation router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock getSortedCourses from config
vi.mock("@/config/dog-training", () => ({
  getSortedCourses: vi.fn(() => [
    { id: "course-1", key: "puppy-school", label: "Puppy School" },
    { id: "course-2", key: "basic-obedience", label: "Basic Obedience" },
  ]),
}));

describe("OrgServicesTab Component", () => {
  const mockOrg = {
    id: "org-1",
    name: "Happy Paws",
    email: "paws@ngo.org",
  };

  const mockServices = [
    {
      id: "srv-1",
      name: "Dog Boarding",
      slug: "dog-boarding",
      description: "Overnight dog care",
    },
    {
      id: "srv-2",
      name: "Dog Training",
      slug: "dog-training",
      description: "Professional dog training",
      coursesOrder: "course-1,course-2",
    },
  ];

  it("should render empty state message when servicesList is empty", () => {
    render(
      <OrgServicesTab
        organization={mockOrg}
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

  it("should render service items with active badge for enabled services", () => {
    render(
      <OrgServicesTab
        organization={mockOrg}
        servicesList={mockServices}
        isDashboard={false}
        enabledServiceIds={["srv-1"]}
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

    expect(screen.getByText("Dog Boarding")).toBeDefined();
    expect(screen.getByText("Dog Training")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("should trigger onToggleService when switch is clicked", () => {
    const handleToggleService = vi.fn();

    render(
      <OrgServicesTab
        organization={mockOrg}
        servicesList={mockServices}
        isDashboard={false}
        enabledServiceIds={[]}
        enabledCourseIds={[]}
        expandedIds={[]}
        togglingServiceId={null}
        togglingCourseId={null}
        isPending={false}
        onToggleService={handleToggleService}
        onToggleCourse={() => {}}
        onToggleExpand={() => {}}
      />
    );

    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[0]);

    expect(handleToggleService).toHaveBeenCalledWith("srv-1");
  });

  it("should trigger onToggleExpand when expand chevron is clicked on Dog Training", () => {
    const handleToggleExpand = vi.fn();

    render(
      <OrgServicesTab
        organization={mockOrg}
        servicesList={mockServices}
        isDashboard={false}
        enabledServiceIds={["srv-2"]}
        enabledCourseIds={[]}
        expandedIds={[]}
        togglingServiceId={null}
        togglingCourseId={null}
        isPending={false}
        onToggleService={() => {}}
        onToggleCourse={() => {}}
        onToggleExpand={handleToggleExpand}
      />
    );

    const expandBtn = screen.getByTitle("Expand courses");
    fireEvent.click(expandBtn);

    expect(handleToggleExpand).toHaveBeenCalledWith("srv-2");
  });

  it("should render nested courses when expanded", () => {
    render(
      <OrgServicesTab
        organization={mockOrg}
        servicesList={mockServices}
        isDashboard={false}
        enabledServiceIds={["srv-2"]}
        enabledCourseIds={["course-1"]}
        expandedIds={["srv-2"]}
        togglingServiceId={null}
        togglingCourseId={null}
        isPending={false}
        onToggleService={() => {}}
        onToggleCourse={() => {}}
        onToggleExpand={() => {}}
      />
    );

    expect(screen.getByText("Puppy School")).toBeDefined();
    expect(screen.getByText("Basic Obedience")).toBeDefined();
  });
});
