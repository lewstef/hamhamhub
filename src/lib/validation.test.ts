import { describe, it, expect } from "vitest";
import { isValidEmail, isValidRomanianPhone, isValidUrl } from "./validation";

describe("Validation Utility Functions", () => {
  describe("isValidEmail", () => {
    it("should return true for valid email addresses with existing TLDs", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("john.doe@domain.ro")).toBe(true);
      expect(isValidEmail("admin@organization.org")).toBe(true);
      expect(isValidEmail("test-user_123@sub.domain.co.uk")).toBe(true);
      expect(isValidEmail("info@ngo.eu")).toBe(true);
    });

    it("should return false for invalid emails or missing TLDs", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail("plainaddress")).toBe(false);
      expect(isValidEmail("@no-user.com")).toBe(false);
      expect(isValidEmail("user@domain")).toBe(false);
      expect(isValidEmail("user@domain.")).toBe(false);
      expect(isValidEmail("user@domain.c")).toBe(false);
      expect(isValidEmail("user@.com")).toBe(false);
      expect(isValidEmail("user@domain..com")).toBe(false);
      expect(isValidEmail("user name@domain.com")).toBe(false);
    });
  });

  describe("isValidRomanianPhone", () => {
    it("should return true for valid 10-digit Romanian phone numbers starting with 0", () => {
      expect(isValidRomanianPhone("0724247122")).toBe(true);
      expect(isValidRomanianPhone("0712345678")).toBe(true);
      expect(isValidRomanianPhone("0213456789")).toBe(true);
      expect(isValidRomanianPhone("0312345678")).toBe(true);
      expect(isValidRomanianPhone("0755555555")).toBe(true);
    });

    it("should return false for invalid phone formats, prefixes, spaces, or non-numeric characters", () => {
      expect(isValidRomanianPhone("")).toBe(false);
      expect(isValidRomanianPhone(null)).toBe(false);
      expect(isValidRomanianPhone(undefined)).toBe(false);
      expect(isValidRomanianPhone("+40724247122")).toBe(false);
      expect(isValidRomanianPhone("+4 0724247122")).toBe(false);
      expect(isValidRomanianPhone("0724 247 122")).toBe(false);
      expect(isValidRomanianPhone("0724-247-122")).toBe(false);
      expect(isValidRomanianPhone("0724.247.122")).toBe(false);
      expect(isValidRomanianPhone("724247122")).toBe(false);
      expect(isValidRomanianPhone("072424712")).toBe(false); // 9 digits
      expect(isValidRomanianPhone("07242471223")).toBe(false); // 11 digits
      expect(isValidRomanianPhone("0123456789")).toBe(false); // Invalid prefix 01
      expect(isValidRomanianPhone("072424712a")).toBe(false);
    });
  });

  describe("isValidUrl", () => {
    it("should return true for valid website URLs starting with http:// or https://", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://example.org")).toBe(true);
      expect(isValidUrl("https://sub.domain.ro/path?query=1")).toBe(true);
      expect(isValidUrl("https://www.hamhamhub.com/about")).toBe(true);
    });

    it("should return false for invalid URLs, missing http(s) scheme, or unsupported protocols", () => {
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
      expect(isValidUrl("example.com")).toBe(false);
      expect(isValidUrl("www.example.com")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(false);
      expect(isValidUrl("javascript:alert(1)")).toBe(false);
      expect(isValidUrl("invalid-url")).toBe(false);
    });
  });
});
