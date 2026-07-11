import { vi, describe, it, expect, beforeEach } from "vitest";
import { createCourseAction, updateCourseAction, deleteCourseAction } from "./courses";
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
      formData.append("certifiedTrainer", "true");
      formData.append("certifierName", "SuperDog");

      const result = await createCourseAction(null, formData);
      expect(mockValues).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/services/dog-training");
      expect(result).toEqual({ success: true });
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

      const result = await updateCourseAction(null, formData);
      expect(result).toEqual({ success: true });
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
  });
});
