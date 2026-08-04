"use server";

import { db } from "@/db";
import { users, organizationCategories } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isValidEmail, isValidRomanianPhone, isValidUrl } from "@/lib/validation";
import { sendMail } from "@/lib/email";
import { isCitySupported } from "@/config/romanian-cartiere";

/**
 * Returns all organization categories from the database.
 * If the table is empty on first call, seeds it with 4 default categories
 * (NGO, Dog Kennel, Dog service provider, Official Cynological Association)
 * before returning.
 *
 * @returns Array of `{ id, name, description }` objects
 */
export async function getOrganizationCategories() {
  let list = await db.select().from(organizationCategories);
  if (list.length === 0) {
    const defaults = [
      { id: "ngo", name: "NGO", description: "Non-governmental organizations working for animal welfare." },
      { id: "dog_kennel", name: "Dog Kennel", description: "Professional kennels offering boarding, breeding, and care services." },
      { id: "dog_service_provider", name: "Dog service provider", description: "Independent dog trainers, walkers, and groomers." },
      { id: "cynological_association", name: "Official Cynological Association", description: "National Cynological Association supervising breed standards and official registries." },
    ];
    await db.insert(organizationCategories).values(defaults);
    list = await db.select().from(organizationCategories);
  }
  return list;
}

/**
 * Creates a new organization category.
 * The `id` is auto-derived from the name (lowercased, slugified).
 *
 * @param formData.name        - Category display name (required, must produce a non-empty slug)
 * @param formData.description - Optional description text
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` if name is missing, slug is invalid, or the category already exists
 * @sideEffect Revalidates `/backoffice/organizations`
 */
export async function createOrganizationCategoryAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  if (!name || name.trim() === "") {
    return { error: "Organization category name is required." };
  }

  // Generate ID: lowercased, slugged name
  const id = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_+|_+$)/g, "");

  if (!id) {
    return { error: "Invalid organization category name." };
  }

  try {
    const [existing] = await db
      .select({ id: organizationCategories.id })
      .from(organizationCategories)
      .where(eq(organizationCategories.id, id))
      .limit(1);

    if (existing) {
      return { error: "An organization category with this name or ID already exists." };
    }

    await db.insert(organizationCategories).values({
      id,
      name: name.trim(),
      description: description?.trim() || null,
    });

    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to create organization category:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Updates the name and description of an existing organization category.
 * The `id` is immutable — only display fields are changed.
 *
 * @param formData.id          - Existing category ID (required)
 * @param formData.name        - New display name (required)
 * @param formData.description - New description (optional, clears to null if empty)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` on missing fields or DB failure
 * @sideEffect Revalidates `/backoffice/organizations`
 */
export async function updateOrganizationCategoryAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!id || !name || name.trim() === "") {
    return { error: "Category ID and name are required." };
  }

  try {
    await db
      .update(organizationCategories)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .where(eq(organizationCategories.id, id));

    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to update organization category:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Deletes an existing organization category.
 * Fails if any organization is currently assigned to this category.
 *
 * @param formData.id - Category ID to delete (required)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` if category is in use or DB fails
 * @sideEffect Revalidates `/backoffice/organizations`
 */
export async function deleteOrganizationCategoryAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Organization category ID is required." };
  }

  try {
    // Check if any organization user is assigned to this category
    const [assignedUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "organization"), eq(users.organizationCategory, id)))
      .limit(1);

    if (assignedUser) {
      return { error: "Cannot delete this organization category because it is in use by one or more organizations." };
    }

    await db.delete(organizationCategories).where(eq(organizationCategories.id, id));

    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete organization category:", error);
    return { error: "Could not delete organization category. Please try again." };
  }
}

/**
 * Creates a new organization account (role = "organization").
 *
 * @param formData.name                 - Organization display name (required)
 * @param formData.email                - Unique login email (required, validated format)
 * @param formData.password             - Min 6 characters (required)
 * @param formData.organizationCategory - Must be a valid category ID (required)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` on missing fields, duplicate email, invalid category, or DB failure
 * @sideEffect Revalidates `/backoffice/organizations`
 */
