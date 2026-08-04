// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { SmtpConfigForm } from "./smtp-config-form";
import { updateSmtpConfigAction, sendTestEmailAction } from "@/app/actions/system";

vi.mock("@/app/actions/system", () => ({
  updateSmtpConfigAction: vi.fn(),
  sendTestEmailAction: vi.fn(),
}));

describe("SmtpConfigForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default inputs when no initialConfig is provided", () => {
    render(<SmtpConfigForm />);

    expect(screen.getByDisplayValue("smtp.gmail.com")).toBeDefined();
    expect(screen.getByDisplayValue("587")).toBeDefined();
    expect(screen.getByDisplayValue("notifications@hamhamhub.ro")).toBeDefined();
    expect(screen.getByDisplayValue("HamHamHub System")).toBeDefined();
    expect(screen.getByDisplayValue("no-reply@hamhamhub.ro")).toBeDefined();
  });

  it("renders with custom initialConfig values", () => {
    render(
      <SmtpConfigForm
        initialConfig={{
          smtpHost: "mail.mycompany.com",
          smtpPort: "465",
          smtpSecurity: "SSL",
          smtpUsername: "smtp@mycompany.com",
          senderName: "My Company Admin",
          senderEmail: "admin@mycompany.com",
        }}
      />
    );

    expect(screen.getByDisplayValue("mail.mycompany.com")).toBeDefined();
    expect(screen.getByDisplayValue("465")).toBeDefined();
    expect(screen.getByDisplayValue("smtp@mycompany.com")).toBeDefined();
    expect(screen.getByDisplayValue("My Company Admin")).toBeDefined();
    expect(screen.getByDisplayValue("admin@mycompany.com")).toBeDefined();
  });

  it("toggles password visibility when eye icon button is clicked", () => {
    render(<SmtpConfigForm />);

    const passwordInput = screen.getByPlaceholderText("••••••••••••") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByTitle("Show password");
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(screen.getByTitle("Hide password"));
    expect(passwordInput.type).toBe("password");
  });

  it("opens and closes the test email modal", () => {
    render(<SmtpConfigForm />);

    expect(screen.queryByText("Send Test Connection Email")).toBeNull();

    const openBtn = screen.getByRole("button", { name: /Send Test Email/i });
    fireEvent.click(openBtn);

    expect(screen.getByText("Send Test Connection Email")).toBeDefined();

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Send Test Connection Email")).toBeNull();
  });

  it("handles typing recipient email and dispatching test email form", () => {
    render(<SmtpConfigForm />);

    fireEvent.click(screen.getByRole("button", { name: /Send Test Email/i }));

    const recipientInput = screen.getByPlaceholderText("admin@hamhamhub.ro");
    fireEvent.change(recipientInput, { target: { value: "test@example.com" } });

    const dispatchBtn = screen.getByRole("button", { name: /Dispatch Test Email/i });
    fireEvent.click(dispatchBtn);

    expect(sendTestEmailAction).toHaveBeenCalled();
  });
});
