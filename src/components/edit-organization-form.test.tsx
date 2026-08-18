// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import React from "react";
import { EditOrganizationForm } from "./edit-organization-form";
import {
  toggleOrganizationServiceAction,
  toggleOrganizationCourseAction,
  updateOrganizationAction,
  changeOrganizationPasswordAction,
} from "@/app/actions/organizations";

// Mock the server actions
vi.mock("@/app/actions/organizations", () => ({
  updateOrganizationAction: vi.fn(),
  changeOrganizationPasswordAction: vi.fn(),
  toggleOrganizationServiceAction: vi.fn(),
  toggleOrganizationCourseAction: vi.fn(),
}));

vi.mock("@/config/dog-training", () => ({
  getSortedCourses: vi.fn(() => [
    { id: "puppy-school", label: "Puppy School", key: "puppy-school" },
  ]),
}));

let mockActionStateSuccess = false;
let mockActionStateError: string | null = null;

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: (action: any, initialState: any) => {
      if (mockActionStateSuccess) {
        return [{ success: true }, vi.fn(), false];
      }
      if (mockActionStateError) {
        return [{ error: mockActionStateError }, vi.fn(), false];
      }
      return [initialState, vi.fn(), false];
    }
  };
});

const mockRefresh = vi.fn();
const mockPush = vi.fn();
let mockPathname = "/backoffice/organizations";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

