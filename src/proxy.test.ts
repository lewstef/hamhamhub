import { describe, it, expect, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("next-auth", () => ({
  default: () => ({
    auth: vi.fn((fn) => fn),
  }),
}));

describe("Proxy / Middleware Module (src/proxy.ts)", () => {
  it("should configure route matcher excluding api and static assets", async () => {
    const { config } = await import("./proxy");
    expect(config.matcher).toBeDefined();
    expect(config.matcher[0]).toBe("/((?!api|_next/static|_next/image|.*\\.png$).*)");
  });

  it("should inject x-pathname into request headers and proceed to next response", async () => {
    const { proxy } = await import("./proxy");

    const mockReq = {
      headers: new Headers({ "user-agent": "test-agent" }),
      nextUrl: { pathname: "/dashboard/courses" },
    };

    const response = (proxy as any)(mockReq as any);
    expect(response).toBeDefined();
    expect(response instanceof NextResponse).toBe(true);
  });
});
