// @vitest-environment happy-dom
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { OrgVerificationTab } from "./org-verification-tab";
import { Organization, OrganizationCategory } from "./types";
import * as orgActions from "@/app/actions/organizations";

vi.mock("@/app/actions/organizations", () => ({
  requestOrganizationVerificationAction: vi.fn(),
  updateOrganizationVerificationStatusAction: vi.fn(),
}));

describe("OrgVerificationTab Component", () => {
  const dummyOrg: Organization = {
    id: "org-123",
    name: "Dog School SRL",
    email: "contact@dogschool.ro",
    organizationCategory: "dog_school",
    phoneNumber: "0722123456",
    addressCity: "Cluj-Napoca",
    addressLine: "Str. Principala 10",
    verificationStatus: "unverified",
  };

  const dummyCategories: OrganizationCategory[] = [
    { id: "dog_school", name: "Dog School" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders unverified state guide and submits verification request", async () => {
    vi.mocked(orgActions.requestOrganizationVerificationAction).mockResolvedValue({
      success: true,
      message: "Verification request submitted successfully.",
    });

    render(
      <OrgVerificationTab
        organization={dummyOrg}
        organizationCategoryList={dummyCategories}
        isBackoffice={false}
      />
    );

    expect(screen.getByText("Category Verification")).toBeDefined();
    expect(screen.getByText("Not Verified")).toBeDefined();

    const textarea = screen.getByLabelText(/Additional Accreditation Notes/i);
    fireEvent.change(textarea, { target: { value: "CUI RO12345678" } });

    const submitBtn = screen.getByRole("button", { name: /Request Category Verification/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(orgActions.requestOrganizationVerificationAction).toHaveBeenCalledWith("org-123", "CUI RO12345678");
  });

  it("renders pending state banner and displays submitted notes", () => {
    const pendingOrg: Organization = {
      ...dummyOrg,
      verificationStatus: "pending",
      verificationRequestedAt: "2026-08-04T12:00:00Z",
      verificationNotes: "Submitted CUI RO87654321",
    };

    render(
      <OrgVerificationTab
        organization={pendingOrg}
        organizationCategoryList={dummyCategories}
        isBackoffice={false}
      />
    );

    expect(screen.getByText("Under Review")).toBeDefined();
    expect(screen.getByText(/Verification Request Submitted & Under Review/i)).toBeDefined();
    expect(screen.getByText(/Submitted CUI RO87654321/i)).toBeDefined();
  });

  it("renders verified state banner for verified organizations", () => {
    const verifiedOrg: Organization = {
      ...dummyOrg,
      verificationStatus: "verified",
    };

    render(
      <OrgVerificationTab
        organization={verifiedOrg}
        organizationCategoryList={dummyCategories}
        isBackoffice={false}
      />
    );

    expect(screen.getAllByText("Verified Provider").length).toBeGreaterThan(0);
    expect(screen.getByText(/Verified Provider Status Active/i)).toBeDefined();
  });

  it("renders backoffice admin controls and handles status update actions", async () => {
    vi.mocked(orgActions.updateOrganizationVerificationStatusAction).mockResolvedValue({
      success: true,
      message: "Status updated.",
    });

    const pendingOrg: Organization = {
      ...dummyOrg,
      verificationStatus: "pending",
    };

    render(
      <OrgVerificationTab
        organization={pendingOrg}
        organizationCategoryList={dummyCategories}
        isBackoffice={true}
      />
    );

    const approveBtn = screen.getByRole("button", { name: /Approve Verification/i });
    await act(async () => {
      fireEvent.click(approveBtn);
    });

    expect(orgActions.updateOrganizationVerificationStatusAction).toHaveBeenCalledWith("org-123", "verified");
  });

  it("handles verification request error feedback", async () => {
    vi.mocked(orgActions.requestOrganizationVerificationAction).mockResolvedValue({
      error: "Submission failed due to invalid state.",
    });

    render(
      <OrgVerificationTab
        organization={{ ...dummyOrg, organizationCategory: null }}
        organizationCategoryList={[]}
        isBackoffice={false}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Request Category Verification/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText("Submission failed due to invalid state.")).toBeDefined();
  });

  it("handles backoffice admin reject and revoke actions with error feedback", async () => {
    vi.mocked(orgActions.updateOrganizationVerificationStatusAction).mockResolvedValue({
      error: "Permission denied",
    });

    const pendingOrg: Organization = {
      ...dummyOrg,
      verificationStatus: "pending",
    };

    const { rerender } = render(
      <OrgVerificationTab
        organization={pendingOrg}
        organizationCategoryList={dummyCategories}
        isBackoffice={true}
      />
    );

    // Reject request
    const rejectBtn = screen.getByRole("button", { name: /Reject Request/i });
    await act(async () => {
      fireEvent.click(rejectBtn);
    });
    expect(orgActions.updateOrganizationVerificationStatusAction).toHaveBeenCalledWith("org-123", "unverified");
    expect(screen.getByText("Permission denied")).toBeDefined();

    // Revoke verified status
    const verifiedOrg: Organization = {
      ...dummyOrg,
      verificationStatus: "verified",
    };
    rerender(
      <OrgVerificationTab
        organization={verifiedOrg}
        organizationCategoryList={dummyCategories}
        isBackoffice={true}
      />
    );

    const revokeBtn = screen.getByRole("button", { name: /Revoke Verification/i });
    await act(async () => {
      fireEvent.click(revokeBtn);
    });
    expect(orgActions.updateOrganizationVerificationStatusAction).toHaveBeenCalledWith("org-123", "unverified");
  });
});
