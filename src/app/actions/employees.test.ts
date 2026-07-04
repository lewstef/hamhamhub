import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  createEmployeeAction,
  updateEmployeeAction,
  changeEmployeePasswordAction,
  deleteEmployeeAction,
} from "./employees";
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

describe("Employee Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEmployeeAction", () => {
    it("should return error if required fields are missing", async () => {
      const formData = new FormData();
      formData.append("name", "John Doe");
      // missing username, email, password, role

      const result = await createEmployeeAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });
    });

    it("should return error if password is less than 6 characters", async () => {
      const formData = new FormData();
      formData.append("name", "John Doe");
      formData.append("username", "johndoe");
      formData.append("email", "john@example.com");
      formData.append("password", "12345");
      formData.append("role", "employee");

      const result = await createEmployeeAction(null, formData);
      expect(result).toEqual({ error: "Password must be at least 6 characters" });
    });

    it("should return error if username is already taken", async () => {
      const formData = new FormData();
      formData.append("name", "John Doe");
      formData.append("username", "johndoe");
      formData.append("email", "john@example.com");
      formData.append("password", "123456");
      formData.append("role", "employee");

      // Mock select username check returning an existing user
      mockSelect.mockResolvedValueOnce([{ id: "existing-id", username: "johndoe" }]);

      const result = await createEmployeeAction(null, formData);
      expect(result).toEqual({ error: "Username is already taken" });
    });

    it("should return error if email is already taken", async () => {
      const formData = new FormData();
      formData.append("name", "John Doe");
      formData.append("username", "johndoe");
      formData.append("email", "john@example.com");
      formData.append("password", "123456");
      formData.append("role", "employee");

      // Mock username check empty, mock email check returning existing user
      mockSelect
        .mockResolvedValueOnce([]) // username lookup
        .mockResolvedValueOnce([{ id: "existing-id", email: "john@example.com" }]); // email lookup

      const result = await createEmployeeAction(null, formData);
      expect(result).toEqual({ error: "Email address is already taken" });
    });

    it("should successfully create employee, revalidate path and return success", async () => {
      const formData = new FormData();
      formData.append("name", "John Doe");
      formData.append("username", "johndoe");
      formData.append("email", "john@example.com");
      formData.append("password", "123456");
      formData.append("role", "employee");

      // Both username and email lookup return empty list
      mockSelect
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      
      mockInsert.mockResolvedValueOnce({ id: "new-id" });

      const result = await createEmployeeAction(null, formData);

      expect(mockInsert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/employees");
      expect(result).toEqual({ success: true });
    });
  });

  describe("updateEmployeeAction", () => {
    it("should return error if required fields are missing", async () => {
      const formData = new FormData();
      formData.append("id", "user-id");
      // missing name, username, email, role

      const result = await updateEmployeeAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });
    });

    it("should return error if username is taken by another user", async () => {
      const formData = new FormData();
      formData.append("id", "user-id");
      formData.append("name", "John Doe");
      formData.append("username", "johndoe");
      formData.append("email", "john@example.com");
      formData.append("role", "employee");

      // Mock select username check returning user with different ID
      mockSelect.mockResolvedValueOnce([{ id: "other-id", username: "johndoe" }]);

      const result = await updateEmployeeAction(null, formData);
      expect(result).toEqual({ error: "Username is already taken" });
    });

    it("should successfully update and redirect to backoffice", async () => {
      const formData = new FormData();
      formData.append("id", "user-id");
      formData.append("name", "John Doe");
      formData.append("username", "johndoe");
      formData.append("email", "john@example.com");
      formData.append("role", "employee");

      // Both lookups return empty
      mockSelect
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      await expect(updateEmployeeAction(null, formData)).rejects.toThrow("NEXT_REDIRECT");
      
      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/employees");
      expect(redirect).toHaveBeenCalledWith("/backoffice/employees");
    });
  });

  describe("changeEmployeePasswordAction", () => {
    it("should return error if passwords do not match", async () => {
      const formData = new FormData();
      formData.append("id", "user-id");
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "differentpassword");

      const result = await changeEmployeePasswordAction(null, formData);
      expect(result).toEqual({ error: "Passwords do not match" });
    });

    it("should return error if password is less than 6 characters", async () => {
      const formData = new FormData();
      formData.append("id", "user-id");
      formData.append("password", "12345");
      formData.append("confirmPassword", "12345");

      const result = await changeEmployeePasswordAction(null, formData);
      expect(result).toEqual({ error: "Password must be at least 6 characters" });
    });

    it("should update password and redirect to backoffice", async () => {
      const formData = new FormData();
      formData.append("id", "user-id");
      formData.append("password", "validpassword");
      formData.append("confirmPassword", "validpassword");

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      await expect(changeEmployeePasswordAction(null, formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/employees");
      expect(redirect).toHaveBeenCalledWith("/backoffice/employees");
    });
  });

  describe("deleteEmployeeAction", () => {
    it("should block deleting employee with username 'admin'", async () => {
      const formData = new FormData();
      formData.append("id", "admin-id");

      // Mock user select returning username 'admin'
      mockSelect.mockResolvedValueOnce([{ username: "admin" }]);

      const result = await deleteEmployeeAction(null, formData);
      
      expect(mockSelect).toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
      expect(result).toEqual({ error: "The primary 'admin' account cannot be deleted." });
    });

    it("should allow deleting employee with other roles/usernames", async () => {
      const formData = new FormData();
      formData.append("id", "other-id");

      // Mock user select returning username 'otheradmin'
      mockSelect.mockResolvedValueOnce([{ username: "otheradmin" }]);
      mockDelete.mockResolvedValueOnce({ count: 1 });

      const result = await deleteEmployeeAction(null, formData);

      expect(mockSelect).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/backoffice/employees");
      expect(result).toEqual({ success: true });
    });
  });
});
