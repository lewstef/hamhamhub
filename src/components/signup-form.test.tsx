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
  it("should render the User (Email) tab as active by default", () => {
    render(<SignupForm />);
    expect(screen.getByRole("button", { name: "User (Email)" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Staff (Username)" })).toBeDefined();
  });

  it("should show email input and hide username input on User tab", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("Email Address")).toBeDefined();
    expect(screen.queryByLabelText("Username")).toBeNull();
  });

  it("should show username + role inputs and hide email when switching to Staff tab", () => {
    render(<SignupForm />);
    fireEvent.click(screen.getByRole("button", { name: "Staff (Username)" }));

    expect(screen.getByLabelText("Username")).toBeDefined();
    expect(screen.getByLabelText("Role")).toBeDefined();
    expect(screen.queryByLabelText("Email Address")).toBeNull();
  });

  it("should switch back to email input after clicking User tab again", () => {
    render(<SignupForm />);
    fireEvent.click(screen.getByRole("button", { name: "Staff (Username)" }));
    fireEvent.click(screen.getByRole("button", { name: "User (Email)" }));

    expect(screen.getByLabelText("Email Address")).toBeDefined();
    expect(screen.queryByLabelText("Username")).toBeNull();
  });

  it("should render Sign In link pointing to /dashboard/login when on User tab", () => {
    render(<SignupForm />);
    const link = screen.getByRole("link", { name: "Sign In" }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/dashboard/login");
  });

  it("should render Sign In link pointing to /backoffice/login when on Staff tab", () => {
    render(<SignupForm />);
    fireEvent.click(screen.getByRole("button", { name: "Staff (Username)" }));
    const link = screen.getByRole("link", { name: "Sign In" }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/backoffice/login");
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
});
