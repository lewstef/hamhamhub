// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardServiceDetail } from "./dashboard-service-detail";
import { toggleOrganizationServiceAction } from "@/app/actions/organizations";

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left" />,
  CheckCircle2: () => <div data-testid="check-circle" />,
  XCircle: () => <div data-testid="x-circle" />,
  Plus: () => <div data-testid="plus" />,
  Edit2: () => <div data-testid="edit" />,
  Trash2: () => <div data-testid="trash" />,
  Award: () => <div data-testid="award" />,
  MapPin: () => <div data-testid="map-pin" />,
  Car: () => <div data-testid="car" />,
  X: () => <div data-testid="x" />,
  GripVertical: () => <div data-testid="grip" />,
  Pill: () => <div data-testid="pill" />,
  Footprints: () => <div data-testid="footprints" />,
  Camera: () => <div data-testid="camera" />,
  Utensils: () => <div data-testid="utensils" />,
}));

vi.mock("@/app/actions/organizations", () => ({
  toggleOrganizationServiceAction: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/app/actions/courses", () => ({
  deleteCourseAction: vi.fn(),
  createCourseAction: vi.fn(),
  updateCourseAction: vi.fn(),
  reorderOrgCoursesAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
  usePathname: () => "/dashboard/services/dog-walking",
}));

describe("DashboardServiceDetail Component", () => {
  const genericService = {
    id: "srv-dog-walking",
    name: "Dog Walking",
    description: "Professional walking for all breeds.",
  };

  const trainingService = {
    id: "srv-dog-training",
    name: "Dog Training",
    description: "Professional training for all breeds.",
  };

  it("should render service details correctly when active", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={genericService}
        initialIsEnabled={true}
        slug="dog-walking"
      />
    );

    expect(screen.getByText("Dog Walking")).toBeDefined();
    expect(screen.getByText(/Template Identifier: srv-dog-walking/)).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("should render service details correctly when inactive", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={genericService}
        initialIsEnabled={false}
        slug="dog-walking"
      />
    );

    expect(screen.getByText("Inactive")).toBeDefined();
  });

  it("should call toggleOrganizationServiceAction when toggle switch is clicked", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ success: true });

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={genericService}
        initialIsEnabled={false}
        slug="dog-walking"
      />
    );

    const toggleBtn = screen.getByRole("switch");
    fireEvent.click(toggleBtn);

    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-123", "srv-dog-walking", true);
  });

  it("should hide toggle button and identifier description for Dog Training, and render Add Course button", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[]}
      />
    );

    expect(screen.getByText("Dog Training")).toBeDefined();
    // Identifier should not be rendered
    expect(screen.queryByText(/Template Identifier:/)).toBeNull();
    // Toggle switch should not be rendered
    expect(screen.queryByRole("switch")).toBeNull();
    // Add Course button should be rendered
    expect(screen.getByText("Add Course")).toBeDefined();
    // Empty state message should be visible
    expect(screen.getByText(/No courses created yet/)).toBeDefined();
  });

  it("should render Dog Sports Training service details correctly, showing Add Dog Sport and correct empty state", () => {
    const sportService = {
      id: "srv-sport-dog-training",
      name: "Dog Sports Training",
      description: "Advanced training for dog sports.",
    };

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={sportService}
        initialIsEnabled={true}
        slug="sport-dog-training"
        courses={[]}
      />
    );

    expect(screen.getByText("Dog Sports Training")).toBeDefined();
    expect(screen.queryByText(/Template Identifier:/)).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.getByText("Add Dog Sport")).toBeDefined();
    expect(screen.getByText(/No dog sports created yet/)).toBeDefined();
  });

  it("should display pricing formatted with suffix according to priceType", () => {
    const trainingServiceWithCourses = {
      id: "srv-dog-training",
      name: "Dog Training",
      description: "Behavioral training.",
    };

    const mockCourses = [
      {
        id: "c-1",
        name: "Puppy Basics",
        certifiedTrainer: false,
        dedicatedField: false,
        parking: false,
        price: "$100",
        priceType: "course",
      },
      {
        id: "c-2",
        name: "Agility Pro",
        certifiedTrainer: false,
        dedicatedField: false,
        parking: false,
        price: "$50",
        priceType: "month",
      },
    ];

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingServiceWithCourses}
        initialIsEnabled={true}
        slug="dog-training"
        courses={mockCourses}
      />
    );

    expect(screen.getByText("$100 / course")).toBeDefined();
    expect(screen.getByText("$50 / month")).toBeDefined();
  });

  it("should hide toggle button and identifier description for Dog Boarding", () => {
    const boardingService = {
      id: "srv-dog-boarding",
      name: "Dog Boarding",
      description: "Overnight stays, boarding services, and day care facilities.",
    };

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={boardingService}
        initialIsEnabled={true}
        slug="dog-boarding"
      />
    );

    expect(screen.getByText("Dog Boarding")).toBeDefined();
    expect(screen.queryByText(/Template Identifier:/)).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("should format pricing with night/day/service suffix for Boarding services", () => {
    const boardingService = {
      id: "srv-dog-boarding",
      name: "Dog Boarding",
      description: "Overnight stays, boarding services, and day care facilities.",
    };

    const mockBoardingOfferings = [
      {
        id: "b-1",
        name: "Standard Room",
        certifiedTrainer: false,
        dedicatedField: false,
        parking: true,
        price: "120 RON",
        priceType: "night",
      },
      {
        id: "b-2",
        name: "VIP Suite",
        certifiedTrainer: false,
        dedicatedField: false,
        parking: true,
        price: "250 RON",
        priceType: "day",
      },
    ];

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={boardingService}
        initialIsEnabled={true}
        slug="dog-boarding"
        courses={mockBoardingOfferings}
      />
    );

    expect(screen.getByText("120 RON / night")).toBeDefined();
    expect(screen.getByText("250 RON / day")).toBeDefined();
  });

  it("should display custom badges (Meds, Walks, Updates, Meals) for Boarding services", () => {
    const boardingService = {
      id: "srv-dog-boarding",
      name: "Dog Boarding",
      description: "Overnight stays, boarding services, and day care facilities.",
    };

    const mockBoardingOfferings = [
      {
        id: "b-1",
        name: "Standard Room",
        certifiedTrainer: false,
        dedicatedField: false,
        parking: true,
        price: "120 RON",
        priceType: "night",
        medicationAdministration: true,
        medicationAdministrationDetails: "Twice daily",
        dailyWalks: 3,
        ownerCommunication: true,
        ownerCommunicationDetails: "WhatsApp photos",
        personalizedMealPlan: true,
        personalizedMealPlanDetails: "BARF diet",
        checkin: "08:00",
        checkout: "18:00",
      },
    ];

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={boardingService}
        initialIsEnabled={true}
        slug="dog-boarding"
        courses={mockBoardingOfferings}
      />
    );

    expect(screen.getByText("Meds Administered")).toBeDefined();
    expect(screen.getByText("3 Walks")).toBeDefined();
    expect(screen.getByText("Updates Sent")).toBeDefined();
    expect(screen.getByText("Meal Plan")).toBeDefined();
    expect(screen.getByText("In: 08:00 • Out: 18:00")).toBeDefined();
  });
});

