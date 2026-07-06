"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Users,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Search,
  X,
  Briefcase,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  email?: string | null;
  onSignOut: () => void;
}

interface NavItem {
  label: string;
  href: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ElementType;
  href?: string;
  items?: NavItem[];
}

const menuData: NavSection[] = [
  {
    id: "general",
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/backoffice",
  },
  {
    id: "user",
    title: "Users",
    icon: Users,
    items: [
      { label: "Employees", href: "/backoffice/employees" },
      { label: "Users", href: "/backoffice/users" },
      { label: "Organizations", href: "/backoffice/organizations" },
    ],
  },
  {
    id: "services",
    title: "Services",
    icon: Briefcase,
    items: [
      { label: "Manage Services", href: "/backoffice/services" },
      { label: "Service types", href: "/backoffice/services/types" },
    ],
  },
];

function TreeNavItem({
  section,
  pathname,
  isCollapsed,
  searchQuery,
}: {
  section: NavSection;
  pathname: string;
  isCollapsed: boolean;
  searchQuery: string;
}) {
  const hasChildren = !!section.items?.length;
  const isAnyChildActive = section.items?.some((item) =>
    pathname.startsWith(item.href)
  );

  const [open, setOpen] = useState(() => !!isAnyChildActive);

  const [prevIsAnyChildActive, setPrevIsAnyChildActive] = useState(isAnyChildActive);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  if (isAnyChildActive !== prevIsAnyChildActive) {
    setPrevIsAnyChildActive(isAnyChildActive);
    if (isAnyChildActive) {
      setOpen(true);
    }
  }

  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    if (searchQuery) {
      setOpen(true);
    }
  }

  const Icon = section.icon;

  // Leaf node (no children) — direct link
  if (!hasChildren && section.href) {
    const isActive = pathname === section.href;
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={section.href} />}
          isActive={isActive}
          tooltip={section.title}
        >
          <Icon />
          <span>{section.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Parent node — expandable
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => !isCollapsed && setOpen((prev) => !prev)}
        isActive={isAnyChildActive && !open}
        tooltip={section.title}
        className="select-none"
        aria-expanded={open}
      >
        <Icon />
        <span className="flex-1">{section.title}</span>
        {!isCollapsed && (
          <ChevronRight
            className={cn(
              "ml-auto size-3.5 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
              open && "rotate-90"
            )}
          />
        )}
      </SidebarMenuButton>

      {/* Animated sub-menu */}
      {!isCollapsed && (
        <div
          className={cn(
            "grid transition-all duration-200 ease-in-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <SidebarMenuSub>
              {section.items?.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuSubItem key={item.href}>
                    <SidebarMenuSubButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                    >
                      <span>{item.label}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </div>
        </div>
      )}
    </SidebarMenuItem>
  );
}

export function BackofficeSidebar({ email, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [searchQuery, setSearchQuery] = useState("");

  // SAP Hybris-style tree elements search filtering
  const filteredMenu = searchQuery
    ? menuData
        .map((section) => {
          const isSectionMatch = section.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const filteredItems = section.items?.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (isSectionMatch || (filteredItems && filteredItems.length > 0)) {
            return {
              ...section,
              // If parent matches, show all its items; otherwise, show only matching items
              items:
                filteredItems && filteredItems.length > 0
                  ? filteredItems
                  : isSectionMatch
                  ? section.items
                  : [],
            };
          }
          return null;
        })
        .filter(Boolean) as NavSection[]
    : menuData;

  return (
    <Sidebar collapsible="icon">
      {/* Header / Logo & Search */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3 flex flex-col gap-3">
        <div className="flex flex-col">
          <Link href="/backoffice" className="flex items-center gap-2.5 group">
            <span className="text-base font-extrabold tracking-tight text-sidebar-foreground group-hover:text-primary transition-colors truncate">
              HamHamHub
            </span>
          </Link>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest group-data-[collapsible=icon]:hidden">
            Backoffice
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sidebar-accent/50 text-sidebar-foreground text-xs rounded-md pl-8 pr-7 py-1.5 border border-sidebar-border focus:outline-none focus:border-sidebar-border focus:ring-1 focus:ring-sidebar-ring placeholder:text-muted-foreground/75 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 size-4 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-sidebar-foreground transition-colors"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* Tree Navigation */}
      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          {filteredMenu.map((section) => (
            <TreeNavItem
              key={section.id}
              section={section}
              pathname={pathname}
              isCollapsed={isCollapsed}
              searchQuery={searchQuery}
            />
          ))}
          {filteredMenu.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 group-data-[collapsible=icon]:hidden">
              No results found
            </p>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer — Session & Sign Out */}
      <SidebarFooter className="p-3 gap-2">
        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            Active Session
          </span>
          <span
            className="text-xs font-semibold text-sidebar-foreground truncate"
            title={email || "Staff"}
          >
            {email || "admin"}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onSignOut}
          className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center"
        >
          <LogOut className="size-3.5 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
