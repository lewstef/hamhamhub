"use client";

import { useState, useActionState, useRef, useEffect, useTransition, useCallback } from "react";
import { updateOrganizationAction, changeOrganizationPasswordAction, toggleOrganizationServiceAction, toggleOrganizationCourseAction } from "@/app/actions/organizations";
import { getSortedCourses } from "@/config/dog-training";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Eye, EyeOff, Search, Check, User, ChevronRight, ChevronDown, X, Key, Shield, Mail, Home, Building, Map, Globe, Hash, MapPin, Phone, Lock, Settings } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { PasswordStrength } from "@/components/password-strength";
import { WysiwygEditor } from "./wysiwyg-editor";
import { ROMANIAN_COUNTIES, getCountyLocalities } from "@/config/romanian-territory";
import { CustomSelect } from "@/components/ui/custom-select";
import { normalizeSearchText } from "@/lib/utils";
import { OrgInfoTab } from "./org-form/org-info-tab";
import { OrgBillingTab } from "./org-form/org-billing-tab";
import { OrgSecurityTab } from "./org-form/org-security-tab";
import { OrgSubscriptionTab } from "./org-form/org-subscription-tab";
import { OrgServicesTab } from "./org-form/org-services-tab";
import { OrgVerificationTab } from "./org-form/org-verification-tab";
import { OrgEditNameCategoryModal } from "./org-form/modals/org-edit-name-category-modal";
import { OrgEditContactModal } from "./org-form/modals/org-edit-contact-modal";
import { OrgEditAddressModal } from "./org-form/modals/org-edit-address-modal";
import { OrgEditBillingModal } from "./org-form/modals/org-edit-billing-modal";
import { OrgEditPasswordModal } from "./org-form/modals/org-edit-password-modal";
import { OrgEditDescriptionModal } from "./org-form/modals/org-edit-description-modal";

interface Organization {
  id: string;
  name: string;
  email: string | null;
  organizationCategory: string | null;
  phoneNumber?: string | null;
  recoveryEmail?: string | null;
  addressCountry?: string | null;
  addressState?: string | null;
  addressCity?: string | null;
  addressLine?: string | null;
  addressZip?: string | null;
  address?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  website?: string | null;
  googleBusinessProfile?: string | null;
  description?: string | null;
  createdAt?: Date | string | null;
  enabledServices?: string | null;
  enabledCourses?: string | null;
  billingCompanyName?: string | null;
  billingTaxId?: string | null;
  billingTradeRegistryNumber?: string | null;
  billingEuid?: string | null;
  billingBankAccountNumber?: string | null;
  billingBankName?: string | null;
  billingContactName?: string | null;
  billingContactPhone?: string | null;
  billingContactEmail?: string | null;
  billingSecondaryContactName?: string | null;
  billingSecondaryContactPhone?: string | null;
  billingSecondaryContactEmail?: string | null;
}

interface OrganizationCategory {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  organizationCategory: string | null;
  slug: string | null;
  description: string | null;
  coursesOrder?: string | null;
}

interface EditOrganizationFormProps {
  organization: Organization;
  organizationCategoryList: OrganizationCategory[];
  servicesList?: Service[];
  activeTabProp?: "personal" | "account" | "subscription" | "services" | "billing" | "verification";
}