export async function createOrganizationAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const organizationCategory = formData.get("organizationCategory") as string;

  if (!name || !email || !password || !organizationCategory) {
    return { error: "All fields are required" };
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const list = await getOrganizationCategories();
    const validCategories = list.map((t) => t.id);
    if (!validCategories.includes(organizationCategory)) {
      return { error: "A valid Organization Category is required" };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }

    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail) {
      return { error: "Email address is already taken" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "organization",
      organizationCategory,
    });

    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to create organization:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Updates profile and billing fields for an existing organization account.
 * Does not change password or role.
 *
 * @param prevState - Unused state placeholder
 * @param formData - The FormData object containing input fields
 * @param formData.id - Organization user ID (required)
 * @param formData.name - New display name (required)
 * @param formData.organizationCategory - Must be a valid category ID (required)
 * @param formData.phoneNumber - Contact phone number (optional, validated 10-digit Romanian format)
 * @param formData.description - Rich-text organization description, stored as HTML string (optional)
 * @param formData.addressLine - Street address line (optional)
 * @param formData.addressCity - City name (optional)
 * @param formData.addressState - State / region (optional)
 * @param formData.addressZip - Zip code (optional)
 * @param formData.addressCountry - Country (optional)
 * @param formData.facebook - Facebook profile URL (optional)
 * @param formData.instagram - Instagram profile URL (optional)
 * @param formData.tiktok - TikTok profile URL (optional)
 * @param formData.youtube - YouTube channel URL (optional)
 * @param formData.website - Website URL (optional)
 * @param formData.googleBusinessProfile - Google Business Profile link (optional)
 * @param formData.billingCompanyName - Company legal name (optional)
 * @param formData.billingTaxId - VAT / Tax ID (optional)
 * @param formData.billingTradeRegistryNumber - Trade Registry Identifier (optional)
 * @param formData.billingEuid - EUID identification code (optional)
 * @param formData.billingBankName - Bank name from Romania (optional)
 * @param formData.billingBankAccountNumber - Bank account IBAN (optional)
 * @param formData.billingContactName - Billing contact person name (optional)
 * @param formData.billingContactPhone - Billing contact phone number (optional, validated 10-digit Romanian format)
 * @param formData.billingContactEmail - Billing contact email address (optional, validated email format)
 * @param formData.billingSecondaryContactName - Secondary contact person name (optional)
 * @param formData.billingSecondaryContactPhone - Secondary contact phone number (optional, validated 10-digit Romanian format)
 * @param formData.billingSecondaryContactEmail - Secondary contact email address (optional, validated email format)
 *
 * @returns `{ success: true }` on success
 * @returns `{ error: string }` on validation or database query failure
 * @sideEffect Revalidates Next.js path caches for `/backoffice/organizations` and `/dashboard/account`
 */
