import { describe, it, expect } from "vitest";
import { authConfig } from "./auth.config";
import { NextRequest } from "next/server";

describe("NextAuth Authorized Callback", () => {
  const authorized = authConfig.callbacks.authorized;

  const createRequest = (pathname: string) => {
    return {
      nextUrl: new URL(pathname, "http://localhost"),
    } as unknown as NextRequest;
  };

  const getRedirectLocation = (response: unknown): string | null => {
    if (response instanceof Response) {
      return response.headers.get("Location");
    }
    return null;
  };

  describe("Unauthenticated access (isLoggedIn = false)", () => {
    const auth = null;

    it("should allow accessing backoffice login page", () => {
      const result = authorized({ auth, request: createRequest("/backoffice/login") });
      expect(result).toBe(true);
    });

    it("should allow accessing dashboard login page", () => {
      const result = authorized({ auth, request: createRequest("/dashboard/login") });
      expect(result).toBe(true);
    });

    it("should allow accessing signup page", () => {
      const result = authorized({ auth, request: createRequest("/signup") });
      expect(result).toBe(true);
    });

    it("should redirect backoffice access to backoffice login page", () => {
      const result = authorized({ auth, request: createRequest("/backoffice") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice/login");
    });

    it("should redirect backoffice subpages access to backoffice login page", () => {
      const result = authorized({ auth, request: createRequest("/backoffice/organizations") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice/login");
    });

    it("should redirect dashboard access to dashboard login page", () => {
      const result = authorized({ auth, request: createRequest("/dashboard") });
      expect(getRedirectLocation(result)).toBe("http://localhost/dashboard/login");
    });

    it("should allow accessing home or general pages", () => {
      const result = authorized({ auth, request: createRequest("/") });
      expect(result).toBe(true);
    });
  });

  describe("Authenticated as a regular 'user'", () => {
    const auth = {
      user: { id: "user-id", role: "user" as const },
      expires: "any",
    };

    it("should redirect user from backoffice login page to user dashboard", () => {
      const result = authorized({ auth, request: createRequest("/backoffice/login") });
      expect(getRedirectLocation(result)).toBe("http://localhost/dashboard");
    });

    it("should redirect user from dashboard login page to user dashboard", () => {
      const result = authorized({ auth, request: createRequest("/dashboard/login") });
      expect(getRedirectLocation(result)).toBe("http://localhost/dashboard");
    });

    it("should redirect user from signup page to user dashboard", () => {
      const result = authorized({ auth, request: createRequest("/signup") });
      expect(getRedirectLocation(result)).toBe("http://localhost/dashboard");
    });

    it("should allow user to access dashboard page", () => {
      const result = authorized({ auth, request: createRequest("/dashboard") });
      expect(result).toBe(true);
    });

    it("should allow user to access dashboard subpages", () => {
      const result = authorized({ auth, request: createRequest("/dashboard/profile") });
      expect(result).toBe(true);
    });

    it("should redirect user from backoffice page to dashboard", () => {
      const result = authorized({ auth, request: createRequest("/backoffice") });
      expect(getRedirectLocation(result)).toBe("http://localhost/dashboard");
    });
  });

  describe("Authenticated as an 'organization'", () => {
    const auth = {
      user: { id: "org-id", role: "organization" as const },
      expires: "any",
    };

    it("should allow organization to access dashboard page", () => {
      const result = authorized({ auth, request: createRequest("/dashboard") });
      expect(result).toBe(true);
    });

    it("should redirect organization from backoffice page to backoffice login", () => {
      const result = authorized({ auth, request: createRequest("/backoffice") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice/login");
    });
  });

  describe("Authenticated as 'admin'", () => {
    const auth = {
      user: { id: "admin-id", role: "admin" as const },
      expires: "any",
    };

    it("should redirect admin from backoffice login page to backoffice page", () => {
      const result = authorized({ auth, request: createRequest("/backoffice/login") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice");
    });

    it("should redirect admin from dashboard login page to backoffice page", () => {
      const result = authorized({ auth, request: createRequest("/dashboard/login") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice");
    });

    it("should redirect admin from signup page to backoffice page", () => {
      const result = authorized({ auth, request: createRequest("/signup") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice");
    });

    it("should allow admin to access backoffice pages", () => {
      const result = authorized({ auth, request: createRequest("/backoffice") });
      expect(result).toBe(true);
    });

    it("should redirect admin from user dashboard pages to backoffice", () => {
      const result = authorized({ auth, request: createRequest("/dashboard") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice");
    });
  });

  describe("Authenticated as 'employee'", () => {
    const auth = {
      user: { id: "emp-id", role: "employee" as const },
      expires: "any",
    };

    it("should allow employee to access backoffice page", () => {
      const result = authorized({ auth, request: createRequest("/backoffice") });
      expect(result).toBe(true);
    });

    it("should redirect employee from user dashboard pages to backoffice", () => {
      const result = authorized({ auth, request: createRequest("/dashboard") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice");
    });
  });

  describe("Additional edge cases", () => {
    it("should redirect organization from backoffice login page to dashboard", () => {
      const auth = {
        user: { id: "org-id", role: "organization" as const },
        expires: "any",
      };
      const result = authorized({ auth, request: createRequest("/backoffice/login") });
      expect(getRedirectLocation(result)).toBe("http://localhost/dashboard");
    });

    it("should redirect organization from dashboard login page to dashboard", () => {
      const auth = {
        user: { id: "org-id", role: "organization" as const },
        expires: "any",
      };
      const result = authorized({ auth, request: createRequest("/dashboard/login") });
      expect(getRedirectLocation(result)).toBe("http://localhost/dashboard");
    });

    it("should redirect organization from signup page to dashboard", () => {
      const auth = {
        user: { id: "org-id", role: "organization" as const },
        expires: "any",
      };
      const result = authorized({ auth, request: createRequest("/signup") });
      expect(getRedirectLocation(result)).toBe("http://localhost/dashboard");
    });

    it("should redirect employee from backoffice login page to backoffice", () => {
      const auth = {
        user: { id: "emp-id", role: "employee" as const },
        expires: "any",
      };
      const result = authorized({ auth, request: createRequest("/backoffice/login") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice");
    });

    it("should redirect employee from dashboard login page to backoffice", () => {
      const auth = {
        user: { id: "emp-id", role: "employee" as const },
        expires: "any",
      };
      const result = authorized({ auth, request: createRequest("/dashboard/login") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice");
    });

    it("should redirect admin from dashboard subpage to backoffice", () => {
      const auth = {
        user: { id: "admin-id", role: "admin" as const },
        expires: "any",
      };
      const result = authorized({ auth, request: createRequest("/dashboard/account") });
      expect(getRedirectLocation(result)).toBe("http://localhost/backoffice");
    });

    it("should allow employee access to backoffice subpages", () => {
      const auth = {
        user: { id: "emp-id", role: "employee" as const },
        expires: "any",
      };
      const result = authorized({ auth, request: createRequest("/backoffice/organizations") });
      expect(result).toBe(true);
    });
  });
});

describe("NextAuth jwt and session Callbacks", () => {
  const jwt = authConfig.callbacks.jwt;
  const session = authConfig.callbacks.session;

  describe("jwt callback", () => {
    it("should augment token with id and role when user object is present", async () => {
      const token = {};
      const user = { id: "user-123", role: "admin" as const };
      const result = await jwt({ token, user } as any);
      expect(result.id).toBe("user-123");
      expect(result.role).toBe("admin");
    });

    it("should return token unchanged when no user is provided", async () => {
      const token = { id: "existing-id", role: "organization" as const };
      const result = await jwt({ token } as any);
      expect(result.id).toBe("existing-id");
      expect(result.role).toBe("organization");
    });

    it("should not override existing token fields when user is undefined", async () => {
      const token = { id: "persisted-id", role: "employee" as const, name: "Test" };
      const result = await jwt({ token, user: undefined } as any);
      expect(result.id).toBe("persisted-id");
      expect(result.role).toBe("employee");
    });
  });

  describe("session callback", () => {
    it("should map token.id to session.user.id when token has id", async () => {
      const token = { id: "tok-id-123", role: "organization" as const };
      const sess: any = { user: { name: "Org" }, expires: "any" };
      const result = await session({ session: sess, token } as any);
      expect(result.user.id).toBe("tok-id-123");
      expect(result.user.role).toBe("organization");
    });

    it("should not set session.user.id when token.id is absent", async () => {
      const token = {};
      const sess: any = { user: { name: "Anonymous" }, expires: "any" };
      const result = await session({ session: sess, token } as any);
      expect(result.user.id).toBeUndefined();
      expect(result.user.role).toBeUndefined();
    });

    it("should set session.user.role from token.role for all role types", async () => {
      for (const role of ["user", "employee", "admin", "organization"] as const) {
        const token = { id: "some-id", role };
        const sess: any = { user: {}, expires: "any" };
        const result = await session({ session: sess, token } as any);
        expect(result.user.role).toBe(role);
      }
    });
  });
});

