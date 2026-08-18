import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateSmtpConfigAction, sendTestEmailAction } from "./system";
import { auth } from "@/auth";
import { sendMail } from "@/lib/email";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({}),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    })),
  },
}));

vi.mock("@/lib/email", () => ({
  sendMail: vi.fn(),
}));

describe("System Server Actions — SMTP Config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateSmtpConfigAction", () => {
    it("should return error when session is null", async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      const formData = new FormData();

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ error: "Unauthorized. Admin privileges required." });
    });

    it("should return error when user is not admin", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "employee" },
      } as any);
      const formData = new FormData();

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ error: "Unauthorized. Admin privileges required." });
    });

    it("should return error when smtpHost is missing", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      const formData = new FormData();

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ error: "SMTP Host is required." });
    });

    it("should return error when smtpPort is invalid", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      const formData = new FormData();
      formData.append("smtpHost", "smtp.gmail.com");
      formData.append("smtpPort", "invalid");

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ error: "A valid SMTP Port number is required." });
    });

    it("should return error when smtpSecurity is missing", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      const formData = new FormData();
      formData.append("smtpHost", "smtp.gmail.com");
      formData.append("smtpPort", "587");

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ error: "SMTP Security protocol choice is required." });
    });

    it("should return error when senderName is missing", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      const formData = new FormData();
      formData.append("smtpHost", "smtp.gmail.com");
      formData.append("smtpPort", "587");
      formData.append("smtpSecurity", "TLS");

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ error: "Sender Name is required." });
    });

    it("should return error when senderEmail is invalid", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      const formData = new FormData();
      formData.append("smtpHost", "smtp.gmail.com");
      formData.append("smtpPort", "587");
      formData.append("smtpSecurity", "TLS");
      formData.append("senderName", "HamHamHub System");
      formData.append("senderEmail", "invalid-email");

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ error: "A valid Sender Email address is required." });
    });

    it("should save configuration successfully when valid data is provided", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      const formData = new FormData();
      formData.append("smtpHost", "smtp.gmail.com");
      formData.append("smtpPort", "587");
      formData.append("smtpSecurity", "TLS");
      formData.append("smtpUsername", "no-reply@hamhamhub.ro");
      formData.append("smtpPassword", "secretpass");
      formData.append("senderName", "HamHamHub System");
      formData.append("senderEmail", "no-reply@hamhamhub.ro");

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ success: true });
    });

    it("should preserve existing password when smtpPassword is empty in form data", async () => {
      const { db } = await import("@/db");
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);

      // Mock existing config with saved password
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([
              { value: JSON.stringify({ smtpPassword: "preservedSecretPassword123" }) },
            ]),
          }),
        }),
      } as any);

      const formData = new FormData();
      formData.append("smtpHost", "smtp.gmail.com");
      formData.append("smtpPort", "587");
      formData.append("smtpSecurity", "TLS");
      formData.append("smtpUsername", "no-reply@hamhamhub.ro");
      formData.append("smtpPassword", ""); // empty password to trigger preservation
      formData.append("senderName", "HamHamHub System");
      formData.append("senderEmail", "no-reply@hamhamhub.ro");

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ success: true });
    });

    it("should fallback gracefully if existing config JSON is malformed", async () => {
      const { db } = await import("@/db");
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([
              { value: "malformed-not-json" },
            ]),
          }),
        }),
      } as any);

      const formData = new FormData();
      formData.append("smtpHost", "smtp.gmail.com");
      formData.append("smtpPort", "587");
      formData.append("smtpSecurity", "TLS");
      formData.append("smtpUsername", "no-reply@hamhamhub.ro");
      formData.append("smtpPassword", "");
      formData.append("senderName", "HamHamHub System");
      formData.append("senderEmail", "no-reply@hamhamhub.ro");

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ success: true });
    });

    it("should return error when database throws during update", async () => {
      const { db } = await import("@/db");
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockRejectedValueOnce(new Error("DB offline")),
          }),
        }),
      } as any);

      const formData = new FormData();
      formData.append("smtpHost", "smtp.gmail.com");
      formData.append("smtpPort", "587");
      formData.append("smtpSecurity", "TLS");
      formData.append("smtpUsername", "no-reply@hamhamhub.ro");
      formData.append("smtpPassword", "pass");
      formData.append("senderName", "HamHamHub System");
      formData.append("senderEmail", "no-reply@hamhamhub.ro");

      const result = await updateSmtpConfigAction({}, formData);
      expect(result).toEqual({ error: "An unexpected error occurred while saving SMTP configuration." });
    });
  });

  describe("sendTestEmailAction", () => {
    it("should return error when session is missing", async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      const formData = new FormData();

      const result = await sendTestEmailAction({}, formData);
      expect(result).toEqual({ error: "Unauthorized. Admin privileges required." });
    });

    it("should return error when recipient email is invalid", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      const formData = new FormData();
      formData.append("testRecipientEmail", "invalid");

      const result = await sendTestEmailAction({}, formData);
      expect(result).toEqual({ error: "A valid target recipient email address is required for test emails." });
    });

    it("should send test email successfully when valid target email is provided", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      vi.mocked(sendMail).mockResolvedValue({ success: true, messageId: "test-msg-123" });

      const formData = new FormData();
      formData.append("testRecipientEmail", "admin@test.com");

      const result = await sendTestEmailAction({}, formData);
      expect(result).toEqual({ success: true });
    });

    it("should return error when sendMail fails with result error", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      vi.mocked(sendMail).mockResolvedValue({ success: false, error: "SMTP auth failed" });

      const formData = new FormData();
      formData.append("testRecipientEmail", "admin@test.com");

      const result = await sendTestEmailAction({}, formData);
      expect(result).toEqual({ error: "SMTP auth failed" });
    });

    it("should return error when sendMail throws exception", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { role: "admin" },
      } as any);
      vi.mocked(sendMail).mockRejectedValueOnce(new Error("Connection timeout"));

      const formData = new FormData();
      formData.append("testRecipientEmail", "admin@test.com");

      const result = await sendTestEmailAction({}, formData);
      expect(result).toEqual({ error: "Failed to establish SMTP connection or deliver test email." });
    });
  });
});
