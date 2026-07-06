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

describe("EditOrganizationForm Component", () => {
  const dummyOrganization = {
    id: "org-id-123",
    name: "Happy Paws Rescue",
    email: "paws@ngo.org",
    organizationCategory: "ngo",
  };
  const dummyOrganizationCategoryList = [
    { id: "ngo", name: "NGO", description: "NGO Description" },
    { id: "dog_kennel", name: "Dog Kennel", description: "Dog Kennel Description" },
    { id: "dog_service_provider", name: "Dog service provider", description: "Dog service provider Description" },
    { id: "cynological_association", name: "Official Cynological Association", description: "Official Cynological Association Description" },
  ];

  it("should render with prefilled organization values on the General tab", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Check title and description
    expect(screen.getByText("Edit Organization")).toBeDefined();
    expect(screen.getByText(`Modify details for ${dummyOrganization.email}.`)).toBeDefined();

    // Check input fields are prefilled
    const nameInput = screen.getByLabelText("Organization Name") as HTMLInputElement;
    expect(nameInput.value).toBe(dummyOrganization.name);

    const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;
    expect(emailInput.value).toBe(dummyOrganization.email);

    const typeSelect = screen.getByLabelText("Organization Category") as HTMLSelectElement;
    expect(typeSelect.value).toBe(dummyOrganization.organizationCategory);
  });

  it("should allow switching between General and Password tabs", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Initially general form is visible, password form is hidden
    expect(screen.queryByLabelText("New Password")).toBeNull();
    expect(screen.getByLabelText("Organization Name")).toBeDefined();

    // Switch to Password tab
    const passwordTabBtn = screen.getByRole("button", { name: "Password" });
    fireEvent.click(passwordTabBtn);

    // Password form fields should be visible, general form fields hidden
    expect(screen.getByLabelText("New Password")).toBeDefined();
    expect(screen.getByLabelText("Confirm New Password")).toBeDefined();
    expect(screen.queryByLabelText("Organization Name")).toBeNull();

    // Switch back to General tab
    const generalTabBtn = screen.getByRole("button", { name: "General" });
    fireEvent.click(generalTabBtn);

    expect(screen.queryByLabelText("New Password")).toBeNull();
    expect(screen.getByLabelText("Organization Name")).toBeDefined();
  });

  it("should validate that passwords match and control submit button disabled state", () => {
    render(
      <EditOrganizationForm
        organization={dummyOrganization}
        organizationCategoryList={dummyOrganizationCategoryList}
      />
    );

    // Switch to Password tab
    const passwordTabBtn = screen.getByRole("button", { name: "Password" });
    fireEvent.click(passwordTabBtn);

    const passwordInput = screen.getByLabelText("New Password") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirm New Password") as HTMLInputElement;
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
