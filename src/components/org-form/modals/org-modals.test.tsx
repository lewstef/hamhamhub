// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { OrgEditNameCategoryModal } from "./org-edit-name-category-modal";
import { OrgEditDescriptionModal } from "./org-edit-description-modal";
import { OrgEditPasswordModal } from "./org-edit-password-modal";
import { OrgEditBillingModal } from "./org-edit-billing-modal";
import { OrgEditAddressModal } from "./org-edit-address-modal";
import { OrgEditContactModal } from "./org-edit-contact-modal";

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
    it("renders Name modal when showNameModal is true, shows error, handles cancel and backdrop click", () => {
      const setShowNameModal = vi.fn();
      const { rerender } = render(
        <OrgEditNameCategoryModal
          showNameModal={true}
          showCategoryModal={false}
          onCloseModal={onCloseModal}
          setShowNameModal={setShowNameModal}
          setShowCategoryModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          organizationCategoryList={dummyCategories}
          personalAction={personalAction}
          personalError="Name must be unique"
          isPending={false}
        />
      );

      expect(screen.getByText("Edit Organization Name")).toBeDefined();
      expect(screen.getByText("Name must be unique")).toBeDefined();
      expect(screen.getByDisplayValue("Alpha Dog School")).toBeDefined();

      // Submit
      const submitBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.click(submitBtn);
      expect(personalAction).toHaveBeenCalledTimes(1);

      // Cancel
      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelBtn);
      expect(onCloseModal).toHaveBeenCalledWith(setShowNameModal);

      // Backdrop click
      const backdrop = screen.getByText("Edit Organization Name").closest(".fixed")!;
      fireEvent.click(backdrop);
      expect(onCloseAllModals).toHaveBeenCalled();
    });

    it("renders Category modal when showCategoryModal is true, handles submit, cancel and backdrop", () => {
      const setShowCategoryModal = vi.fn();
      const emptyOrg = {
        id: "org-empty",
        name: "Empty Org",
        organizationCategory: null,
        phoneNumber: null,
        addressCountry: null,
        addressState: null,
        addressCity: null,
        addressLine: null,
        addressZip: null,
      };

      render(
        <OrgEditNameCategoryModal
          showNameModal={false}
          showCategoryModal={true}
          onCloseModal={onCloseModal}
          setShowNameModal={vi.fn()}
          setShowCategoryModal={setShowCategoryModal}
          onCloseAllModals={onCloseAllModals}
          organization={emptyOrg}
          organizationCategoryList={dummyCategories}
          personalAction={personalAction}
          personalError="Category is invalid"
          isPending={false}
        />
      );

      expect(screen.getByText("Edit Category")).toBeDefined();
      expect(screen.getByText("Category is invalid")).toBeDefined();

      const saveBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.submit(saveBtn.closest("form")!);
      expect(personalAction).toHaveBeenCalled();

      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelBtn);
      expect(onCloseModal).toHaveBeenCalledWith(setShowCategoryModal);

      const backdrop = screen.getByText("Edit Category").closest(".fixed")!;
      fireEvent.click(backdrop);
      expect(onCloseAllModals).toHaveBeenCalled();
    });
  });

  describe("OrgEditDescriptionModal", () => {
    it("returns null when showDescriptionModal is false", () => {
      const { container } = render(
        <OrgEditDescriptionModal
          showDescriptionModal={false}
          onCloseModal={onCloseModal}
          setShowDescriptionModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError={null}
          isPending={false}
          editDescription=""
          setEditDescription={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("renders description modal, shows error, submits changes, and handles cancel/backdrop", () => {
      const setShowDescriptionModal = vi.fn();
      const setEditDescription = vi.fn();

      render(
        <OrgEditDescriptionModal
          showDescriptionModal={true}
          onCloseModal={onCloseModal}
          setShowDescriptionModal={setShowDescriptionModal}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError="Description too long"
          isPending={false}
          editDescription="Premier dog training school in Cluj."
          setEditDescription={setEditDescription}
        />
      );

      expect(screen.getByText("Edit Description")).toBeDefined();
      expect(screen.getByText("Description too long")).toBeDefined();

      const saveBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.click(saveBtn);
      expect(personalAction).toHaveBeenCalledTimes(1);

      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelBtn);
      expect(onCloseModal).toHaveBeenCalledWith(setShowDescriptionModal);

      const backdrop = screen.getByText("Edit Description").closest(".fixed")!;
      fireEvent.click(backdrop);
      expect(onCloseAllModals).toHaveBeenCalled();
    });
  });

  describe("OrgEditPasswordModal", () => {
    it("renders Email modal and handles submit, cancel, and backdrop", () => {
      const accountAction = vi.fn();
      const setShowEmailModal = vi.fn();

      render(
        <OrgEditPasswordModal
          showEmailModal={true}
          showRecoveryEmailModal={false}
          showPasswordModal={false}
          onCloseModal={onCloseModal}
          setShowEmailModal={setShowEmailModal}
          setShowRecoveryEmailModal={vi.fn()}
          setShowPasswordModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          accountAction={accountAction}
          accountError="Email already registered"
          isPending={false}
          isDashboard={false}
        />
      );

      expect(screen.getByText("Edit Email")).toBeDefined();
      expect(screen.getByText("Email already registered")).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
      expect(accountAction).toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onCloseModal).toHaveBeenCalledWith(setShowEmailModal);

      const backdrop = screen.getByText("Edit Email").closest(".fixed")!;
      fireEvent.click(backdrop);
      expect(onCloseAllModals).toHaveBeenCalled();
    });

    it("renders Recovery Email modal and handles submit and cancel", () => {
      const accountAction = vi.fn();
      const setShowRecoveryEmailModal = vi.fn();

      render(
        <OrgEditPasswordModal
          showEmailModal={false}
          showRecoveryEmailModal={true}
          showPasswordModal={false}
          onCloseModal={onCloseModal}
          setShowEmailModal={vi.fn()}
          setShowRecoveryEmailModal={setShowRecoveryEmailModal}
          setShowPasswordModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          accountAction={accountAction}
          accountError="Invalid recovery email"
          isPending={false}
          isDashboard={false}
        />
      );

      expect(screen.getByText("Edit Recovery Email")).toBeDefined();
      expect(screen.getByText("Invalid recovery email")).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
      expect(accountAction).toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onCloseModal).toHaveBeenCalledWith(setShowRecoveryEmailModal);
    });

    it("renders password edit modal, toggles visibility, validates mismatch, and submits when matching", () => {
      const accountAction = vi.fn();
      const setShowPasswordModal = vi.fn();

      render(
        <OrgEditPasswordModal
          showPasswordModal={true}
          showEmailModal={false}
          showRecoveryEmailModal={false}
          setShowEmailModal={vi.fn()}
          setShowRecoveryEmailModal={vi.fn()}
          onCloseModal={onCloseModal}
          setShowPasswordModal={setShowPasswordModal}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          accountAction={accountAction}
          accountError="Invalid current password"
          isPending={false}
          isDashboard={true}
        />
      );

      expect(screen.getAllByText("Change Password").length).toBeGreaterThan(0);
      expect(screen.getByText("Current Password")).toBeDefined();
      expect(screen.getByText("Invalid current password")).toBeDefined();

      // Submit should be disabled initially
      const submitBtn = screen.getByRole("button", { name: /change password/i });
      expect(submitBtn.hasAttribute("disabled")).toBe(true);

      // Type mismatching passwords
      const passwordInput = screen.getByLabelText("New Password");
      const confirmInput = screen.getByLabelText("Confirm Password");

      fireEvent.change(passwordInput, { target: { value: "Secret123!" } });
      fireEvent.change(confirmInput, { target: { value: "Different123!" } });

      expect(screen.getByText("Passwords do not match.")).toBeDefined();
      expect(submitBtn.hasAttribute("disabled")).toBe(true);

      // Toggle show/hide password buttons
      const toggleBtns = screen.getAllByRole("button").filter(btn => btn.querySelector("svg") !== null);
      if (toggleBtns.length > 0) {
        fireEvent.click(toggleBtns[0]); // Toggle new password visibility
        fireEvent.click(toggleBtns[toggleBtns.length - 1]); // Toggle confirm password visibility
      }

      // Type matching password
      fireEvent.change(confirmInput, { target: { value: "Secret123!" } });
      expect(screen.queryByText("Passwords do not match.")).toBeNull();
      expect(submitBtn.hasAttribute("disabled")).toBe(false);

      // Submit password change
      fireEvent.submit(submitBtn.closest("form")!);
      expect(accountAction).toHaveBeenCalled();

      // Cancel
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onCloseModal).toHaveBeenCalledWith(setShowPasswordModal);
    });
  });

  describe("OrgEditBillingModal", () => {
    it("renders billing details modal and calls personalAction on submit", () => {
      const bankRef = { current: null };
      const setEditBank = vi.fn();
      const setShowBankDropdown = vi.fn();
      const setBankSearch = vi.fn();

      const { rerender } = render(
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
          personalError="Invalid Tax ID"
          isPending={false}
          bankDropdownRef={bankRef}
          editBank="Banca Transilvania"
          setEditBank={setEditBank}
          bankSearch="Banca Transilvania"
          setBankSearch={setBankSearch}
          showBankDropdown={true}
          setShowBankDropdown={setShowBankDropdown}
          filteredBanks={["Banca Transilvania", "ING Bank"]}
          bankHighlightIndex={0}
          setBankHighlightIndex={vi.fn()}
          handleBankKeyDown={vi.fn()}
        />
      );

      expect(screen.getByText("Edit Company details")).toBeDefined();
      expect(screen.getByText("Invalid Tax ID")).toBeDefined();
      expect(screen.getByDisplayValue("Alpha Dog Solutions SRL")).toBeDefined();
      expect(screen.getByDisplayValue("RO12345678")).toBeDefined();

      // Click a bank option from dropdown
      const ingOption = screen.getByText("ING Bank");
      fireEvent.click(ingOption);
      expect(setEditBank).toHaveBeenCalledWith("ING Bank");

      const saveBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.click(saveBtn);
      expect(personalAction).toHaveBeenCalledTimes(1);

      // Primary contact modal
      rerender(
        <OrgEditBillingModal
          showBillingModal={false}
          showPrimaryContactModal={true}
          showSecondaryContactModal={false}
          onCloseModal={onCloseModal}
          setShowBillingModal={vi.fn()}
          setShowPrimaryContactModal={vi.fn()}
          setShowSecondaryContactModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError="Invalid primary email"
          isPending={false}
          bankDropdownRef={bankRef}
          editBank=""
          setEditBank={setEditBank}
          bankSearch=""
          setBankSearch={setBankSearch}
          showBankDropdown={false}
          setShowBankDropdown={setShowBankDropdown}
          filteredBanks={[]}
          bankHighlightIndex={-1}
          setBankHighlightIndex={vi.fn()}
          handleBankKeyDown={vi.fn()}
        />
      );
      expect(screen.getByText("Edit Primary Contact")).toBeDefined();
      expect(screen.getByText("Invalid primary email")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

      // Secondary contact modal
      rerender(
        <OrgEditBillingModal
          showBillingModal={false}
          showPrimaryContactModal={false}
          showSecondaryContactModal={true}
          onCloseModal={onCloseModal}
          setShowBillingModal={vi.fn()}
          setShowPrimaryContactModal={vi.fn()}
          setShowSecondaryContactModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError="Invalid secondary email"
          isPending={false}
          bankDropdownRef={bankRef}
          editBank=""
          setEditBank={setEditBank}
          bankSearch=""
          setBankSearch={setBankSearch}
          showBankDropdown={false}
          setShowBankDropdown={setShowBankDropdown}
          filteredBanks={[]}
          bankHighlightIndex={-1}
          setBankHighlightIndex={vi.fn()}
          handleBankKeyDown={vi.fn()}
        />
      );
      expect(screen.getByText("Edit Secondary Contact")).toBeDefined();
      expect(screen.getByText("Invalid secondary email")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onCloseModal).toHaveBeenCalled();
    });
  });

  describe("OrgEditAddressModal", () => {
    it("renders address edit modal with street and zip code", () => {
      const countyRef = { current: null };
      const localityRef = { current: null };
      const localityInputRef = { current: null };
      const setShowAddressModal = vi.fn();
      const selectCounty = vi.fn();
      const setEditLocality = vi.fn();
      const setLocalitySearch = vi.fn();
      const setShowLocalityDropdown = vi.fn();

      const { rerender } = render(
        <OrgEditAddressModal
          showAddressModal={false}
          onCloseModal={onCloseModal}
          setShowAddressModal={setShowAddressModal}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError={null}
          isPending={false}
          countyDropdownRef={countyRef}
          editCounty=""
          setEditCounty={vi.fn()}
          countySearch=""
          setCountySearch={vi.fn()}
          showCountyDropdown={false}
          setShowCountyDropdown={vi.fn()}
          filteredCounties={[]}
          countyHighlightIndex={-1}
          setCountyHighlightIndex={vi.fn()}
          selectCounty={selectCounty}
          handleCountyKeyDown={vi.fn()}
          localityDropdownRef={localityRef}
          localityInputRef={localityInputRef}
          editLocality=""
          setEditLocality={setEditLocality}
          localitySearch=""
          setLocalitySearch={setLocalitySearch}
          showLocalityDropdown={false}
          setShowLocalityDropdown={setShowLocalityDropdown}
          filteredLocalities={[]}
          localityHighlightIndex={-1}
          setLocalityHighlightIndex={vi.fn()}
          handleLocalityKeyDown={vi.fn()}
        />
      );

      // Returns null when showAddressModal is false
      expect(screen.queryByText("Edit Address Details")).toBeNull();

      rerender(
        <OrgEditAddressModal
          showAddressModal={true}
          onCloseModal={onCloseModal}
          setShowAddressModal={setShowAddressModal}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError="Invalid postal zip code"
          isPending={false}
          countyDropdownRef={countyRef}
          editCounty="Cluj"
          setEditCounty={vi.fn()}
          countySearch="Cluj"
          setCountySearch={vi.fn()}
          showCountyDropdown={true}
          setShowCountyDropdown={vi.fn()}
          filteredCounties={["Cluj", "Bihor"]}
          countyHighlightIndex={0}
          setCountyHighlightIndex={vi.fn()}
          selectCounty={selectCounty}
          handleCountyKeyDown={vi.fn()}
          localityDropdownRef={localityRef}
          localityInputRef={localityInputRef}
          editLocality="Cluj-Napoca"
          setEditLocality={setEditLocality}
          localitySearch="Cluj-Napoca"
          setLocalitySearch={setLocalitySearch}
          showLocalityDropdown={true}
          setShowLocalityDropdown={setShowLocalityDropdown}
          filteredLocalities={["Cluj-Napoca", "Dej"]}
          localityHighlightIndex={0}
          setLocalityHighlightIndex={vi.fn()}
          handleLocalityKeyDown={vi.fn()}
        />
      );

      expect(screen.getByText("Edit Address Details")).toBeDefined();
      expect(screen.getByText("Invalid postal zip code")).toBeDefined();
      expect(screen.getByDisplayValue("Strada Câinilor 10")).toBeDefined();
      expect(screen.getByDisplayValue("400001")).toBeDefined();

      // Click county option
      const bihorBtn = screen.getByText("Bihor");
      fireEvent.click(bihorBtn);
      expect(selectCounty).toHaveBeenCalledWith("Bihor");

      // Click locality option
      const dejBtn = screen.getByText("Dej");
      fireEvent.click(dejBtn);
      expect(setEditLocality).toHaveBeenCalledWith("Dej");

      // Save
      const saveBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.click(saveBtn);
      expect(personalAction).toHaveBeenCalled();

      // Cancel
      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelBtn);
      expect(onCloseModal).toHaveBeenCalledWith(setShowAddressModal);

      // Backdrop click
      const backdrop = screen.getByText("Edit Address Details").closest(".fixed")!;
      fireEvent.click(backdrop);
      expect(onCloseAllModals).toHaveBeenCalled();
    });
  });

  describe("OrgEditContactModal", () => {
    it("renders phone modal and calls personalAction on save", () => {
      render(
        <OrgEditContactModal
          showPhoneModal={true}
          showWebsiteModal={false}
          showFacebookModal={false}
          showInstagramModal={false}
          showTikTokModal={false}
          showLinkedinModal={false}
          onCloseModal={onCloseModal}
          setShowPhoneModal={vi.fn()}
          setShowWebsiteModal={vi.fn()}
          setShowFacebookModal={vi.fn()}
          setShowInstagramModal={vi.fn()}
          setShowTikTokModal={vi.fn()}
          setShowLinkedinModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError="Invalid phone number"
          isPending={false}
          phonePlaceholder="0712 345 678"
          phonePatternInfo={{ prefix: "+40", placeholder: "0712 345 678" }}
          selectedCountry="Romania"
        />
      );

      expect(screen.getByText("Edit Phone Number")).toBeDefined();
      expect(screen.getByText("Invalid phone number")).toBeDefined();
      expect(screen.getByText("Expected format for Romania:")).toBeDefined();
      expect(screen.getByDisplayValue("+40721000111")).toBeDefined();

      const saveBtn = screen.getByRole("button", { name: /save changes/i });
      fireEvent.click(saveBtn);
      expect(personalAction).toHaveBeenCalledTimes(1);

      // Backdrop click
      const backdrop = screen.getByText("Edit Phone Number").closest(".fixed")!;
      fireEvent.click(backdrop);
      expect(onCloseAllModals).toHaveBeenCalled();
    });

    it("renders website and social media modals (Website, Facebook, Instagram, TikTok, LinkedIn)", () => {
      const { rerender } = render(
        <OrgEditContactModal
          showPhoneModal={false}
          showWebsiteModal={true}
          showFacebookModal={false}
          showInstagramModal={false}
          showTikTokModal={false}
          showLinkedinModal={false}
          onCloseModal={onCloseModal}
          setShowPhoneModal={vi.fn()}
          setShowWebsiteModal={vi.fn()}
          setShowFacebookModal={vi.fn()}
          setShowInstagramModal={vi.fn()}
          setShowTikTokModal={vi.fn()}
          setShowLinkedinModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError={null}
          isPending={false}
          phonePlaceholder="0712 345 678"
        />
      );

      expect(screen.getByText("Edit Website")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
      expect(personalAction).toHaveBeenCalled();

      rerender(
        <OrgEditContactModal
          showPhoneModal={false}
          showWebsiteModal={false}
          showFacebookModal={true}
          showInstagramModal={false}
          showTikTokModal={false}
          showLinkedinModal={false}
          onCloseModal={onCloseModal}
          setShowPhoneModal={vi.fn()}
          setShowWebsiteModal={vi.fn()}
          setShowFacebookModal={vi.fn()}
          setShowInstagramModal={vi.fn()}
          setShowTikTokModal={vi.fn()}
          setShowLinkedinModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError="Invalid FB URL"
          isPending={false}
          phonePlaceholder="0712 345 678"
        />
      );
      expect(screen.getByText("Edit Facebook Page")).toBeDefined();
      expect(screen.getByText("Invalid FB URL")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onCloseModal).toHaveBeenCalled();
      fireEvent.click(screen.getByText("Edit Facebook Page").closest(".fixed")!);
      expect(onCloseAllModals).toHaveBeenCalled();

      rerender(
        <OrgEditContactModal
          showPhoneModal={false}
          showWebsiteModal={false}
          showFacebookModal={false}
          showInstagramModal={true}
          showTikTokModal={false}
          showLinkedinModal={false}
          onCloseModal={onCloseModal}
          setShowPhoneModal={vi.fn()}
          setShowWebsiteModal={vi.fn()}
          setShowFacebookModal={vi.fn()}
          setShowInstagramModal={vi.fn()}
          setShowTikTokModal={vi.fn()}
          setShowLinkedinModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError="Invalid IG URL"
          isPending={false}
          phonePlaceholder="0712 345 678"
        />
      );
      expect(screen.getByText("Edit Instagram Profile")).toBeDefined();
      expect(screen.getByText("Invalid IG URL")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      fireEvent.click(screen.getByText("Edit Instagram Profile").closest(".fixed")!);

      rerender(
        <OrgEditContactModal
          showPhoneModal={false}
          showWebsiteModal={false}
          showFacebookModal={false}
          showInstagramModal={false}
          showTikTokModal={true}
          showLinkedinModal={false}
          onCloseModal={onCloseModal}
          setShowPhoneModal={vi.fn()}
          setShowWebsiteModal={vi.fn()}
          setShowFacebookModal={vi.fn()}
          setShowInstagramModal={vi.fn()}
          setShowTikTokModal={vi.fn()}
          setShowLinkedinModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError="Invalid TikTok URL"
          isPending={false}
          phonePlaceholder="0712 345 678"
        />
      );
      expect(screen.getByText("Edit TikTok Profile")).toBeDefined();
      expect(screen.getByText("Invalid TikTok URL")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      fireEvent.click(screen.getByText("Edit TikTok Profile").closest(".fixed")!);

      rerender(
        <OrgEditContactModal
          showPhoneModal={false}
          showWebsiteModal={false}
          showFacebookModal={false}
          showInstagramModal={false}
          showTikTokModal={false}
          showLinkedinModal={true}
          onCloseModal={onCloseModal}
          setShowPhoneModal={vi.fn()}
          setShowWebsiteModal={vi.fn()}
          setShowFacebookModal={vi.fn()}
          setShowInstagramModal={vi.fn()}
          setShowTikTokModal={vi.fn()}
          setShowLinkedinModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={dummyOrg}
          personalAction={personalAction}
          personalError="Invalid LinkedIn URL"
          isPending={false}
          phonePlaceholder="0712 345 678"
        />
      );
      expect(screen.getByText("Edit LinkedIn Profile")).toBeDefined();
      expect(screen.getByText("Invalid LinkedIn URL")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      fireEvent.click(screen.getByText("Edit LinkedIn Profile").closest(".fixed")!);
      expect(onCloseModal).toHaveBeenCalled();
    });

    it("renders OrgEditContactModal with null fallback values and US country format", () => {
      const bareOrg = {
        id: "bare-org",
        name: "Bare Org",
        organizationCategory: null,
        phoneNumber: null,
        website: null,
        description: null,
      };

      render(
        <OrgEditContactModal
          showPhoneModal={true}
          showWebsiteModal={false}
          showFacebookModal={false}
          showInstagramModal={false}
          showTikTokModal={false}
          showLinkedinModal={false}
          onCloseModal={onCloseModal}
          setShowPhoneModal={vi.fn()}
          setShowWebsiteModal={vi.fn()}
          setShowFacebookModal={vi.fn()}
          setShowInstagramModal={vi.fn()}
          setShowTikTokModal={vi.fn()}
          setShowLinkedinModal={vi.fn()}
          onCloseAllModals={onCloseAllModals}
          organization={bareOrg as any}
          personalAction={personalAction}
          personalError={null}
          isPending={true}
          phonePlaceholder="+1 (555) 000-0000"
          selectedCountry="United States"
        />
      );

      expect(screen.getByText("Edit Phone Number")).toBeDefined();
      expect(screen.getByText("Saving...")).toBeDefined();
    });
  });

  describe("OrgEditPasswordModal Additional Branches", () => {
    it("renders change password modal in dashboard mode with current password and mismatch error", () => {
      const setShowPasswordModal = vi.fn();
      render(
        <OrgEditPasswordModal
          showEmailModal={false}
          showRecoveryEmailModal={false}
          showPasswordModal={true}
          onCloseModal={onCloseModal}
          onCloseAllModals={onCloseAllModals}
          setShowEmailModal={vi.fn()}
          setShowRecoveryEmailModal={vi.fn()}
          setShowPasswordModal={setShowPasswordModal}
          organization={dummyOrg as any}
          accountAction={personalAction}
          accountError={null}
          isPending={false}
          isDashboard={true}
        />
      );

      expect(screen.getByText("Current Password")).toBeDefined();
      expect(screen.getAllByText("Change Password")[0]).toBeDefined();

      const newPassInput = screen.getByLabelText("New Password");
      const confirmPassInput = screen.getByLabelText("Confirm Password");

      fireEvent.change(newPassInput, { target: { value: "password123" } });
      fireEvent.change(confirmPassInput, { target: { value: "different123" } });

      expect(screen.getByText("Passwords do not match.")).toBeDefined();

      // Test eye toggle buttons
      const eyeBtns = screen.getAllByRole("button").filter(btn => btn.querySelector("svg"));
      if (eyeBtns.length >= 2) {
        fireEvent.click(eyeBtns[0]);
        fireEvent.click(eyeBtns[1]);
      }

      // Test backdrop click
      const backdrop = screen.getAllByText("Change Password")[0].closest(".fixed")!;
      fireEvent.click(backdrop);
      expect(onCloseAllModals).toHaveBeenCalled();
    });
  });
});
