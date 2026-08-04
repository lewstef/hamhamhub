import { describe, it, expect } from "vitest";
import { loginSchema, signUpSchema, updateUserThemeSchema } from "./auth";
import {
  updateOrganizationSchema,
  changeOrganizationPasswordSchema,
  organizationCategorySchema,
  requestNewCartierSchema,
} from "./organizations";
import { courseSchema, coursePricingSchema, faqItemSchema } from "./courses";
import { employeeSchema, changeEmployeePasswordSchema } from "./employees";
import { userSchema, changeUserPasswordSchema } from "./users";
import { smtpConfigSchema, sendTestEmailSchema } from "./system";

describe("Zod Validation Schemas (src/lib/validations/)", () => {
  describe("Auth Validation Schemas", () => {
    it("should validate valid login input", () => {
      const result = loginSchema.safeParse({
        identifier: "user@example.com",
        password: "secretpassword",
        type: "user",
      });
      expect(result.success).toBe(true);
    });

    it("should fail login when identifier is empty", () => {
      const result = loginSchema.safeParse({
        identifier: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Identifier is required");
      }
    });

    it("should validate valid sign up input", () => {
      const result = signUpSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        confirmPassword: "password123",
        type: "user",
      });
      expect(result.success).toBe(true);
    });

    it("should fail sign up when passwords do not match", () => {
      const result = signUpSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
        type: "user",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });

    it("should validate theme update input", () => {
      expect(updateUserThemeSchema.safeParse({ userId: "usr_1", theme: "dark" }).success).toBe(true);
      expect(updateUserThemeSchema.safeParse({ userId: "usr_1", theme: "invalid" }).success).toBe(false);
    });
  });

  describe("Organization Validation Schemas", () => {
    it("should validate organization category input", () => {
      expect(organizationCategorySchema.safeParse({ name: "Dog Shelter" }).success).toBe(true);
      expect(organizationCategorySchema.safeParse({ name: "" }).success).toBe(false);
    });

    it("should validate request new cartier input", () => {
      const valid = requestNewCartierSchema.safeParse({
        organizationId: "org_1",
        organizationName: "Paws NGO",
        cartierName: "Aviation",
        county: "București",
        locality: "București",
        contactEmail: "contact@paws.org",
      });
      expect(valid.success).toBe(true);

      const invalidEmail = requestNewCartierSchema.safeParse({
        organizationId: "org_1",
        organizationName: "Paws NGO",
        cartierName: "Aviation",
        county: "București",
        locality: "București",
        contactEmail: "invalid-email",
      });
      expect(invalidEmail.success).toBe(false);
    });

    it("should refine change organization password", () => {
      const valid = changeOrganizationPasswordSchema.safeParse({
        id: "org_1",
        password: "newpassword123",
        confirmPassword: "newpassword123",
      });
      expect(valid.success).toBe(true);

      const mismatch = changeOrganizationPasswordSchema.safeParse({
        id: "org_1",
        password: "newpassword123",
        confirmPassword: "wrongpassword",
      });
      expect(mismatch.success).toBe(false);
    });
  });

  describe("Course Validation Schemas", () => {
    it("should validate course pricing schema", () => {
      const valid = coursePricingSchema.safeParse({
        billingFrequency: "per_session",
        price: 150,
      });
      expect(valid.success).toBe(true);

      const negative = coursePricingSchema.safeParse({
        billingFrequency: "per_session",
        price: -50,
      });
      expect(negative.success).toBe(false);
    });

    it("should validate FAQ items", () => {
      expect(faqItemSchema.safeParse({ question: "Q?", answer: "A!" }).success).toBe(true);
      expect(faqItemSchema.safeParse({ question: "", answer: "A!" }).success).toBe(false);
    });
  });

  describe("Employee & User Validation Schemas", () => {
    it("should validate employee input", () => {
      const valid = employeeSchema.safeParse({
        name: "John Staff",
        username: "johnstaff",
        email: "john@staff.com",
        role: "admin",
      });
      expect(valid.success).toBe(true);
    });

    it("should validate user password change", () => {
      const mismatch = changeUserPasswordSchema.safeParse({
        id: "usr_1",
        password: "password1",
        confirmPassword: "password2",
      });
      expect(mismatch.success).toBe(false);
    });
  });

  describe("System SMTP Validation Schemas", () => {
    it("should validate SMTP configuration input", () => {
      const valid = smtpConfigSchema.safeParse({
        host: "smtp.mailtrap.io",
        port: 587,
        user: "smtp_user",
        pass: "smtp_pass",
        fromEmail: "noreply@hamhamhub.ro",
        fromName: "HamHamHub System",
      });
      expect(valid.success).toBe(true);

      const invalidPort = smtpConfigSchema.safeParse({
        host: "smtp.mailtrap.io",
        port: 70000,
        user: "smtp_user",
        pass: "smtp_pass",
        fromEmail: "noreply@hamhamhub.ro",
        fromName: "HamHamHub System",
      });
      expect(invalidPort.success).toBe(false);
    });

    it("should validate test email recipient", () => {
      expect(sendTestEmailSchema.safeParse({ recipientEmail: "test@example.com" }).success).toBe(true);
      expect(sendTestEmailSchema.safeParse({ recipientEmail: "not-an-email" }).success).toBe(false);
    });
  });
});
