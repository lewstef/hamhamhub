// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { OrgInfoTab } from "./org-info-tab";
import type { Organization } from "./types";

describe("OrgInfoTab Component", () => {
  const dummyOrg: Organization = {
    id: "org-1",
    name: "Alpha Dog School",
    email: "info@alphadog.ro",
    phoneNumber: "+40721000111",
    organizationCategory: "dog_school",
    website: "https://alphadog.ro",
    facebook: "https://facebook.com/alphadog",
    instagram: "https://instagram.com/alphadog",
    tiktok: "https://tiktok.com/@alphadog",
    linkedin: "https://linkedin.com/company/alphadog",
    description: "Professional dog obedience school and agility training.",
    createdAt: new Date("2026-01-01"),
  };

  const onOpenNameModal = vi.fn();
  const onOpenEmailModal = vi.fn();
  const onOpenPhoneModal = vi.fn();
  const onOpenWebsiteModal = vi.fn();
  const onOpenFacebookModal = vi.fn();
  const onOpenInstagramModal = vi.fn();
  const onOpenTikTokModal = vi.fn();
  const onOpenLinkedinModal = vi.fn();
  const onOpenDescriptionModal = vi.fn();
  const onOpenCategoryModal = vi.fn();
  const renderLinkValue = vi.fn((val: string | null | undefined) => <span>{val || "-"}</span>);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders organization profile fields, category, and social links", () => {
    render(
      <OrgInfoTab
        organization={dummyOrg}
        selectedCategoryName="Dog Training School"
        formattedRegistrationDate="01 Jan 2026"
        isPending={false}
        onOpenNameModal={onOpenNameModal}
        onOpenEmailModal={onOpenEmailModal}
        onOpenPhoneModal={onOpenPhoneModal}
        onOpenWebsiteModal={onOpenWebsiteModal}
        onOpenFacebookModal={onOpenFacebookModal}
        onOpenInstagramModal={onOpenInstagramModal}
        onOpenTikTokModal={onOpenTikTokModal}
        onOpenLinkedinModal={onOpenLinkedinModal}
        onOpenDescriptionModal={onOpenDescriptionModal}
        onOpenCategoryModal={onOpenCategoryModal}
        renderLinkValue={renderLinkValue}
      />
    );

    expect(screen.getByText("Information")).toBeDefined();
    expect(screen.getByText("Alpha Dog School")).toBeDefined();
    expect(screen.getByText("Dog Training School")).toBeDefined();
    expect(screen.getByText("01 Jan 2026")).toBeDefined();
  });

  it("triggers modal callbacks when clicking edit buttons", () => {
    render(
      <OrgInfoTab
        organization={dummyOrg}
        selectedCategoryName="Dog Training School"
        formattedRegistrationDate="01 Jan 2026"
        isPending={false}
        onOpenNameModal={onOpenNameModal}
        onOpenEmailModal={onOpenEmailModal}
        onOpenPhoneModal={onOpenPhoneModal}
        onOpenWebsiteModal={onOpenWebsiteModal}
        onOpenFacebookModal={onOpenFacebookModal}
        onOpenInstagramModal={onOpenInstagramModal}
        onOpenTikTokModal={onOpenTikTokModal}
        onOpenLinkedinModal={onOpenLinkedinModal}
        onOpenDescriptionModal={onOpenDescriptionModal}
        onOpenCategoryModal={onOpenCategoryModal}
        renderLinkValue={renderLinkValue}
      />
    );

    const editNameBtn = screen.getByRole("button", { name: /^edit name$/i });
    fireEvent.click(editNameBtn);
    expect(onOpenNameModal).toHaveBeenCalledTimes(1);

    const editEmailBtn = screen.getByRole("button", { name: /^edit email$/i });
    fireEvent.click(editEmailBtn);
    expect(onOpenEmailModal).toHaveBeenCalledTimes(1);

    const editPhoneBtn = screen.getByRole("button", { name: /^edit phone$/i });
    fireEvent.click(editPhoneBtn);
    expect(onOpenPhoneModal).toHaveBeenCalledTimes(1);

    const editWebsiteBtn = screen.getByRole("button", { name: /^edit website$/i });
    fireEvent.click(editWebsiteBtn);
    expect(onOpenWebsiteModal).toHaveBeenCalledTimes(1);

    const editFbBtn = screen.getByRole("button", { name: /^edit facebook$/i });
    fireEvent.click(editFbBtn);
    expect(onOpenFacebookModal).toHaveBeenCalledTimes(1);

    const editInstaBtn = screen.getByRole("button", { name: /^edit instagram$/i });
    fireEvent.click(editInstaBtn);
    expect(onOpenInstagramModal).toHaveBeenCalledTimes(1);

    const editTikTokBtn = screen.getByRole("button", { name: /^edit tiktok$/i });
    fireEvent.click(editTikTokBtn);
    expect(onOpenTikTokModal).toHaveBeenCalledTimes(1);

    const editLinkedinBtn = screen.getByRole("button", { name: /^edit linkedin$/i });
    fireEvent.click(editLinkedinBtn);
    expect(onOpenLinkedinModal).toHaveBeenCalledTimes(1);

    const editCategoryBtn = screen.getByRole("button", { name: /^edit category$/i });
    fireEvent.click(editCategoryBtn);
    expect(onOpenCategoryModal).toHaveBeenCalledTimes(1);

    const editDescBtn = screen.getByRole("button", { name: /^edit description$/i });
    fireEvent.click(editDescBtn);
    expect(onOpenDescriptionModal).toHaveBeenCalledTimes(1);
  });

  it("handles blank or HTML-only descriptions gracefully", () => {
    const { rerender } = render(
      <OrgInfoTab
        organization={{ ...dummyOrg, description: "<p>   </p>" }}
        selectedCategoryName="Dog Training School"
        formattedRegistrationDate="01 Jan 2026"
        isPending={false}
        onOpenNameModal={onOpenNameModal}
        onOpenEmailModal={onOpenEmailModal}
        onOpenPhoneModal={onOpenPhoneModal}
        onOpenWebsiteModal={onOpenWebsiteModal}
        onOpenFacebookModal={onOpenFacebookModal}
        onOpenInstagramModal={onOpenInstagramModal}
        onOpenTikTokModal={onOpenTikTokModal}
        onOpenLinkedinModal={onOpenLinkedinModal}
        onOpenDescriptionModal={onOpenDescriptionModal}
        onOpenCategoryModal={onOpenCategoryModal}
        renderLinkValue={renderLinkValue}
      />
    );

    expect(screen.getAllByText("-").length).toBeGreaterThan(0);

    rerender(
      <OrgInfoTab
        organization={{ ...dummyOrg, description: null }}
        selectedCategoryName="Dog Training School"
        formattedRegistrationDate="01 Jan 2026"
        isPending={false}
        onOpenNameModal={onOpenNameModal}
        onOpenEmailModal={onOpenEmailModal}
        onOpenPhoneModal={onOpenPhoneModal}
        onOpenWebsiteModal={onOpenWebsiteModal}
        onOpenFacebookModal={onOpenFacebookModal}
        onOpenInstagramModal={onOpenInstagramModal}
        onOpenTikTokModal={onOpenTikTokModal}
        onOpenLinkedinModal={onOpenLinkedinModal}
        onOpenDescriptionModal={onOpenDescriptionModal}
        onOpenCategoryModal={onOpenCategoryModal}
        renderLinkValue={renderLinkValue}
      />
    );

    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });
});
