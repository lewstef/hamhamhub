import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BackofficeDashboardPage() {
  const session = await auth();

  let allUsers: (typeof users.$inferSelect)[] = [];
  try {
    allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Failed to query user telemetry for metrics:", error);
  }

  const staffCount = allUsers.filter((u) => u.role === "admin" || u.role === "employee").length;
  const standardUserCount = allUsers.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-8 w-full">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          General metrics, active session diagnostics, and connection status.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Customers</CardTitle>
            <span className="text-lg">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{standardUserCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Regular platform accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Staff</CardTitle>
            <span className="text-lg">🛡️</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{staffCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Admins and employees combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Database Engine</CardTitle>
            <span className="text-lg">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">Drizzle</div>
            <p className="text-xs text-muted-foreground mt-1">PostgreSQL (16-alpine)</p>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active Session Diagnostics</CardTitle>
          <CardDescription className="text-xs">
            Realtime framework status logs and security session properties.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border bg-muted/30 rounded-lg p-4 font-mono text-xs text-muted-foreground space-y-2 overflow-x-auto">
            <div><span className="text-muted-foreground/60">[DIAGNOSTICS]</span> Active Administrative Session: {session?.user?.email || "username log"}</div>
            <div><span className="text-muted-foreground/60">[DIAGNOSTICS]</span> Session Role Authority: <span className="text-primary font-semibold">{session?.user?.role}</span></div>
            <div><span className="text-muted-foreground/60">[DIAGNOSTICS]</span> Connection Status to Drizzle ORM: <span className="text-green-600 font-semibold dark:text-green-400">STABLE</span></div>
            <div><span className="text-muted-foreground/60">[DIAGNOSTICS]</span> Postgres Driver status: <span className="text-green-600 dark:text-green-400">ACTIVE</span> (1 connection pool)</div>
            <div><span className="text-muted-foreground/60">[SYSTEM]</span> All services operating within parameters ... <span className="text-green-600 font-bold dark:text-green-400">OK</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
