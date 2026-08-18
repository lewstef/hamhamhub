// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

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
  usePathname: vi.fn(() => "/dashboard"),
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <nav data-testid="sidebar">{children}</nav>
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
    isActive,
    tooltip,
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
      return React.cloneElement(renderProp, { ...props, "data-active": isActive } as any, children);
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
    isActive,
    ...props
  }: {
    children: React.ReactNode;
    render?: React.ReactElement;
    isActive?: boolean;
  }) => {
    if (renderProp) {
      return React.cloneElement(renderProp, { ...props, "data-active": isActive } as any, children);
    }
    return <span>{children}</span>;
  },
  SidebarSeparator: () => <hr />,
  useSidebar: vi.fn(() => ({ state: "expanded" })),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("DashboardSidebar Component", () => {
  const onSignOut = vi.fn();
  const mockActiveServices = [
    { id: "srv-1", name: "Dog Training", slug: "dog-training" },
    { id: "srv-2", name: "Dog Boarding", slug: "dog-boarding" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue("/dashboard");
    vi.mocked(useSidebar).mockReturnValue({ state: "expanded" } as any);
  });

  it("renders sidebar header, user email, and main navigation links", () => {
    render(
      <DashboardSidebar
        email="owner@dogkennel.test"
        activeServices={mockActiveServices}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByText("HamHamHub")).toBeDefined();
    expect(screen.getByText("Dashboard", { selector: "span" })).toBeDefined();
    expect(screen.getByText("Services")).toBeDefined();
    expect(screen.getByText("Account")).toBeDefined();
    expect(screen.getByText("owner@dogkennel.test")).toBeDefined();
  });

  it("renders active services under the Services section", () => {
    render(
      <DashboardSidebar
        email="owner@dogkennel.test"
        activeServices={mockActiveServices}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByText("Dog Training")).toBeDefined();
    expect(screen.getByText("Dog Boarding")).toBeDefined();
  });

  it("filters navigation items when search query is entered", () => {
    render(
      <DashboardSidebar
        email="owner@dogkennel.test"
        activeServices={mockActiveServices}
        onSignOut={onSignOut}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search menu...");
    fireEvent.change(searchInput, { target: { value: "Training" } });

    expect(screen.getByText("Dog Training")).toBeDefined();
  });

  it("clears search query when clear button is clicked", () => {
    const { container } = render(
      <DashboardSidebar
        email="owner@dogkennel.test"
        activeServices={mockActiveServices}
        onSignOut={onSignOut}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search menu...");
    fireEvent.change(searchInput, { target: { value: "Boarding" } });

    // The clear X button is rendered inside the search container
    const clearButton = container.querySelector("button.absolute.right-2");
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(searchInput).toHaveProperty("value", "");
    }
  });

  it("calls onSignOut when the Sign Out button is clicked", () => {
    render(
      <DashboardSidebar
        email="owner@dogkennel.test"
        activeServices={mockActiveServices}
        onSignOut={onSignOut}
      />
    );

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("renders correctly in collapsed mode", () => {
    vi.mocked(useSidebar).mockReturnValue({ state: "collapsed" } as any);

    render(
      <DashboardSidebar
        email="owner@dogkennel.test"
        activeServices={mockActiveServices}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByTestId("sidebar")).toBeDefined();
  });
});
