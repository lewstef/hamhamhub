import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  createUserAction,
  updateUserAction,
  changeUserPasswordAction,
  deleteUserAction,
} from "./users";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    from: vi.fn().mockReturnThis(),
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

describe("User Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUserAction", () => {
    it("should return error if required fields are missing", async () => {
      const formData = new FormData();
      formData.append("name", "Jane Doe");
      // missing email, password

      const result = await createUserAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });
    });

    it("should return error if password is less than 6 characters", async () => {
      const formData = new FormData();
      formData.append("name", "Jane Doe");
      formData.append("email", "jane@example.com");
      formData.append("password", "12345");

      const result = await createUserAction(null, formData);
      expect(result).toEqual({ error: "Password must be at least 6 characters" });
    });

    it("should return error if email is already taken", async () => {
      const formData = new FormData();
      formData.append("name", "Jane Doe");
      formData.append("email", "jane@example.com");
      formData.append("password", "123456");

      mockSelect.mockResolvedValueOnce([{ id: "existing-id", email: "jane@example.com" }]);

      const result = await createUserAction(null, formData);
      expect(result).toEqual({ error: "Email address is already taken" });
    });

    it("should successfully create user, revalidate path and return success", async () => {
      const formData = new FormData();
      formData.append("name", "Jane Doe");
      formData.append("email", "jane@example.com");
      formData.append("password", "123456");

      mockSelect.mockResolvedValueOnce([]); // email check empty
      mockInsert.mockResolvedValueOnce({ id: "new-user-id" });

      const result = await createUserAction(null, formData);

      expect(mockInsert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/users");
      expect(result).toEqual({ success: true });
    });
  });

  describe("updateUserAction", () => {
    it("should return error if required fields are missing", async () => {
      const formData = new FormData();
      formData.append("id", "cust-id");
      // missing name, email

      const result = await updateUserAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });
    });

    it("should return error if email is taken by another user", async () => {
      const formData = new FormData();
      formData.append("id", "cust-id");
      formData.append("name", "Jane Doe");
      formData.append("email", "jane@example.com");

      mockSelect.mockResolvedValueOnce([{ id: "other-id", email: "jane@example.com" }]);

      const result = await updateUserAction(null, formData);
      expect(result).toEqual({ error: "Email address is already taken" });
    });

    it("should successfully update and redirect to backoffice/users", async () => {
      const formData = new FormData();
      formData.append("id", "cust-id");
      formData.append("name", "Jane Doe");
      formData.append("email", "jane@example.com");

      mockSelect.mockResolvedValueOnce([]); // no duplicate email found
      mockUpdate.mockResolvedValueOnce({ count: 1 });

      await expect(updateUserAction(null, formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/users");
      expect(redirect).toHaveBeenCalledWith("/backoffice/users");
    });
  });

  describe("changeUserPasswordAction", () => {
    it("should return error if passwords do not match", async () => {
      const formData = new FormData();
      formData.append("id", "cust-id");
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "differentpassword");

      const result = await changeUserPasswordAction(null, formData);
      expect(result).toEqual({ error: "Passwords do not match" });
    });

    it("should return error if password is less than 6 characters", async () => {
      const formData = new FormData();
      formData.append("id", "cust-id");
      formData.append("password", "12345");
      formData.append("confirmPassword", "12345");

      const result = await changeUserPasswordAction(null, formData);
      expect(result).toEqual({ error: "Password must be at least 6 characters" });
    });

    it("should update password and redirect to backoffice/users", async () => {
      const formData = new FormData();
      formData.append("id", "cust-id");
      formData.append("password", "validpassword");
      formData.append("confirmPassword", "validpassword");

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      await expect(changeUserPasswordAction(null, formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/users");
      expect(redirect).toHaveBeenCalledWith("/backoffice/users");
    });
  });

  describe("deleteUserAction", () => {
    it("should restrict deleting users with roles other than 'user'", async () => {
      const formData = new FormData();
      formData.append("id", "emp-id");

      // Mock DB look up returning employee role
      mockSelect.mockResolvedValueOnce([{ role: "employee" }]);

      const result = await deleteUserAction(null, formData);

      expect(mockSelect).toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
      expect(result).toEqual({ error: "Security restriction: Only user accounts can be deleted." });
    });

    it("should allow deleting a user with role 'user'", async () => {
      const formData = new FormData();
      formData.append("id", "cust-id");

      mockSelect.mockResolvedValueOnce([{ role: "user" }]);
      mockDelete.mockResolvedValueOnce({ count: 1 });

      const result = await deleteUserAction(null, formData);

      expect(mockSelect).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/users");
      expect(result).toEqual({ success: true });
    });
  });
});