const ROMANIAN_BANKS = [
  "Banca Transilvania",
  "BCR (Banca Comercială Română)",
  "BRD (Groupe Société Générale)",
  "ING Bank",
  "Raiffeisen Bank",
  "UniCredit Bank",
  "CEC Bank",
  "Alpha Bank",
  "OTP Bank",
  "Garanti BBVA",
  "Libra Internet Bank",
  "Vista Bank",
  "Patria Bank",
  "First Bank",
  "ProCredit Bank",
  "Intesa Sanpaolo Bank",
  "Salt Bank",
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Urovay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

const COUNTRY_PHONE_PATTERNS: Record<string, { prefix: string; placeholder: string }> = {
  "United States": { prefix: "+1", placeholder: "+1 (555) 000-0000" },
  "Canada": { prefix: "+1", placeholder: "+1 (555) 000-0000" },
  "United Kingdom": { prefix: "+44", placeholder: "+44 7700 900077" },
  "Romania": { prefix: "+40", placeholder: "0723456789" },
  "Germany": { prefix: "+49", placeholder: "+49 170 1234567" },
  "France": { prefix: "+33", placeholder: "+33 6 12 34 56 78" },
  "Australia": { prefix: "+61", placeholder: "+61 491 570 156" },
  "Spain": { prefix: "+34", placeholder: "+34 612 345 678" },
  "Italy": { prefix: "+39", placeholder: "+39 312 345 6789" },
  "Netherlands": { prefix: "+31", placeholder: "+31 6 12345678" },
  "India": { prefix: "+91", placeholder: "+91 98765 43210" },
  "China": { prefix: "+86", placeholder: "+86 138 0000 0000" },
  "Japan": { prefix: "+81", placeholder: "+81 90-1234-5678" },
  "Brazil": { prefix: "+55", placeholder: "+55 11 98765-4321" },
};

function formatUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function renderLinkValue(value: string | null | undefined, type: "link" | "email" | "phone" = "link") {
  if (!value || !value.trim()) return <span className="text-sm text-foreground/90 font-medium">-</span>;
  const trimmed = value.trim();
  const href = type === "email" ? `mailto:${trimmed}` : type === "phone" ? `tel:${trimmed}` : formatUrl(trimmed) || "#";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-primary hover:underline font-medium truncate max-w-xs sm:max-w-md md:max-w-lg"
      onClick={(e) => e.stopPropagation()}
    >
      {trimmed}
    </a>
  );
}

