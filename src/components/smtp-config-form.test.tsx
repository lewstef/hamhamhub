// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SmtpConfigForm } from "./smtp-config-form";

vi.mock("@/app/actions/system", () => ({
  updateSmtpConfigAction: vi.fn(),
  sendTestEmailAction: vi.fn(),
}));

let mockSaveState: any = null;
let mockTestState: any = null;

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: (action: any, initialState: any) => {
      if (action.name === "updateSmtpConfigAction") {
        return [mockSaveState, vi.fn(), false];
      }
      return [mockTestState, vi.fn(), false];
    },
  };
});

describe("SmtpConfigForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveState = null;
    mockTestState = null;
  });

  it("should render default form inputs and header title", () => {
    render(<SmtpConfigForm />);

    expect(screen.getByText("SMTP Server Configuration")).toBeDefined();
    expect(screen.getByLabelText(/SMTP Host/i)).toBeDefined();
    expect(screen.getByLabelText(/Port/i)).toBeDefined();
    expect(screen.getByLabelText(/Encryption Protocol/i)).toBeDefined();
    expect(screen.getByLabelText(/Sender Display Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Sender Email Address/i)).toBeDefined();
  });

  it("should toggle password visibility when show/hide eye icon button is clicked", () => {
    render(<SmtpConfigForm />);

    const passwordInput = screen.getByLabelText(/SMTP Password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByTitle("Show password");
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    const hideBtn = screen.getByTitle("Hide password");
    fireEvent.click(hideBtn);
    expect(passwordInput.type).toBe("password");
  });

  it("should open and close the test email modal", () => {
    render(<SmtpConfigForm />);

    const testEmailBtn = screen.getByRole("button", { name: /Send Test Email/i });
    fireEvent.click(testEmailBtn);

    expect(screen.getByText("Send Test Connection Email")).toBeDefined();

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Send Test Connection Email")).toBeNull();
  });
});
