// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { EditOrganizationForm } from "./edit-organization-form";

// Mock the server actions
vi.mock("@/app/actions/organizations", () => ({
  updateOrganizationAction: vi.fn(),
  changeOrganizationPasswordAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
  usePathname: () => "/backoffice/organizations",
}));

describe("EditOrganizationForm Component", () => {
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
});
