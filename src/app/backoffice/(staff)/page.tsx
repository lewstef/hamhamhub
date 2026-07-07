import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, TrendingUp, CreditCard, AlertTriangle } from "lucide-react";

export default async function BackofficeDashboardPage() {
  const session = await auth();

  let allUsers: (typeof users.$inferSelect)[] = [];
  try {
    allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Failed to query user telemetry for metrics:", error);
  }

  const organizationCount = allUsers.filter((u) => u.role === "organization").length;

  // Fake subscription metrics for demonstration as requested
  const newSubscriptions24h = 12;
  const totalSubscriptionsCount = 34;
  const expiringSubscriptions7d = 3;

  return (
    <div className="space-y-8 w-full">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Backoffice Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform telemetry summary, active organizations, and subscription metrics.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Organizations */}
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Organizations</CardTitle>
            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
              <Building className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-foreground">{organizationCount}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Registered business accounts</p>
          </CardContent>
        </Card>

        {/* Card 2: New Subscriptions in 24h */}
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Subscriptions (24h)</CardTitle>
            <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-foreground">{newSubscriptions24h}</div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                +15%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Activated licenses in last 24h</p>
          </CardContent>
        </Card>

        {/* Card 3: Total Subscriptions */}
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Subscriptions</CardTitle>
            <div className="p-1.5 bg-indigo-500/10 rounded-md text-indigo-600 dark:text-indigo-400">
              <CreditCard className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-foreground">{totalSubscriptionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Active paid platform tiers</p>
          </CardContent>
        </Card>

        {/* Card 4: Expiring Subscriptions in 7 days */}
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expiring (7 days)</CardTitle>
            <div className="p-1.5 bg-amber-500/10 rounded-md text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-foreground">{expiringSubscriptions7d}</div>
              {expiringSubscriptions7d > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Action required
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Renewal processing pending</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
