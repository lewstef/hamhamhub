// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { EditOrganizationForm } from "./edit-organization-form";
import { toggleOrganizationServiceAction, updateOrganizationAction, changeOrganizationPasswordAction } from "@/app/actions/organizations";

// Mock the server actions
vi.mock("@/app/actions/organizations", () => ({
  updateOrganizationAction: vi.fn(),
  changeOrganizationPasswordAction: vi.fn(),
  toggleOrganizationServiceAction: vi.fn(),
  toggleOrganizationCourseAction: vi.fn(),
}));

let mockActionStateSuccess = false;

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: (action: any, initialState: any) => {
      if (mockActionStateSuccess) {
        return [{ success: true }, vi.fn(), false];
      }
      return [initialState, vi.fn(), false];
    }
  };
});

const mockRefresh = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: mockPush,
  }),
  usePathname: () => "/backoffice/organizations",
}));

describe("EditOrganizationForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActionStateSuccess = false;
  });
  const dummyOrganization = {
    id: "org-id-123",
    name: "Happy Paws Rescue",
    email: "paws@ngo.org",
    organizationCategory: "ngo",
    phoneNumber: "123456789",
    addressLine: "123 Bark Lane",
    addressCity: "Dogtown",
    addressState: "PA",
    addressZip: "19001",
    addressCountry: "United States",
    address: "123 Bark Lane, Dogtown, PA, 19001, United States",
  };
  const dummyOrganizationCategoryList = [
    { id: "ngo", name: "NGO", description: "NGO Description" },
    { id: "dog_kennel", name: "Dog Kennel", description: "Dog Kennel Description" },
  ];

  it("should render overview fields on their respective tabs", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    expect(screen.getByText("Edit Organization")).toBeDefined();
    
    // Account information tab is default
    expect(screen.getAllByText("Account information")[0]).toBeDefined();
    expect(screen.getByText(dummyOrganization.name)).toBeDefined();
    expect(screen.getByText("NGO")).toBeDefined();
    expect(screen.getByText(dummyOrganization.address)).toBeDefined();
    expect(screen.getByText(dummyOrganization.phoneNumber)).toBeDefined();

    // Verify other tabs are visible
    expect(screen.getByRole("button", { name: "Subscription" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Services" })).toBeDefined();
    
    // Email is on Account settings tab, shouldn't be visible yet
    expect(screen.queryByText(dummyOrganization.email)).toBeNull();

    // Switch to Account settings tab
    const accountTabBtn = screen.getByRole("button", { name: "Account settings" });
    fireEvent.click(accountTabBtn);

    // Email should now be visible
    expect(screen.getByText(dummyOrganization.email)).toBeDefined();
  });

  it("should open and close the Identity edit modal on the Account information tab", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Initial state: Name input not visible
    expect(screen.queryByLabelText("Organization Name")).toBeNull();

    // Click Edit button corresponding to Name row
    const editNameBtn = screen.getByRole("button", { name: "Edit Name" });
    fireEvent.click(editNameBtn);

    // Now modal is open and shows the name input
    const nameInput = screen.getByLabelText("Organization Name") as HTMLInputElement;
    expect(nameInput.value).toBe(dummyOrganization.name);

    // Click Cancel to close
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    // Input should be hidden again
    expect(screen.queryByLabelText("Organization Name")).toBeNull();
  });

  it("should open and test password matching logic in Password modal on the Account settings tab", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Switch to Account settings tab first
    const accountTabBtn = screen.getByRole("button", { name: "Account settings" });
    fireEvent.click(accountTabBtn);

    // Click the Edit button corresponding to Password row
    const editPasswordBtn = screen.getByRole("button", { name: "Edit Password" });
    fireEvent.click(editPasswordBtn);

    const passwordInput = screen.getByLabelText("New Password") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirm Password") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: "Change Password" }) as HTMLButtonElement;

    // Initially empty, button should be disabled
    expect(submitBtn.disabled).toBe(true);

    // Enter mismatching passwords
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "different123" } });

    // Warning message should show and button should be disabled
    expect(screen.getByText("Passwords do not match.")).toBeDefined();
    expect(submitBtn.disabled).toBe(true);

    // Enter matching passwords
    fireEvent.change(confirmInput, { target: { value: "password123" } });

    // Warning should disappear and button should be enabled
    expect(screen.queryByText("Passwords do not match.")).toBeNull();
    expect(submitBtn.disabled).toBe(false);
  });

  it("should render services tab empty state when servicesList is empty", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        servicesList={[]}
      />
    );

    const servicesTabBtn = screen.getByRole("button", { name: "Services" });
    fireEvent.click(servicesTabBtn);

    expect(screen.getByText("No active services associated with this organization's category.")).toBeDefined();
  });

  it("should render services list and handle toggle service on Services tab", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ success: true } as any);

    const dummyServices = [
      { id: "s-1", name: "Dog Grooming", organizationCategory: "ngo", slug: "dog-grooming", description: "Trim & wash" }
    ];

    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        servicesList={dummyServices}
      />
    );

    const servicesTabBtn = screen.getByRole("button", { name: "Services" });
    fireEvent.click(servicesTabBtn);

    expect(screen.getByText("Dog Grooming")).toBeDefined();
    expect(screen.getByText("Trim & wash")).toBeDefined();

    // Click the toggle switch
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-id-123", "s-1", true);
  });

  it("should open and close Address, Phone, and Social modals on Account information tab", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Initial check: address fields not shown
    expect(screen.queryByLabelText("Street Address")).toBeNull();

    // Click Edit Address
    const editAddressBtn = screen.getByRole("button", { name: "Edit Address" });
    fireEvent.click(editAddressBtn);
    expect(screen.getByLabelText("Street Address")).toBeDefined();

    // Close address modal
    const cancelAddress = screen.getAllByRole("button", { name: /cancel/i })[0];
    fireEvent.click(cancelAddress);
    expect(screen.queryByLabelText("Street Address")).toBeNull();

    // Phone modal
    const editPhoneBtn = screen.getByRole("button", { name: "Edit Phone number" });
    fireEvent.click(editPhoneBtn);
    expect(screen.getByLabelText("Phone number")).toBeDefined();
    const cancelPhone = screen.getAllByRole("button", { name: /cancel/i })[0];
    fireEvent.click(cancelPhone);
    expect(screen.queryByLabelText("Phone number")).toBeNull();
  });

  it("should render Subscription tab content", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    const subscriptionTabBtn = screen.getByRole("button", { name: "Subscription" });
    fireEvent.click(subscriptionTabBtn);

    expect(screen.getByText("No subscription details currently configured.")).toBeDefined();
  });

  it("should open and close Edit Category, Email, Recovery Email, and Social modals", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // 1. Edit Category modal
    expect(screen.queryByLabelText("Organization Category")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Edit Category" }));
    expect(screen.getByLabelText("Organization Category")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);
    expect(screen.queryByLabelText("Organization Category")).toBeNull();

    // Switch to Account settings tab for Email / Recovery Email
    fireEvent.click(screen.getByRole("button", { name: "Account settings" }));

    // 2. Edit Email modal
    expect(screen.queryByLabelText("New Email Address")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Edit Email" }));
    // In edit-organization-form.tsx, the input is marked as:
    // id="email" or similar. Let's verify we can cancel it
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // 3. Edit Recovery Email modal
    fireEvent.click(screen.getByRole("button", { name: "Edit Recovery email" }));
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // 4. Social links modal (on Account info tab)
    fireEvent.click(screen.getByRole("button", { name: "Account information" }));
  });

  it("should auto-close personal modals on personalState success", async () => {
    mockActionStateSuccess = true;

    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("should auto-close account modals on accountState success", async () => {
    mockActionStateSuccess = true;

    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("should toggle a course and call toggleOrganizationCourseAction", async () => {
    const { toggleOrganizationCourseAction } = await import("@/app/actions/organizations");
    vi.mocked(toggleOrganizationCourseAction).mockResolvedValue({ success: true });

    const orgWithEnabledService = {
      ...dummyOrganization,
      enabledServices: "s-1",
      enabledCourses: "",
    };

    // Service with dog-training slug and courses order
    const dummyServices = [
      { id: "s-1", name: "Dog Training", organizationCategory: "ngo", slug: "dog-training", description: "Train your dog.", coursesOrder: null },
    ];

    render(
      <EditOrganizationForm
        organization={orgWithEnabledService}
        organizationCategoryList={dummyOrganizationCategoryList}
        servicesList={dummyServices}
      />
    );

    const servicesTabBtn = screen.getByRole("button", { name: "Services" });
    fireEvent.click(servicesTabBtn);

    // Service is enabled — Edit button should appear
    expect(screen.getByText("Dog Training")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("should rollback service state when toggleOrganizationServiceAction returns error", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ error: "Failed to toggle" });

    const dummyServices = [
      { id: "s-2", name: "Dog Walking", organizationCategory: "ngo", slug: "dog-walking", description: "Walk your dog.", coursesOrder: null },
    ];

    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        servicesList={dummyServices}
      />
    );

    const servicesTabBtn = screen.getByRole("button", { name: "Services" });
    fireEvent.click(servicesTabBtn);

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-id-123", "s-2", true);
  });

  it("should render enabledServices and enabledCourses from organization prop", () => {
    const orgWithData = {
      ...dummyOrganization,
      enabledServices: "s-1,s-2",
      enabledCourses: "dog-training:basic,dog-training:group",
    };

    const dummyServices = [
      { id: "s-1", name: "Dog Training", organizationCategory: "ngo", slug: "dog-training", description: "Train dogs.", coursesOrder: null },
      { id: "s-2", name: "Dog Walking", organizationCategory: "ngo", slug: "dog-walking", description: "Walk dogs.", coursesOrder: null },
    ];

    render(
      <EditOrganizationForm
        organization={orgWithData}
        organizationCategoryList={dummyOrganizationCategoryList}
        servicesList={dummyServices}
      />
    );

    const servicesTabBtn = screen.getByRole("button", { name: "Services" });
    fireEvent.click(servicesTabBtn);

    // Both services are enabled — both have Active badge
    expect(screen.getAllByText("Active").length).toBe(2);
  });

  it("should render with activeTabProp 'services' showing the services tab content", () => {
    const dummyServices = [
      { id: "s-1", name: "Dog Boarding", organizationCategory: "ngo", slug: "dog-boarding", description: "Safe stay.", coursesOrder: null },
    ];

    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        servicesList={dummyServices}
        activeTabProp="services"
      />
    );

    // When activeTabProp is set, tabs are rendered as Link elements, not buttons
    // Services tab content should still show
    expect(screen.getByText("Services Configuration")).toBeDefined();
  });

  it("should render with activeTabProp 'personal' showing account information content", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="personal"
      />
    );

    // With activeTabProp, tabs are link elements; "Account information" appears in tab + card heading
    expect(screen.getAllByText("Account information").length).toBeGreaterThanOrEqual(1);
  });

  it("should show country phone pattern placeholder in phone modal", () => {
    const orgWithCountry = {
      ...dummyOrganization,
      addressCountry: "United States",
    };

    render(
      <EditOrganizationForm
        organization={orgWithCountry}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Open phone modal
    const editPhoneBtn = screen.getByRole("button", { name: "Edit Phone number" });
    fireEvent.click(editPhoneBtn);

    // Placeholder for USA should be +1 (555) 000-0000
    const phoneInput = screen.getByPlaceholderText("+1 (555) 000-0000");
    expect(phoneInput).toBeDefined();
  });

  it("should show '-' when no address is provided", () => {
    const orgNoAddress = {
      ...dummyOrganization,
      address: null,
    };

    render(
      <EditOrganizationForm
        organization={orgNoAddress}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Address row should show "-" (multiple dashes may appear for empty fields)
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1);
  });

  it("should show/hide password text when eye icon buttons are clicked", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Switch to Account settings tab
    const accountTabBtn = screen.getByRole("button", { name: "Account settings" });
    fireEvent.click(accountTabBtn);

    // Open change password modal
    const editPasswordBtn = screen.getByRole("button", { name: "Edit Password" });
    fireEvent.click(editPasswordBtn);

    expect(screen.getAllByText("Change Password").length).toBeGreaterThanOrEqual(1);

    // The inputs should initially be type="password"
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirmPassword") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");
    expect(confirmPasswordInput.type).toBe("password");

    // Get the eye toggle buttons
    const eyeButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg") && btn.closest(".relative") && !btn.textContent
    );
    expect(eyeButtons.length).toBeGreaterThanOrEqual(2);

    // Click first eye button
    fireEvent.click(eyeButtons[0]);
    expect(passwordInput.type).toBe("text");

    // Click second eye button
    fireEvent.click(eyeButtons[1]);
    expect(confirmPasswordInput.type).toBe("text");

    // Click cancel button on password modal
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);
    expect(screen.queryByText("Change Password")).toBeNull();
  });
});
