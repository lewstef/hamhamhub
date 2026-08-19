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
      } as unknown as ReturnType<typeof db.select>);

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
      } as unknown as ReturnType<typeof nodemailer.createTransport>);

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
      } as unknown as ReturnType<typeof nodemailer.createTransport>);

      const result = await sendMail({
        to: "user@test.com",
        subject: "Test Error",
        html: "<p>Fail</p>",
      });

      expect(result).toEqual({ success: false, error: "Connection refused" });
    });

    it("should handle SSL encryption, port 465, and empty sender name correctly", async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: "<ssl-msg@hamhamhub.ro>" });
      vi.mocked(nodemailer.createTransport).mockReturnValue({
        sendMail: mockSendMail,
      } as unknown as ReturnType<typeof nodemailer.createTransport>);

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([
              {
                key: "smtp_config",
                value: JSON.stringify({
                  smtpHost: "smtp.mail.com",
                  smtpPort: "465",
                  smtpSecurity: "SSL",
                  senderName: "",
                  senderEmail: "ssl-admin@hamhamhub.ro",
                }),
              },
            ]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await sendMail({
        to: "recipient@test.com",
        subject: "SSL Test",
        html: "<b>SSL</b>",
      });

      expect(result.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "ssl-admin@hamhamhub.ro",
        })
      );
    });

    it("should handle db error in getActiveSmtpConfig gracefully", async () => {
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockRejectedValueOnce(new Error("DB timeout")),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const config = await getActiveSmtpConfig();
      expect(config.smtpHost).toBe("smtp.gmail.com");
      warnSpy.mockRestore();
    });
  });
});
