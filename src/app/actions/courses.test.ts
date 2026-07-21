import { vi, describe, it, expect, beforeEach } from "vitest";
import { createCourseAction, updateCourseAction, deleteCourseAction, reorderOrgCoursesAction } from "./courses";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";

// Dummy database URL to satisfy drizzle setup
process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Courses Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCourseAction", () => {
    it("should fail if unauthorized", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null);
      const result = await createCourseAction(null, new FormData());
      expect(result).toEqual({ error: "Unauthorized access" });
    });

    it("should fail if name is missing", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Course name is required." });
    });

    it("should successfully insert new course", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const mockValues = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.insert).mockReturnValueOnce({ values: mockValues } as any);

      const formData = new FormData();
      formData.append("name", "Basic Obedience");
      formData.append("price", "200");
      formData.append("priceType", "month");
      formData.append("certifiedTrainer", "true");
      formData.append("certifierName", "SuperDog");
      formData.append("ageLimitsEnabled", "true");
      formData.append("ageLimits", "Puppyhood (8 Weeks to 5 Months),Adulthood & Senior Years (1 Year +)");
      formData.append("dedicatedField", "true");
      formData.append("trainingFieldDescription", "A great field");
      formData.append("trainingFieldAddress", "123 Bark St");
      formData.append("trainingFieldGoogleBusinessProfile", "https://business.google.com/123");
      formData.append("trainingFieldGoogleMapsLink", "https://maps.google.com/123");

      const result = await createCourseAction(null, formData);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        name: "Basic Obedience",
        price: "200",
        priceType: "month",
        certifiedTrainer: true,
        certifierName: "SuperDog",
        ageLimitsEnabled: true,
        ageLimits: "Puppyhood (8 Weeks to 5 Months),Adulthood & Senior Years (1 Year +)",
        dedicatedField: true,
        trainingFieldDescription: "A great field",
        trainingFieldAddress: "123 Bark St",
        trainingFieldGoogleBusinessProfile: "https://business.google.com/123",
        trainingFieldGoogleMapsLink: "https://maps.google.com/123",
      }));
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/services/dog-training");
      expect(result).toEqual({ success: true });
    });

    it("should successfully insert new course when user is an admin", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });
      const mockValues = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.insert).mockReturnValueOnce({ values: mockValues } as any);

      const formData = new FormData();
      formData.append("organizationId", "org-1");
      formData.append("serviceId", "service-123");
      formData.append("name", "Admin Course");
      formData.append("price", "150");

      const result = await createCourseAction(null, formData);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        organizationId: "org-1",
        serviceId: "service-123",
        name: "Admin Course",
        price: "150",
      }));
      expect(result).toEqual({ success: true });
    });

    it("should successfully insert new boarding offering with custom boarding attributes", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const mockValues = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.insert).mockReturnValueOnce({ values: mockValues } as any);

      const formData = new FormData();
      formData.append("name", "VIP Kennel Stay");
      formData.append("price", "300");
      formData.append("priceType", "night");
      formData.append("medicationAdministration", "true");
      formData.append("medicationAdministrationDetails", "Give pill after meals");
      formData.append("dailyWalks", "3");
      formData.append("ownerCommunication", "true");
      formData.append("ownerCommunicationDetails", "WhatsApp photo at noon");
      formData.append("personalizedMealPlan", "true");
      formData.append("personalizedMealPlanDetails", "Raw BARF mix twice a day");
      formData.append("checkin", "08:30");
      formData.append("checkout", "18:00");

      const result = await createCourseAction(null, formData);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        name: "VIP Kennel Stay",
        price: "300",
        priceType: "night",
        medicationAdministration: true,
        medicationAdministrationDetails: "Give pill after meals",
        dailyWalks: 3,
        ownerCommunication: true,
        ownerCommunicationDetails: "WhatsApp photo at noon",
        personalizedMealPlan: true,
        personalizedMealPlanDetails: "Raw BARF mix twice a day",
        checkin: "08:30",
        checkout: "18:00",
      }));
      expect(result).toEqual({ success: true });
    });

    it("should fail check-in format validation", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      formData.append("name", "VIP Stay");
      formData.append("checkin", "25:00");

      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Invalid check-in time format. Use hh:mm (24h)." });
    });

    it("should fail check-out format validation", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      formData.append("name", "VIP Stay");
      formData.append("checkout", "18:65");

      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Invalid check-out time format. Use hh:mm (24h)." });
    });

    it("should fail if organization ID is missing for admin", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });
      const formData = new FormData();
      formData.append("name", "Admin Course");
      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Organization ID is required." });
    });

    it("should return error on DB failure", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const mockValues = vi.fn().mockRejectedValueOnce(new Error("DB insertion failed"));
      vi.mocked(db.insert).mockReturnValueOnce({ values: mockValues } as any);

      const formData = new FormData();
      formData.append("name", "Obedience 101");

      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Something went wrong. Please try again." });
    });
  });

  describe("updateCourseAction", () => {
    it("should fail if unauthorized", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null);
      const result = await updateCourseAction(null, new FormData());
      expect(result).toEqual({ error: "Unauthorized access" });
    });

    it("should fail if course ID or name is missing", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      const result = await updateCourseAction(null, formData);
      expect(result).toEqual({ error: "Course ID is required." });
    });

    it("should update a course when user is the owner", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      
      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-1" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      const mockWhereUpdate = vi.fn().mockResolvedValueOnce({ count: 1 });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValueOnce({ set: mockSet } as any);

      const formData = new FormData();
      formData.append("id", "course-123");
      formData.append("name", "Updated Obedience");
      formData.append("dedicatedField", "true");
      formData.append("trainingFieldDescription", "New field description");
      formData.append("trainingFieldAddress", "456 Bark St");
      formData.append("trainingFieldGoogleBusinessProfile", "https://business.google.com/456");
      formData.append("trainingFieldGoogleMapsLink", "https://maps.google.com/456");

      const result = await updateCourseAction(null, formData);
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        name: "Updated Obedience",
        dedicatedField: true,
        trainingFieldDescription: "New field description",
        trainingFieldAddress: "456 Bark St",
        trainingFieldGoogleBusinessProfile: "https://business.google.com/456",
        trainingFieldGoogleMapsLink: "https://maps.google.com/456",
      }));
      expect(result).toEqual({ success: true });
    });

    it("should update a course when user is an admin even if they don't own it", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });
      
      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-other" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      const mockWhereUpdate = vi.fn().mockResolvedValueOnce({ count: 1 });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValueOnce({ set: mockSet } as any);

      const formData = new FormData();
      formData.append("id", "course-123");
      formData.append("name", "Admin Updated Name");

      const result = await updateCourseAction(null, formData);
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        name: "Admin Updated Name",
      }));
      expect(result).toEqual({ success: true });
    });

    it("should fail if organization user tries to update a course owned by another organization", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-different" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      const formData = new FormData();
      formData.append("id", "course-123");
      formData.append("name", "Malicious Update Attempt");

      const result = await updateCourseAction(null, formData);
      expect(result).toEqual({ error: "Unauthorized course modification" });
    });

    it("should clear conditional fields (trainer name and venue details) when their respective toggles are false", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-1" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      const mockWhereUpdate = vi.fn().mockResolvedValueOnce({ count: 1 });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValueOnce({ set: mockSet } as any);

      const formData = new FormData();
      formData.append("id", "course-123");
      formData.append("name", "Puppy Obedience");
      formData.append("certifiedTrainer", "false");
      formData.append("certifierName", "Unused Certifier");
      formData.append("dedicatedField", "false");
      formData.append("trainingFieldAddress", "123 Address");
      formData.append("parking", "false");
      formData.append("parkingDescription", "Unused parking desc");

      const result = await updateCourseAction(null, formData);
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        certifierName: null,
        trainingFieldDescription: null,
        trainingFieldAddress: null,
        trainingFieldGoogleBusinessProfile: null,
        trainingFieldGoogleMapsLink: null,
        parkingDescription: null,
      }));
      expect(result).toEqual({ success: true });
    });

    it("should return error on DB failure", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-1" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      const mockWhereUpdate = vi.fn().mockRejectedValueOnce(new Error("DB update failed"));
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValueOnce({ set: mockSet } as any);

      const formData = new FormData();
      formData.append("id", "course-123");
      formData.append("name", "Puppy Obedience");

      const result = await updateCourseAction(null, formData);
      expect(result).toEqual({ error: "Something went wrong. Please try again." });
    });
  });

  describe("deleteCourseAction", () => {
    it("should delete course when owner", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-1" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      const mockWhereDelete = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.delete).mockReturnValueOnce({ where: mockWhereDelete } as any);

      const result = await deleteCourseAction("course-123");
      expect(result).toEqual({ success: true });
    });

    it("should delete course when user is an admin even if they don't own it", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });

      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-other" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      const mockWhereDelete = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.delete).mockReturnValueOnce({ where: mockWhereDelete } as any);

      const result = await deleteCourseAction("course-123");
      expect(result).toEqual({ success: true });
    });

    it("should fail if organization user tries to delete a course owned by another organization", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-different" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      const result = await deleteCourseAction("course-123");
      expect(result).toEqual({ error: "Unauthorized course deletion" });
    });

    it("should return error on DB failure", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-1" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      vi.mocked(db.delete).mockReturnValueOnce({
        where: vi.fn().mockRejectedValueOnce(new Error("DB delete failed")),
      } as any);

      const result = await deleteCourseAction("course-123");
      expect(result).toEqual({ error: "Something went wrong. Please try again." });
    });
  });

  describe("reorderOrgCoursesAction", () => {
    it("should fail if unauthorized", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null);
      const result = await reorderOrgCoursesAction(["course-1", "course-2"]);
      expect(result).toEqual({ error: "Unauthorized access" });
    });

    it("should reorder courses when user is the owner", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockWhereUpdate = vi.fn().mockResolvedValue({ count: 1 });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const result = await reorderOrgCoursesAction(["course-1", "course-2"]);
      expect(mockSet).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it("should reorder courses when user is an admin", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });

      const mockWhereUpdate = vi.fn().mockResolvedValue({ count: 1 });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const result = await reorderOrgCoursesAction(["course-1", "course-2"]);
      expect(mockSet).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it("should return error on DB failure", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockWhereUpdate = vi.fn().mockRejectedValueOnce(new Error("DB update failed"));
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValueOnce({ set: mockSet } as any);

      const result = await reorderOrgCoursesAction(["course-1", "course-2"]);
      expect(result).toEqual({ error: "Failed to save courses order." });
    });
  });
});
