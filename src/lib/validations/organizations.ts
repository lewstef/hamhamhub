import { z } from "zod";

export const updateOrganizationSchema = z.object({
  id: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Organization name is required"),
  organizationCategory: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  recoveryEmail: z.string().email("Invalid recovery email address").nullable().optional().or(z.literal("")),
  addressCountry: z.string().nullable().optional(),
  addressState: z.string().nullable().optional(),
  addressCity: z.string().nullable().optional(),
  addressLine: z.string().nullable().optional(),
  addressZip: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  billingCompanyName: z.string().nullable().optional(),
  billingTaxId: z.string().nullable().optional(),
  billingTradeRegistryNumber: z.string().nullable().optional(),
  billingEuid: z.string().nullable().optional(),
  billingBankAccountNumber: z.string().nullable().optional(),
  billingBankName: z.string().nullable().optional(),
  billingContactName: z.string().nullable().optional(),
  billingContactPhone: z.string().nullable().optional(),
  billingContactEmail: z.string().nullable().optional(),
  billingSecondaryContactName: z.string().nullable().optional(),
  billingSecondaryContactPhone: z.string().nullable().optional(),
  billingSecondaryContactEmail: z.string().nullable().optional(),
});

export const changeOrganizationPasswordSchema = z
  .object({
    id: z.string().min(1, "Organization ID is required"),
    currentPassword: z.string().optional(),
    password: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm new password"),
    isDashboard: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const organizationCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const requestNewCartierSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  organizationName: z.string().min(1, "Organization name is required"),
  cartierName: z.string().min(1, "Cartier name is required"),
  county: z.string().min(1, "County is required"),
  locality: z.string().min(1, "Locality is required"),
  contactEmail: z.string().email("Invalid contact email address"),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type ChangeOrganizationPasswordInput = z.infer<typeof changeOrganizationPasswordSchema>;
export type OrganizationCategoryInput = z.infer<typeof organizationCategorySchema>;
export type RequestNewCartierInput = z.infer<typeof requestNewCartierSchema>;
