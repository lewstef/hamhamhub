import { vi, describe, it, expect, beforeEach } from "vitest";
import { createAdminAction } from "./initialization";
import { revalidatePath } from "next/cache";

// Dummy database URL to satisfy drizzle setup
process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";

// Declare mocks that we can control in tests
const mockSelect = vi.fn();
const mockInsert = vi.fn();

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
  };

  return { db };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async (val: string) => `hashed_${val}`),
  },
}));

describe("Initialization Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if password fields are missing", async () => {
    const formData = new FormData();
    formData.append("password", "");
    formData.append("confirmPassword", "123456");
    let result = await createAdminAction(null, formData);
    expect(result).toEqual({ error: "All password fields are required" });

    formData.set("password", "123456");
    formData.set("confirmPassword", "");
    result = await createAdminAction(null, formData);
    expect(result).toEqual({ error: "All password fields are required" });
  });

  it("should return error if password is less than 6 characters", async () => {
    const formData = new FormData();
    formData.append("password", "12345");
    formData.append("confirmPassword", "12345");

    const result = await createAdminAction(null, formData);
    expect(result).toEqual({ error: "Password must be at least 6 characters" });
  });

  it("should return error if passwords do not match", async () => {
    const formData = new FormData();
    formData.append("password", "123456");
    formData.append("confirmPassword", "654321");

    const result = await createAdminAction(null, formData);
    expect(result).toEqual({ error: "Passwords do not match" });
  });

  it("should return error if an admin already exists", async () => {
    const formData = new FormData();
    formData.append("password", "123456");
    formData.append("confirmPassword", "123456");

    // Mock admin lookup returning existing admin
    mockSelect.mockResolvedValueOnce([{ id: "existing-admin-id" }]);

    const result = await createAdminAction(null, formData);
    expect(result).toEqual({ error: "Platform has already been initialized." });
  });

  it("should successfully hash password, insert admin user, and return success", async () => {
    const formData = new FormData();
    formData.append("password", "new-secure-password");
    formData.append("confirmPassword", "new-secure-password");

    mockSelect.mockResolvedValueOnce([]); // no existing admin
    mockInsert.mockResolvedValueOnce({ id: "new-admin-id" });

    const result = await createAdminAction(null, formData);

    expect(mockInsert).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(result).toEqual({ success: true });
  });

  it("should return error on database exception", async () => {
    const formData = new FormData();
    formData.append("password", "123456");
    formData.append("confirmPassword", "123456");

    mockSelect.mockRejectedValueOnce(new Error("Database offline"));

    const result = await createAdminAction(null, formData);
    expect(result).toEqual({ error: "Something went wrong. Please try again." });
  });
});
