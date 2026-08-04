import { z } from "zod";

export const smtpConfigSchema = z.object({
  host: z.string().min(1, "SMTP host is required"),
  port: z.number().int().min(1, "Port must be a positive integer").max(65535, "Invalid port number"),
  user: z.string().min(1, "SMTP user is required"),
  pass: z.string().min(1, "SMTP password is required"),
  fromEmail: z.string().email("Invalid sender email address"),
  fromName: z.string().min(1, "Sender name is required"),
});

export const sendTestEmailSchema = z.object({
  recipientEmail: z.string().email("Invalid recipient email address"),
});

export type SmtpConfigInput = z.infer<typeof smtpConfigSchema>;
export type SendTestEmailInput = z.infer<typeof sendTestEmailSchema>;
