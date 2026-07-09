import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { users, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  if (pathname === "/dashboard/login") {
    return <>{children}</>;
  }

  const session = await auth();

  if (!session) {
    redirect("/dashboard/login");
  }

  const [org] = await db
    .select({
      organizationCategory: users.organizationCategory,
      enabledServices: users.enabledServices,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  let activeServices: { id: string; name: string }[] = [];
  if (org?.organizationCategory) {
    const dbServices = await db
      .select({
        id: services.id,
        name: services.name,
      })
      .from(services)
      .where(eq(services.organizationCategory, org.organizationCategory));

    const enabledIds = org.enabledServices
      ? org.enabledServices.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    activeServices = dbServices.filter((s) => enabledIds.includes(s.id));
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <SidebarProvider>
      <DashboardSidebar
        email={session.user?.email || session.user?.name}
        activeServices={activeServices}
        onSignOut={handleSignOut}
      />
      <SidebarInset>
        {/* Top bar with sidebar toggle and theme switcher */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
          </div>
        </header>
        {/* Main content */}
        <main className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
