import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  signUpAction,
  loginAction,
  updateUserThemeAction,
} from "./auth";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

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

describe("Core Auth Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signUpAction", () => {
    it("should return error if name or password is missing", async () => {
      const formData = new FormData();
      formData.append("name", "");
      formData.append("password", "123456");
      let result = await signUpAction(null, formData);
      expect(result).toEqual({ error: "Name and password are required" });

      formData.set("name", "John");
      formData.set("password", "");
      result = await signUpAction(null, formData);
      expect(result).toEqual({ error: "Name and password are required" });
    });

    it("should return error if password is less than 6 characters", async () => {
      const formData = new FormData();
      formData.append("name", "John");
      formData.append("password", "12345");
      const result = await signUpAction(null, formData);
      expect(result).toEqual({ error: "Password must be at least 6 characters" });
    });

    describe("Standard User Registration", () => {
      it("should return error if email is missing", async () => {
        const formData = new FormData();
        formData.append("name", "John");
        formData.append("password", "123456");
        formData.append("roleType", "user");

        const result = await signUpAction(null, formData);
        expect(result).toEqual({ error: "Email is required" });
      });

      it("should return error if email is already registered", async () => {
        const formData = new FormData();
        formData.append("name", "John");
        formData.append("password", "123456");
        formData.append("roleType", "user");
        formData.append("email", "john@example.com");

        mockSelect.mockResolvedValueOnce([{ id: "existing-id" }]);

        const result = await signUpAction(null, formData);
        expect(result).toEqual({ error: "Email is already registered" });
      });

      it("should successfully register standard user", async () => {
        const formData = new FormData();
        formData.append("name", "John");
        formData.append("password", "123456");
        formData.append("roleType", "user");
        formData.append("email", "john@example.com");

        mockSelect.mockResolvedValueOnce([]); // no existing email
        mockInsert.mockResolvedValueOnce({ id: "new-id" });

        const result = await signUpAction(null, formData);

        expect(mockInsert).toHaveBeenCalled();
        expect(result).toEqual({ success: true });
      });
    });



    it("should return error on database exception", async () => {
      const formData = new FormData();
      formData.append("name", "John");
      formData.append("password", "123456");
      formData.append("roleType", "user");
      formData.append("email", "john@example.com");

      mockSelect.mockRejectedValueOnce(new Error("Database connection lost"));

      const result = await signUpAction(null, formData);
      expect(result).toEqual({ error: "Something went wrong. Please try again." });
    });
  });

  describe("loginAction", () => {
    it("should return error if identifier or password is missing", async () => {
      const formData = new FormData();
      formData.append("identifier", "");
      formData.append("password", "123456");
      let result = await loginAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });

      formData.set("identifier", "john@example.com");
      formData.set("password", "");
      result = await loginAction(null, formData);
      expect(result).toEqual({ error: "All fields are required" });
    });

    it("should return error if loginType is user and identifier is not an email", async () => {
      const formData = new FormData();
      formData.append("identifier", "john_username");
      formData.append("password", "123456");
      formData.append("loginType", "user");
      const result = await loginAction(null, formData);
      expect(result).toEqual({ error: "Invalid email format." });
    });

    it("should return error if invalid credentials error in redirect URL", async () => {
      const formData = new FormData();
      formData.append("identifier", "john@example.com");
      formData.append("password", "wrongpass");
      formData.append("loginType", "user");

      vi.mocked(signIn).mockResolvedValueOnce("http://localhost/dashboard/login?error=CredentialsSignin");

      const result = await loginAction(null, formData);
      expect(signIn).toHaveBeenCalledWith("credentials", {
        identifier: "john@example.com",
        password: "wrongpass",
        redirectTo: "/dashboard",
        redirect: false,
      });
      expect(result).toEqual({ error: "Invalid credentials." });
    });

    it("should successfully redirect on correct credentials for user", async () => {
      const formData = new FormData();
      formData.append("identifier", "john@example.com");
      formData.append("password", "correctpass");
      formData.append("loginType", "user");

      vi.mocked(signIn).mockResolvedValueOnce("http://localhost/dashboard");

      await expect(loginAction(null, formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("should successfully redirect to backoffice for staff", async () => {
      const formData = new FormData();
      formData.append("identifier", "staffusername");
      formData.append("password", "correctpass");
      formData.append("loginType", "staff");

      vi.mocked(signIn).mockResolvedValueOnce("http://localhost/backoffice");

      await expect(loginAction(null, formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/backoffice");
    });

    it("should return error if sign-in throws other error", async () => {
      const formData = new FormData();
      formData.append("identifier", "john@example.com");
      formData.append("password", "correctpass");
      formData.append("loginType", "user");

      vi.mocked(signIn).mockRejectedValueOnce(new Error("Fatal connection issue"));

      const result = await loginAction(null, formData);
      expect(result).toEqual({ error: "Something went wrong during sign-in." });
    });
  });

  describe("updateUserThemeAction", () => {
    it("should return error if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null);

      const result = await updateUserThemeAction("dark");
      expect(result).toEqual({ error: "Not authenticated" });
    });

    it("should return error if theme is invalid", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "user-id", name: "John", email: "john@example.com", role: "user" },
        expires: "any",
      });

      const result = await updateUserThemeAction("invalid" as unknown as "light" | "dark");
      expect(result).toEqual({ error: "Invalid theme" });
    });

    it("should successfully update theme in database", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "user-id", name: "John", email: "john@example.com", role: "user" },
        expires: "any",
      });

      mockUpdate.mockResolvedValueOnce({ count: 1 });

      const result = await updateUserThemeAction("dark");

      expect(mockUpdate).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should return error on database update exception", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "user-id", name: "John", email: "john@example.com", role: "user" },
        expires: "any",
      });

      mockUpdate.mockRejectedValueOnce(new Error("Database error"));

      const result = await updateUserThemeAction("light");
      expect(result).toEqual({ error: "Failed to update theme" });
    });
  });
});
