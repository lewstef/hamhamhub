// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { OrgSecurityTab } from "./org-security-tab";
import type { Organization } from "./types";

describe("OrgSecurityTab Component", () => {
  const dummyOrg: Organization = {
    id: "org-1",
    name: "Alpha Dog School",
    email: "security@alphadog.ro",
    recoveryEmail: "backup@alphadog.ro",
    organizationCategory: "dog_school",
  };

  const onOpenEmailModal = vi.fn();
  const onOpenRecoveryEmailModal = vi.fn();
  const onOpenPasswordModal = vi.fn();
  const renderLinkValue = vi.fn((val: string | null | undefined) => <span>{val || "-"}</span>);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email, recovery email, and password rows", () => {
    render(
      <OrgSecurityTab
        organization={dummyOrg}
        isPending={false}
        onOpenEmailModal={onOpenEmailModal}
        onOpenRecoveryEmailModal={onOpenRecoveryEmailModal}
        onOpenPasswordModal={onOpenPasswordModal}
        renderLinkValue={renderLinkValue}
      />
    );

    expect(screen.getByText("Security")).toBeDefined();
    expect(screen.getByText("Email")).toBeDefined();
    expect(screen.getByText("Recovery email")).toBeDefined();
    expect(screen.getByText("Password")).toBeDefined();
  });

  it("triggers modal callbacks when clicking edit buttons", () => {
    render(
      <OrgSecurityTab
        organization={dummyOrg}
        isPending={false}
        onOpenEmailModal={onOpenEmailModal}
        onOpenRecoveryEmailModal={onOpenRecoveryEmailModal}
        onOpenPasswordModal={onOpenPasswordModal}
        renderLinkValue={renderLinkValue}
      />
    );

    const editEmailBtn = screen.getByRole("button", { name: /edit email/i });
    fireEvent.click(editEmailBtn);
    expect(onOpenEmailModal).toHaveBeenCalledTimes(1);

    const editRecoveryBtn = screen.getByRole("button", { name: /edit recovery email/i });
    fireEvent.click(editRecoveryBtn);
    expect(onOpenRecoveryEmailModal).toHaveBeenCalledTimes(1);

    const editPasswordBtn = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editPasswordBtn);
    expect(onOpenPasswordModal).toHaveBeenCalledTimes(1);
  });
});
