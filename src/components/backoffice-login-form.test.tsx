// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useActionState } from "react";
import { BackofficeLoginForm } from "./backoffice-login-form";

vi.mock("@/app/actions/auth", () => ({
  loginAction: vi.fn(),
}));

// Shim useActionState — returns [state, action, isPending]
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

describe("BackofficeLoginForm Component", () => {
  it("should render identifier and password inputs plus a Sign In button", () => {
    render(<BackofficeLoginForm />);

    expect(screen.getByLabelText("Username")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
  });

  it("should include a hidden loginType input with value 'staff'", () => {
    const { container } = render(<BackofficeLoginForm />);
    const hidden = container.querySelector(
      'input[type="hidden"][name="loginType"]'
    ) as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden!.value).toBe("staff");
  });

  it("should toggle password visibility when Eye/EyeOff button is clicked", () => {
    render(<BackofficeLoginForm />);

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    // The toggle is a type="button" inside the password wrapper row
    const toggleButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.getAttribute("type") === "button");
    expect(toggleButtons.length).toBeGreaterThan(0);
    fireEvent.click(toggleButtons[0]);

    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe("password");
  });

  it("should NOT render an error banner in idle state", () => {
    render(<BackofficeLoginForm />);
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
    render(<BackofficeLoginForm />);
    expect(screen.getByText("Invalid username or password.")).toBeDefined();
  });

  it("should disable all inputs and the submit button while isPending is true", () => {
    vi.mocked(useActionState).mockImplementationOnce(
      (_action: unknown, _init: unknown) => [null, vi.fn(), true]
    );

    render(<BackofficeLoginForm />);

    const identifier = screen.getByLabelText("Username") as HTMLInputElement;
    const password = screen.getByLabelText("Password") as HTMLInputElement;
    // While isPending, the button renders a spinner span rather than "Sign In"
    const submitBtn = screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("type") === "submit") as HTMLButtonElement;

    expect(identifier.disabled).toBe(true);
    expect(password.disabled).toBe(true);
    expect(submitBtn.disabled).toBe(true);
  });
});
