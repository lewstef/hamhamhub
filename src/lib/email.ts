import nodemailer from "nodemailer";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Interface representing the SMTP configuration options structure.
 * @interface SmtpConfigOptions
 */
export interface SmtpConfigOptions {
  smtpHost: string;
  smtpPort: string;
  smtpSecurity: string;
  smtpUsername?: string;
  smtpPassword?: string;
  senderName: string;
  senderEmail: string;
}

/**
 * Interface representing options for sending an email.
 * @interface SendMailOptions
 */
export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Fetches the active SMTP configuration settings.
 * Checks Drizzle ORM database system_settings table first, falling back to process.env defaults.
 *
 * @returns {Promise<SmtpConfigOptions>} The resolved active SMTP configuration options.
 */
export async function getActiveSmtpConfig(): Promise<SmtpConfigOptions> {
  try {
    const record = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "smtp_config"))
      .limit(1);

    if (record && record.length > 0 && record[0].value) {
      const parsed = JSON.parse(record[0].value) as SmtpConfigOptions;
      if (parsed.smtpHost && parsed.smtpPort) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Failed to read system_settings from database, using env defaults:", error);
  }

  // Fallback to process environment variables
  return {
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: process.env.SMTP_PORT || "587",
    smtpSecurity: process.env.SMTP_SECURITY || "TLS",
    smtpUsername: process.env.SMTP_USER || "",
    smtpPassword: process.env.SMTP_PASSWORD || "",
    senderName: process.env.SENDER_NAME || "HamHamHub System",
    senderEmail: process.env.SENDER_EMAIL || "no-reply@hamhamhub.ro",
  };
}

/**
 * Dispatches an email using Nodemailer transport based on active SMTP settings.
 *
 * @param {SendMailOptions} options - Email parameters including recipient, subject, and content.
 * @returns {Promise<{ success: boolean; messageId?: string; error?: string }>} Response object indicating status.
 */
export async function sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = await getActiveSmtpConfig();

    const isSecure = config.smtpSecurity?.toUpperCase() === "SSL" || String(config.smtpPort) === "465";

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort) || 587,
      secure: isSecure,
      auth:
        config.smtpUsername && config.smtpPassword
          ? {
              user: config.smtpUsername,
              pass: config.smtpPassword,
            }
          : undefined,
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });

    const fromAddress = config.senderName
      ? `"${config.senderName}" <${config.senderEmail}>`
      : config.senderEmail;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error("sendMail error:", error);
    const message = error instanceof Error ? error.message : "Failed to dispatch email.";
    return { success: false, error: message };
  }
}
