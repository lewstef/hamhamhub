"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { updateOrganizationAction, changeOrganizationPasswordAction } from "@/app/actions/organizations";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Search, Check, User, ChevronRight, Key, Shield, Mail, Home, Building, Map, Globe, Hash, MapPin, Phone, Lock, Settings } from "lucide-react";
import { PasswordStrength } from "@/components/password-strength";

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
  createdAt?: Date | string | null;
}

interface OrganizationCategory {
  id: string;
  name: string;
}

interface EditOrganizationFormProps {
  organization: Organization;
  organizationCategoryList: OrganizationCategory[];
}

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
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
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

export function EditOrganizationForm({ organization, organizationCategoryList }: EditOrganizationFormProps) {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<"personal" | "account" | "subscription" | "services">("personal");

  // Granular Modal toggle states
  const [showNameModal, setShowNameModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showRecoveryEmailModal, setShowRecoveryEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const isPending = personalPending || accountPending;
  const passwordsMatch = passwordVal === confirmPasswordVal;

  const isPasswordSubmitDisabled =
    isPending || !passwordsMatch || passwordVal === "" || passwordVal.length < 6 || confirmPasswordVal === "";

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes((countrySearch || "").toLowerCase())
  );

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
      router.refresh();
    }
  }, [personalState, router]);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategoryName = organizationCategoryList.find(
    (c) => c.id === organization.organizationCategory
  )?.name || "NGO";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Organization</h1>
        <p className="text-sm text-muted-foreground">
          Modify details for {organization.email || organization.name}.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border flex gap-6 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`pb-2 px-1 focus:outline-none transition-all cursor-pointer font-semibold ${
            activeTab === "personal"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Account information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`pb-2 px-1 focus:outline-none transition-all cursor-pointer font-semibold ${
            activeTab === "account"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Account settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subscription")}
          className={`pb-2 px-1 focus:outline-none transition-all cursor-pointer font-semibold ${
            activeTab === "subscription"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Subscription
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={`pb-2 px-1 focus:outline-none transition-all cursor-pointer font-semibold ${
            activeTab === "services"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Services
        </button>
      </div>

      {/* CARD 1: Account information */}
      {activeTab === "personal" && (
        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
          <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <User className="size-5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">Account information</CardTitle>
          </div>
          <CardContent className="p-0">
            <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
              The information provided below will reflect on your invoices
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

              {/* Phone Number Row */}
              <button
                type="button"
                onClick={() => setShowPhoneModal(true)}
                aria-label="Edit Phone number"
                disabled={isPending}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left focus:outline-none cursor-pointer group disabled:cursor-not-allowed"
              >
                <div className="flex flex-1 items-center">
                  <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Phone number</span>
                  <span className="text-sm text-foreground/90">{organization.phoneNumber || "-"}</span>
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

      {/* CARD 2: Account settings */}
      {activeTab === "account" && (
        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
          <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Mail className="size-5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">Account settings</CardTitle>
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

      {/* CARD 4: Services (Empty) */}
      {activeTab === "services" && (
        <Card className="border border-border shadow-sm rounded-xl bg-card p-12 text-center text-muted-foreground">
          No active services associated with this organization.
        </Card>
      )}

      <div className="flex justify-start">
        <Link href="/backoffice/organizations" className={buttonVariants({ variant: "outline" })}>
          Back to list
        </Link>
      </div>

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
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                    <Label htmlFor="organizationCategory" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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

              <CardContent className="p-6 space-y-4 bg-muted/5">
                {personalState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalState.error}
                  </div>
                )}
                <div className="space-y-4">
                  {/* Street Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="addressLine" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Street Address
                    </Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="addressLine"
                        name="addressLine"
                        type="text"
                        defaultValue={organization.addressLine || ""}
                        placeholder="123 Main Street, Suite 100"
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* City & State */}
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="addressCity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        City
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                        <Input
                          id="addressCity"
                          name="addressCity"
                          type="text"
                          defaultValue={organization.addressCity || ""}
                          placeholder="City"
                          className="pl-9 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="addressState" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        State / Region / Province
                      </Label>
                      <div className="relative">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                        <Input
                          id="addressState"
                          name="addressState"
                          type="text"
                          defaultValue={organization.addressState || ""}
                          placeholder="State / Region"
                          className="pl-9 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Zip Code & Country */}
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="addressZip" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Zip Code / Postal Code
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

                    {/* Country select with suggestions */}
                    <div className="space-y-1.5 relative" ref={dropdownRef}>
                      <Label htmlFor="addressCountry" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Country
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                        <Input
                          id="addressCountry"
                          name="addressCountry"
                          type="text"
                          value={countrySearch}
                          onChange={(e) => {
                            setCountrySearch(e.target.value);
                            setEditCountry(e.target.value);
                            setShowCountryDropdown(true);
                          }}
                          onFocus={() => setShowCountryDropdown(true)}
                          placeholder="Search country..."
                          className="pl-9 focus-visible:ring-primary/20"
                        />
                      </div>

                      {showCountryDropdown && filteredCountries.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-36 overflow-y-auto animate-in slide-in-from-top-1 duration-100">
                          {filteredCountries.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setEditCountry(c);
                                setCountrySearch(c);
                                setShowCountryDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none flex items-center justify-between"
                            >
                              <span>{c}</span>
                              {editCountry === c && <Check className="size-3 text-primary" />}
                            </button>
                          ))}
                        </div>
                      )}
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
                    <Label htmlFor="phoneNumber" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Phone number
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
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                    <Label htmlFor="recoveryEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                    <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
    </div>
  );
}
