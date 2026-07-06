// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BackofficeSidebar } from "./backoffice-sidebar";

// ── External dependencies ──────────────────────────────────────────────────

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
  usePathname: vi.fn(() => "/backoffice"),
}));

// Stub the Sidebar context hook used inside the component
vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <nav>{children}</nav>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarHeader: ({ children, ...props }: { children: React.ReactNode; className?: string }) => (
    <header {...props}>{children}</header>
  ),
  SidebarFooter: ({ children, ...props }: { children: React.ReactNode; className?: string }) => (
    <footer {...props}>{children}</footer>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuButton: ({
    children,
    onClick,
    render: renderProp,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    render?: React.ReactElement;
    isActive?: boolean;
    tooltip?: string;
    className?: string;
    "aria-expanded"?: boolean;
  }) => {
    if (renderProp) {
      return React.cloneElement(renderProp, props, children);
    }
    return <button onClick={onClick}>{children}</button>;
  },
  SidebarMenuSub: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuSubItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuSubButton: ({
    children,
    render: renderProp,
    ...props
  }: {
    children: React.ReactNode;
    render?: React.ReactElement;
    isActive?: boolean;
  }) => {
    if (renderProp) {
      return React.cloneElement(renderProp, props, children);
    }
    return <span>{children}</span>;
  },
  SidebarSeparator: () => <hr />,
  useSidebar: vi.fn(() => ({ state: "expanded" })),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// ── Helper ─────────────────────────────────────────────────────────────────

function renderSidebar(email = "admin@test.com") {
  return render(
    <BackofficeSidebar email={email} onSignOut={vi.fn()} />
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("BackofficeSidebar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all top-level section titles without a search query", () => {
    renderSidebar();
    expect(screen.getByText("Dashboard")).toBeDefined();
    // "Users" appears as both a section title and a child nav item
    expect(screen.getAllByText("Users").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Services")).toBeDefined();
  });

  it("should render child items when sections are expanded (expanded sidebar)", () => {
    renderSidebar();
    expect(screen.getByText("Employees")).toBeDefined();
    expect(screen.getByText("Organizations")).toBeDefined();
    expect(screen.getByText("Manage Services")).toBeDefined();
    expect(screen.getByText("Service types")).toBeDefined();
  });

  it("should filter sections by section title (case-insensitive)", () => {
    renderSidebar();

    const searchInput = screen.getByPlaceholderText("Search menu...");
    fireEvent.change(searchInput, { target: { value: "services" } });

    // The "Services" section should remain
    expect(screen.getByText("Services")).toBeDefined();

    // The "Users" section (which doesn't match) should be removed
    expect(screen.queryByText("Users")).toBeNull();
    // Dashboard link-section should be removed
    expect(screen.queryByText("Dashboard")).toBeNull();
  });

  it("should filter sections by a child item label", () => {
    renderSidebar();

    const searchInput = screen.getByPlaceholderText("Search menu...");
    fireEvent.change(searchInput, { target: { value: "Employees" } });

    // Parent "Users" section should be visible (because "Employees" is its child)
    expect(screen.getByText("Users")).toBeDefined();
    // Non-matching sections should be gone
    expect(screen.queryByText("Dashboard")).toBeNull();
    expect(screen.queryByText("Services")).toBeNull();

    // "Employees" child item should be present
    expect(screen.getByText("Employees")).toBeDefined();
    // "Organizations" child item should be filtered out (doesn't match)
    expect(screen.queryByText("Organizations")).toBeNull();
  });

  it("should show 'No results found' when query matches nothing", () => {
    renderSidebar();

    const searchInput = screen.getByPlaceholderText("Search menu...");
    fireEvent.change(searchInput, { target: { value: "zzz_no_match_zzz" } });

    expect(screen.getByText("No results found")).toBeDefined();
    expect(screen.queryByText("Dashboard")).toBeNull();
    expect(screen.queryByText("Users")).toBeNull();
  });

  it("should clear the search and restore full menu when X button is clicked", () => {
    renderSidebar();

    const searchInput = screen.getByPlaceholderText("Search menu...");
    fireEvent.change(searchInput, { target: { value: "employees" } });

    // Only "Users" section visible — "Dashboard" and "Services" should be gone
    expect(screen.queryByText("Dashboard")).toBeNull();
    expect(screen.queryByText("Services")).toBeNull();

    // Click the clear (X) button — it's rendered as an unlabelled button
    // Get all buttons and find the one that is NOT a section toggle and NOT "Sign Out"
    const allButtons = screen.getAllByRole("button");
    // The X button is the only button rendered inside the search bar area; it is
    // a type="button" with no aria-label. We identify it by position (it appears
    // after the search input in DOM order, before the menu items).
    const clearButton = allButtons.find(
      (btn) =>
        btn.closest("header") !== null &&
        btn.getAttribute("type") !== "submit"
    );
    expect(clearButton).toBeDefined();
    fireEvent.click(clearButton!);

    // All sections restored
    expect(screen.getByText("Dashboard")).toBeDefined();
    // "Users" appears as section title AND child item — use getAllByText
    expect(screen.getAllByText("Users").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Services")).toBeDefined();
  });

  it("should display the provided email in the footer", () => {
    renderSidebar("hammy@hamhamhub.com");
    expect(screen.getByText("hammy@hamhamhub.com")).toBeDefined();
  });

  it("should fall back to 'admin' in the footer when no email is provided", () => {
    render(<BackofficeSidebar onSignOut={vi.fn()} />);
    expect(screen.getByText("admin")).toBeDefined();
  });

  it("should call onSignOut when the Sign Out button is clicked", () => {
    const onSignOut = vi.fn();
    render(<BackofficeSidebar email="a@b.com" onSignOut={onSignOut} />);

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
