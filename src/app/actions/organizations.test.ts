import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  createOrganizationAction,
  updateOrganizationAction,
  changeOrganizationPasswordAction,
  deleteOrganizationAction,
  createOrganizationCategoryAction,
  updateOrganizationCategoryAction,
  deleteOrganizationCategoryAction,
  toggleOrganizationServiceAction,
  toggleOrganizationSubServiceAction,
} from "./organizations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

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
    compare: vi.fn(async (val: string, hashed: string) => hashed === `hashed_${val}` || hashed === val),
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

    it("should return error if category ID is missing for delete", async () => {
      const formData = new FormData();
      // no id appended
      const result = await deleteOrganizationCategoryAction(null, formData);
      expect(result).toEqual({ error: "Organization category ID is required." });
    });

    it("should return error when deleting a category that is in use by an organization", async () => {
      const formData = new FormData();
      formData.append("id", "ngo");

      // mock: an organization user is using this category
      mockSelect.mockResolvedValueOnce([{ id: "org-1" }]);

      const result = await deleteOrganizationCategoryAction(null, formData);
      expect(result).toEqual({
        error: "Cannot delete this organization category because it is in use by one or more organizations.",
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("should successfully delete a category not in use", async () => {
      const formData = new FormData();
      formData.append("id", "ngo");

      // mock: no organization using this category
      mockSelect.mockResolvedValueOnce([]);
      mockDelete.mockResolvedValueOnce({ count: 1 });

      const result = await deleteOrganizationCategoryAction(null, formData);
      expect(mockDelete).toHaveBeenCalled();
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
      // missing name, category

      const result = await updateOrganizationAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });
    });

    it("should return error if organization category is invalid", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("name", "Org Name");
      formData.append("organizationCategory", "invalid_category");

      const result = await updateOrganizationAction(null, formData);
      expect(result).toEqual({ error: "A valid Organization Category is required" });
    });

    it("should successfully update and return success", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("name", "Org Name");
      formData.append("organizationCategory", "ngo");
      formData.append("phoneNumber", "+15551234");
      formData.append("addressCountry", "Romania");

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await updateOrganizationAction(null, formData);
      expect(result).toEqual({ success: true });

      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations/edit/comp-id");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/account");
    });

    it("should persist social media and google business profile fields", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("name", "Social Org");
      formData.append("organizationCategory", "ngo");
      formData.append("facebook", "https://facebook.com/org");
      formData.append("instagram", "https://instagram.com/org");
      formData.append("tiktok", "https://tiktok.com/@org");
      formData.append("youtube", "https://youtube.com/@org");
      formData.append("website", "https://org.com");
      formData.append("googleBusinessProfile", "https://maps.google.com/org");

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await updateOrganizationAction(null, formData);
      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("changeOrganizationPasswordAction", () => {
    it("should return error if email is taken by another user", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("email", "org@example.com");

      mockSelect.mockResolvedValueOnce([{ id: "other-id", email: "org@example.com" }]);

      const result = await changeOrganizationPasswordAction(null, formData);
      expect(result).toEqual({ error: "Email address is already taken" });
    });

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

    it("should update password and return success", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("password", "validpassword");
      formData.append("confirmPassword", "validpassword");

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await changeOrganizationPasswordAction(null, formData);
      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations/edit/comp-id");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/account");
    });

    it("should update email and recovery email and return success", async () => {
      const formData = new FormData();
      formData.append("id", "comp-id");
      formData.append("email", "new@example.com");
      formData.append("recoveryEmail", "backup@example.com");

      mockSelect.mockResolvedValueOnce([]); // email free
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await changeOrganizationPasswordAction(null, formData);
      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations/edit/comp-id");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/account");
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

  describe("changeOrganizationPasswordAction", () => {
    it("should successfully change password if logged in as admin without current password", async () => {
      const formData = new FormData();
      formData.append("id", "org-id");
      formData.append("password", "newsecurepassword");
      formData.append("confirmPassword", "newsecurepassword");

      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "admin-id", role: "admin", name: "Admin" },
        expires: "expires-date",
      });

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await changeOrganizationPasswordAction(null, formData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/account");
      expect(result).toEqual({ success: true });
    });

    it("should require current password if logged in as organization", async () => {
      const formData = new FormData();
      formData.append("id", "org-id");
      formData.append("password", "newsecurepassword");
      formData.append("confirmPassword", "newsecurepassword");

      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "org-id", role: "organization", name: "Org" },
        expires: "expires-date",
      });

      const result = await changeOrganizationPasswordAction(null, formData);

      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toEqual({ error: "Current password is required" });
    });

    it("should return error if current password is incorrect for organization", async () => {
      const formData = new FormData();
      formData.append("id", "org-id");
      formData.append("password", "newsecurepassword");
      formData.append("confirmPassword", "newsecurepassword");
      formData.append("currentPassword", "wrongpassword");

      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "org-id", role: "organization", name: "Org" },
        expires: "expires-date",
      });

      mockSelect.mockResolvedValueOnce([{ password: "hashed_correctpassword" }]);

      const result = await changeOrganizationPasswordAction(null, formData);

      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toEqual({ error: "Incorrect current password" });
    });

    it("should successfully change password if current password is correct for organization", async () => {
      const formData = new FormData();
      formData.append("id", "org-id");
      formData.append("password", "newsecurepassword");
      formData.append("confirmPassword", "newsecurepassword");
      formData.append("currentPassword", "correctpassword");

      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "org-id", role: "organization", name: "Org" },
        expires: "expires-date",
      });

      mockSelect.mockResolvedValueOnce([{ password: "hashed_correctpassword" }]);
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await changeOrganizationPasswordAction(null, formData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/account");
      expect(result).toEqual({ success: true });
    });
  });

  describe("toggleOrganizationServiceAction", () => {
    it("should return error if organization is not found", async () => {
      mockSelect.mockResolvedValueOnce([]); // no org found

      const result = await toggleOrganizationServiceAction("nonexistent-org", "srv-1", true);
      expect(result).toEqual({ error: "Organization not found" });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should add a service ID to the enabled list", async () => {
      mockSelect.mockResolvedValueOnce([{ enabledServices: "srv-2" }]);
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await toggleOrganizationServiceAction("org-id", "srv-1", true);
      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/services");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/account");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(result).toEqual({ success: true });
    });

    it("should not add a duplicate service ID to the enabled list", async () => {
      mockSelect.mockResolvedValueOnce([{ enabledServices: "srv-1,srv-2" }]);
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await toggleOrganizationServiceAction("org-id", "srv-1", true);
      expect(mockUpdate).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should remove a service ID from the enabled list", async () => {
      mockSelect.mockResolvedValueOnce([{ enabledServices: "srv-1,srv-2" }]);
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await toggleOrganizationServiceAction("org-id", "srv-1", false);
      expect(mockUpdate).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should handle null enabledServices (start from empty list)", async () => {
      mockSelect.mockResolvedValueOnce([{ enabledServices: null }]);
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await toggleOrganizationServiceAction("org-id", "srv-1", true);
      expect(result).toEqual({ success: true });
    });

    it("should return error on DB failure", async () => {
      // Trigger failure via the update step (select resolves normally first)
      mockSelect.mockResolvedValueOnce([{ enabledServices: "srv-2" }]);
      mockUpdate.mockRejectedValueOnce(new Error("DB offline"));

      const result = await toggleOrganizationServiceAction("org-id", "srv-1", true);
      expect(result).toEqual({ error: "Failed to toggle service. Please try again." });
    });
  });

  describe("toggleOrganizationSubServiceAction", () => {
    it("should return error if organization is not found", async () => {
      mockSelect.mockResolvedValueOnce([]);

      const result = await toggleOrganizationSubServiceAction("nonexistent-org", "dog-training:basic", true);
      expect(result).toEqual({ error: "Organization not found" });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should add a sub-service ID to the enabled sub-services list", async () => {
      mockSelect.mockResolvedValueOnce([{ enabledSubServices: "dog-training:group" }]);
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await toggleOrganizationSubServiceAction("org-id", "dog-training:basic", true);
      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/services");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/account");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/organizations/services");
      expect(result).toEqual({ success: true });
    });

    it("should not add a duplicate sub-service ID", async () => {
      mockSelect.mockResolvedValueOnce([{ enabledSubServices: "dog-training:basic,dog-training:group" }]);
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await toggleOrganizationSubServiceAction("org-id", "dog-training:basic", true);
      expect(mockUpdate).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should remove a sub-service ID from the enabled list", async () => {
      mockSelect.mockResolvedValueOnce([{ enabledSubServices: "dog-training:basic,dog-training:group" }]);
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await toggleOrganizationSubServiceAction("org-id", "dog-training:basic", false);
      expect(mockUpdate).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should handle null enabledSubServices (start from empty list)", async () => {
      mockSelect.mockResolvedValueOnce([{ enabledSubServices: null }]);
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await toggleOrganizationSubServiceAction("org-id", "dog-training:sar", true);
      expect(result).toEqual({ success: true });
    });

    it("should return error on DB failure", async () => {
      // Trigger failure via the update step (select resolves normally first)
      mockSelect.mockResolvedValueOnce([{ enabledSubServices: "dog-training:group" }]);
      mockUpdate.mockRejectedValueOnce(new Error("DB offline"));

      const result = await toggleOrganizationSubServiceAction("org-id", "dog-training:basic", true);
      expect(result).toEqual({ error: "Failed to toggle sub-service. Please try again." });
    });
  });
});
