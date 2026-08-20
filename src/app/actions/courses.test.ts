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
      vi.mocked(auth as any).mockResolvedValueOnce(null);
      const result = await createCourseAction(null, new FormData());
      expect(result).toEqual({ error: "Unauthorized access" });
    });

    it("should fail if name is missing", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Course name is required." });
    });

    it("should successfully insert new course", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const mockValues = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.insert).mockReturnValueOnce({ values: mockValues } as any);

      const formData = new FormData();
      formData.append("name", "Basic Obedience");
      formData.append("price", "200");
      formData.append("priceType", "month");
      formData.append("certifiedTrainer", "true");
      formData.append("certifierName", "SuperDog");
      formData.append("trainerExperienceDescription", "10 years experience");
      formData.append("ageLimitsEnabled", "true");
      formData.append("ageLimits", "Puppy (2-6 mos),Senior (7+ yrs)");
      formData.append("acceptedDogSizesEnabled", "true");
      formData.append("acceptedDogSizes", "Small,Medium");
      formData.append("trainingFormat", "Group Class");
      formData.append("maxDogsPerGroup", "6");
      formData.append("indoorFacility", "true");
      formData.append("indoorFacilityDescription", "200 sqm heated indoor agility arena");
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
        trainerExperienceDescription: "10 years experience",
        ageLimitsEnabled: true,
        ageLimits: "Puppy (2-6 mos),Senior (7+ yrs)",
        acceptedDogSizesEnabled: true,
        acceptedDogSizes: "Small,Medium",
        trainingFormat: "Group Class",
        maxDogsPerGroup: 6,
        indoorFacility: true,
        indoorFacilityDescription: "200 sqm heated indoor agility arena",
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
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });
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
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const mockValues = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.insert).mockReturnValueOnce({ values: mockValues } as any);

      const formData = new FormData();
      formData.append("name", "VIP Kennel Stay");
      formData.append("price", "300");
      formData.append("priceType", "night");
      formData.append("medicationAdministration", "true");
      formData.append("medicationAdministrationDetails", "Give pill after meals");
      formData.append("surveillance247", "true");
      formData.append("surveillance247Details", "Continuous CCTV monitoring");
      formData.append("webCam", "true");
      formData.append("webCamDetails", "Live webcam stream link");
      formData.append("dailyWalks", "3");
      formData.append("ownerCommunication", "true");
      formData.append("ownerCommunicationDetails", "WhatsApp photo at noon");
      formData.append("personalizedMealPlan", "true");
      formData.append("personalizedMealPlanDetails", "Raw BARF mix twice a day");
      formData.append("checkin", "08:30");
      formData.append("checkout", "18:00");
      formData.append("checkinWeekend", "09:30");
      formData.append("checkoutWeekend", "16:30");
      formData.append("playYard", "true");
      formData.append("playYardDetails", "500 sqm grass yard with splash pool");
      formData.append("pool", "true");
      formData.append("poolDetails", "Inground canine pool with life jackets");
      formData.append("socializationPolicy", "Supervised small group play with temperament testing");
      const testSchedule = JSON.stringify([
        { day: "monday", label: "Monday", enabled: true, checkin: "08:30", checkout: "18:00" },
      ]);
      formData.append("schedule", testSchedule);

      const result = await createCourseAction(null, formData);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        name: "VIP Kennel Stay",
        price: "300",
        priceType: "night",
        medicationAdministration: true,
        medicationAdministrationDetails: "Give pill after meals",
        surveillance247: true,
        surveillance247Details: "Continuous CCTV monitoring",
        webCam: true,
        webCamDetails: "Live webcam stream link",
        dailyWalks: 3,
        ownerCommunication: true,
        ownerCommunicationDetails: "WhatsApp photo at noon",
        personalizedMealPlan: true,
        personalizedMealPlanDetails: "Raw BARF mix twice a day",
        playYard: true,
        playYardDetails: "500 sqm grass yard with splash pool",
        pool: true,
        poolDetails: "Inground canine pool with life jackets",
        socializationPolicy: "Supervised small group play with temperament testing",
        checkin: "08:30",
        checkout: "18:00",
        checkinWeekend: "09:30",
        checkoutWeekend: "16:30",
        schedule: testSchedule,
      }));
      expect(result).toEqual({ success: true });
    });

    it("should successfully insert sitting service with veterinary training attributes", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const mockValues = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.insert).mockReturnValueOnce({ values: mockValues } as any);

      const formData = new FormData();
      formData.append("name", "Medical Day Sitting");
      formData.append("price", "80");
      formData.append("priceType", "1h");
      formData.append("veterinaryTraining", "true");
      formData.append("veterinaryTrainingCertifier", "USAMV Vet Tech");
      formData.append("veterinaryTrainingDetails", "Veterinary nurse with 5 years clinical experience");
      formData.append("emergencyVetTransport", "true");
      formData.append("emergencyVetTransportDetails", "Emergency vehicle on standby");
      formData.append("maxPetsPerVisit", "2");
      formData.append("additionalPetPolicy", "+20 RON/hr for second dog");
      formData.append("acceptedDogSizesEnabled", "true");
      formData.append("acceptedDogSizes", "Small,Medium,Large");

      const result = await createCourseAction(null, formData);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        name: "Medical Day Sitting",
        price: "80",
        priceType: "1h",
        veterinaryTraining: true,
        veterinaryTrainingCertifier: "USAMV Vet Tech",
        veterinaryTrainingDetails: "Veterinary nurse with 5 years clinical experience",
        emergencyVetTransport: true,
        emergencyVetTransportDetails: "Emergency vehicle on standby",
        maxPetsPerVisit: 2,
        additionalPetPolicy: "+20 RON/hr for second dog",
        acceptedDogSizesEnabled: true,
        acceptedDogSizes: "Small,Medium,Large",
      }));
      expect(result).toEqual({ success: true });
    });

    it("should successfully insert grooming service with acceptedDogWeight", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const mockValues = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.insert).mockReturnValueOnce({ values: mockValues } as any);

      const formData = new FormData();
      formData.append("name", "Full Grooming Package");
      formData.append("price", "150");
      formData.append("priceType", "service");
      formData.append("acceptedDogWeight", "5,10,15,20,25");

      const result = await createCourseAction(null, formData);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        name: "Full Grooming Package",
        price: "150",
        priceType: "service",
        acceptedDogWeight: "5,10,15,20,25",
      }));
      expect(result).toEqual({ success: true });
    });

    it("should fail schedule time format validation", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      formData.append("name", "VIP Stay");
      formData.append("schedule", JSON.stringify([
        { day: "tuesday", label: "Tuesday", enabled: true, checkin: "25:00", checkout: "18:00" }
      ]));

      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Invalid check-in time format for Tuesday. Use hh:mm (24h)." });
    });

    it("should fail check-in format validation", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      formData.append("name", "VIP Stay");
      formData.append("checkin", "25:00");

      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Invalid work week check-in time format. Use hh:mm (24h)." });
    });

    it("should fail check-out format validation", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      formData.append("name", "VIP Stay");
      formData.append("checkout", "18:65");

      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Invalid work week check-out time format. Use hh:mm (24h)." });
    });

    it("should fail weekend check-in format validation", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      formData.append("name", "VIP Stay");
      formData.append("checkinWeekend", "25:00");

      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Invalid weekend check-in time format. Use hh:mm (24h)." });
    });

    it("should fail weekend check-out format validation", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      formData.append("name", "VIP Stay");
      formData.append("checkoutWeekend", "18:65");

      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Invalid weekend check-out time format. Use hh:mm (24h)." });
    });

    it("should fail if organization ID is missing for admin", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });
      const formData = new FormData();
      formData.append("name", "Admin Course");
      const result = await createCourseAction(null, formData);
      expect(result).toEqual({ error: "Organization ID is required." });
    });

    it("should return error on DB failure", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
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
      vi.mocked(auth as any).mockResolvedValueOnce(null);
      const result = await updateCourseAction(null, new FormData());
      expect(result).toEqual({ error: "Unauthorized access" });
    });

    it("should fail if course ID or name is missing", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      const formData = new FormData();
      const result = await updateCourseAction(null, formData);
      expect(result).toEqual({ error: "Course ID is required." });
    });

    it("should update a course when user is the owner", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      
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
      formData.append("acceptedDogSizesEnabled", "true");
      formData.append("acceptedDogSizes", "Small,Medium,Giant");
      formData.append("trainingFormat", "Private 1-on-1 Session");
      formData.append("indoorFacility", "true");
      formData.append("indoorFacilityDescription", "300 sqm heated arena");
      formData.append("playYard", "true");
      formData.append("playYardDetails", "1000 sqm play area");
      formData.append("pool", "true");
      formData.append("poolDetails", "Chlorine-free dog pool");

      const result = await updateCourseAction(null, formData);
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        name: "Updated Obedience",
        dedicatedField: true,
        trainingFieldDescription: "New field description",
        trainingFieldAddress: "456 Bark St",
        trainingFieldGoogleBusinessProfile: "https://business.google.com/456",
        trainingFieldGoogleMapsLink: "https://maps.google.com/456",
        acceptedDogSizesEnabled: true,
        acceptedDogSizes: "Small,Medium,Giant",
        trainingFormat: "Private 1-on-1 Session",
        indoorFacility: true,
        indoorFacilityDescription: "300 sqm heated arena",
        playYard: true,
        playYardDetails: "1000 sqm play area",
        pool: true,
        poolDetails: "Chlorine-free dog pool",
      }));
      expect(result).toEqual({ success: true });
    });

    it("should update a course when user is an admin even if they don't own it", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });
      
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
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

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
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

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
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

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
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

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
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });

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
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-different" }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      vi.mocked(db.select).mockReturnValueOnce({ from: mockFrom } as any);

      const result = await deleteCourseAction("course-123");
      expect(result).toEqual({ error: "Unauthorized course deletion" });
    });

    it("should return error on DB failure", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

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
      vi.mocked(auth as any).mockResolvedValueOnce(null);
      const result = await reorderOrgCoursesAction(["course-1", "course-2"]);
      expect(result).toEqual({ error: "Unauthorized access" });
    });

    it("should reorder courses when user is the owner", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockWhereUpdate = vi.fn().mockResolvedValue({ count: 1 });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const result = await reorderOrgCoursesAction(["course-1", "course-2"]);
      expect(mockSet).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it("should reorder courses when user is an admin", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "admin-1", role: "admin" }, expires: "" });

      const mockWhereUpdate = vi.fn().mockResolvedValue({ count: 1 });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const result = await reorderOrgCoursesAction(["course-1", "course-2"]);
      expect(mockSet).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it("should return error on DB failure", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });

      const mockWhereUpdate = vi.fn().mockRejectedValueOnce(new Error("DB update failed"));
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      vi.mocked(db.update).mockReturnValueOnce({ set: mockSet } as any);

      const result = await reorderOrgCoursesAction(["course-1", "course-2"]);
      expect(result).toEqual({ error: "Failed to save courses order." });
    });
  });

  describe("Additional branch tests for courses.ts", () => {
    it("should allow employee role to create, update, and delete courses", async () => {
      vi.mocked(auth as any).mockResolvedValue({ user: { id: "emp-1", role: "employee" }, expires: "" });

      // Create
      const mockValues = vi.fn().mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.insert).mockReturnValueOnce({ values: mockValues } as any);
      const createData = new FormData();
      createData.append("organizationId", "org-1");
      createData.append("name", "Employee Created Course");

      const createRes = await createCourseAction(null, createData);
      expect(createRes).toEqual({ success: true });

      // Update
      const mockLimit = vi.fn().mockResolvedValueOnce([{ organizationId: "org-1" }]);
      vi.mocked(db.select).mockReturnValueOnce({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: mockLimit }) }) } as any);
      const mockSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValueOnce({ count: 1 }) });
      vi.mocked(db.update).mockReturnValueOnce({ set: mockSet } as any);

      const updateData = new FormData();
      updateData.append("id", "course-1");
      updateData.append("name", "Employee Updated Course");

      const updateRes = await updateCourseAction(null, updateData);
      expect(updateRes).toEqual({ success: true });

      // Delete
      vi.mocked(db.select).mockReturnValueOnce({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValueOnce([{ organizationId: "org-1" }]) }) }) } as any);
      vi.mocked(db.delete).mockReturnValueOnce({ where: vi.fn().mockResolvedValueOnce({ count: 1 }) } as any);

      const deleteRes = await deleteCourseAction("course-1");
      expect(deleteRes).toEqual({ success: true });
    });

    it("should return error if course to update is not found", async () => {
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      vi.mocked(db.select).mockReturnValueOnce({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValueOnce([]) }) }) } as any);

      const formData = new FormData();
      formData.append("id", "non-existent-course");
      formData.append("name", "Non Existent");

      const result = await updateCourseAction(null, formData);
      expect(result).toEqual({ error: "Course not found" });
    });

    it("should return error if course to delete is not found or unauthorized", async () => {
      // Unauthenticated
      vi.mocked(auth as any).mockResolvedValueOnce(null);
      expect(await deleteCourseAction("course-1")).toEqual({ error: "Unauthorized access" });

      // Course not found
      vi.mocked(auth as any).mockResolvedValueOnce({ user: { id: "org-1", role: "organization" }, expires: "" });
      vi.mocked(db.select).mockReturnValueOnce({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValueOnce([]) }) }) } as any);
      expect(await deleteCourseAction("course-1")).toEqual({ error: "Course not found" });
    });

    it("should return validation error when schedule checkout is before checkin or JSON is invalid", async () => {
      vi.mocked(auth as any).mockResolvedValue({ user: { id: "org-1", role: "organization" }, expires: "" });

      // Invalid schedule JSON
      const formInvalidJson = new FormData();
      formInvalidJson.append("organizationId", "org-1");
      formInvalidJson.append("name", "Schedule Course");
      formInvalidJson.append("schedule", "invalid-json-string");

      const resInvalidJson = await createCourseAction(null, formInvalidJson);
      expect(resInvalidJson).toEqual({ error: "Invalid schedule JSON format." });

      // Checkout before checkin
      const formInvalidTimes = new FormData();
      formInvalidTimes.append("organizationId", "org-1");
      formInvalidTimes.append("name", "Schedule Course");
      formInvalidTimes.append(
        "schedule",
        JSON.stringify([
          { day: "monday", label: "Monday", enabled: true, checkin: "14:00", checkout: "10:00" },
        ])
      );

      const resInvalidTimes = await createCourseAction(null, formInvalidTimes);
      expect(resInvalidTimes).toEqual({
        error: "Check-out time cannot be before or equal to check-in time for Monday.",
      });
    });
  });
});
