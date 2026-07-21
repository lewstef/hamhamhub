"use client";

import { useState, useActionState, useRef, useEffect, useTransition } from "react";
import { updateOrganizationAction, changeOrganizationPasswordAction, toggleOrganizationServiceAction, toggleOrganizationCourseAction } from "@/app/actions/organizations";
import { getSortedCourses } from "@/config/dog-training";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Eye, EyeOff, Search, Check, User, ChevronRight, ChevronDown, X, Key, Shield, Mail, Home, Building, Map, Globe, Hash, MapPin, Phone, Lock, Settings } from "lucide-react";
import { PasswordStrength } from "@/components/password-strength";
import { WysiwygEditor } from "./wysiwyg-editor";
import { ROMANIAN_COUNTIES, getCountyLocalities } from "@/config/romanian-territory";

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
  activeTabProp?: "personal" | "account" | "subscription" | "services" | "billing";
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
  "Romania": { prefix: "+40", placeholder: "+40 722 123 456" },
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
    c.toLowerCase().includes((countrySearch || "").toLowerCase())
  );

  const filteredBanks = ROMANIAN_BANKS.filter((b) =>
    b.toLowerCase().includes((bankSearch || "").toLowerCase())
  );

  const filteredCounties = ROMANIAN_COUNTIES.filter((c) =>
    c.toLowerCase().includes((countySearch || "").toLowerCase())
  );

  const filteredLocalities = availableLocalities.filter((loc) =>
    loc.toLowerCase().includes((localitySearch || "").toLowerCase())
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
  const phonePlaceholder = phonePatternInfo?.placeholder || "+1 (555) 000-0000";

  // Format registration date
  const formattedRegistrationDate = organization.createdAt
    ? new Date(organization.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  // Auto-close Personal Info modals on success & refresh data
  useEffect(() => {
    if (personalState?.success) {
      setShowNameModal(false);
      setShowCategoryModal(false);
      setShowAddressModal(false);
      setShowPhoneModal(false);
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

  // Auto-close Account modals on success & refresh data
  useEffect(() => {
    if (accountState?.success) {
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

      {/* CARD 1: Information */}
      {activeTab === "personal" && (
        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
          <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <User className="size-5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">Information</CardTitle>
          </div>
          <CardContent className="p-0">
            <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
              Manage your basic organization profile details
            </div>
            <div className="divide-y divide-border/50">
              {/* Name Row */}
              <button
                type="button"
                onClick={() => setShowNameModal(true)}
                aria-label="Edit Name"
                disabled={isPending}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
              >
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Name</span>
                  <span className="text-sm font-semibold text-foreground">{organization.name}</span>
                </div>
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Email Row */}
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                aria-label="Edit Email"
                disabled={isPending}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
              >
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Email</span>
                  <span className="text-sm text-foreground/90">{organization.email || "-"}</span>
                </div>
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Phone Row */}
              <button
                type="button"
                onClick={() => setShowPhoneModal(true)}
                aria-label="Edit Phone"
                disabled={isPending}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
              >
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Phone</span>
                  <span className="text-sm text-foreground/90">{organization.phoneNumber || "-"}</span>
                </div>
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Description Row */}
              <button
                type="button"
                onClick={() => setShowDescriptionModal(true)}
                aria-label="Edit Description"
                disabled={isPending}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
              >
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Description</span>
                  <span className="text-sm text-foreground/90 truncate max-w-xs sm:max-w-md md:max-w-lg">
                    {organization.description ? organization.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "-" : "-"}
                  </span>
                </div>
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Category Row */}
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                aria-label="Edit Category"
                disabled={isPending}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
              >
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Category</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {selectedCategoryName}
                  </span>
                </div>
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Member since Row */}
              <div className="w-full flex items-center justify-between px-6 py-4 text-left">
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Member since</span>
                  <span className="text-sm text-foreground/90 font-medium">{formattedRegistrationDate}</span>
                </div>
              </div>

              {/* Subscription Row */}
              <div className="w-full flex items-center justify-between px-6 py-4 text-left">
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Subscription</span>
                  <span className="text-sm text-foreground/90 font-medium">-</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CARD 1.2: Billing details */}
      {activeTab === "billing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1.2: Company details */}
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
            <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Building className="size-5" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">Company information</CardTitle>
            </div>
            <CardContent className="p-0">
              <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
                The information provided below will reflect on your invoices
              </div>
              <div className="divide-y divide-border/50">
                {/* Company Name Row */}
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  aria-label="Edit Billing Company Name"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Company name</span>
                    <span className="text-sm text-foreground/90">{organization.billingCompanyName || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Tax ID Row */}
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  aria-label="Edit Billing Tax ID"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Tax ID</span>
                    <span className="text-sm text-foreground/90">{organization.billingTaxId || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Trade Registry Number Row */}
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  aria-label="Edit Billing Trade Registry Number"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Trade Registry Number</span>
                    <span className="text-sm text-foreground/90">{organization.billingTradeRegistryNumber || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* EUID Row */}
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  aria-label="Edit Billing EUID"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">EUID</span>
                    <span className="text-sm text-foreground/90">{organization.billingEuid || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Address Row */}
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  aria-label="Edit Address"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Address</span>
                    <span className="text-sm text-foreground/90">{organization.address || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Bank Row */}
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  aria-label="Edit Billing Bank"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Bank</span>
                    <span className="text-sm text-foreground/90">{organization.billingBankName || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Bank Account Number Row */}
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  aria-label="Edit Billing Bank Account Number"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Bank Account Number</span>
                    <span className="text-sm text-foreground/90">{organization.billingBankAccountNumber || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* CARD 1.3: Contact details */}
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
            <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <User className="size-5" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">Contact information</CardTitle>
            </div>
            <CardContent className="p-0">
              <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
                Primary and secondary contact persons for this organization
              </div>

              {/* Primary Contact Person Section */}
              <div className="px-6 py-2.5 bg-muted/20 border-b border-border/50 text-xs font-bold text-muted-foreground/90">
                Primary Contact Person
              </div>
              <div className="divide-y divide-border/50 border-b border-border/50">
                {/* Primary Contact Name */}
                <button
                  type="button"
                  onClick={() => setShowPrimaryContactModal(true)}
                  aria-label="Edit Primary Contact Person Name"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Name</span>
                    <span className="text-sm text-foreground/90">{organization.billingContactName || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Primary Contact Phone */}
                <button
                  type="button"
                  onClick={() => setShowPrimaryContactModal(true)}
                  aria-label="Edit Primary Contact Person Phone"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Phone</span>
                    <span className="text-sm text-foreground/90">{organization.billingContactPhone || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Primary Contact Email */}
                <button
                  type="button"
                  onClick={() => setShowPrimaryContactModal(true)}
                  aria-label="Edit Primary Contact Person Email"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Email</span>
                    <span className="text-sm text-foreground/90">{organization.billingContactEmail || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* Secondary Contact Person Section */}
              <div className="px-6 py-2.5 bg-muted/20 border-b border-border/50 text-xs font-bold text-muted-foreground/90 flex items-center justify-between">
                <span>Secondary Contact Person</span>
                <span className="text-[10px] font-normal normal-case text-muted-foreground/70">(Optional)</span>
              </div>
              <div className="divide-y divide-border/50">
                {/* Secondary Contact Name */}
                <button
                  type="button"
                  onClick={() => setShowSecondaryContactModal(true)}
                  aria-label="Edit Secondary Contact Person Name"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Name</span>
                    <span className="text-sm text-foreground/90">{organization.billingSecondaryContactName || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Secondary Contact Phone */}
                <button
                  type="button"
                  onClick={() => setShowSecondaryContactModal(true)}
                  aria-label="Edit Secondary Contact Person Phone"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Phone</span>
                    <span className="text-sm text-foreground/90">{organization.billingSecondaryContactPhone || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Secondary Contact Email */}
                <button
                  type="button"
                  onClick={() => setShowSecondaryContactModal(true)}
                  aria-label="Edit Secondary Contact Person Email"
                  disabled={isPending}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
                >
                  <div className="flex flex-1 items-center">
                    <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Email</span>
                    <span className="text-sm text-foreground/90">{organization.billingSecondaryContactEmail || "-"}</span>
                  </div>
                  <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CARD 2: Security */}
      {activeTab === "account" && (
        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
          <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Mail className="size-5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">Security</CardTitle>
          </div>
          <CardContent className="p-0">
            <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
              Manage your login credentials, recovery email, and security settings
            </div>
            <div className="divide-y divide-border/50">
              {/* Email Row */}
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                aria-label="Edit Email"
                disabled={isPending}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
              >
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Email</span>
                  <span className="text-sm font-semibold text-foreground">{organization.email}</span>
                </div>
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Recovery Email Row */}
              <button
                type="button"
                onClick={() => setShowRecoveryEmailModal(true)}
                aria-label="Edit Recovery email"
                disabled={isPending}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
              >
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Recovery email</span>
                  <span className="text-sm text-foreground/90">{organization.recoveryEmail || "-"}</span>
                </div>
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Password Row */}
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                aria-label="Edit Password"
                disabled={isPending}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
              >
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Password</span>
                  <span className="text-sm font-mono text-foreground/80">••••••••</span>
                </div>
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CARD 3: Subscription (Empty) */}
      {activeTab === "subscription" && (
        <Card className="border border-border shadow-sm rounded-xl bg-card p-12 text-center text-muted-foreground">
          No subscription details currently configured.
        </Card>
      )}

      {/* CARD 4: Services */}
      {activeTab === "services" && (
        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
          <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Settings className="size-5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">Services Configuration</CardTitle>
          </div>
          <CardContent className="p-0">
            <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
              Enable or disable services offered by this organization.
            </div>
            {servicesList.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No active services associated with this organization's category.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {servicesList.map((s) => {
                  const isEnabled = enabledServiceIds.includes(s.id);
                  const isLoading = togglingServiceId === s.id && isPending;
                  return (
                    <div key={s.id} className="flex flex-col">
                      <div className="flex items-center justify-between px-6 py-4 hover:bg-muted/10 transition-colors">
                        <div className="flex flex-col gap-1.5 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{s.name}</span>
                            {isEnabled && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground leading-relaxed">
                            {s.description || "No description provided."}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {isEnabled && s.slug === "dog-training" && getSortedCourses(s.coursesOrder).length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(s.id)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                              title={expandedIds.includes(s.id) ? "Collapse courses" : "Expand courses"}
                            >
                              <ChevronDown
                                className={`size-4.5 transition-transform duration-200 ${
                                  expandedIds.includes(s.id) ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}
                          {isEnabled && (
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => {
                                if (s.slug === "dog-training") {
                                  if (isDashboard) {
                                    router.push(`/dashboard/services/dog-training`);
                                  } else {
                                    router.push(`/backoffice/organizations/services/${s.slug}/${organization.id}`);
                                  }
                                } else {
                                  router.push(`/backoffice/organizations/services/${s.slug}/${organization.id}`);
                                }
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isEnabled}
                            disabled={isLoading}
                            onClick={() => handleToggleService(s.id)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${
                              isEnabled ? "bg-primary" : "bg-muted-foreground/30"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                                isEnabled ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Nested Courses Accordion (for Dog training) */}
                      {isEnabled && s.slug === "dog-training" && getSortedCourses(s.coursesOrder).length > 0 && (
                        <div
                          className={`grid transition-all duration-200 ease-in-out border-t border-border/30 bg-muted/5 ${
                            expandedIds.includes(s.id)
                              ? "grid-rows-[1fr] opacity-100 py-5 pl-12 pr-6"
                              : "grid-rows-[0fr] opacity-0 py-0 pl-12 pr-6 overflow-hidden"
                          }`}
                        >
                          <div className="overflow-hidden space-y-3">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                              Courses Configured
                            </div>
                            <div className="divide-y divide-border/20 border border-border/40 rounded-lg bg-card overflow-hidden">
                              {getSortedCourses(s.coursesOrder).map((sub) => {
                                const isSubEnabled = enabledCourseIds.includes(sub.id);
                                const isSubLoading = togglingCourseId === sub.id && isPending;

                                return (
                                  <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                                    <span className="text-sm font-semibold text-foreground/90">
                                      {sub.label}
                                    </span>

                                    <div className="flex items-center gap-4">
                                      {isSubEnabled && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          type="button"
                                          className="h-8 px-3"
                                          onClick={() => router.push(`/backoffice/organizations/services/dog-training/${sub.key}/${organization.id}`)}
                                        >
                                          Edit
                                        </Button>
                                      )}
                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={isSubEnabled}
                                        disabled={isSubLoading}
                                        onClick={() => handleToggleCourse(sub.id)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                                          isSubEnabled ? "bg-primary" : "bg-muted-foreground/30"
                                        }`}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                                            isSubEnabled ? "translate-x-4" : "translate-x-0"
                                          }`}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isDashboard && (
        <div className="flex justify-start">
          <Link href="/backoffice/organizations" className={buttonVariants({ variant: "outline" })}>
            Back to list
          </Link>
        </div>
      )}

      {/* POPUP 1: Edit Name (Identity) */}
      {showNameModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <User className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Name</CardTitle>
                <CardDescription className="text-xs">Update your organization's official profile name.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />
              <input type="hidden" name="phoneNumber" value={organization.phoneNumber || ""} />
              <input type="hidden" name="addressCountry" value={organization.addressCountry || ""} />
              <input type="hidden" name="addressState" value={organization.addressState || ""} />
              <input type="hidden" name="addressCity" value={organization.addressCity || ""} />
              <input type="hidden" name="addressLine" value={organization.addressLine || ""} />
              <input type="hidden" name="addressZip" value={organization.addressZip || ""} />

              <CardContent className="p-6 space-y-4">
                {personalState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalState.error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Organization Name
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        defaultValue={organization.name}
                        required
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowNameModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 1.5: Edit Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Settings className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Category</CardTitle>
                <CardDescription className="text-xs">Update organization Operational Category classification.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="phoneNumber" value={organization.phoneNumber || ""} />
              <input type="hidden" name="addressCountry" value={organization.addressCountry || ""} />
              <input type="hidden" name="addressState" value={organization.addressState || ""} />
              <input type="hidden" name="addressCity" value={organization.addressCity || ""} />
              <input type="hidden" name="addressLine" value={organization.addressLine || ""} />
              <input type="hidden" name="addressZip" value={organization.addressZip || ""} />

              <CardContent className="p-6 space-y-4">
                {personalState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalState.error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="organizationCategory" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Organization Category
                    </Label>
                    <select
                      id="organizationCategory"
                      name="organizationCategory"
                      defaultValue={organization.organizationCategory || ""}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {organizationCategoryList.map((t) => (
                        <option key={t.id} value={t.id} className="bg-popover text-popover-foreground">
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 2: Edit Address */}
      {/* POPUP 4: Edit Address Details */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <MapPin className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Address Details</CardTitle>
                <CardDescription className="text-xs">Update your organization's physical billing coordinates.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />
              <input type="hidden" name="phoneNumber" value={organization.phoneNumber || ""} />
              <input type="hidden" name="addressCountry" value="Romania" />

              <CardContent className="p-6 space-y-4 bg-muted/5">
                {personalState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalState.error}
                  </div>
                )}
                 <div className="space-y-4">
                  {/* County & Locality */}
                  <div className="grid gap-4 grid-cols-2">
                    {/* County Search Select */}
                    <div className="space-y-1.5 relative" ref={countyDropdownRef}>
                      <input type="hidden" name="addressState" value={editCounty} />
                      <Label htmlFor="addressState" className="text-sm font-medium normal-case text-muted-foreground/80">
                        County <span className="text-destructive font-semibold">*</span>
                      </Label>
                      <div className="relative">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                        <Input
                          id="addressState"
                          type="text"
                          value={countySearch}
                          onChange={(e) => {
                            setCountySearch(e.target.value);
                            setEditCounty(e.target.value);
                            setShowCountyDropdown(true);
                          }}
                          onFocus={() => setShowCountyDropdown(true)}
                          onKeyDown={handleCountyKeyDown}
                          placeholder="Search county..."
                          required
                          className="pl-9 pr-10 focus-visible:ring-primary/20"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          {countySearch && (
                            <button
                              type="button"
                              aria-label="Clear county selection"
                              onClick={() => {
                                setCountySearch("");
                                setEditCounty("");
                                setLocalitySearch("");
                                setEditLocality("");
                                setShowCountyDropdown(false);
                              }}
                              className="text-muted-foreground/60 hover:text-foreground/90 transition-colors p-0.5"
                            >
                              <X className="size-3.5" />
                            </button>
                          )}
                          <ChevronDown className="size-4 text-muted-foreground/60 pointer-events-none" />
                        </div>
                      </div>

                      {showCountyDropdown && filteredCounties.length > 0 && (
                        <div className="absolute z-50 w-full mt-1.5 bg-popover border border-border/80 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200 p-1.5 backdrop-blur-md">
                          {filteredCounties.map((c, index) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => selectCounty(c)}
                              onMouseEnter={() => setCountyHighlightIndex(index)}
                              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 focus:outline-none flex items-center justify-between font-medium cursor-pointer mb-0.5 last:mb-0 ${
                                countyHighlightIndex === index
                                  ? "bg-accent text-accent-foreground"
                                  : "text-popover-foreground hover:bg-accent/80 hover:text-accent-foreground"
                              }`}
                            >
                              <span>{c}</span>
                              {editCounty === c && <Check className="size-4 text-primary" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Locality Search Select */}
                    <div className="space-y-1.5 relative" ref={localityDropdownRef}>
                      <input type="hidden" name="addressCity" value={editLocality} />
                      <Label htmlFor="addressCity" className="text-sm font-medium normal-case text-muted-foreground/80">
                        Locality <span className="text-destructive font-semibold">*</span>
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                        <Input
                          id="addressCity"
                          ref={localityInputRef}
                          type="text"
                          value={localitySearch}
                          disabled={!editCounty}
                          onChange={(e) => {
                            setLocalitySearch(e.target.value);
                            setEditLocality(e.target.value);
                            setShowLocalityDropdown(true);
                          }}
                          onFocus={() => {
                            if (editCounty) setShowLocalityDropdown(true);
                          }}
                          onKeyDown={handleLocalityKeyDown}
                          placeholder={editCounty ? "Search locality..." : "Select county first..."}
                          required
                          className="pl-9 pr-10 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          {localitySearch && (
                            <button
                              type="button"
                              aria-label="Clear locality selection"
                              onClick={() => {
                                setLocalitySearch("");
                                setEditLocality("");
                                setShowLocalityDropdown(false);
                              }}
                              className="text-muted-foreground/60 hover:text-foreground/90 transition-colors p-0.5"
                            >
                              <X className="size-3.5" />
                            </button>
                          )}
                          <ChevronDown className="size-4 text-muted-foreground/60 pointer-events-none" />
                        </div>
                      </div>

                      {showLocalityDropdown && editCounty && filteredLocalities.length > 0 && (
                        <div className="absolute z-50 w-full mt-1.5 bg-popover border border-border/80 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200 p-1.5 backdrop-blur-md">
                          {filteredLocalities.map((loc, index) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setEditLocality(loc);
                                setLocalitySearch(loc);
                                setShowLocalityDropdown(false);
                              }}
                              onMouseEnter={() => setLocalityHighlightIndex(index)}
                              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 focus:outline-none flex items-center justify-between font-medium cursor-pointer mb-0.5 last:mb-0 ${
                                localityHighlightIndex === index
                                  ? "bg-accent text-accent-foreground"
                                  : "text-popover-foreground hover:bg-accent/80 hover:text-accent-foreground"
                              }`}
                            >
                              <span>{loc}</span>
                              {editLocality === loc && <Check className="size-4 text-primary" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="addressLine" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Street Address <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="addressLine"
                        name="addressLine"
                        type="text"
                        defaultValue={organization.addressLine || ""}
                        placeholder="123 Main Street, Suite 100"
                        required
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Zip Code */}
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="addressZip" className="text-sm font-medium normal-case text-muted-foreground/80">
                        Zip code
                      </Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                        <Input
                          id="addressZip"
                          name="addressZip"
                          type="text"
                          defaultValue={organization.addressZip || ""}
                          placeholder="12345"
                          className="pl-9 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowAddressModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 3: Edit Phone Number */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Phone className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Phone Number</CardTitle>
                <CardDescription className="text-xs">Update organization main primary phone contact.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />
              <input type="hidden" name="addressCountry" value={organization.addressCountry || ""} />
              <input type="hidden" name="addressState" value={organization.addressState || ""} />
              <input type="hidden" name="addressCity" value={organization.addressCity || ""} />
              <input type="hidden" name="addressLine" value={organization.addressLine || ""} />
              <input type="hidden" name="addressZip" value={organization.addressZip || ""} />

              <CardContent className="p-6 space-y-4">
                {personalState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalState.error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Phone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="text"
                        defaultValue={organization.phoneNumber || ""}
                        placeholder={phonePlaceholder}
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                    {phonePatternInfo && (
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        Expected format for {selectedCountry}: <span className="font-mono text-foreground font-semibold">{phonePatternInfo.placeholder}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowPhoneModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 4: Edit Email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Mail className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Email</CardTitle>
                <CardDescription className="text-xs">Modify login email credentials.</CardDescription>
              </div>
            </CardHeader>
            <form action={accountAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="recoveryEmail" value={organization.recoveryEmail || ""} />
              <CardContent className="p-6 space-y-4">
                {accountState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {accountState.error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={organization.email || ""}
                        required
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowEmailModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 4.5: Edit Recovery Email */}
      {showRecoveryEmailModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Shield className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Recovery Email</CardTitle>
                <CardDescription className="text-xs">Modify account backup recovery contact mail.</CardDescription>
              </div>
            </CardHeader>
            <form action={accountAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="email" value={organization.email || ""} />
              <CardContent className="p-6 space-y-4">
                {accountState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {accountState.error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="recoveryEmail" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Recovery email
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="recoveryEmail"
                        name="recoveryEmail"
                        type="email"
                        defaultValue={organization.recoveryEmail || ""}
                        placeholder="backup@example.com"
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowRecoveryEmailModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 5: Edit Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Lock className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                <CardDescription className="text-xs">Set a new operational access password for safety.</CardDescription>
              </div>
            </CardHeader>
            <form action={accountAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="email" value={organization.email || ""} />
              <input type="hidden" name="recoveryEmail" value={organization.recoveryEmail || ""} />

              <CardContent className="p-6 space-y-4">
                {accountState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {accountState.error}
                  </div>
                )}
                <div className="space-y-4">
                  {isDashboard && (
                    <div className="space-y-1.5">
                      <Label htmlFor="currentPassword" className="text-sm font-medium normal-case text-muted-foreground/80">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          placeholder="••••••••"
                          required
                          className="pl-9 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium normal-case text-muted-foreground/80">
                      New Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={passwordVal}
                        onChange={(e) => setPasswordVal(e.target.value)}
                        className="pl-9 pr-10 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={passwordVal} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={confirmPasswordVal}
                        onChange={(e) => setConfirmPasswordVal(e.target.value)}
                        className="pl-9 pr-10 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {passwordVal !== "" && confirmPasswordVal !== "" && !passwordsMatch && (
                      <p className="text-xs font-medium text-destructive mt-1">Passwords do not match.</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPasswordSubmitDisabled}>
                    {isPending ? "Saving..." : "Change Password"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
      {/* POPUP 6: Edit Billing Details */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Building className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Company details</CardTitle>
                <CardDescription className="text-xs">Update your organization billing details used on invoices.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-4">
                {personalState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalState.error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingCompanyName" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Company name <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingCompanyName"
                      name="billingCompanyName"
                      type="text"
                      key={organization.billingCompanyName || ""}
                      defaultValue={organization.billingCompanyName || ""}
                      required
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingTaxId" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Tax ID <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingTaxId"
                      name="billingTaxId"
                      type="text"
                      key={organization.billingTaxId || ""}
                      defaultValue={organization.billingTaxId || ""}
                      required
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingTradeRegistryNumber" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Trade Registry Number <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingTradeRegistryNumber"
                      name="billingTradeRegistryNumber"
                      type="text"
                      key={organization.billingTradeRegistryNumber || ""}
                      defaultValue={organization.billingTradeRegistryNumber || ""}
                      placeholder="J40/1234/2020"
                      required
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingEuid" className="text-sm font-medium normal-case text-muted-foreground/80">
                      EUID <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingEuid"
                      name="billingEuid"
                      type="text"
                      key={organization.billingEuid || ""}
                      defaultValue={organization.billingEuid || ""}
                      required
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  {/* Bank select with suggestions */}
                  <div className="space-y-1.5 relative" ref={bankDropdownRef}>
                    <Label htmlFor="billingBankName" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Bank
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="billingBankName"
                        name="billingBankName"
                        type="text"
                        value={bankSearch}
                        onChange={(e) => {
                          setBankSearch(e.target.value);
                          setEditBank(e.target.value);
                          setShowBankDropdown(true);
                        }}
                        onFocus={() => setShowBankDropdown(true)}
                        onKeyDown={handleBankKeyDown}
                        placeholder="Search or select bank..."
                        className="pl-9 pr-10 focus-visible:ring-primary/20"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {bankSearch && (
                          <button
                            type="button"
                            aria-label="Clear bank selection"
                            onClick={() => {
                              setBankSearch("");
                              setEditBank("");
                              setShowBankDropdown(false);
                            }}
                            className="text-muted-foreground/60 hover:text-foreground/90 transition-colors p-0.5"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                        <ChevronDown className="size-4 text-muted-foreground/60 pointer-events-none" />
                      </div>
                    </div>

                    {showBankDropdown && filteredBanks.length > 0 && (
                      <div className="absolute z-50 w-full mt-1.5 bg-popover border border-border/80 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200 p-1.5 backdrop-blur-md">
                        {filteredBanks.map((b, index) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setEditBank(b);
                              setBankSearch(b);
                              setShowBankDropdown(false);
                            }}
                            onMouseEnter={() => setBankHighlightIndex(index)}
                            className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 focus:outline-none flex items-center justify-between font-medium cursor-pointer mb-0.5 last:mb-0 ${
                              bankHighlightIndex === index
                                ? "bg-accent text-accent-foreground"
                                : "text-popover-foreground hover:bg-accent/80 hover:text-accent-foreground"
                            }`}
                          >
                            <span>{b}</span>
                            {editBank === b && <Check className="size-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingBankAccountNumber" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Bank Account Number
                    </Label>
                    <Input
                      id="billingBankAccountNumber"
                      name="billingBankAccountNumber"
                      type="text"
                      key={organization.billingBankAccountNumber || ""}
                      defaultValue={organization.billingBankAccountNumber || ""}
                      className="focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowBillingModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 7: Edit Primary Contact Details */}
      {showPrimaryContactModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <User className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Primary Contact</CardTitle>
                <CardDescription className="text-xs">Update your organization's primary contact details.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-6">
                {personalState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalState.error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingContactName" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Name <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingContactName"
                      name="billingContactName"
                      type="text"
                      key={organization.billingContactName || ""}
                      defaultValue={organization.billingContactName || ""}
                      required
                      placeholder="e.g. Jane Doe"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingContactPhone" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Phone <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingContactPhone"
                      name="billingContactPhone"
                      type="text"
                      key={organization.billingContactPhone || ""}
                      defaultValue={organization.billingContactPhone || ""}
                      required
                      placeholder="+40 700 000 000"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingContactEmail" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Email <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingContactEmail"
                      name="billingContactEmail"
                      type="email"
                      key={organization.billingContactEmail || ""}
                      defaultValue={organization.billingContactEmail || ""}
                      required
                      placeholder="jane@organization.org"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowPrimaryContactModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 8: Edit Secondary Contact Details */}
      {showSecondaryContactModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <User className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Secondary Contact</CardTitle>
                <CardDescription className="text-xs">Update your organization's secondary contact details (optional).</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-6">
                {personalState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalState.error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingSecondaryContactName" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Name
                    </Label>
                    <Input
                      id="billingSecondaryContactName"
                      name="billingSecondaryContactName"
                      type="text"
                      key={organization.billingSecondaryContactName || ""}
                      defaultValue={organization.billingSecondaryContactName || ""}
                      placeholder="e.g. John Smith"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingSecondaryContactPhone" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Phone
                    </Label>
                    <Input
                      id="billingSecondaryContactPhone"
                      name="billingSecondaryContactPhone"
                      type="text"
                      key={organization.billingSecondaryContactPhone || ""}
                      defaultValue={organization.billingSecondaryContactPhone || ""}
                      placeholder="+40 700 000 001"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingSecondaryContactEmail" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Email
                    </Label>
                    <Input
                      id="billingSecondaryContactEmail"
                      name="billingSecondaryContactEmail"
                      type="email"
                      key={organization.billingSecondaryContactEmail || ""}
                      defaultValue={organization.billingSecondaryContactEmail || ""}
                      placeholder="john@organization.org"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowSecondaryContactModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 9: Edit Description Details */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Settings className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Description</CardTitle>
                <CardDescription className="text-xs">Update your organization's public rich-text profile description.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />
              <input type="hidden" name="description" value={editDescription} />

              <CardContent className="p-6 space-y-6">
                {personalState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalState.error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium normal-case text-muted-foreground/80">
                    Description
                  </Label>
                  <WysiwygEditor
                    value={editDescription}
                    onChange={setEditDescription}
                    placeholder="Provide a detailed description of your organization, services, and operations..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowDescriptionModal(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
