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

let mockSaveState: { success?: boolean; error?: string } | null = null;
let mockTestState: { success?: boolean; error?: string } | null = null;
const mockSaveAction = vi.fn();
const mockTestAction = vi.fn();

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: (action: unknown, initialState: unknown) => {
      if (action === updateSmtpConfigAction) {
        return [mockSaveState || initialState, mockSaveAction, false];
      }
      if (action === sendTestEmailAction) {
        return [mockTestState || initialState, mockTestAction, false];
      }
      return [initialState, vi.fn(), false];
    },
  };
});

describe("SmtpConfigForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveState = null;
    mockTestState = null;
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

    expect(mockTestAction).toHaveBeenCalled();
  });

  it("handles changing input fields and submitting main config form", () => {
    render(<SmtpConfigForm />);

    // Change Host
    fireEvent.change(screen.getByDisplayValue("smtp.gmail.com"), {
      target: { value: "smtp.mailgun.org" },
    });
    expect(screen.getByDisplayValue("smtp.mailgun.org")).toBeDefined();

    // Change Port
    fireEvent.change(screen.getByDisplayValue("587"), {
      target: { value: "465" },
    });
    expect(screen.getByDisplayValue("465")).toBeDefined();

    // Change Username
    fireEvent.change(screen.getByDisplayValue("notifications@hamhamhub.ro"), {
      target: { value: "new-user@hamhamhub.ro" },
    });
    expect(screen.getByDisplayValue("new-user@hamhamhub.ro")).toBeDefined();

    // Change Password
    const passwordInput = screen.getByPlaceholderText("••••••••••••");
    fireEvent.change(passwordInput, { target: { value: "Secret123!" } });
    expect(screen.getByDisplayValue("Secret123!")).toBeDefined();

    // Change Sender Name
    const senderNameInput = screen.getByPlaceholderText("e.g. HamHamHub System");
    fireEvent.change(senderNameInput, { target: { value: "HamHamHub Admin" } });
    expect(screen.getByDisplayValue("HamHamHub Admin")).toBeDefined();

    // Change Sender Email
    const senderEmailInput = screen.getByPlaceholderText("no-reply@hamhamhub.ro");
    fireEvent.change(senderEmailInput, { target: { value: "support@hamhamhub.ro" } });
    expect(screen.getByDisplayValue("support@hamhamhub.ro")).toBeDefined();

    // Submit form
    const saveBtn = screen.getByRole("button", { name: /Save Configuration/i });
    fireEvent.submit(saveBtn.closest("form")!);
    expect(mockSaveAction).toHaveBeenCalled();
  });

  it("renders with custom initial config and handles null passwords", () => {
    render(
      <SmtpConfigForm
        initialConfig={{
          smtpHost: "smtp.office365.com",
          smtpPort: "587",
          smtpSecurity: "STARTTLS",
          smtpUsername: "admin@office.com",
          senderName: "Office Bot",
          senderEmail: "bot@office.com",
        }}
      />
    );

    expect(screen.getByDisplayValue("smtp.office365.com")).toBeDefined();
    expect(screen.getByDisplayValue("Office Bot")).toBeDefined();
    expect(screen.getByDisplayValue("bot@office.com")).toBeDefined();
  });

  it("renders saveState error and success banners", () => {
    mockSaveState = { error: "Failed to connect to SMTP server." };
    const { rerender } = render(<SmtpConfigForm />);
    expect(screen.getByText("Failed to connect to SMTP server.")).toBeDefined();

    mockSaveState = { success: true };
    rerender(<SmtpConfigForm />);
    expect(screen.getByText("SMTP server configuration updated successfully!")).toBeDefined();
  });

  it("renders test email error and success banners inside modal", () => {
    mockTestState = { error: "Recipient mailbox unavailable." };
    const { rerender } = render(<SmtpConfigForm />);

    // Open modal
    fireEvent.click(screen.getByRole("button", { name: /Send Test Email/i }));
    // Submit test form
    const dispatchBtn = screen.getByRole("button", { name: /Dispatch Test Email/i });
    fireEvent.submit(dispatchBtn.closest("form")!);
    expect(screen.getByText("Recipient mailbox unavailable.")).toBeDefined();

    mockTestState = { success: true };
    rerender(<SmtpConfigForm />);
    fireEvent.submit(dispatchBtn.closest("form")!);
    expect(screen.getByText("Test email sent successfully! Transport connection verified.")).toBeDefined();
  });
});
