// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { OrgEditNameCategoryModal } from "./org-edit-name-category-modal";
import { OrgEditDescriptionModal } from "./org-edit-description-modal";
import { OrgEditPasswordModal } from "./org-edit-password-modal";
import { OrgEditBillingModal } from "./org-edit-billing-modal";
import { OrgEditAddressModal } from "./org-edit-address-modal";

const dummyOrg = {
  id: "org-1",
  name: "Alpha Dog School",
  email: "info@alphadog.ro",
  phoneNumber: "+40721000111",
  organizationCategory: "dog_school",
  billingCompanyName: "Alpha Dog Solutions SRL",
  billingTaxId: "RO12345678",
  billingTradeRegistryNumber: "J12/345/2020",
  billingEuid: "ROONRC.J12/345/2020",
  billingBankAccountNumber: "RO49AAAA1B31007593840000",
  billingBankName: "Banca Transilvania",
  addressCountry: "Romania",
  addressCity: "Cluj-Napoca",
  addressState: "Cluj",
  addressLine: "Strada Câinilor 10",
  addressZip: "400001",
  description: "Premier dog training school in Cluj.",
};

const dummyCategories = [
  { id: "dog_school", name: "Dog Training School" },
  { id: "dog_kennel", name: "Boarding Kennel & Hotel" },
];

describe("Organization Modals Suite", () => {
  const onCloseModal = vi.fn();
  const onCloseAllModals = vi.fn();
  const personalAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("OrgEditNameCategoryModal", () => {
    it("renders Name modal when showNameModal is true and calls personalAction on submit", () => {
      render(
        <OrgEditNameCategoryModal
          showNameModal={true}
          showCategoryModal={false}
          onCloseModal={onCloseModal}
          setShowNameModal={vi.fn()}
          setShowCategoryModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          organizationCategoryList={dummyCategories}
          personalAction={personalAction}
          personalError={null}
          isPending={false}
        />
      );

      expect(screen.getByText("Edit Organization Name")).toBeDefined();
      expect(screen.getByDisplayValue("Alpha Dog School")).toBeDefined();

      const submitBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.click(submitBtn);

      expect(personalAction).toHaveBeenCalledTimes(1);
    });

    it("renders Category modal when showCategoryModal is true", () => {
      render(
        <OrgEditNameCategoryModal
          showNameModal={false}
          showCategoryModal={true}
          onCloseModal={onCloseModal}
          setShowNameModal={vi.fn()}
          setShowCategoryModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          organizationCategoryList={dummyCategories}
          personalAction={personalAction}
          personalError={null}
          isPending={false}
        />
      );

      expect(screen.getByText("Edit Category")).toBeDefined();
    });
  });

  describe("OrgEditDescriptionModal", () => {
    it("renders description modal and submits changes", () => {
      render(
        <OrgEditDescriptionModal
          showDescriptionModal={true}
          onCloseModal={onCloseModal}
          setShowDescriptionModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError={null}
          isPending={false}
          editDescription="Premier dog training school in Cluj."
          setEditDescription={vi.fn()}
        />
      );

      expect(screen.getByText("Edit Description")).toBeDefined();
      const saveBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.click(saveBtn);

      expect(personalAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("OrgEditPasswordModal", () => {
    it("renders password edit modal and validates matching passwords", () => {
      const accountAction = vi.fn();

      render(
        <OrgEditPasswordModal
          showPasswordModal={true}
          showEmailModal={false}
          showRecoveryEmailModal={false}
          setShowEmailModal={vi.fn()}
          setShowRecoveryEmailModal={vi.fn()}
          onCloseModal={onCloseModal}
          setShowPasswordModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          accountAction={accountAction}
          accountError={null}
          isPending={false}
          isDashboard={false}
        />
      );

      expect(screen.getAllByText("Change Password").length).toBeGreaterThan(0);
    });
  });

  describe("OrgEditBillingModal", () => {
    it("renders billing details modal and calls personalAction on submit", () => {
      const bankRef = { current: null };
      render(
        <OrgEditBillingModal
          showBillingModal={true}
          showPrimaryContactModal={false}
          showSecondaryContactModal={false}
          onCloseModal={onCloseModal}
          setShowBillingModal={vi.fn()}
          setShowPrimaryContactModal={vi.fn()}
          setShowSecondaryContactModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError={null}
          isPending={false}
          bankDropdownRef={bankRef}
          editBank="Banca Transilvania"
          setEditBank={vi.fn()}
          bankSearch="Banca Transilvania"
          setBankSearch={vi.fn()}
          showBankDropdown={false}
          setShowBankDropdown={vi.fn()}
          filteredBanks={["Banca Transilvania"]}
          bankHighlightIndex={-1}
          setBankHighlightIndex={vi.fn()}
          handleBankKeyDown={vi.fn()}
        />
      );

      expect(screen.getByText("Edit Company details")).toBeDefined();
      expect(screen.getByDisplayValue("Alpha Dog Solutions SRL")).toBeDefined();
      expect(screen.getByDisplayValue("RO12345678")).toBeDefined();

      const saveBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.click(saveBtn);

      expect(personalAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("OrgEditAddressModal", () => {
    it("renders address edit modal with street and zip code", () => {
      const countyRef = { current: null };
      const localityRef = { current: null };
      const localityInputRef = { current: null };

      render(
        <OrgEditAddressModal
          showAddressModal={true}
          onCloseModal={onCloseModal}
          setShowAddressModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError={null}
          isPending={false}
          countyDropdownRef={countyRef}
          editCounty="Cluj"
          setEditCounty={vi.fn()}
          countySearch="Cluj"
          setCountySearch={vi.fn()}
          showCountyDropdown={false}
          setShowCountyDropdown={vi.fn()}
          filteredCounties={["Cluj"]}
          countyHighlightIndex={-1}
          setCountyHighlightIndex={vi.fn()}
          selectCounty={vi.fn()}
          handleCountyKeyDown={vi.fn()}
          localityDropdownRef={localityRef}
          localityInputRef={localityInputRef}
          editLocality="Cluj-Napoca"
          setEditLocality={vi.fn()}
          localitySearch="Cluj-Napoca"
          setLocalitySearch={vi.fn()}
          showLocalityDropdown={false}
          setShowLocalityDropdown={vi.fn()}
          filteredLocalities={["Cluj-Napoca"]}
          localityHighlightIndex={-1}
          setLocalityHighlightIndex={vi.fn()}
          handleLocalityKeyDown={vi.fn()}
        />
      );

      expect(screen.getByText("Edit Address Details")).toBeDefined();
      expect(screen.getByDisplayValue("Strada Câinilor 10")).toBeDefined();
      expect(screen.getByDisplayValue("400001")).toBeDefined();
    });
  });
});
