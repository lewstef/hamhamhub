// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { OrgBillingTab } from "./org-billing-tab";
import type { Organization } from "./types";

describe("OrgBillingTab Component", () => {
  const dummyOrg: Organization = {
    id: "org-1",
    name: "Alpha Dog SRL",
    email: "billing@alphadog.ro",
    organizationCategory: "dog_school",
    billingCompanyName: "Alpha Dog Solutions SRL",
    billingTaxId: "RO12345678",
    billingTradeRegistryNumber: "J12/345/2020",
    billingEuid: "ROONRC.J12/345/2020",
    billingBankAccountNumber: "RO49AAAA1B31007593840000",
    billingBankName: "Banca Transilvania",
    billingContactName: "Ion Popescu",
    billingContactPhone: "+40721000111",
    billingContactEmail: "ion@alphadog.ro",
    billingSecondaryContactName: "Maria Popescu",
    billingSecondaryContactPhone: "+40721000222",
    billingSecondaryContactEmail: "maria@alphadog.ro",
    addressCountry: "Romania",
    addressCity: "Cluj-Napoca",
    addressState: "Cluj",
    addressLine: "Strada Câinilor 10",
    addressZip: "400001",
  };

  const onOpenBillingModal = vi.fn();
  const onOpenAddressModal = vi.fn();
  const onOpenPrimaryContactModal = vi.fn();
  const onOpenSecondaryContactModal = vi.fn();
  const renderLinkValue = vi.fn((val: string | null | undefined) => <span>{val || "-"}</span>);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders billing details, address, and primary/secondary contact sections", () => {
    render(
      <OrgBillingTab
        organization={dummyOrg}
        isPending={false}
        onOpenBillingModal={onOpenBillingModal}
        onOpenAddressModal={onOpenAddressModal}
        onOpenPrimaryContactModal={onOpenPrimaryContactModal}
        onOpenSecondaryContactModal={onOpenSecondaryContactModal}
        renderLinkValue={renderLinkValue}
      />
    );

    expect(screen.getByText("Billing details")).toBeDefined();
    expect(screen.getByText("Alpha Dog Solutions SRL")).toBeDefined();
    expect(screen.getByText("RO12345678")).toBeDefined();
    expect(screen.getByText("Banca Transilvania")).toBeDefined();
    expect(screen.getByText("Primary Contact Person")).toBeDefined();
    expect(screen.getByText("Secondary Contact Person")).toBeDefined();
  });

  it("triggers modal callbacks when clicking edit buttons", () => {
    render(
      <OrgBillingTab
        organization={dummyOrg}
        isPending={false}
        onOpenBillingModal={onOpenBillingModal}
        onOpenAddressModal={onOpenAddressModal}
        onOpenPrimaryContactModal={onOpenPrimaryContactModal}
        onOpenSecondaryContactModal={onOpenSecondaryContactModal}
        renderLinkValue={renderLinkValue}
      />
    );

    const editBillingBtn = screen.getByRole("button", { name: /edit billing company name/i });
    fireEvent.click(editBillingBtn);
    expect(onOpenBillingModal).toHaveBeenCalledTimes(1);

    const editAddressBtn = screen.getByRole("button", { name: /^edit address$/i });
    fireEvent.click(editAddressBtn);
    expect(onOpenAddressModal).toHaveBeenCalledTimes(1);

    const editPrimaryBtn = screen.getByRole("button", { name: /edit primary contact person name/i });
    fireEvent.click(editPrimaryBtn);
    expect(onOpenPrimaryContactModal).toHaveBeenCalledTimes(1);

    const editSecondaryBtn = screen.getByRole("button", { name: /edit secondary contact person name/i });
    fireEvent.click(editSecondaryBtn);
    expect(onOpenSecondaryContactModal).toHaveBeenCalledTimes(1);
  });
});
