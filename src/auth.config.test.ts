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
});
