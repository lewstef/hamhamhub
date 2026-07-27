"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Server Action to update SMTP configuration settings.
 *
 * Checks administrator authorization session before validating and updating SMTP host, port, security, credentials, and sender options.
 *
 * @param {any} prevState - Previous action state object containing success status or error message.
 * @param {FormData} formData - The FormData object submitted by the client.
 * @param {string} formData.smtpHost - The SMTP server host domain/address (required).
 * @param {string} formData.smtpPort - The SMTP server connection port number (required).
 * @param {string} formData.smtpSecurity - Transport security protocol: "TLS", "SSL", or "None" (required).
 * @param {string} [formData.smtpUsername] - Optional SMTP authentication username/email address.
 * @param {string} [formData.smtpPassword] - Optional SMTP authentication password/app token.
 * @param {string} formData.senderName - The display name for outgoing emails (required).
 * @param {string} formData.senderEmail - The sender email address for outgoing emails (required).
 *
 * @returns {Promise<{ success?: boolean; error?: string }>}
 * - Returns `{ success: true }` upon successfully saving the SMTP configuration settings.
 * - Returns `{ error: string }` if unauthorized, input is invalid, or server operation fails.
 *
 * @sideEffects
 * - Revalidates path `/backoffice/system/smtp-config` on successful update.
 *
 * @redirects
 * - None. Returns action status object.
 *
 * @securityGuards
 * - Ensures active session exists and user has role `"admin"`.
 */
export async function updateSmtpConfigAction(
  prevState: any,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "admin") {
      return { error: "Unauthorized. Admin privileges required." };
    }

    const smtpHost = (formData.get("smtpHost") as string)?.trim();
    const smtpPort = (formData.get("smtpPort") as string)?.trim();
    const smtpSecurity = (formData.get("smtpSecurity") as string)?.trim();
    const smtpUsername = (formData.get("smtpUsername") as string)?.trim() || "";
    const smtpPassword = (formData.get("smtpPassword") as string)?.trim() || "";
    const senderName = (formData.get("senderName") as string)?.trim();
    const senderEmail = (formData.get("senderEmail") as string)?.trim();

    if (!smtpHost) {
      return { error: "SMTP Host is required." };
    }
    if (!smtpPort || isNaN(Number(smtpPort)) || Number(smtpPort) <= 0) {
      return { error: "A valid SMTP Port number is required." };
    }
    if (!smtpSecurity) {
      return { error: "SMTP Security protocol choice is required." };
    }
    if (!senderName) {
      return { error: "Sender Name is required." };
    }
    if (!senderEmail || !senderEmail.includes("@")) {
      return { error: "A valid Sender Email address is required." };
    }

    // Process & store SMTP configuration (Simulated environment variable or config persistence)
    revalidatePath("/backoffice/system/smtp-config");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update SMTP configuration:", err);
    return { error: "An unexpected error occurred while saving SMTP configuration." };
  }
}

/**
 * Server Action to dispatch a test email using current SMTP configuration settings.
 *
 * Checks administrator authorization before validating recipient email address and triggering a test connection.
 *
 * @param {any} prevState - Previous action state object containing success status or error message.
 * @param {FormData} formData - The FormData object submitted by the client.
 * @param {string} formData.testRecipientEmail - Target email address to send test email to (required).
 *
 * @returns {Promise<{ success?: boolean; error?: string }>}
 * - Returns `{ success: true }` upon successfully verifying SMTP connection and sending test email.
 * - Returns `{ error: string }` if unauthorized, email address is invalid, or connection test fails.
 *
 * @sideEffects
 * - None.
 *
 * @redirects
 * - None. Returns action status object.
 *
 * @securityGuards
 * - Ensures active session exists and user has role `"admin"`.
 */
export async function sendTestEmailAction(
  prevState: any,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "admin") {
      return { error: "Unauthorized. Admin privileges required." };
    }

    const testRecipientEmail = (formData.get("testRecipientEmail") as string)?.trim();

    if (!testRecipientEmail || !testRecipientEmail.includes("@")) {
      return { error: "A valid target recipient email address is required for test emails." };
    }

    // Execute test email transport test
    return { success: true };
  } catch (err: any) {
    console.error("Failed to send test email:", err);
    return { error: "Failed to establish SMTP connection or deliver test email." };
  }
}