export async function updateOrganizationAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const organizationCategory = formData.get("organizationCategory") as string;

  if (!id || !name || !organizationCategory) {
    return { error: "All fields are required" };
  }

  try {
    const list = await getOrganizationCategories();
    const validCategories = list.map((t) => t.id);
    if (!validCategories.includes(organizationCategory)) {
      return { error: "A valid Organization Category is required" };
    }

    const updateData: Record<string, any> = {
      name,
      organizationCategory,
    };

    if (formData.has("phoneNumber")) {
      const val = (formData.get("phoneNumber") as string) || null;
      if (val && !isValidRomanianPhone(val)) {
        return { error: "Please enter a valid 10-digit Romanian phone number (e.g., 0723456789)." };
      }
      updateData.phoneNumber = val;
    }

    if (formData.has("description")) {
      updateData.description = (formData.get("description") as string) || null;
    }

    if (
      formData.has("addressLine") ||
      formData.has("addressCity") ||
      formData.has("addressState") ||
      formData.has("addressZip") ||
      formData.has("addressCountry")
    ) {
      const addressLine = formData.get("addressLine") as string | null;
      const addressCity = formData.get("addressCity") as string | null;
      const addressState = formData.get("addressState") as string | null;
      const addressZip = formData.get("addressZip") as string | null;
      const addressCountry = formData.get("addressCountry") as string | null;

      const parts = [
        addressLine?.trim(),
        addressCity?.trim(),
        addressState?.trim(),
        addressZip?.trim(),
        addressCountry?.trim(),
      ].filter(Boolean);

      updateData.address = parts.join(", ") || null;
      updateData.addressLine = addressLine?.trim() || null;
      updateData.addressCity = addressCity?.trim() || null;
      updateData.addressState = addressState?.trim() || null;
      updateData.addressZip = addressZip?.trim() || null;
      updateData.addressCountry = addressCountry?.trim() || null;

      if (addressCity && addressCity.trim() !== "" && !isCitySupported(addressCity.trim())) {
        try {
          await sendMail({
            to: "stefan.wrabeli@gmail.com",
            subject: "HamHamHub - Localitate lipsa pentru servicii de plimbare caini",
            html: `<p>Organization <strong>${name}</strong> (ID: ${id}) set address city to <strong>${addressCity.trim()}</strong> which is not in the supported top cities list.</p>`,
          });
        } catch (emailErr) {
          console.error("Failed to send unsupported city email notification:", emailErr);
        }
      }
    }

    if (formData.has("facebook")) {
      const val = (formData.get("facebook") as string)?.trim() || null;
      if (val && !isValidUrl(val)) {
        return { error: "Please enter a valid Facebook URL starting with http:// or https:// (e.g., https://facebook.com/yourpage)." };
      }
      updateData.facebook = val;
    }
    if (formData.has("instagram")) {
      const val = (formData.get("instagram") as string)?.trim() || null;
      if (val && !isValidUrl(val)) {
        return { error: "Please enter a valid Instagram URL starting with http:// or https:// (e.g., https://instagram.com/yourpage)." };
      }
      updateData.instagram = val;
    }
    if (formData.has("tiktok")) {
      const val = (formData.get("tiktok") as string)?.trim() || null;
      if (val && !isValidUrl(val)) {
        return { error: "Please enter a valid TikTok URL starting with http:// or https:// (e.g., https://tiktok.com/@yourpage)." };
      }
      updateData.tiktok = val;
    }
    if (formData.has("linkedin")) {
      const val = (formData.get("linkedin") as string)?.trim() || null;
      if (val && !isValidUrl(val)) {
        return { error: "Please enter a valid LinkedIn URL starting with http:// or https:// (e.g., https://linkedin.com/in/yourprofile)." };
      }
      updateData.linkedin = val;
    }
    if (formData.has("youtube")) {
      const val = (formData.get("youtube") as string)?.trim() || null;
      if (val && !isValidUrl(val)) {
        return { error: "Please enter a valid YouTube URL starting with http:// or https:// (e.g., https://youtube.com/@channel)." };
      }
      updateData.youtube = val;
    }
    if (formData.has("website")) {
      const val = (formData.get("website") as string)?.trim() || null;
      if (val && !isValidUrl(val)) {
        return { error: "Please enter a valid website URL starting with http:// or https:// (e.g., https://example.com)." };
      }
      updateData.website = val;
    }
    if (formData.has("googleBusinessProfile")) {
      const val = (formData.get("googleBusinessProfile") as string)?.trim() || null;
      if (val && !isValidUrl(val)) {
        return { error: "Please enter a valid Google Business Profile URL starting with http:// or https://." };
      }
      updateData.googleBusinessProfile = val;
    }
    if (formData.has("billingCompanyName")) {
      updateData.billingCompanyName = (formData.get("billingCompanyName") as string) || null;
    }
    if (formData.has("billingTaxId")) {
      updateData.billingTaxId = (formData.get("billingTaxId") as string) || null;
    }
    if (formData.has("billingTradeRegistryNumber")) {
      updateData.billingTradeRegistryNumber = (formData.get("billingTradeRegistryNumber") as string) || null;
    }
    if (formData.has("billingEuid")) {
      updateData.billingEuid = (formData.get("billingEuid") as string) || null;
    }
    if (formData.has("billingBankAccountNumber")) {
      updateData.billingBankAccountNumber = (formData.get("billingBankAccountNumber") as string) || null;
    }
    if (formData.has("billingBankName")) {
      updateData.billingBankName = (formData.get("billingBankName") as string) || null;
    }
    if (formData.has("billingContactName")) {
      updateData.billingContactName = (formData.get("billingContactName") as string) || null;
    }
    if (formData.has("billingContactPhone")) {
      const val = (formData.get("billingContactPhone") as string) || null;
      if (val && !isValidRomanianPhone(val)) {
        return { error: "Please enter a valid 10-digit Romanian phone number (e.g., 0723456789)." };
      }
      updateData.billingContactPhone = val;
    }
    if (formData.has("billingContactEmail")) {
      const val = (formData.get("billingContactEmail") as string) || null;
      if (val && !isValidEmail(val)) {
        return { error: "Please enter a valid billing contact email address." };
      }
      updateData.billingContactEmail = val;
    }
    if (formData.has("billingSecondaryContactName")) {
      updateData.billingSecondaryContactName = (formData.get("billingSecondaryContactName") as string) || null;
    }
    if (formData.has("billingSecondaryContactPhone")) {
      const val = (formData.get("billingSecondaryContactPhone") as string) || null;
      if (val && !isValidRomanianPhone(val)) {
        return { error: "Please enter a valid 10-digit Romanian phone number (e.g., 0723456789)." };
      }
      updateData.billingSecondaryContactPhone = val;
    }
    if (formData.has("billingSecondaryContactEmail")) {
      const val = (formData.get("billingSecondaryContactEmail") as string) || null;
      if (val && !isValidEmail(val)) {
        return { error: "Please enter a valid secondary contact email address." };
      }
      updateData.billingSecondaryContactEmail = val;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id));

    revalidatePath("/backoffice/organizations");
    revalidatePath("/dashboard/account");
    return { success: true };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to update organization:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Changes the password, email, and recovery email for an existing organization account.
 * Dispatches a password change security notification email to the primary account email when password is updated.
 *
 * @param {unknown} prevState - Previous action state object.
 * @param {FormData} formData - Form data containing organization fields.
 * @param {string} formData.id - Organization user ID (required).
 * @param {string} [formData.email] - Unique login email (optional, validated email format).
 * @param {string} [formData.recoveryEmail] - Recovery email address (optional, validated email format).
 * @param {string} [formData.password] - New password, minimum 6 characters (optional).
 * @param {string} [formData.confirmPassword] - Password confirmation matching `password` (optional).
 * @param {string} [formData.currentPassword] - Current password (required when organization role changes own password).
 *
 * @returns {Promise<{ success?: boolean; error?: string }>}
 * - Returns `{ success: true }` on successful update.
 * - Returns `{ error: string }` on validation error, incorrect current password, or database error.
 *
 * @sideEffects
 * - Revalidates Next.js path caches for `/backoffice/organizations` and `/dashboard/account`.
 * - Dispatches a security notification email via Nodemailer `sendMail` to the primary account email if password is changed.
 *
 * @redirects
 * - None. Returns action status object.
 *
 * @securityGuards
 * - Verifies current password match if authenticated user role is `"organization"`.
 */
