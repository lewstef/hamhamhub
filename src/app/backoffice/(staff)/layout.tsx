import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { BackofficeSidebar } from "@/components/backoffice-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/backoffice/login");
  }

  const role = session.user?.role;
  if (role !== "admin" && role !== "employee") {
    redirect("/dashboard");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <SidebarProvider>
      <BackofficeSidebar
        email={session.user?.email || session.user?.name}
        onSignOut={handleSignOut}
      />
      <SidebarInset>
        {/* Top bar with sidebar toggle and theme switcher */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Backoffice
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
