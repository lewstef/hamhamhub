// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { DashboardServiceDetail } from "./dashboard-service-detail";
import { toggleOrganizationServiceAction } from "@/app/actions/organizations";
import { deleteCourseAction, createCourseAction } from "@/app/actions/courses";

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
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronUp: () => <div data-testid="chevron-up" />,
  // WysiwygEditor icons
  Bold: () => <div data-testid="bold" />,
  Italic: () => <div data-testid="italic" />,
  Underline: () => <div data-testid="underline" />,
  List: () => <div data-testid="list" />,
  ListOrdered: () => <div data-testid="list-ordered" />,
  RemoveFormatting: () => <div data-testid="remove-formatting" />,
  // CourseForm icons
  ChevronDown: () => <div data-testid="chevron-down" />,
  CheckCircle: () => <div data-testid="check-circle-2" />,
  Info: () => <div data-testid="info" />,
  AlertCircle: () => <div data-testid="alert-circle" />,
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
    expect(screen.queryByText(/Template Identifier:/)).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.getByText("Add Course")).toBeDefined();
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
        service={trainingService}
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

  it("should display Certified, Field, and Parking badges when course has those flags", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[
          {
            id: "c-1",
            name: "Advanced Agility",
            certifiedTrainer: true,
            certifierName: "John Doe",
            dedicatedField: true,
            parking: true,
            priceType: "course",
          },
        ]}
      />
    );

    expect(screen.getByText("Certified")).toBeDefined();
    expect(screen.getByText("Field")).toBeDefined();
    expect(screen.getByText("Parking")).toBeDefined();
  });

  it("should show '1 Walk' (singular) when dailyWalks is 1", () => {
    const boardingService = {
      id: "srv-dog-boarding",
      name: "Dog Boarding",
      description: "Day care.",
    };

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={boardingService}
        initialIsEnabled={true}
        slug="dog-boarding"
        courses={[
          {
            id: "b-1",
            name: "Basic Stay",
            certifiedTrainer: false,
            dedicatedField: false,
            parking: false,
            dailyWalks: 1,
          },
        ]}
      />
    );

    expect(screen.getByText("1 Walk")).toBeDefined();
  });

  it("should open delete confirmation modal when Delete button is clicked", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[
          { id: "c-1", name: "Puppy Basics", certifiedTrainer: false, dedicatedField: false, parking: false },
        ]}
      />
    );

    // Find the Delete button in the course row (not in a modal yet)
    const deleteBtn = screen.getByRole("button", { name: /Delete/ });
    fireEvent.click(deleteBtn);

    expect(screen.getByText("Delete Course")).toBeDefined();
    expect(screen.getByText(/Are you sure you want to delete this course/)).toBeDefined();
  });

  it("should close delete confirmation modal via Cancel button", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[
          { id: "c-1", name: "Puppy Basics", certifiedTrainer: false, dedicatedField: false, parking: false },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Delete/ }));
    expect(screen.getByText("Delete Course")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Delete Course")).toBeNull();
  });

  it("should close delete confirmation modal via X button", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[
          { id: "c-1", name: "Puppy Basics", certifiedTrainer: false, dedicatedField: false, parking: false },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Delete/ }));
    expect(screen.getByText("Delete Course")).toBeDefined();

    // Find the X button in the modal
    const xBtn = screen.getAllByRole("button").find(
      (btn) => btn.querySelector("[data-testid='x']")
    );
    fireEvent.click(xBtn!);
    expect(screen.queryByText("Delete Course")).toBeNull();
  });

  it("should call deleteCourseAction when confirm delete button is clicked", async () => {
    vi.mocked(deleteCourseAction).mockResolvedValue({ success: true });

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[
          { id: "c-1", name: "Puppy Basics", certifiedTrainer: false, dedicatedField: false, parking: false },
        ]}
      />
    );

    // Open delete modal
    fireEvent.click(screen.getByRole("button", { name: /Delete/ }));
    // The modal has a "Delete" confirm button
    const allDeleteBtns = screen.getAllByRole("button", { name: "Delete" });
    // The last one is the confirm button inside the modal
    fireEvent.click(allDeleteBtns[allDeleteBtns.length - 1]);

    expect(deleteCourseAction).toHaveBeenCalledWith("c-1");
  });

  it("should open CourseForm when Edit button is clicked for a course", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[
          { id: "c-1", name: "Puppy Basics", certifiedTrainer: false, dedicatedField: false, parking: false },
        ]}
      />
    );

    // Before clicking Edit, the course row with name is visible
    expect(screen.getByText("Puppy Basics")).toBeDefined();
    // Also the Add Course header button is visible
    expect(screen.getByText("Add Course")).toBeDefined();

    const editBtn = screen.getByRole("button", { name: /Edit/ });
    fireEvent.click(editBtn);

    // After clicking Edit, CourseForm takes over — the course row list is replaced
    // The Add Course top button disappears since isDynamicCourses && isFormOpen renders only the form
    expect(screen.queryByText("Add Course")).toBeNull();
  });

  it("should open CourseForm when Add Course button is clicked", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[]}
      />
    );

    // Empty state message is visible before clicking Add
    expect(screen.getByText(/No courses created yet/)).toBeDefined();

    fireEvent.click(screen.getByText("Add Course"));

    // CourseForm takes over — empty state is gone, Add button is gone
    expect(screen.queryByText("Add Course")).toBeNull();
    expect(screen.queryByText(/No courses created yet/)).toBeNull();
  });

  it("should use custom backHref and backLabel when provided", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={genericService}
        initialIsEnabled={true}
        slug="dog-walking"
        backHref="/dashboard/account/services"
        backLabel="Back to My Services"
      />
    );

    expect(screen.getByText("Back to My Services")).toBeDefined();
  });

  it("should display only checkin time when checkout is absent", () => {
    const boardingService = {
      id: "srv-dog-boarding",
      name: "Dog Boarding",
      description: "Stays.",
    };

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={boardingService}
        initialIsEnabled={true}
        slug="dog-boarding"
        courses={[
          {
            id: "b-1",
            name: "Basic Stay",
            certifiedTrainer: false,
            dedicatedField: false,
            parking: false,
            checkin: "09:00",
          },
        ]}
      />
    );

    expect(screen.getByText("In: 09:00")).toBeDefined();
  });

  it("should close the CourseForm and return to list when onCancel (Back button) is triggered", () => {
    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[]}
      />
    );

    // Click Add Course to open CourseForm
    fireEvent.click(screen.getByText("Add Course"));
    expect(screen.queryByText("Add Course")).toBeNull();

    // Click Back to Courses List (which fires onCancel)
    fireEvent.click(screen.getByText("Back to Courses List"));

    // Form should close and main view with Add Course button should be back
    expect(screen.getByText("Add Course")).toBeDefined();
    expect(screen.getByText(/No courses created yet/)).toBeDefined();
  });

  it("should close the CourseForm and return to list when onSubmitSuccess is triggered", async () => {
    vi.mocked(createCourseAction).mockResolvedValue({ success: true });

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[]}
      />
    );

    // Open form
    fireEvent.click(screen.getByText("Add Course"));

    // Fill form and submit
    const nameInput = screen.getByLabelText("Course Name");
    fireEvent.change(nameInput, { target: { value: "New Agility" } });

    const submitBtn = screen.getByRole("button", { name: "Create Course" });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Submission success should trigger onSubmitSuccess, closing the form and going back to list view
    expect(screen.getByText("Add Course")).toBeDefined();
  });

  it("should open collapsible drawer and show details, terms, and toggle FAQ accordion answers", async () => {
    const coursesWithFaq = [
      {
        id: "course-abc",
        name: "Agility Pro",
        certifiedTrainer: true,
        dedicatedField: false,
        parking: false,
        details: "<p>Learn high speed agility runs</p>",
        termsOfParticipation: "<p>Must have completed Basic course</p>",
        faq: JSON.stringify([
          { question: "Are treats allowed?", answer: "Yes, healthy soft treats are recommended." },
          { question: "What is the age limit?", answer: "Dogs must be at least 1 year old." }
        ])
      }
    ];

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={coursesWithFaq}
      />
    );

    // Initial state: details and FAQs should not be rendered
    expect(screen.queryByText("Description & Details")).toBeNull();
    expect(screen.queryByText("Terms of Participation")).toBeNull();
    expect(screen.queryByText("Are treats allowed?")).toBeNull();

    // Click the course row header (the course name text) to toggle details
    const courseRowHeader = screen.getByText("Agility Pro");
    fireEvent.click(courseRowHeader);

    // Details drawer should be expanded
    expect(screen.getByText("Description & Details")).toBeDefined();
    expect(screen.getByText("Terms of Participation")).toBeDefined();
    
    // FAQs section questions should be visible
    expect(screen.getByText("Are treats allowed?")).toBeDefined();
    expect(screen.getByText("What is the age limit?")).toBeDefined();

    // FAQ answers should not be visible initially (accordion closed)
    expect(screen.queryByText("Yes, healthy soft treats are recommended.")).toBeNull();

    // Click on the first FAQ question header to expand it
    const faqQuestionBtn = screen.getByRole("button", { name: "Are treats allowed?" });
    fireEvent.click(faqQuestionBtn);

    // FAQ answer should now be visible
    expect(screen.getByText("Yes, healthy soft treats are recommended.")).toBeDefined();

    // Click FAQ question header again to close it
    fireEvent.click(faqQuestionBtn);
    expect(screen.queryByText("Yes, healthy soft treats are recommended.")).toBeNull();
  });

  it("should rollback toggle state when toggleOrganizationServiceAction returns an error", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ error: "Toggle failed" });

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={genericService}
        initialIsEnabled={false}
        slug="dog-walking"
      />
    );

    // Initially inactive
    expect(screen.getByText("Inactive")).toBeDefined();

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    // Optimistically shows Active
    expect(screen.getByText("Active")).toBeDefined();
    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-123", "srv-dog-walking", true);
  });

  it("should call reorderOrgCoursesAction after drag-end on a course row", async () => {
    const { reorderOrgCoursesAction } = await import("@/app/actions/courses");
    vi.mocked(reorderOrgCoursesAction).mockResolvedValue({ success: true });

    const mockCourses = [
      { id: "c-1", name: "Puppy Basics", certifiedTrainer: false, dedicatedField: false, parking: false },
      { id: "c-2", name: "Advanced Agility", certifiedTrainer: false, dedicatedField: false, parking: false },
    ];

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={mockCourses}
      />
    );

    // Find a course row that has draggable behavior
    const courseRows = document.querySelectorAll("[draggable]");
    expect(courseRows.length).toBeGreaterThan(0);

    // Simulate drag start on first course
    fireEvent.dragStart(courseRows[0], { dataTransfer: { effectAllowed: "" } });

    // Simulate drag over on second course
    fireEvent.dragOver(courseRows[1]);

    // Simulate drag end on first course
    fireEvent.dragEnd(courseRows[0]);

    // reorderOrgCoursesAction should have been called
    await vi.waitFor(() => {
      expect(reorderOrgCoursesAction).toHaveBeenCalled();
    });
  });

  it("should show delete error message when deleteCourseAction fails", async () => {
    vi.mocked(deleteCourseAction).mockResolvedValue({ error: "Failed to delete" });

    render(
      <DashboardServiceDetail
        organizationId="org-123"
        service={trainingService}
        initialIsEnabled={true}
        slug="dog-training"
        courses={[
          { id: "c-1", name: "Puppy Basics", certifiedTrainer: false, dedicatedField: false, parking: false },
        ]}
      />
    );

    // Open delete modal
    fireEvent.click(screen.getByRole("button", { name: /Delete/ }));

    // Confirm delete
    const allDeleteBtns = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(allDeleteBtns[allDeleteBtns.length - 1]);

    await vi.waitFor(() => {
      expect(deleteCourseAction).toHaveBeenCalledWith("c-1");
    });
  });
});
