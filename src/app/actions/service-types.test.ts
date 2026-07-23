import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  getServiceTypesAction,
  updateServiceTypeAction,
} from "./service-types";
import { revalidatePath } from "next/cache";

// Dummy database URL to satisfy drizzle setup
process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";

// Declare mocks that we can control in tests
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/db", () => {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockImplementation(() => {
      return mockSelect();
    }),
    values: vi.fn().mockImplementation(() => {
      return mockInsert();
    }),
    then: vi.fn().mockImplementation((onfulfilled) => {
      return Promise.resolve(mockSelect()).then(onfulfilled);
    }),
  };

  const db = {
    select: vi.fn().mockReturnValue(chain),
    insert: vi.fn().mockReturnValue(chain),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          return mockUpdate();
        }),
      }),
    }),
  };

  return { db };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Service Types Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getServiceTypesAction", () => {
    it("should seed default service types if database list is empty", async () => {
      // First select call returns empty database list, second returns the seeded values
      mockSelect
        .mockResolvedValueOnce([]) // empty DB check
        .mockResolvedValueOnce([
          { id: "dog_training", name: "Dog training", description: "DB Desc" },
          { id: "dog_boarding", name: "Dog boarding", description: "DB Desc" },
          { id: "sport_dog_training", name: "Dog sports training", description: "DB Desc" },
          { id: "dog_walking", name: "Dog walking", description: "DB Desc" },
          { id: "dog_grooming", name: "Dog grooming", description: "DB Desc" },
        ]);

      mockInsert.mockResolvedValueOnce({ count: 5 });

      const result = await getServiceTypesAction();

      expect(mockInsert).toHaveBeenCalled();
      expect(result.length).toBe(5);
      expect(result[0].name).toBe("Dog training");
      expect(result[0].description).toBe("DB Desc");
      // Check that field configuration is preserved
      expect(result[0].fields.length).toBeGreaterThan(0);
    });

    it("should return merged db values if database list has records", async () => {
      mockSelect.mockResolvedValueOnce([
        { id: "dog_training", name: "Updated Training Name", description: "Updated Training Desc" },
      ]);

      const result = await getServiceTypesAction();

      expect(mockInsert).not.toHaveBeenCalled();
      const training = result.find((item) => item.id === "dog_training");
      expect(training?.name).toBe("Updated Training Name");
      expect(training?.description).toBe("Updated Training Desc");
      // Preserved fields
      expect(training?.fields.length).toBeGreaterThan(0);
    });
  });

  describe("updateServiceTypeAction", () => {
    it("should return error if name or description are missing", async () => {
      const formData = new FormData();
      formData.append("id", "dog_training");
      // missing name/description

      const result = await updateServiceTypeAction(null, formData);
      expect(result).toEqual({ error: "All fields are required." });
    });

    it("should return error if name or description is blank (whitespace only)", async () => {
      const formData = new FormData();
      formData.append("id", "dog_training");
      formData.append("name", "   ");
      formData.append("description", "Valid description");

      const result = await updateServiceTypeAction(null, formData);
      expect(result).toEqual({ error: "All fields are required." });
    });

    it("should successfully update and return success", async () => {
      const formData = new FormData();
      formData.append("id", "dog_training");
      formData.append("name", "Obedience Agility Class");
      formData.append("description", "Premium instruction classes");

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await updateServiceTypeAction(null, formData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/services/types");
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/services");
      expect(result).toEqual({ success: true });
    });

    it("should return error on DB failure", async () => {
      const formData = new FormData();
      formData.append("id", "dog_training");
      formData.append("name", "Dog Training");
      formData.append("description", "Valid description");

      mockUpdate.mockRejectedValueOnce(new Error("DB connection lost"));

      const result = await updateServiceTypeAction(null, formData);
      expect(result).toEqual({ error: "Something went wrong. Please try again." });
    });
  });
});
