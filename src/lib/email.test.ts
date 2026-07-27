import { describe, it, expect, vi, beforeEach } from "vitest";
import { getActiveSmtpConfig, sendMail } from "./email";
import nodemailer from "nodemailer";
import { db } from "@/db";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
  },
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(),
  },
}));

describe("Email Transport Module (src/lib/email.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActiveSmtpConfig", () => {
    it("should return fallback environment configuration when database has no record", async () => {
      const config = await getActiveSmtpConfig();
      expect(config.smtpHost).toBe("smtp.gmail.com");
      expect(config.smtpPort).toBe("587");
      expect(config.senderEmail).toBe("no-reply@hamhamhub.ro");
    });

    it("should return database configuration when present in systemSettings table", async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([
              {
                key: "smtp_config",
                value: JSON.stringify({
                  smtpHost: "email-smtp.eu-central-1.amazonaws.com",
                  smtpPort: "587",
                  smtpSecurity: "TLS",
                  smtpUsername: "ses-user",
                  smtpPassword: "ses-password",
                  senderName: "HamHamHub SES",
                  senderEmail: "notifications@hamhamhub.ro",
                }),
              },
            ]),
          }),
        }),
      } as any);

      const config = await getActiveSmtpConfig();
      expect(config.smtpHost).toBe("email-smtp.eu-central-1.amazonaws.com");
      expect(config.senderName).toBe("HamHamHub SES");
    });
  });

  describe("sendMail", () => {
    it("should create transport and dispatch mail successfully", async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: "<msg-123@hamhamhub.ro>" });
      vi.mocked(nodemailer.createTransport).mockReturnValue({
        sendMail: mockSendMail,
      } as any);

      const result = await sendMail({
        to: "user@test.com",
        subject: "Welcome to HamHamHub",
        html: "<p>Welcome!</p>",
      });

      expect(result).toEqual({ success: true, messageId: "<msg-123@hamhamhub.ro>" });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@test.com",
          subject: "Welcome to HamHamHub",
          html: "<p>Welcome!</p>",
        })
      );
    });

    it("should return error object when nodemailer fails", async () => {
      vi.mocked(nodemailer.createTransport).mockReturnValue({
        sendMail: vi.fn().mockRejectedValue(new Error("Connection refused")),
      } as any);

      const result = await sendMail({
        to: "user@test.com",
        subject: "Test Error",
        html: "<p>Fail</p>",
      });

      expect(result).toEqual({ success: false, error: "Connection refused" });
    });
  });
});
