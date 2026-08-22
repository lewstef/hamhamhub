"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendMail } from "@/lib/email";
import { sendTestEmailSchema } from "@/lib/validations/system";

/**
 * Updates or persists system-wide SMTP mail transport settings in the database.
 * Preserves the existing password if the user submits an empty password field.
 *
 * @param {unknown} prevState - Previous form state or action state (unused).
 * @param {FormData} formData - Form payload containing:
 *   - `smtpHost`: Host address (e.g. `smtp.gmail.com`)
 *   - `smtpPort`: Port number (`587`, `465`, `25`)
 *   - `smtpSecurity`: Protocol (`none`, `ssl`, `tls`, `starttls`)
 *   - `smtpUsername`: Optional account username
 *   - `smtpPassword`: Optional account password
 *   - `senderName`: Human-readable display sender name
 *   - `senderEmail`: Valid sender email address
 *
 * @returns {Promise<{ success?: boolean; error?: string }>} Resolves with `{ success: true }` or `{ error: string }`.
 * @sideEffect Updates `systemSettings` table record for key `smtp_config`.
 * @sideEffect Revalidates cache path `/backoffice/system/smtp`.
 * @security Guarded by session verification requiring role === "admin".
 */
export async function updateSmtpConfigAction(
  prevState: unknown,
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

    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "smtp_config"))
      .limit(1);

    let finalPassword = smtpPassword;
    if (!finalPassword && existing && existing.length > 0 && existing[0].value) {
      try {
        const parsed = JSON.parse(existing[0].value);
        if (parsed.smtpPassword) {
          finalPassword = parsed.smtpPassword;
        }
      } catch {
        // Fallback to empty string if JSON parse fails
      }
    }

    const payload = JSON.stringify({
      smtpHost,
      smtpPort,
      smtpSecurity,
      smtpUsername,
      smtpPassword: finalPassword,
      senderName,
      senderEmail,
    });

    if (existing && existing.length > 0) {
      await db
        .update(systemSettings)
        .set({ value: payload })
        .where(eq(systemSettings.key, "smtp_config"));
    } else {
      await db.insert(systemSettings).values({
        key: "smtp_config",
        value: payload,
      });
    }

    revalidatePath("/backoffice/system/smtp");
    return { success: true };
  } catch (err) {
    console.error("Failed to update SMTP configuration:", err);
    return { error: "An unexpected error occurred while saving SMTP configuration." };
  }
}

/**
 * Dispatches a test verification email to validate SMTP connectivity and configuration settings.
 *
 * @param {unknown} prevState - Previous form state or action state (unused).
 * @param {FormData} formData - Form payload containing:
 *   - `testRecipientEmail`: Target email address to receive the verification test message.
 *
 * @returns {Promise<{ success?: boolean; error?: string }>} Resolves with `{ success: true }` or `{ error: string }`.
 * @sideEffect Sends an email via Nodemailer transport.
 * @security Guarded by session verification requiring role === "admin".
 */
export async function sendTestEmailAction(
  prevState: unknown,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "admin") {
      return { error: "Unauthorized. Admin privileges required." };
    }

    const testRecipientEmail = (formData.get("testRecipientEmail") as string)?.trim();

    const parsed = sendTestEmailSchema.safeParse({ recipientEmail: testRecipientEmail });
    if (!parsed.success) {
      return { error: "A valid target recipient email address is required for test emails." };
    }

    const result = await sendMail({
      to: parsed.data.recipientEmail,
      subject: "HamHamHub SMTP Verification Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">HamHamHub SMTP Verification Success</h2>
          <p>This email confirms that your SMTP server settings are correctly configured and operational.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">Sent automatically from HamHamHub Backoffice System.</p>
        </div>
      `,
      text: "HamHamHub SMTP Verification Success. Your SMTP server settings are operational.",
    });

    if (!result.success) {
      return { error: result.error || "Failed to deliver test email over SMTP." };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send test email:", err);
    return { error: "Failed to establish SMTP connection or deliver test email." };
  }
}