export async function changeOrganizationPasswordAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const email = formData.get("email") as string | null;
  const recoveryEmail = formData.get("recoveryEmail") as string | null;
  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;
  const currentPassword = formData.get("currentPassword") as string | null;

  if (!id) {
    return { error: "Organization ID is required" };
  }

  try {
    const updateData: Partial<typeof users.$inferInsert> = {};

    if (email) {
      if (!isValidEmail(email)) {
        return { error: "Please enter a valid email address." };
      }
      // Check if email is taken by another user
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), ne(users.id, id)))
        .limit(1);

      if (existingEmail) {
        return { error: "Email address is already taken" };
      }
      updateData.email = email;
    }

    if (recoveryEmail !== null) {
      if (recoveryEmail && !isValidEmail(recoveryEmail)) {
        return { error: "Please enter a valid recovery email address." };
      }
      updateData.recoveryEmail = recoveryEmail || null;
    }

    let orgUserEmail: string | null | undefined;
    let orgUserName: string | null | undefined;
    let isPasswordChanged = false;

    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        return { error: "All password fields are required" };
      }

      if (password.length < 6) {
        return { error: "Password must be at least 6 characters" };
      }

      if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
      }

      const session = await auth();
      if (session?.user?.role === "organization") {
        if (!currentPassword) {
          return { error: "Current password is required" };
        }

        const [orgUser] = await db
          .select({ password: users.password, email: users.email, name: users.name })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (!orgUser) {
          return { error: "Organization not found" };
        }

        const isMatch = await bcrypt.compare(currentPassword, orgUser.password);
        if (!isMatch) {
          return { error: "Incorrect current password" };
        }

        orgUserEmail = orgUser.email;
        orgUserName = orgUser.name;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
      isPasswordChanged = true;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id));
    }

    // Send email notification to primary account email when password is changed
    if (isPasswordChanged) {
      const recipientEmail = updateData.email || orgUserEmail;
      if (recipientEmail && isValidEmail(recipientEmail)) {
        const recipientName = orgUserName || "Organization";
        const timestamp = new Date().toUTCString();

        try {
          await sendMail({
            to: recipientEmail,
            subject: "Security Notification: Password Changed for your HamHamHub Account",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                <div style="background-color: #4f46e5; padding: 16px 24px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">HamHamHub Security Alert</h2>
                </div>
                <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
                  <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Hello ${recipientName},</p>
                  <p>The password for your HamHamHub organization account (<strong>${recipientEmail}</strong>) was successfully changed on <strong>${timestamp}</strong>.</p>
                  <div style="background-color: #f3f4f6; padding: 14px 16px; border-left: 4px solid #4f46e5; border-radius: 4px; font-size: 13px; color: #374151; margin: 20px 0;">
                    <strong>Security Notice:</strong> If you initiated this password change, no further action is required. If you did NOT perform this update, please reset your password immediately or contact platform support.
                  </div>
                  <p style="margin-bottom: 0; font-size: 14px; color: #6b7280;">Best regards,<br>The HamHamHub Team</p>
                </div>
              </div>
            `,
            text: `Hello ${recipientName},\n\nThe password for your HamHamHub organization account (${recipientEmail}) was successfully changed on ${timestamp}.\n\nIf you initiated this change, no action is required. If you did not perform this update, please reset your password immediately.\n\nBest regards,\nThe HamHamHub Team`,
          });
        } catch (mailErr) {
          console.error("Failed to send password change notification email:", mailErr);
        }
      }
    }

    revalidatePath("/backoffice/organizations");
    revalidatePath("/dashboard/account");
    return { success: true };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Failed to change organization account settings:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Permanently deletes an organization account.
 * Includes a role guard — only accounts with role "organization" can be deleted.
 *
 * @param formData.id - Organization user ID to delete (required)
 *
 * @returns `{ success: true }` on successful deletion
 * @returns `{ error: string }` if ID is missing, account not found, wrong role, or DB failure
 * @sideEffect Revalidates `/backoffice/organizations`
 */
export async function deleteOrganizationAction(prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "Organization ID is required" };
  }

  try {
    const [userToDelete] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userToDelete) {
      return { error: "Organization not found." };
    }

    if (userToDelete.role !== "organization") {
      return { error: "Security restriction: Only organization accounts can be deleted." };
    }

    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/backoffice/organizations");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return { error: "Could not delete organization. Please try again." };
  }
}

/**
 * Toggles the enabled status of a service for a specific organization.
 *
 * Adds or removes the service ID to/from the organization's comma-separated list of enabled services.
 *
 * @param {string} organizationId - The database ID of the organization to modify.
 * @param {string} serviceId - The unique ID of the service to toggle.
 * @param {boolean} enabled - True to enable the service; false to disable it.
 * @returns {Promise<{ success: boolean } | { error: string }>} Resolves with success state or error message.
 * @sideEffect Revalidates cache paths: `/dashboard/services`, `/dashboard/account`, and `/dashboard`.
 * @security Guarded by db query lookup verifying organization exists.
 */
export async function toggleOrganizationServiceAction(organizationId: string, serviceId: string, enabled: boolean) {
  try {
    const [org] = await db
      .select({ enabledServices: users.enabledServices })
      .from(users)
      .where(eq(users.id, organizationId))
      .limit(1);

    if (!org) {
      return { error: "Organization not found" };
    }

    let enabledList = org.enabledServices ? org.enabledServices.split(",").map(id => id.trim()).filter(Boolean) : [];
    if (enabled) {
      if (!enabledList.includes(serviceId)) {
        enabledList.push(serviceId);
      }
    } else {
      enabledList = enabledList.filter((id) => id !== serviceId);
    }

    const nextVal = enabledList.join(",");

    await db
      .update(users)
      .set({ enabledServices: nextVal || null })
      .where(eq(users.id, organizationId));

    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle organization service:", error);
    return { error: "Failed to toggle service. Please try again." };
  }
}

/**
 * Toggles the active status of an individual course under a service for a specific organization.
 *
 * Adds or removes the course ID to/from the organization's comma-separated list of active courses.
 * Sorted according to a predefined display order.
 *
 * @param {string} organizationId - The database ID of the organization to modify.
 * @param {string} courseId - The unique ID of the course to toggle.
 * @param {boolean} enabled - True to activate; false to deactivate.
 * @returns {Promise<{ success: boolean } | { error: string }>} Resolves with success state or error message.
 * @sideEffect Revalidates cache paths: `/dashboard/services`, `/dashboard/account`, `/dashboard`, and `/backoffice/organizations/services`.
 * @security Guarded by db query lookup verifying organization exists.
 */
export async function toggleOrganizationCourseAction(organizationId: string, courseId: string, enabled: boolean) {
  try {
    const [org] = await db
      .select({ enabledCourses: users.enabledCourses })
      .from(users)
      .where(eq(users.id, organizationId))
      .limit(1);

    if (!org) {
      return { error: "Organization not found" };
    }

    let enabledList = org.enabledCourses ? org.enabledCourses.split(",").map(id => id.trim()).filter(Boolean) : [];
    if (enabled) {
      if (!enabledList.includes(courseId)) {
        enabledList.push(courseId);
      }
    } else {
      enabledList = enabledList.filter((id) => id !== courseId);
    }

    const courseOrder = [
      "dog-training:basic",
      "dog-training:group",
      "dog-training:private",
      "dog-training:sar",
      "dog-training:show",
    ];

    enabledList.sort((a, b) => {
      const idxA = courseOrder.indexOf(a);
      const idxB = courseOrder.indexOf(b);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });

    const nextVal = enabledList.join(",");

    await db
      .update(users)
      .set({ enabledCourses: nextVal || null })
      .where(eq(users.id, organizationId));

    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard");
    revalidatePath("/backoffice/organizations/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle organization course:", error);
    return { error: "Failed to toggle course. Please try again." };
  }
}

/**
 * Server Action: Sends an automated email notification requesting addition of a missing neighborhood/cartier for a city.
 *
 * Security: Requires an active authenticated user session.
 * Side Effects: Dispatches an email to stefan.wrabeli@gmail.com using the sendMail transport module.
 *
 * @param {Object} params - Input parameters.
 * @param {string} params.cityName - The name of the city (e.g., "Cluj-Napoca", "București").
 * @param {string} params.cartierName - The name of the requested missing neighborhood/cartier.
 * @param {string} [params.notes] - Optional additional notes or comments from the user.
 * @returns {Promise<{ success: true; message: string } | { error: string }>} Result object.
 */
export async function requestNewCartierAction({
  cityName,
  cartierName,
  notes,
}: {
  cityName: string;
  cartierName: string;
  notes?: string;
}): Promise<{ success: true; message: string } | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized access" };
    }

    if (!cityName || cityName.trim() === "") {
      return { error: "Numele localității este obligatoriu." };
    }

    if (!cartierName || cartierName.trim() === "") {
      return { error: "Numele cartierului este obligatoriu." };
    }

    const cleanCity = cityName.trim();
    const cleanCartier = cartierName.trim();
    const cleanNotes = notes?.trim() || "";
    const userEmail = session.user.email || session.user.name || "Unknown user";

    const emailRes = await sendMail({
      to: "stefan.wrabeli@gmail.com",
      subject: `HamHamHub - Solicitare adaugare Cartier nou: ${cleanCartier} (${cleanCity})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-top: 0;">Solicitare Cartier Nou</h2>
          <p>Utilizatorul <strong>${userEmail}</strong> a solicitat adăugarea unui nou cartier pentru serviciul de plimbat câini.</p>
          <ul style="line-height: 1.6;">
            <li><strong>Oraș / Localitate:</strong> ${cleanCity}</li>
            <li><strong>Cartier Solicitat:</strong> ${cleanCartier}</li>
            ${cleanNotes ? `<li><strong>Observații / Detalii:</strong> ${cleanNotes}</li>` : ""}
          </ul>
        </div>
      `,
    });

    if (emailRes && "error" in emailRes) {
      return { error: "A apărut o eroare la trimiterea solicitării. Vă rugăm să încercați din nou." };
    }

    return {
      success: true,
      message: "We received your request for a new coverage zone, we will be back soon",
    };
  } catch (error) {
    console.error("Failed to process new cartier request email:", error);
    return { error: "A apărut o eroare la trimiterea solicitării. Vă rugăm să încercați din nou." };
  }
}
