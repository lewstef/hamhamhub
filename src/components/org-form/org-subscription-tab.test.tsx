// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { OrgSubscriptionTab } from "./org-subscription-tab";

describe("OrgSubscriptionTab Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active subscription overview and plan cards", () => {
    render(<OrgSubscriptionTab />);

    expect(screen.getByText("Professional Tier")).toBeDefined();
    expect(screen.getByText("Active Subscription")).toBeDefined();
    expect(screen.getByText("Starter")).toBeDefined();
    expect(screen.getByText("Professional")).toBeDefined();
    expect(screen.getByText("Kennel & School Enterprise")).toBeDefined();
  });

  it("switches billing cycle between monthly and annual discounts", () => {
    render(<OrgSubscriptionTab />);

    const annualBtn = screen.getByRole("button", { name: /annual billing/i });
    fireEvent.click(annualBtn);

    expect(screen.getAllByText("1,490 RON / yr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2,990 RON / yr").length).toBeGreaterThan(0);

    const monthlyBtn = screen.getByRole("button", { name: /monthly billing/i });
    fireEvent.click(monthlyBtn);

    expect(screen.getAllByText("149 RON / mo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("299 RON / mo").length).toBeGreaterThan(0);
  });

  it("opens confirmation modal when user selects a different plan tier and updates plan on confirmation", async () => {
    render(<OrgSubscriptionTab />);

    const switchBtn = screen.getByRole("button", { name: /switch to starter/i });
    fireEvent.click(switchBtn);

    expect(screen.getByText("Confirm Plan Change")).toBeDefined();

    const confirmBtn = screen.getByRole("button", { name: /confirm & update plan/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/successfully switched to the starter plan/i)).toBeDefined();
    }, { timeout: 1500 });
  });

  it("renders billing invoice history table", () => {
    render(<OrgSubscriptionTab />);

    expect(screen.getByText("Billing History & Invoices")).toBeDefined();
    expect(screen.getByText("HHH-2026-0042")).toBeDefined();
    expect(screen.getByText("15 Jul 2026")).toBeDefined();
  });
});