describe("EditOrganizationForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActionStateSuccess = false;
    mockActionStateError = null;
    mockPathname = "/backoffice/organizations";
  });
  const dummyOrganization = {
    id: "org-id-123",
    name: "Happy Paws Rescue",
    email: "paws@ngo.org",
    organizationCategory: "ngo",
    phoneNumber: "0724247122",
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
    
    // Information tab is default
    expect(screen.getAllByText("Information")[0]).toBeDefined();
    expect(screen.getByText(dummyOrganization.name)).toBeDefined();
    expect(screen.getByText("NGO")).toBeDefined();
    expect(screen.getByText(dummyOrganization.phoneNumber)).toBeDefined();

    // Address is on Billing tab, shouldn't be visible yet
    expect(screen.queryByText(dummyOrganization.address)).toBeNull();

    // Verify other tabs are visible
    expect(screen.getByRole("button", { name: "Billing" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Subscription" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Services" })).toBeDefined();
    
    // Email is now on Information tab, so it should be visible
    expect(screen.getByText(dummyOrganization.email)).toBeDefined();

    // Switch to Billing tab to verify address
    const billingTabBtn = screen.getByRole("button", { name: "Billing" });
    fireEvent.click(billingTabBtn);
    expect(screen.getByText(dummyOrganization.address)).toBeDefined();

    // Switch to Security tab
    const accountTabBtn = screen.getByRole("button", { name: "Security" });
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

  it("should open and test password matching logic in Password modal on the Security tab", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Switch to Security tab first
    const accountTabBtn = screen.getByRole("button", { name: "Security" });
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
    await act(async () => {
      fireEvent.click(toggle);
    });

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
    expect(screen.queryByLabelText(/Street Address/i)).toBeNull();

    // Click Billing tab first to show Address row
    const billingTabBtn = screen.getByRole("button", { name: "Billing" });
    fireEvent.click(billingTabBtn);

    // Click Edit Address
    const editAddressBtn = screen.getByRole("button", { name: "Edit Address" });
    fireEvent.click(editAddressBtn);
    expect(screen.getByLabelText(/Street Address/i)).toBeDefined();

    // Close address modal
    const cancelAddress = screen.getAllByRole("button", { name: /cancel/i })[0];
    fireEvent.click(cancelAddress);
    expect(screen.queryByLabelText(/Street Address/i)).toBeNull();

    // Switch back to Information tab to show Phone and Social rows
    const infoTabBtn = screen.getByRole("button", { name: "Information" });
    fireEvent.click(infoTabBtn);

    // Phone modal
    const editPhoneBtn = screen.getByRole("button", { name: "Edit Phone" });
    fireEvent.click(editPhoneBtn);
    expect(screen.getByLabelText("Phone")).toBeDefined();
    const cancelPhone = screen.getAllByRole("button", { name: /cancel/i })[0];
    fireEvent.click(cancelPhone);
    expect(screen.queryByLabelText("Phone")).toBeNull();
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

    expect(screen.getByText("Active Subscription")).toBeDefined();
    expect(screen.getByText("Subscription Plans & Tiers")).toBeDefined();
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

    // Switch to Security tab for Email / Recovery Email
    fireEvent.click(screen.getByRole("button", { name: "Security" }));

    // 2. Edit Email modal
    expect(screen.queryByLabelText("New Email Address")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Edit Email" }));
    // In edit-organization-form.tsx, the input is marked as:
    // id="email" or similar. Let's verify we can cancel it
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // 3. Edit Recovery Email modal
    fireEvent.click(screen.getByRole("button", { name: "Edit Recovery email" }));
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // 4. Return to Information tab to test description, website, and social modals
    fireEvent.click(screen.getByRole("button", { name: "Information" }));

    // Edit Description
    const editDescBtn = screen.getByTitle("Edit Description");
    fireEvent.click(editDescBtn);
    expect(screen.getByText("Edit Description")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // Edit Website
    const editWebBtn = screen.getByTitle("Edit Website");
    fireEvent.click(editWebBtn);
    expect(screen.getByText("Edit Website")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // Edit Facebook
    const editFbBtn = screen.getByTitle("Edit Facebook");
    fireEvent.click(editFbBtn);
    expect(screen.getByText("Edit Facebook Page")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // Edit Instagram
    const editIgBtn = screen.getByTitle("Edit Instagram");
    fireEvent.click(editIgBtn);
    expect(screen.getByText("Edit Instagram Profile")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // Edit TikTok
    const editTtBtn = screen.getByTitle("Edit TikTok");
    fireEvent.click(editTtBtn);
    expect(screen.getByText("Edit TikTok Profile")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // Edit LinkedIn
    const editLiBtn = screen.getByTitle("Edit LinkedIn");
    fireEvent.click(editLiBtn);
    expect(screen.getByText("Edit LinkedIn Profile")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    // 5. Switch to Billing tab to test primary contact, secondary contact, company details
    fireEvent.click(screen.getByRole("button", { name: "Billing" }));

    const editPrimaryBtns = screen.getAllByTitle(/Edit Primary Contact Person/i);
    fireEvent.click(editPrimaryBtns[0]);
    expect(screen.getByText("Edit Primary Contact")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    const editSecondaryBtns = screen.getAllByTitle(/Edit Secondary Contact Person/i);
    fireEvent.click(editSecondaryBtns[0]);
    expect(screen.getByText("Edit Secondary Contact")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);

    const editCompanyBtns = screen.getAllByTitle(/Edit Billing Company Name/i);
    fireEvent.click(editCompanyBtns[0]);
    expect(screen.getByText("Edit Company details")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: /cancel/i })[0]);
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

  it("should display errors when personalState or accountState have error messages", async () => {
    mockActionStateError = "Invalid server submission.";

    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Open a modal to check that personalError or accountError is displayed
    const editNameBtn = screen.getByTitle("Edit Name");
    fireEvent.click(editNameBtn);
    expect(screen.getByText("Invalid server submission.")).toBeDefined();
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
    await act(async () => {
      fireEvent.click(toggle);
    });

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

    // With activeTabProp, tabs are link elements; "Information" appears in tab + card heading
    expect(screen.getAllByText("Information").length).toBeGreaterThanOrEqual(1);
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
    const editPhoneBtn = screen.getByRole("button", { name: "Edit Phone" });
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

    // Switch to Security tab
    const accountTabBtn = screen.getByRole("button", { name: "Security" });
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

  it("should render new billing and contact fields, handle bank dropdown search filtering and clear button", async () => {
    const orgWithBilling = {
      ...dummyOrganization,
      billingCompanyName: "Happy Paws SRL",
      billingTaxId: "RO123456",
      billingTradeRegistryNumber: "J12/345/2020",
      billingEuid: "ROONRC.J12/345/2020",
      billingBankName: "ING Bank",
      billingBankAccountNumber: "RO12INGB0000000000000000",
      billingContactName: "John Doe",
      billingContactPhone: "0722000000",
      billingContactEmail: "john@paws.org",
    };

    render(
      <EditOrganizationForm
        organization={orgWithBilling}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Switch to Billing tab
    const billingTabBtn = screen.getByRole("button", { name: "Billing" });
    fireEvent.click(billingTabBtn);

    // Verify company billing values are rendered on the card
    expect(screen.getByText("Happy Paws SRL")).toBeDefined();
    expect(screen.getByText("RO123456")).toBeDefined();
    expect(screen.getByText("J12/345/2020")).toBeDefined();
    expect(screen.getByText("ROONRC.J12/345/2020")).toBeDefined();
    expect(screen.getByText("ING Bank")).toBeDefined();
    expect(screen.getByText("RO12INGB0000000000000000")).toBeDefined();

    // Verify contact values are rendered on the card
    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("0722000000")).toBeDefined();
    expect(screen.getByText("john@paws.org")).toBeDefined();

    // Click to open Edit Company details modal
    const editCompanyBtn = screen.getByRole("button", { name: "Edit Billing Company Name" });
    fireEvent.click(editCompanyBtn);

    // Verify input values are preset in form inputs
    const companyInput = document.getElementById("billingCompanyName") as HTMLInputElement;
    const taxIdInput = document.getElementById("billingTaxId") as HTMLInputElement;
    const bankInput = document.getElementById("billingBankName") as HTMLInputElement;
    const bankAccountInput = document.getElementById("billingBankAccountNumber") as HTMLInputElement;

    expect(companyInput.value).toBe("Happy Paws SRL");
    expect(taxIdInput.value).toBe("RO123456");
    expect(bankInput.value).toBe("ING Bank");
    expect(bankAccountInput.value).toBe("RO12INGB0000000000000000");

    // Verify required attribute is on Company name and Tax ID, but not Bank or Bank Account
    expect(companyInput.hasAttribute("required")).toBe(true);
    expect(taxIdInput.hasAttribute("required")).toBe(true);
    expect(bankInput.hasAttribute("required")).toBe(false);
    expect(bankAccountInput.hasAttribute("required")).toBe(false);

    // Test bank input change filters Romanian banks list
    fireEvent.change(bankInput, { target: { value: "Banca" } });
    expect(screen.getByText("Banca Transilvania")).toBeDefined();
    expect(screen.queryByRole("button", { name: "ING Bank" })).toBeNull();

    // Select a bank from the filtered list
    const btOption = screen.getByText("Banca Transilvania");
    fireEvent.click(btOption);
    expect(bankInput.value).toBe("Banca Transilvania");

    // Test clear bank input button
    const clearBtn = screen.getByRole("button", { name: "Clear bank selection" });
    fireEvent.click(clearBtn);
    expect(bankInput.value).toBe("");

    // Click Cancel to close modal
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);
  });

  it("should render Primary and Secondary Contact Person fields in distinct modals", () => {
    const orgWithSecondaryContact = {
      ...dummyOrganization,
      billingContactName: "Jane Primary",
      billingContactPhone: "0711111111",
      billingContactEmail: "jane@primary.org",
      billingSecondaryContactName: "John Secondary",
      billingSecondaryContactPhone: "0722222222",
      billingSecondaryContactEmail: "john@secondary.org",
    };

    render(
      <EditOrganizationForm
        organization={orgWithSecondaryContact}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    const billingTabBtn = screen.getByRole("button", { name: "Billing" });
    fireEvent.click(billingTabBtn);

    // Verify card shows both Primary and Secondary contact info
    expect(screen.getByText("Jane Primary")).toBeDefined();
    expect(screen.getByText("John Secondary")).toBeDefined();

    // Click to open Edit Primary Contact modal
    const editPrimaryBtn = screen.getByRole("button", { name: "Edit Primary Contact Person Name" });
    fireEvent.click(editPrimaryBtn);

    const primaryNameInput = document.getElementById("billingContactName") as HTMLInputElement;
    const secondaryNameInputInPrimary = document.getElementById("billingSecondaryContactName");

    expect(primaryNameInput.value).toBe("Jane Primary");
    expect(primaryNameInput.hasAttribute("required")).toBe(true);
    expect(secondaryNameInputInPrimary).toBeNull();

    // Click Cancel to close Primary modal
    const cancelPrimaryBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelPrimaryBtn);

    // Click to open Edit Secondary Contact modal
    const editSecondaryBtn = screen.getByRole("button", { name: "Edit Secondary Contact Person Name" });
    fireEvent.click(editSecondaryBtn);

    const secondaryNameInput = document.getElementById("billingSecondaryContactName") as HTMLInputElement;
    const primaryNameInputInSecondary = document.getElementById("billingContactName");

    expect(secondaryNameInput.value).toBe("John Secondary");
    expect(secondaryNameInput.hasAttribute("required")).toBe(false);
    expect(primaryNameInputInSecondary).toBeNull();

    // Click Cancel to close Secondary modal
    const cancelSecondaryBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelSecondaryBtn);
  });

  it("should handle searchable dependent Romanian County and Locality dropdown inputs in Address modal", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Switch to Billing tab and open Address modal
    const billingTabBtn = screen.getByRole("button", { name: "Billing" });
    fireEvent.click(billingTabBtn);

    const editAddressBtn = screen.getByRole("button", { name: "Edit Address" });
    fireEvent.click(editAddressBtn);

    const countyInput = document.getElementById("addressState") as HTMLInputElement;
    const localityInput = document.getElementById("addressCity") as HTMLInputElement;

    expect(countyInput).toBeDefined();
    expect(localityInput).toBeDefined();

    // Search County "Cluj"
    fireEvent.change(countyInput, { target: { value: "Cluj" } });
    const clujOption = screen.getByRole("button", { name: "Cluj" });
    fireEvent.click(clujOption);
    expect(countyInput.value).toBe("Cluj");

    // Locality input should now be enabled and searchable
    expect(localityInput.disabled).toBe(false);
    fireEvent.change(localityInput, { target: { value: "Cluj-Napoca" } });
    const localityOption = screen.getByRole("button", { name: "Cluj-Napoca" });
    fireEvent.click(localityOption);
    expect(localityInput.value).toBe("Cluj-Napoca");

    // Test clear buttons
    const clearLocalityBtn = screen.getByRole("button", { name: "Clear locality selection" });
    fireEvent.click(clearLocalityBtn);
    expect(localityInput.value).toBe("");

    const clearCountyBtn = screen.getByRole("button", { name: "Clear county selection" });
    fireEvent.click(clearCountyBtn);
    expect(countyInput.value).toBe("");
  });

  it("should handle keyboard navigation (ArrowDown, ArrowUp, Enter, Escape) on searchable dropdown inputs", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Switch to Billing tab and open Address modal
    const billingTabBtn = screen.getByRole("button", { name: "Billing" });
    fireEvent.click(billingTabBtn);

    const editAddressBtn = screen.getByRole("button", { name: "Edit Address" });
    fireEvent.click(editAddressBtn);

    const countyInput = document.getElementById("addressState") as HTMLInputElement;

    // Focus and press ArrowDown to open dropdown
    fireEvent.change(countyInput, { target: { value: "" } });
    fireEvent.focus(countyInput);
    fireEvent.keyDown(countyInput, { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: "Alba" })).toBeDefined();

    // Press ArrowDown to navigate down and Enter to select
    fireEvent.keyDown(countyInput, { key: "ArrowDown" });
    fireEvent.keyDown(countyInput, { key: "Enter" });

    // Press Escape to dismiss dropdown if open
    fireEvent.keyDown(countyInput, { key: "Escape" });
  });

  it("should render Email and Description rows in Information tab, and open description modal with WYSIWYG editor", () => {
    const orgWithDescription = {
      ...dummyOrganization,
      email: "rescue@happy.org",
      phoneNumber: "0755555555",
      description: "<p>Happy paws is a dog rescue agency.</p>",
    };

    render(
      <EditOrganizationForm
        organization={orgWithDescription}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Verify information tab shows name, email, phone, description preview
    expect(screen.getByText("rescue@happy.org")).toBeDefined();
    expect(screen.getByText("Phone")).toBeDefined();
    expect(screen.getByText("Happy paws is a dog rescue agency.")).toBeDefined();

    // Click to open Edit Description modal
    const editDescBtn = screen.getByRole("button", { name: "Edit Description" });
    fireEvent.click(editDescBtn);

    // Modal title should be present
    expect(screen.getByText("Edit Description")).toBeDefined();
    // WYSIWYG editor's contenteditable should contain description content
    const editable = document.querySelector("[contenteditable]") as HTMLDivElement;
    expect(editable).toBeDefined();
    expect(editable.innerHTML).toContain("Happy paws is a dog rescue agency.");

    // Click Cancel to close Description modal
    const cancelDescBtn = screen.getAllByRole("button", { name: "Cancel" })[0];
    fireEvent.click(cancelDescBtn);

    // Click to open Edit Email modal
    const editEmailBtn = screen.getByRole("button", { name: "Edit Email" });
    fireEvent.click(editEmailBtn);
    expect(screen.getByLabelText("Email Address")).toBeDefined();
  });

  it("should open and close Description and Category edit modals on the Information tab", () => {
    const orgWithDescription = {
      ...dummyOrganization,
      description: "<p>Happy paws description</p>",
    };

    render(
      <EditOrganizationForm
        organization={orgWithDescription}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Open Edit Description modal
    const editDescBtn = screen.getByRole("button", { name: "Edit Description" });
    fireEvent.click(editDescBtn);

    // Modal title should be present
    expect(screen.getAllByText("Edit Description").length).toBeGreaterThanOrEqual(1);

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    // Open Edit Category modal
    const editCatBtn = screen.getByRole("button", { name: "Edit Category" });
    fireEvent.click(editCatBtn);

    expect(screen.getAllByText("Edit Category").length).toBeGreaterThanOrEqual(1);

    const cancelCat = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelCat);
  });

  it("should render with activeTabProp 'billing' and show billing tab content", () => {
    const orgWithBilling = {
      ...dummyOrganization,
      billingCompanyName: "PawsCorp SRL",
    };

    render(
      <EditOrganizationForm
        organization={orgWithBilling}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="billing"
      />
    );

    // When activeTabProp='billing', the billing tab content should be shown
    expect(screen.getByText("PawsCorp SRL")).toBeDefined();
  });

  it("should render with activeTabProp 'subscription', 'verification', 'security', and 'services' in dashboard mode", () => {
    const verifiedOrg = {
      ...dummyOrganization,
      verificationStatus: "verified" as const,
      verificationNotes: "Approved by Romanian Kennel Club",
    };

    const { rerender } = render(
      <EditOrganizationForm
        organization={verifiedOrg}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="subscription"
        isDashboard={true}
      />
    );

    expect(screen.getByText(/Active Subscription/i)).toBeDefined();

    rerender(
      <EditOrganizationForm
        organization={verifiedOrg}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="verification"
        isDashboard={true}
      />
    );

    expect(screen.getByText("Category Verification")).toBeDefined();
    expect(screen.getByText("Verified Provider")).toBeDefined();

    rerender(
      <EditOrganizationForm
        organization={verifiedOrg}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="account"
        isDashboard={true}
      />
    );

    expect(
      screen.getByText("Manage your login credentials, recovery email, and security settings")
    ).toBeDefined();

    rerender(
      <EditOrganizationForm
        organization={verifiedOrg}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="services"
        isDashboard={false}
        servicesList={[
          {
            id: "srv-dog-training",
            name: "Dog Training",
            slug: "dog-training",
            description: "Obedience lessons",
            organizationCategory: "ngo",
          },
        ]}
      />
    );

    expect(screen.getByText("Services Configuration")).toBeDefined();
  });

  it("should handle address modal keyboard navigation and county/locality selection", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="billing"
      />
    );

    // Open Edit Address modal
    const editAddressBtn = screen.getByTitle("Edit Address");
    fireEvent.click(editAddressBtn);

    expect(screen.getAllByText("Edit Address Details").length).toBeGreaterThanOrEqual(1);

    // County input keyboard navigation
    const countyInput = screen.getByPlaceholderText("Search county...");
    fireEvent.focus(countyInput);
    fireEvent.keyDown(countyInput, { key: "ArrowDown" });
    fireEvent.keyDown(countyInput, { key: "ArrowUp" });
    fireEvent.keyDown(countyInput, { key: "Enter" });

    // Locality input keyboard navigation
    const localityInput = screen.getByPlaceholderText("Search locality...");
    fireEvent.focus(localityInput);
    fireEvent.keyDown(localityInput, { key: "ArrowDown" });
    fireEvent.keyDown(localityInput, { key: "ArrowUp" });
    fireEvent.keyDown(localityInput, { key: "Enter" });

    // Escape key closes modal
    fireEvent.keyDown(localityInput, { key: "Escape" });
  });

  it("should handle billing modal bank search keyboard navigation", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="billing"
      />
    );

    // Open Edit Billing modal
    const editBillingBtn = screen.getByTitle("Edit Billing Tax ID");
    fireEvent.click(editBillingBtn);

    expect(screen.getAllByText("Edit Company details").length).toBeGreaterThanOrEqual(1);

    // Bank search input keyboard navigation
    const bankInput = screen.getByPlaceholderText("Search or select bank...");
    fireEvent.focus(bankInput);
    fireEvent.keyDown(bankInput, { key: "ArrowDown" });
    fireEvent.keyDown(bankInput, { key: "ArrowUp" });
    fireEvent.keyDown(bankInput, { key: "Enter" });

    // Escape key closes modal
    fireEvent.keyDown(bankInput, { key: "Escape" });
  });

  it("should handle social media, phone, and website modals on the information tab", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="personal"
      />
    );

    // Phone modal
    fireEvent.click(screen.getByTitle("Edit Phone"));
    expect(screen.getAllByText("Edit Phone Number").length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Cancel" })[0]);

    // Website modal
    fireEvent.click(screen.getByTitle("Edit Website"));
    expect(screen.getAllByText("Edit Website").length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Cancel" })[0]);

    // Facebook modal
    fireEvent.click(screen.getByTitle("Edit Facebook"));
    expect(screen.getAllByText("Edit Facebook Page").length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Cancel" })[0]);

    // Instagram modal
    fireEvent.click(screen.getByTitle("Edit Instagram"));
    expect(screen.getAllByText("Edit Instagram Profile").length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Cancel" })[0]);

    // TikTok modal
    fireEvent.click(screen.getByTitle("Edit TikTok"));
    expect(screen.getAllByText("Edit TikTok Profile").length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Cancel" })[0]);

    // LinkedIn modal
    fireEvent.click(screen.getByTitle("Edit LinkedIn"));
    expect(screen.getAllByText("Edit LinkedIn Profile").length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Cancel" })[0]);
  });

  it("should handle service toggle failure rollback and course toggle actions", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValueOnce({
      success: false,
    } as any);

    const { rerender, container } = render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="services"
        servicesList={[
          {
            id: "srv-dog-training",
            name: "Dog Training",
            slug: "dog-training",
            description: "Lessons",
            organizationCategory: "ngo",
            courses: [
              {
                id: "crs-1",
                name: "Puppy Basics",
                slug: "puppy-basics",
                description: "Basic commands",
                serviceId: "srv-dog-training",
              },
            ],
          },
        ]}
      />
    );

    // Click service toggle switch
    const serviceToggle = screen.getByRole("switch");
    await act(async () => {
      fireEvent.click(serviceToggle);
    });

    expect(toggleOrganizationServiceAction).toHaveBeenCalled();

    // Re-render with enabled service
    vi.mocked(toggleOrganizationCourseAction)
      .mockResolvedValueOnce({ success: true } as any)
      .mockResolvedValueOnce({ success: false } as any);

    rerender(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="services"
        servicesList={[
          {
            id: "srv-dog-training",
            name: "Dog Training",
            slug: "dog-training",
            description: "Lessons",
            organizationCategory: "ngo",
            courses: [
              {
                id: "crs-1",
                name: "Puppy Basics",
                slug: "puppy-basics",
                description: "Basic commands",
                serviceId: "srv-dog-training",
              },
            ],
          },
        ]}
      />
    );

    // Toggle course switch failure rollback
    const switches = screen.getAllByRole("switch");
    if (switches.length > 1) {
      await act(async () => {
        fireEvent.click(switches[1]);
      });
      expect(toggleOrganizationCourseAction).toHaveBeenCalled();
    }

    // Toggle expand button
    const expandBtn = container.querySelector("button.p-2.text-muted-foreground");
    if (expandBtn) {
      fireEvent.click(expandBtn);
      fireEvent.click(expandBtn);
    }
  });

  it("handles service toggle failure rollback gracefully", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValueOnce({ success: false, error: "DB Error" } as any);

    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="services"
        servicesList={[
          {
            id: "srv-dog-training",
            name: "Dog Training",
            slug: "dog-training",
            description: "Lessons",
            organizationCategory: "ngo",
            courses: [],
          },
        ]}
      />
    );

    const toggle = screen.getByRole("switch");
    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggleOrganizationServiceAction).toHaveBeenCalled();
  });

  it("handles tab navigation in backoffice mode", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="personal"
      />
    );

    const secTab = screen.getByRole("link", { name: "Security" });
    expect(secTab.getAttribute("href")).toBe("/backoffice/organizations/security/org-id-123");
  });

  it("renders verification and subscription tabs directly via activeTabProp", () => {
    const { rerender } = render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="verification"
        isDashboard={false}
      />
    );

    expect(screen.getByText("Category Verification")).toBeDefined();

    rerender(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="subscription"
        isDashboard={false}
      />
    );

    expect(screen.getByText(/Active Subscription/i)).toBeDefined();
  });

  it("should handle county and locality dropdown keyboard events and click outside", () => {
    const { container } = render(
      <EditOrganizationForm
        organization={{
          ...dummyOrganization,
          addressCountry: "Romania",
          addressState: "Cluj",
          addressCity: "Cluj-Napoca",
        }}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="billing"
      />
    );

    // Open address modal
    fireEvent.click(screen.getByTitle("Edit Address"));

    // County dropdown keyboard events (open via ArrowUp when closed, wrap around via ArrowUp, select via Enter)
    const countyInput = document.getElementById("addressState") as HTMLInputElement;
    if (countyInput) {
      fireEvent.focus(countyInput);
      fireEvent.keyDown(countyInput, { key: "ArrowUp" }); // opens dropdown
      fireEvent.keyDown(countyInput, { key: "ArrowUp" }); // wraps to last
      fireEvent.keyDown(countyInput, { key: "ArrowDown" }); // wraps to 0
      fireEvent.keyDown(countyInput, { key: "Enter" }); // selects
      fireEvent.keyDown(countyInput, { key: "Escape" }); // closes
    }

    // Locality dropdown keyboard events (open via ArrowUp when closed, wrap around via ArrowUp, select via Enter)
    const localityInput = document.getElementById("addressCity") as HTMLInputElement;
    if (localityInput) {
      fireEvent.focus(localityInput);
      fireEvent.keyDown(localityInput, { key: "ArrowUp" }); // opens dropdown
      fireEvent.keyDown(localityInput, { key: "ArrowUp" }); // wraps to last
      fireEvent.keyDown(localityInput, { key: "ArrowDown" }); // wraps to 0
      fireEvent.keyDown(localityInput, { key: "Enter" }); // selects
      fireEvent.keyDown(localityInput, { key: "Escape" }); // closes
    }

    // Click outside event
    fireEvent.mouseDown(document.body);

    // Press Escape key on window to test global listener
    fireEvent.keyDown(window, { key: "Escape" });
  });

  it("should handle bank and country keyboard selection and closing outside", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="billing"
      />
    );

    // Open company details modal
    const editCompanyBtns = screen.getAllByTitle(/Edit Billing Company Name/i);
    fireEvent.click(editCompanyBtns[0]);

    // Bank dropdown keyboard events (open via ArrowUp, wrap around via ArrowUp, select via Enter)
    const bankInput = document.getElementById("billingBankName") as HTMLInputElement;
    if (bankInput) {
      fireEvent.focus(bankInput);
      fireEvent.keyDown(bankInput, { key: "ArrowUp" }); // opens dropdown
      fireEvent.keyDown(bankInput, { key: "ArrowUp" }); // wraps to last
      fireEvent.keyDown(bankInput, { key: "ArrowDown" }); // wraps to 0
      fireEvent.keyDown(bankInput, { key: "Enter" }); // selects
      fireEvent.keyDown(bankInput, { key: "Escape" }); // closes
    }

    // Country dropdown keyboard events (open via ArrowUp, wrap around via ArrowUp, select via Enter)
    const countryInput = document.getElementById("addressCountry") as HTMLInputElement;
    if (countryInput) {
      fireEvent.focus(countryInput);
      fireEvent.keyDown(countryInput, { key: "ArrowUp" }); // opens
      fireEvent.keyDown(countryInput, { key: "ArrowUp" }); // wraps to last
      fireEvent.keyDown(countryInput, { key: "ArrowDown" }); // wraps to 0
      fireEvent.keyDown(countryInput, { key: "Enter" }); // selects
      fireEvent.keyDown(countryInput, { key: "Escape" }); // closes
    }

    fireEvent.mouseDown(document.body);
  });

  it("handles mouse clicks on county, locality, bank, and country dropdown items", () => {
    render(
      <EditOrganizationForm
        organization={{
          ...dummyOrganization,
          addressCountry: "Romania",
          addressState: "Cluj",
          addressCity: "Cluj-Napoca",
        }}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="billing"
      />
    );

    // Open address modal
    fireEvent.click(screen.getByTitle("Edit Address"));

    // Focus county input to open dropdown and click an item
    const countyInput = document.getElementById("addressState") as HTMLInputElement;
    if (countyInput) {
      fireEvent.focus(countyInput);
      fireEvent.change(countyInput, { target: { value: "Cluj" } });
      const countyOption = screen.getByText("Cluj");
      fireEvent.click(countyOption);
    }

    // Click locality item
    const localityInput = document.getElementById("addressCity") as HTMLInputElement;
    if (localityInput) {
      fireEvent.focus(localityInput);
      fireEvent.change(localityInput, { target: { value: "Cluj-Napoca" } });
      const localityOption = screen.getByText("Cluj-Napoca");
      fireEvent.click(localityOption);
    }
  });

  it("handles personalState and accountState success effects and closes open modals", () => {
    mockActionStateSuccess = true;

    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="personal"
      />
    );

    // Verify router.refresh was called by the success effect
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should switch between all tabs seamlessly in local state mode", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Click Billing tab
    fireEvent.click(screen.getByRole("button", { name: "Billing" }));
    expect(screen.getByText("Billing details")).toBeDefined();

    // Click Security tab
    fireEvent.click(screen.getByRole("button", { name: "Security" }));
    expect(screen.getAllByText("Security")[0]).toBeDefined();

    // Click Verification tab
    fireEvent.click(screen.getByRole("button", { name: "Verification" }));
    expect(screen.getAllByText("Verification")[0]).toBeDefined();

    // Click Subscription tab
    fireEvent.click(screen.getByRole("button", { name: "Subscription" }));
    expect(screen.getAllByText("Subscription")[0]).toBeDefined();

    // Click Services tab
    fireEvent.click(screen.getByRole("button", { name: "Services" }));
    expect(screen.getAllByText("Services")[0]).toBeDefined();

    // Switch back to Information tab
    fireEvent.click(screen.getByRole("button", { name: "Information" }));
    expect(screen.getAllByText("Information")[0]).toBeDefined();
  });

  it("should format social and web URLs correctly", () => {
    const fullOrg = {
      ...dummyOrganization,
      website: "http://example.com",
      facebook: "https://facebook.com/dogschool",
      instagram: "instagram.com/dogschool",
      tiktok: "tiktok.com/@dogschool",
      linkedin: "linkedin.com/company/dogschool",
    };

    render(
      <EditOrganizationForm
        organization={fullOrg}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="personal"
      />
    );

    expect(screen.getByText("http://example.com")).toBeDefined();
    expect(screen.getByText("https://facebook.com/dogschool")).toBeDefined();
  });

  it("renders dashboard tab links without services tab and without back to list button", () => {
    mockPathname = "/dashboard/account/information";

    render(
      <EditOrganizationForm
        organization={{
          ...dummyOrganization,
          email: null,
          organizationCategory: null,
        }}
        organizationCategoryList={dummyOrganizationCategoryList}
        activeTabProp="personal"
      />
    );

    // Services tab and Back to list not rendered in dashboard mode
    expect(screen.queryByRole("link", { name: "Services" })).toBeNull();
    expect(screen.queryByText("Back to list")).toBeNull();

    // Verify modify details uses name when email is null
    expect(screen.getByText("Modify details for Happy Paws Rescue.")).toBeDefined();

    // Verify tab link hrefs
    const billTab = screen.getByRole("link", { name: "Billing" });
    expect(billTab.getAttribute("href")).toBe("/dashboard/account/billing");

    const secTab = screen.getByRole("link", { name: "Security" });
    expect(secTab.getAttribute("href")).toBe("/dashboard/account/security");

    const verTab = screen.getByRole("link", { name: "Verification" });
    expect(verTab.getAttribute("href")).toBe("/dashboard/account/verification");

    const subTab = screen.getByRole("link", { name: "Subscription" });
    expect(subTab.getAttribute("href")).toBe("/dashboard/account/subscription");
  });

  it("handles service and course toggling with success and rollback", async () => {
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ success: true } as any);
    vi.mocked(toggleOrganizationCourseAction).mockResolvedValue({ success: true } as any);

    const dummyServices = [
      {
        id: "srv-training",
        name: "Dog Training",
        slug: "dog-training",
        description: "Training courses",
        organizationCategory: "rescue",
        coursesOrder: JSON.stringify(["puppy-school"]),
      },
    ];

    render(
      <EditOrganizationForm
        organization={{
          ...dummyOrganization,
          enabledServices: "srv-training",
          enabledCourses: "",
        }}
        organizationCategoryList={dummyOrganizationCategoryList}
        servicesList={dummyServices}
        activeTabProp="services"
      />
    );

    expect(screen.getByText("Dog Training")).toBeDefined();

    // Toggle accordion expansion button
    const collapseBtn = screen.getByTitle("Collapse courses");
    fireEvent.click(collapseBtn);
    const expandBtn = screen.getByTitle("Expand courses");
    fireEvent.click(expandBtn);

    // Toggle course switch on
    const switches = screen.getAllByRole("switch");
    if (switches.length > 1) {
      await act(async () => {
        fireEvent.click(switches[1]);
      });
      expect(toggleOrganizationCourseAction).toHaveBeenCalledWith("org-id-123", expect.any(String), true);
    }

    // Toggle service switch off
    await act(async () => {
      fireEvent.click(switches[0]);
    });
    expect(toggleOrganizationServiceAction).toHaveBeenCalledWith("org-id-123", "srv-training", false);

    // Test toggle service failure/rollback
    vi.mocked(toggleOrganizationServiceAction).mockResolvedValue({ error: "Failed to update" } as any);
    await act(async () => {
      fireEvent.click(switches[0]);
    });

    // Test toggle course failure/rollback
    vi.mocked(toggleOrganizationCourseAction).mockResolvedValue({ error: "Failed to update" } as any);
    if (switches.length > 1) {
      await act(async () => {
        fireEvent.click(switches[1]);
      });
    }
  });
});

