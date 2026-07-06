// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React, { useActionState } from "react";
import { LoginForm } from "./login-form";

vi.mock("@/app/actions/auth", () => ({
  loginAction: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn((_action: unknown, initialState: unknown) => [
      initialState,
      vi.fn(),
      false,
    ]),
  };
});

describe("LoginForm Component", () => {
  it("should render email/username and password inputs", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email or Username")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
  });

  it("should render the Sign In submit button in idle state", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
  });

  it("should include a hidden loginType input with value 'user'", () => {
    const { container } = render(<LoginForm />);
    const hidden = container.querySelector(
      'input[type="hidden"][name="loginType"]'
    ) as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden!.value).toBe("user");
  });

  it("should render the Sign Up link pointing to /signup", () => {
    render(<LoginForm />);
    const link = screen.getByRole("link", { name: "Sign Up" }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/signup");
  });

  it("should NOT render an error banner in the default state", () => {
    render(<LoginForm />);
    expect(screen.queryByText("Invalid username or password.")).toBeNull();
  });

  it("should render an error banner when state.error is set", () => {
    vi.mocked(useActionState).mockImplementationOnce(
      (_action: unknown, _init: unknown) => [
        { error: "Invalid username or password." },
        vi.fn(),
        false,
      ]
    );
    render(<LoginForm />);
    expect(screen.getByText("Invalid username or password.")).toBeDefined();
  });

  it("should show a loading spinner text when isPending is true", () => {
    vi.mocked(useActionState).mockImplementationOnce(
      (_action: unknown, _init: unknown) => [null, vi.fn(), true]
    );
    render(<LoginForm />);
    expect(screen.getByText("Signing in...")).toBeDefined();
    // "Sign In" text label should be replaced by the spinner span
    expect(screen.queryByRole("button", { name: "Sign In" })).toBeNull();
  });
});