export function EditOrganizationForm({
  organization,
  organizationCategoryList,
  servicesList = [],
  activeTabProp,
}: EditOrganizationFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  // Tab state
  const [localActiveTab, setLocalActiveTab] = useState<"personal" | "account" | "subscription" | "services" | "billing">("personal");

  const activeTab = activeTabProp || localActiveTab;

  // Granular Modal toggle states
  const [showNameModal, setShowNameModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [showLinkedinModal, setShowLinkedinModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showRecoveryEmailModal, setShowRecoveryEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showPrimaryContactModal, setShowPrimaryContactModal] = useState(false);
  const [showSecondaryContactModal, setShowSecondaryContactModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [editDescription, setEditDescription] = useState(organization.description || "");

  // Form states and actions
  const [personalState, personalAction, personalPending] = useActionState(updateOrganizationAction, null);
  const [accountState, accountAction, accountPending] = useActionState(changeOrganizationPasswordAction, null);

  const [modalSessionKey, setModalSessionKey] = useState(0);
  const [personalSubmitted, setPersonalSubmitted] = useState(false);
  const [accountSubmitted, setAccountSubmitted] = useState(false);

  const [personalError, setPersonalError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  const openModal = (setModalState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setPersonalError(null);
    setAccountError(null);
    setPersonalSubmitted(false);
    setAccountSubmitted(false);
    setPasswordVal("");
    setConfirmPasswordVal("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEditDescription(organization.description || "");
    setModalSessionKey((k) => k + 1);
    setModalState(true);
  };

  const closeAllModals = useCallback(() => {
    setPersonalError(null);
    setAccountError(null);
    setPersonalSubmitted(false);
    setAccountSubmitted(false);
    setPasswordVal("");
    setConfirmPasswordVal("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNameModal(false);
    setShowCategoryModal(false);
    setShowAddressModal(false);
    setShowPhoneModal(false);
    setShowWebsiteModal(false);
    setShowFacebookModal(false);
    setShowInstagramModal(false);
    setShowTikTokModal(false);
    setShowLinkedinModal(false);
    setShowEmailModal(false);
    setShowRecoveryEmailModal(false);
    setShowPasswordModal(false);
    setShowSocialModal(false);
    setShowBillingModal(false);
    setShowPrimaryContactModal(false);
    setShowSecondaryContactModal(false);
    setShowDescriptionModal(false);
  }, []);

  const closeModal = (setModalState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setPersonalError(null);
    setAccountError(null);
    setPersonalSubmitted(false);
    setAccountSubmitted(false);
    setPasswordVal("");
    setConfirmPasswordVal("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModalState(false);
  };

  // Handle ESC key press to close all open modals
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeAllModals();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAllModals]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordVal, setPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");

  // Country select state
  const [countrySearch, setCountrySearch] = useState(organization.addressCountry || "");
  const [editCountry, setEditCountry] = useState(organization.addressCountry || "");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Bank select state
  const [bankSearch, setBankSearch] = useState(organization.billingBankName || "");
  const [editBank, setEditBank] = useState(organization.billingBankName || "");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  // County search & select state
  const [countySearch, setCountySearch] = useState(organization.addressState || "");
  const [editCounty, setEditCounty] = useState(organization.addressState || "");
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const countyDropdownRef = useRef<HTMLDivElement>(null);

  // Locality search & select state
  const [localitySearch, setLocalitySearch] = useState(organization.addressCity || "");
  const [editLocality, setEditLocality] = useState(organization.addressCity || "");
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const localityDropdownRef = useRef<HTMLDivElement>(null);
  const localityInputRef = useRef<HTMLInputElement>(null);

  const availableLocalities = getCountyLocalities(editCounty);

  const selectCounty = (c: string) => {
    setEditCounty(c);
    setCountySearch(c);
    setShowCountyDropdown(false);
    setEditLocality("");
    setLocalitySearch("");
    setShowLocalityDropdown(true);
    setTimeout(() => {
      localityInputRef.current?.focus();
    }, 0);
  };

  const [enabledServiceIds, setEnabledServiceIds] = useState<string[]>(
    organization.enabledServices
      ? organization.enabledServices.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );
  const [enabledCourseIds, setEnabledCourseIds] = useState<string[]>(
    organization.enabledCourses
      ? organization.enabledCourses.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );
  const [expandedIds, setExpandedIds] = useState<string[]>(
    organization.enabledServices
      ? organization.enabledServices.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );
  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null);
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null);
  const [isTogglePending, startToggleTransition] = useTransition();

  const isPending = personalPending || accountPending || isTogglePending;
  const passwordsMatch = passwordVal === confirmPasswordVal;

  const isPasswordSubmitDisabled =
    isPending || !passwordsMatch || passwordVal === "" || passwordVal.length < 6 || confirmPasswordVal === "";

  // Keyboard highlight indexes
  const [countryHighlightIndex, setCountryHighlightIndex] = useState(0);
  const [bankHighlightIndex, setBankHighlightIndex] = useState(0);
  const [countyHighlightIndex, setCountyHighlightIndex] = useState(0);
  const [localityHighlightIndex, setLocalityHighlightIndex] = useState(0);

  const filteredCountries = COUNTRIES.filter((c) =>
    normalizeSearchText(c).includes(normalizeSearchText(countrySearch))
  );

  const filteredBanks = ROMANIAN_BANKS.filter((b) =>
    normalizeSearchText(b).includes(normalizeSearchText(bankSearch))
  );

  const filteredCounties = ROMANIAN_COUNTIES.filter((c) =>
    normalizeSearchText(c).includes(normalizeSearchText(countySearch))
  );

  const filteredLocalities = availableLocalities.filter((loc) =>
    normalizeSearchText(loc).includes(normalizeSearchText(localitySearch))
  );

  const handleCountryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCountryDropdown) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setShowCountryDropdown(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCountryHighlightIndex((prev) =>
        prev < filteredCountries.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCountryHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCountries.length - 1
      );
    } else if (e.key === "Enter") {
      if (countryHighlightIndex >= 0 && countryHighlightIndex < filteredCountries.length) {
        e.preventDefault();
        const selected = filteredCountries[countryHighlightIndex];
        setEditCountry(selected);
        setCountrySearch(selected);
        setShowCountryDropdown(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowCountryDropdown(false);
    }
  };

  const handleBankKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showBankDropdown) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setShowBankDropdown(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setBankHighlightIndex((prev) =>
        prev < filteredBanks.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setBankHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredBanks.length - 1
      );
    } else if (e.key === "Enter") {
      if (bankHighlightIndex >= 0 && bankHighlightIndex < filteredBanks.length) {
        e.preventDefault();
        const selected = filteredBanks[bankHighlightIndex];
        setEditBank(selected);
        setBankSearch(selected);
        setShowBankDropdown(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowBankDropdown(false);
    }
  };

  const handleCountyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCountyDropdown) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setShowCountyDropdown(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCountyHighlightIndex((prev) =>
        prev < filteredCounties.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCountyHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCounties.length - 1
      );
    } else if (e.key === "Enter") {
      if (countyHighlightIndex >= 0 && countyHighlightIndex < filteredCounties.length) {
        e.preventDefault();
        const selected = filteredCounties[countyHighlightIndex];
        selectCounty(selected);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowCountyDropdown(false);
    }
  };

  const handleLocalityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showLocalityDropdown && editCounty) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setShowLocalityDropdown(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setLocalityHighlightIndex((prev) =>
        prev < filteredLocalities.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setLocalityHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredLocalities.length - 1
      );
    } else if (e.key === "Enter") {
      if (localityHighlightIndex >= 0 && localityHighlightIndex < filteredLocalities.length) {
        e.preventDefault();
        const selected = filteredLocalities[localityHighlightIndex];
        setEditLocality(selected);
        setLocalitySearch(selected);
        setShowLocalityDropdown(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowLocalityDropdown(false);
    }
  };

  // Phone pattern check
  const selectedCountry = organization.addressCountry;
  const phonePatternInfo = selectedCountry ? COUNTRY_PHONE_PATTERNS[selectedCountry] : null;
  const phonePlaceholder = phonePatternInfo?.placeholder || "0723456789";

  // Format registration date
  const formattedRegistrationDate = organization.createdAt
    ? new Date(organization.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  // Sync personalState error & auto-close Personal Info modals on success
  useEffect(() => {
    if (personalState?.error) {
      setPersonalError(personalState.error);
    } else if (personalState?.success) {
      setPersonalError(null);
      setShowNameModal(false);
      setShowCategoryModal(false);
      setShowAddressModal(false);
      setShowPhoneModal(false);
      setShowWebsiteModal(false);
      setShowFacebookModal(false);
      setShowInstagramModal(false);
      setShowTikTokModal(false);
      setShowLinkedinModal(false);
      setShowSocialModal(false);
      setShowBillingModal(false);
      setShowPrimaryContactModal(false);
      setShowSecondaryContactModal(false);
      setShowDescriptionModal(false);
      router.refresh();
    }
  }, [personalState, router]);

  // Sync enabledServices and enabledCourses state if organization details change
  useEffect(() => {
    setEnabledServiceIds(
      organization.enabledServices
        ? organization.enabledServices.split(",").map((s) => s.trim()).filter(Boolean)
        : []
    );
    setEnabledCourseIds(
      organization.enabledCourses
        ? organization.enabledCourses.split(",").map((s) => s.trim()).filter(Boolean)
        : []
    );
  }, [organization.enabledServices, organization.enabledCourses]);

  useEffect(() => {
    setCountrySearch(organization.addressCountry || "");
    setEditCountry(organization.addressCountry || "");
  }, [organization.addressCountry]);

  useEffect(() => {
    setBankSearch(organization.billingBankName || "");
    setEditBank(organization.billingBankName || "");
  }, [organization.billingBankName]);

  useEffect(() => {
    setCountySearch(organization.addressState || "");
    setEditCounty(organization.addressState || "");
    setLocalitySearch(organization.addressCity || "");
    setEditLocality(organization.addressCity || "");
  }, [organization.addressState, organization.addressCity]);

  useEffect(() => {
    setEditDescription(organization.description || "");
  }, [organization.description]);

  useEffect(() => {
    setCountryHighlightIndex(0);
  }, [countrySearch]);

  useEffect(() => {
    setBankHighlightIndex(0);
  }, [bankSearch]);

  useEffect(() => {
    setCountyHighlightIndex(0);
  }, [countySearch]);

  useEffect(() => {
    setLocalityHighlightIndex(0);
  }, [localitySearch]);

  // Sync accountState error & auto-close Account modals on success
  useEffect(() => {
    if (accountState?.error) {
      setAccountError(accountState.error);
    } else if (accountState?.success) {
      setAccountError(null);
      setShowEmailModal(false);
      setShowRecoveryEmailModal(false);
      setShowPasswordModal(false);
      setPasswordVal("");
      setConfirmPasswordVal("");
      router.refresh();
    }
  }, [accountState, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setShowBankDropdown(false);
      }
      if (countyDropdownRef.current && !countyDropdownRef.current.contains(event.target as Node)) {
        setShowCountyDropdown(false);
      }
      if (localityDropdownRef.current && !localityDropdownRef.current.contains(event.target as Node)) {
        setShowLocalityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategoryName = organizationCategoryList.find(
    (c) => c.id === organization.organizationCategory
  )?.name || "NGO";

  const handleToggleService = (serviceId: string) => {
    const isCurrentlyEnabled = enabledServiceIds.includes(serviceId);
    setTogglingServiceId(serviceId);

    const nextIds = isCurrentlyEnabled
      ? enabledServiceIds.filter((id) => id !== serviceId)
      : [...enabledServiceIds, serviceId];
    setEnabledServiceIds(nextIds);

    if (!isCurrentlyEnabled) {
      setExpandedIds((prev) => [...prev, serviceId]);
    }

    startToggleTransition(async () => {
      const res = await toggleOrganizationServiceAction(organization.id, serviceId, !isCurrentlyEnabled);
      if (res?.success) {
        router.refresh();
      } else {
        setEnabledServiceIds(enabledServiceIds); // Rollback
      }
      setTogglingServiceId(null);
    });
  };

  const toggleExpand = (serviceId: string) => {
    setExpandedIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleToggleCourse = (courseId: string) => {
    const isCurrentlyEnabled = enabledCourseIds.includes(courseId);
    setTogglingCourseId(courseId);

    const nextIds = isCurrentlyEnabled
      ? enabledCourseIds.filter((id) => id !== courseId)
      : [...enabledCourseIds, courseId];
    setEnabledCourseIds(nextIds);

    startToggleTransition(async () => {
      const res = await toggleOrganizationCourseAction(organization.id, courseId, !isCurrentlyEnabled);
      if (res?.success) {
        router.refresh();
      } else {
        setEnabledCourseIds(enabledCourseIds); // Rollback
      }
      setTogglingCourseId(null);
    });
  };

  return (
    <div className={`space-y-6 ${activeTab === "billing" ? "w-full" : "max-w-4xl"}`}>
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Organization</h1>
        <p className="text-sm text-muted-foreground">
          Modify details for {organization.email || organization.name}.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border flex gap-6 text-sm">
        {[
          { id: "personal", label: "Information", path: "information" },
          { id: "billing", label: "Billing", path: "billing" },
          { id: "account", label: "Security", path: "security" },
          { id: "verification", label: "Verification", path: "verification" },
          { id: "subscription", label: "Subscription", path: "subscription" },
          ...(isDashboard ? [] : [{ id: "services", label: "Services", path: "services" }]),
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const className = `pb-2 px-1 focus:outline-none transition-all cursor-pointer font-semibold ${
            isActive
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`;

          if (activeTabProp) {
            const tabHref = isDashboard
              ? `/dashboard/account/${tab.path}`
              : `/backoffice/organizations/${tab.path}/${organization.id}`;
            return (
              <Link
                key={tab.id}
                href={tabHref}
                className={className}
              >
                {tab.label}
              </Link>
            );
          } else {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLocalActiveTab(tab.id as any)}
                className={className}
              >
                {tab.label}
              </button>
            );
          }
        })}
      </div>

      {/* TAB CONTENTS */}
      {activeTab === "personal" && (
        <OrgInfoTab
          organization={organization}
          selectedCategoryName={selectedCategoryName}
          formattedRegistrationDate={formattedRegistrationDate}
          isPending={isPending}
          onOpenNameModal={() => openModal(setShowNameModal)}
          onOpenEmailModal={() => openModal(setShowEmailModal)}
          onOpenPhoneModal={() => openModal(setShowPhoneModal)}
          onOpenWebsiteModal={() => openModal(setShowWebsiteModal)}
          onOpenFacebookModal={() => openModal(setShowFacebookModal)}
          onOpenInstagramModal={() => openModal(setShowInstagramModal)}
          onOpenTikTokModal={() => openModal(setShowTikTokModal)}
          onOpenLinkedinModal={() => openModal(setShowLinkedinModal)}
          onOpenDescriptionModal={() => openModal(setShowDescriptionModal)}
          onOpenCategoryModal={() => openModal(setShowCategoryModal)}
          renderLinkValue={renderLinkValue}
        />
      )}

      {activeTab === "billing" && (
        <OrgBillingTab
          organization={organization}
          isPending={isPending}
          onOpenBillingModal={() => openModal(setShowBillingModal)}
          onOpenAddressModal={() => openModal(setShowAddressModal)}
          onOpenPrimaryContactModal={() => openModal(setShowPrimaryContactModal)}
          onOpenSecondaryContactModal={() => openModal(setShowSecondaryContactModal)}
          renderLinkValue={renderLinkValue}
        />
      )}

      {activeTab === "account" && (
        <OrgSecurityTab
          organization={organization}
          isPending={isPending}
          onOpenEmailModal={() => openModal(setShowEmailModal)}
          onOpenRecoveryEmailModal={() => openModal(setShowRecoveryEmailModal)}
          onOpenPasswordModal={() => openModal(setShowPasswordModal)}
          renderLinkValue={renderLinkValue}
        />
      )}

      {activeTab === "verification" && (
        <OrgVerificationTab
          organization={organization}
          organizationCategoryList={organizationCategoryList}
          isBackoffice={!isDashboard}
        />
      )}

      {activeTab === "subscription" && (
        <OrgSubscriptionTab />
      )}

      {activeTab === "services" && (
        <OrgServicesTab
          organization={organization}
          servicesList={servicesList}
          isDashboard={isDashboard}
          enabledServiceIds={enabledServiceIds}
          enabledCourseIds={enabledCourseIds}
          expandedIds={expandedIds}
          togglingServiceId={togglingServiceId}
          togglingCourseId={togglingCourseId}
          isPending={isPending}
          onToggleService={handleToggleService}
          onToggleCourse={handleToggleCourse}
          onToggleExpand={toggleExpand}
        />
      )}

      {!isDashboard && (
        <div className="flex justify-start">
          <Link href="/backoffice/organizations" className={buttonVariants({ variant: "outline" })}>
            Back to list
          </Link>
        </div>
      )}

      {/* MODAL POPUPS DELEGATION */}
      <OrgEditNameCategoryModal
        showNameModal={showNameModal}
        showCategoryModal={showCategoryModal}
        onCloseModal={closeModal}
        setShowNameModal={setShowNameModal}
        setShowCategoryModal={setShowCategoryModal}
        onCloseAllModals={closeAllModals}
        organization={organization}
        organizationCategoryList={organizationCategoryList}
        personalAction={personalAction}
        personalError={personalError}
        isPending={isPending}
      />

      <OrgEditAddressModal
        showAddressModal={showAddressModal}
        onCloseModal={closeModal}
        setShowAddressModal={setShowAddressModal}
        onCloseAllModals={closeAllModals}
        organization={organization}
        personalAction={personalAction}
        personalError={personalError}
        isPending={isPending}
        countyDropdownRef={countyDropdownRef}
        editCounty={editCounty}
        setEditCounty={setEditCounty}
        countySearch={countySearch}
        setCountySearch={setCountySearch}
        showCountyDropdown={showCountyDropdown}
        setShowCountyDropdown={setShowCountyDropdown}
        filteredCounties={filteredCounties}
        countyHighlightIndex={countyHighlightIndex}
        setCountyHighlightIndex={setCountyHighlightIndex}
        selectCounty={selectCounty}
        handleCountyKeyDown={handleCountyKeyDown}
        localityDropdownRef={localityDropdownRef}
        localityInputRef={localityInputRef}
        editLocality={editLocality}
        setEditLocality={setEditLocality}
        localitySearch={localitySearch}
        setLocalitySearch={setLocalitySearch}
        showLocalityDropdown={showLocalityDropdown}
        setShowLocalityDropdown={setShowLocalityDropdown}
        filteredLocalities={filteredLocalities}
        localityHighlightIndex={localityHighlightIndex}
        setLocalityHighlightIndex={setLocalityHighlightIndex}
        handleLocalityKeyDown={handleLocalityKeyDown}
      />

      <OrgEditContactModal
        showPhoneModal={showPhoneModal}
        showWebsiteModal={showWebsiteModal}
        showFacebookModal={showFacebookModal}
        showInstagramModal={showInstagramModal}
        showTikTokModal={showTikTokModal}
        showLinkedinModal={showLinkedinModal}
        onCloseModal={closeModal}
        setShowPhoneModal={setShowPhoneModal}
        setShowWebsiteModal={setShowWebsiteModal}
        setShowFacebookModal={setShowFacebookModal}
        setShowInstagramModal={setShowInstagramModal}
        setShowTikTokModal={setShowTikTokModal}
        setShowLinkedinModal={setShowLinkedinModal}
        onCloseAllModals={closeAllModals}
        organization={organization}
        personalAction={personalAction}
        personalError={personalError}
        isPending={isPending}
        phonePlaceholder={phonePlaceholder}
        phonePatternInfo={phonePatternInfo}
        selectedCountry={selectedCountry}
      />

      <OrgEditBillingModal
        showBillingModal={showBillingModal}
        showPrimaryContactModal={showPrimaryContactModal}
        showSecondaryContactModal={showSecondaryContactModal}
        onCloseModal={closeModal}
        setShowBillingModal={setShowBillingModal}
        setShowPrimaryContactModal={setShowPrimaryContactModal}
        setShowSecondaryContactModal={setShowSecondaryContactModal}
        onCloseAllModals={closeAllModals}
        organization={organization}
        personalAction={personalAction}
        personalError={personalError}
        isPending={isPending}
        bankDropdownRef={bankDropdownRef}
        editBank={editBank}
        setEditBank={setEditBank}
        bankSearch={bankSearch}
        setBankSearch={setBankSearch}
        showBankDropdown={showBankDropdown}
        setShowBankDropdown={setShowBankDropdown}
        filteredBanks={filteredBanks}
        bankHighlightIndex={bankHighlightIndex}
        setBankHighlightIndex={setBankHighlightIndex}
        handleBankKeyDown={handleBankKeyDown}
      />

      <OrgEditPasswordModal
        showEmailModal={showEmailModal}
        showRecoveryEmailModal={showRecoveryEmailModal}
        showPasswordModal={showPasswordModal}
        onCloseModal={closeModal}
        setShowEmailModal={setShowEmailModal}
        setShowRecoveryEmailModal={setShowRecoveryEmailModal}
        setShowPasswordModal={setShowPasswordModal}
        onCloseAllModals={closeAllModals}
        organization={organization}
        accountAction={accountAction}
        accountError={accountError}
        isPending={isPending}
        isDashboard={isDashboard}
      />

      <OrgEditDescriptionModal
        showDescriptionModal={showDescriptionModal}
        onCloseModal={closeModal}
        setShowDescriptionModal={setShowDescriptionModal}
        onCloseAllModals={closeAllModals}
        organization={organization}
        personalAction={personalAction}
        personalError={personalError}
        isPending={isPending}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
      />
    </div>
  );
}
