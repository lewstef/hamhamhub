// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useActionState } from "react";
import { SignupForm } from "./signup-form";

vi.mock("@/app/actions/auth", () => ({
  signUpAction: vi.fn(),
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
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

describe("SignupForm Component", () => {
  it("should render standard user inputs and labels", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("Full Name")).toBeDefined();
    expect(screen.getByLabelText("Email Address")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
  });

  it("should not render Staff options or buttons", () => {
    render(<SignupForm />);
    expect(screen.queryByRole("button", { name: "User (Email)" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Staff (Username)" })).toBeNull();
    expect(screen.queryByLabelText("Username")).toBeNull();
    expect(screen.queryByLabelText("Role")).toBeNull();
  });

  it("should render Sign In link pointing to /dashboard/login", () => {
    render(<SignupForm />);
    const link = screen.getByRole("link", { name: "Sign In" }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/dashboard/login");
  });

  it("should render an error banner when state.error is set", () => {
    vi.mocked(useActionState).mockImplementationOnce(
      (_action: unknown, _init: unknown) => [
        { error: "Email already registered." },
        vi.fn(),
        false,
      ]
    );
    render(<SignupForm />);
    expect(screen.getByText("Email already registered.")).toBeDefined();
  });

  it("should render success message when state.success is true", () => {
    vi.mocked(useActionState).mockImplementationOnce(
      (_action: unknown, _init: unknown) => [{ success: true }, vi.fn(), false]
    );
    render(<SignupForm />);
    expect(
      screen.getByText("Registration successful! Redirecting to login...")
    ).toBeDefined();
  });

  it("should update the PasswordStrength indicator when password is typed", () => {
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.change(passwordInput, { target: { value: "MyStrongPass1!" } });

    // After typing, the input value should reflect what was typed
    expect((passwordInput as HTMLInputElement).value).toBe("MyStrongPass1!");
  });
});
