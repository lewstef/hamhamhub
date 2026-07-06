import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  createServiceAction,
  deleteServiceAction,
} from "./services";
import { revalidatePath } from "next/cache";

// Dummy database URL to satisfy drizzle setup
process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";

// Declare mocks that we can control in tests
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/db", () => {
  const chain = {
    from: vi.fn().mockImplementation((table) => {
      const tableName = table?.[Symbol.for("drizzle:Name")];
      if (tableName === "organization_categories") {
        return Promise.resolve([
          { id: "ngo", name: "NGO" },
          { id: "dog_kennel", name: "Dog Kennel" },
          { id: "dog_service_provider", name: "Dog service provider" },
          { id: "cynological_association", name: "Official Cynological Association" },
        ]);
      }
      return chain;
    }),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockImplementation(() => {
      return mockSelect();
    }),
    values: vi.fn().mockImplementation(() => {
      return mockInsert();
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
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockImplementation(() => {
        return mockDelete();
      }),
    }),
  };

  return { db };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path) => {
    const err = new Error("NEXT_REDIRECT");
    (err as Error & { digest?: string }).digest = `NEXT_REDIRECT;${path};307;`;
    throw err;
  }),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async (val: string) => `hashed_${val}`),
  },
}));

describe("Service Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createServiceAction", () => {
    it("should return error if required fields are missing", async () => {
      const formData = new FormData();
      formData.append("name", "Dog Boarding");
      // missing organizationCategory

      const result = await createServiceAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });
    });

    it("should return error if organization category is invalid", async () => {
      const formData = new FormData();
      formData.append("name", "Dog Boarding");
      formData.append("organizationCategory", "invalid_category");

      const result = await createServiceAction(null, formData);
      expect(result).toEqual({ error: "A valid Organization Category is required" });
    });

    it("should successfully create service and return success", async () => {
      const formData = new FormData();
      formData.append("name", "Dog Boarding");
      formData.append("organizationCategory", "dog_kennel");

      mockInsert.mockResolvedValueOnce({ id: "new-service-id" });

      const result = await createServiceAction(null, formData);

      expect(mockInsert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/services");
      expect(result).toEqual({ success: true });
    });
  });

  describe("deleteServiceAction", () => {
    it("should return error if ID is missing", async () => {
      const formData = new FormData();
      // missing id

      const result = await deleteServiceAction(null, formData);
      expect(result).toEqual({ error: "Service ID is required" });
    });

    it("should successfully delete service and return success", async () => {
      const formData = new FormData();
      formData.append("id", "serv-id");

      mockDelete.mockResolvedValueOnce({ count: 1 });

      const result = await deleteServiceAction(null, formData);

      expect(mockDelete).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/services");
      expect(result).toEqual({ success: true });
    });
  });
});
