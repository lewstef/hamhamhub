export interface Organization {
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
  verificationStatus?: "unverified" | "pending" | "verified" | null;
  verificationRequestedAt?: Date | string | null;
  verificationNotes?: string | null;
}

export interface OrganizationCategory {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  organizationCategory: string | null;
  slug: string | null;
  description: string | null;
  coursesOrder?: string | null;
}

export interface EditOrganizationFormProps {
  organization: Organization;
  organizationCategoryList: OrganizationCategory[];
  servicesList?: Service[];
  activeTabProp?: "personal" | "account" | "subscription" | "services" | "billing" | "verification";
}
