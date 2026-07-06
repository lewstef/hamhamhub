import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  createOrganizationAction,
  updateOrganizationAction,
  changeOrganizationPasswordAction,
  deleteOrganizationAction,
  createOrganizationCategoryAction,
  updateOrganizationCategoryAction,
  deleteOrganizationCategoryAction,
} from "./organizations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Dummy database URL to satisfy drizzle setup
process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";

// Declare mocks that we can control in tests
const mockSelect = vi.fn();
const mockCategorySelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/db", () => {
  let lastTable = "";
  const chain: any = {};

  chain.from = vi.fn().mockImplementation((table) => {
    lastTable = table?.[Symbol.for("drizzle:Name")] || "";
    return chain;
  });
  chain.where = vi.fn().mockImplementation(() => {
    return chain;
  });
  chain.orderBy = vi.fn().mockImplementation(() => {
    return chain;
  });
  chain.limit = vi.fn().mockImplementation(() => {
    return chain;
  });
  chain.values = vi.fn().mockImplementation(() => {
    return mockInsert();
  });
  chain.then = vi.fn().mockImplementation((onfulfilled) => {
    if (lastTable === "organization_categories") {
      const categories = [
        { id: "ngo", name: "NGO", description: "NGO Description" },
        { id: "dog_kennel", name: "Dog Kennel", description: "Dog Kennel Description" },
        { id: "dog_service_provider", name: "Dog service provider", description: "Dog service provider Description" },
        { id: "cynological_association", name: "Official Cynological Association", description: "Official Cynological Association Description" },
      ];
      const customVal = mockCategorySelect();
      const val = customVal !== undefined ? customVal : categories;
      return Promise.resolve(val).then(onfulfilled);
    }
    return Promise.resolve(mockSelect()).then(onfulfilled);
  });

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

describe("Organization Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategorySelect.mockReturnValue(undefined);
  });

  describe("Category Management Actions", () => {
    it("should create category with name and description", async () => {
      const formData = new FormData();
      formData.append("name", "New Category");
      formData.append("description", "A custom description here");

      mockCategorySelect.mockReturnValueOnce([]); // no existing category duplicate
      mockInsert.mockResolvedValueOnce({ id: "new_category" });

      const result = await createOrganizationCategoryAction(null, formData);

      expect(mockInsert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(result).toEqual({ success: true });
    });

    it("should update category name and description", async () => {
      const formData = new FormData();
      formData.append("id", "ngo");
      formData.append("name", "Updated NGO");
      formData.append("description", "Updated description text");

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await updateOrganizationCategoryAction(null, formData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(result).toEqual({ success: true });
    });
  });

  describe("createOrganizationAction", () => {
    it("should return error if required fields are missing", async () => {
      const formData = new FormData();
      formData.append("name", "Org Name");
      // missing email, password, category

      const result = await createOrganizationAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });
    });

    it("should return error if organization category is invalid", async () => {
      const formData = new FormData();
      formData.append("name", "Org Name");
      formData.append("email", "org@example.com");
      formData.append("password", "123456");
      formData.append("organizationCategory", "invalid_category");

      const result = await createOrganizationAction(null, formData);
      expect(result).toEqual({ error: "A valid Organization Category is required" });
    });

    it("should return error if password is less than 6 characters", async () => {
      const formData = new FormData();
      formData.append("name", "Org Name");
      formData.append("email", "org@example.com");
      formData.append("password", "12345");
      formData.append("organizationCategory", "ngo");

      const result = await createOrganizationAction(null, formData);
      expect(result).toEqual({ error: "Password must be at least 6 characters" });
    });

    it("should return error if email is already taken", async () => {
      const formData = new FormData();
      formData.append("name", "Org Name");
      formData.append("email", "org@example.com");
      formData.append("password", "123456");
      formData.append("organizationCategory", "ngo");

      mockSelect.mockResolvedValueOnce([{ id: "existing-id", email: "org@example.com" }]);

      const result = await createOrganizationAction(null, formData);
      expect(result).toEqual({ error: "Email address is already taken" });
    });

    it("should successfully create organization, revalidate path and return success", async () => {
      const formData = new FormData();
      formData.append("name", "Org Name");
      formData.append("email", "org@example.com");
      formData.append("password", "123456");
      formData.append("organizationCategory", "ngo");

      mockSelect.mockResolvedValueOnce([]); // email check empty
      mockInsert.mockResolvedValueOnce({ id: "new-org-id" });

      const result = await createOrganizationAction(null, formData);

      expect(mockInsert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(result).toEqual({ success: true });
    });
  });

  describe("updateOrganizationAction", () => {
    it("should return error if required fields are missing", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      // missing name, email, category

      const result = await updateOrganizationAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });
    });

    it("should return error if organization category is invalid", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("name", "Org Name");
      formData.append("email", "org@example.com");
      formData.append("organizationCategory", "invalid_category");

      const result = await updateOrganizationAction(null, formData);
      expect(result).toEqual({ error: "A valid Organization Category is required" });
    });

    it("should return error if email is taken by another user", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("name", "Org Name");
      formData.append("email", "org@example.com");
      formData.append("organizationCategory", "ngo");

      mockSelect.mockResolvedValueOnce([{ id: "other-id", email: "org@example.com" }]);

      const result = await updateOrganizationAction(null, formData);
      expect(result).toEqual({ error: "Email address is already taken" });
    });

    it("should successfully update and redirect to backoffice/organizations", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("name", "Org Name");
      formData.append("email", "org@example.com");
      formData.append("organizationCategory", "ngo");

      mockSelect.mockResolvedValueOnce([]); // no duplicate email found
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      await expect(updateOrganizationAction(null, formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(redirect).toHaveBeenCalledWith("/backoffice/organizations");
    });
  });

  describe("changeOrganizationPasswordAction", () => {
    it("should return error if passwords do not match", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "differentpassword");

      const result = await changeOrganizationPasswordAction(null, formData);
      expect(result).toEqual({ error: "Passwords do not match" });
    });

    it("should return error if password is less than 6 characters", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("password", "12345");
      formData.append("confirmPassword", "12345");

      const result = await changeOrganizationPasswordAction(null, formData);
      expect(result).toEqual({ error: "Password must be at least 6 characters" });
    });

    it("should update password and redirect to backoffice/organizations", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("password", "validpassword");
      formData.append("confirmPassword", "validpassword");

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      await expect(changeOrganizationPasswordAction(null, formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(redirect).toHaveBeenCalledWith("/backoffice/organizations");
    });
  });

  describe("deleteOrganizationAction", () => {
    it("should restrict deleting users with roles other than 'organization'", async () => {
      const formData = new FormData();
      formData.append("id", "emp-id");

      // Mock DB look up returning employee role
      mockSelect.mockResolvedValueOnce([{ role: "employee" }]);

      const result = await deleteOrganizationAction(null, formData);

      expect(mockSelect).toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
      expect(result).toEqual({ error: "Security restriction: Only organization accounts can be deleted." });
    });

    it("should allow deleting a user with role 'organization'", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");

      mockSelect.mockResolvedValueOnce([{ role: "organization" }]);
      mockDelete.mockResolvedValueOnce({ count: 1 });

      const result = await deleteOrganizationAction(null, formData);

      expect(mockSelect).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(result).toEqual({ success: true });
    });
  });
});
