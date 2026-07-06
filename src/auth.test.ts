import { vi, describe, it, expect, beforeEach } from "vitest";

// Dummy database URL to satisfy drizzle setup
process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";

// ── Capture the authorize function ────────────────────────────────────────
// NextAuth wraps authorize inside Credentials(). We intercept the Credentials
// call to extract authorize so we can test it directly.

type AuthorizeFn = (credentials: Record<string, unknown>) => Promise<unknown>;
let capturedAuthorize: AuthorizeFn | null = null;

vi.mock("next-auth/providers/credentials", () => ({
  default: (config: { authorize: AuthorizeFn }) => {
    capturedAuthorize = config.authorize;
    return { type: "credentials", ...config };
  },
}));

vi.mock("next-auth", () => ({
  default: (config: unknown) => ({
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: {},
  }),
}));

vi.mock("./auth.config", () => ({
  authConfig: { pages: {}, callbacks: {} },
}));

// ── DB mock ───────────────────────────────────────────────────────────────
const mockSelect = vi.fn();

vi.mock("@/db", () => {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockImplementation(() => mockSelect()),
  };
  return { db: { select: vi.fn().mockReturnValue(chain) } };
});

// ── bcryptjs mock ─────────────────────────────────────────────────────────
const mockBcryptCompare = vi.fn();

vi.mock("bcryptjs", () => ({
  default: { compare: (...args: unknown[]) => mockBcryptCompare(...args) },
}));

// ── Import AFTER mocks are in place ───────────────────────────────────────
// The side-effect import triggers NextAuth() which calls Credentials(),
// which triggers our mock and populates capturedAuthorize.
await import("./auth");

// ── Helpers ───────────────────────────────────────────────────────────────
function makeUser(overrides: Partial<{
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  password: string;
  role: "user" | "employee" | "admin" | "organization";
}> = {}) {
  return {
    id: "user-id-1",
    name: "Test User",
    email: "test@example.com",
    username: "testuser",
    password: "hashed_password",
    role: "user" as const,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────
describe("auth.ts — Credentials authorize()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should capture the authorize function from Credentials provider", () => {
    expect(capturedAuthorize).not.toBeNull();
  });

  // ── Zod validation ───────────────────────────────────────────────────

  it("should return null when identifier is too short (< 3 chars)", async () => {
    const result = await capturedAuthorize!({ identifier: "ab", password: "password123" });
    expect(result).toBeNull();
  });

  it("should return null when password is too short (< 6 chars)", async () => {
    const result = await capturedAuthorize!({ identifier: "admin", password: "abc" });
    expect(result).toBeNull();
  });

  it("should return null when credentials are missing entirely", async () => {
    const result = await capturedAuthorize!({});
    expect(result).toBeNull();
  });

  // ── Email login (user / organization) ───────────────────────────────

  it("should return null when no user is found for email login", async () => {
    mockSelect.mockResolvedValueOnce([]); // empty result
    const result = await capturedAuthorize!({ identifier: "notfound@example.com", password: "password123" });
    expect(result).toBeNull();
  });

  it("should return null when email login is attempted by an employee", async () => {
    mockSelect.mockResolvedValueOnce([makeUser({ role: "employee", email: "emp@example.com" })]);
    const result = await capturedAuthorize!({ identifier: "emp@example.com", password: "password123" });
    expect(result).toBeNull();
  });

  it("should return null when email login is attempted by an admin", async () => {
    mockSelect.mockResolvedValueOnce([makeUser({ role: "admin", email: "admin@example.com" })]);
    const result = await capturedAuthorize!({ identifier: "admin@example.com", password: "password123" });
    expect(result).toBeNull();
  });

  it("should return null when email login succeeds but password does not match", async () => {
    mockSelect.mockResolvedValueOnce([makeUser({ role: "user" })]);
    mockBcryptCompare.mockResolvedValueOnce(false);
    const result = await capturedAuthorize!({ identifier: "test@example.com", password: "wrongpassword" });
    expect(result).toBeNull();
  });

  it("should return user object when email login succeeds for a 'user' role", async () => {
    const user = makeUser({ role: "user", email: "test@example.com" });
    mockSelect.mockResolvedValueOnce([user]);
    mockBcryptCompare.mockResolvedValueOnce(true);

    const result = await capturedAuthorize!({ identifier: "test@example.com", password: "correctpassword" });

    expect(result).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  });

  it("should return user object when email login succeeds for an 'organization' role", async () => {
    const user = makeUser({ role: "organization", email: "org@example.com" });
    mockSelect.mockResolvedValueOnce([user]);
    mockBcryptCompare.mockResolvedValueOnce(true);

    const result = await capturedAuthorize!({ identifier: "org@example.com", password: "correctpassword" });

    expect(result).toMatchObject({ role: "organization" });
  });

  // ── Username login (staff: employee / admin) ─────────────────────────

  it("should return null when no user is found for username login", async () => {
    mockSelect.mockResolvedValueOnce([]);
    const result = await capturedAuthorize!({ identifier: "unknownstaff", password: "password123" });
    expect(result).toBeNull();
  });

  it("should return null when a 'user' role account tries to log in via username", async () => {
    mockSelect.mockResolvedValueOnce([makeUser({ role: "user", username: "hammy_user" })]);
    const result = await capturedAuthorize!({ identifier: "hammy_user", password: "password123" });
    expect(result).toBeNull();
  });

  it("should return null when username login succeeds but password does not match", async () => {
    mockSelect.mockResolvedValueOnce([makeUser({ role: "admin", username: "adminuser" })]);
    mockBcryptCompare.mockResolvedValueOnce(false);
    const result = await capturedAuthorize!({ identifier: "adminuser", password: "wrongpassword" });
    expect(result).toBeNull();
  });

  it("should return user object when username login succeeds for an 'admin' role", async () => {
    const user = makeUser({ role: "admin", username: "adminuser", email: null });
    mockSelect.mockResolvedValueOnce([user]);
    mockBcryptCompare.mockResolvedValueOnce(true);

    const result = await capturedAuthorize!({ identifier: "adminuser", password: "correctpassword" });

    expect(result).toEqual({
      id: user.id,
      name: user.name,
      email: "",    // null email falls back to empty string
      role: "admin",
    });
  });

  it("should return user object when username login succeeds for an 'employee' role", async () => {
    const user = makeUser({ role: "employee", username: "emp_staff" });
    mockSelect.mockResolvedValueOnce([user]);
    mockBcryptCompare.mockResolvedValueOnce(true);

    const result = await capturedAuthorize!({ identifier: "emp_staff", password: "correctpassword" });

    expect(result).toMatchObject({ role: "employee" });
  });

  // ── Exception handling ────────────────────────────────────────────────

  it("should return null and not throw when the database throws", async () => {
    mockSelect.mockRejectedValueOnce(new Error("DB connection lost"));
    const result = await capturedAuthorize!({ identifier: "test@example.com", password: "password123" });
    expect(result).toBeNull();
  });
});
