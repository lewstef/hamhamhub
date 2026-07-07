import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard - HamHamHub",
  description: "User dashboard panel.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/dashboard/login");
  }

  // Active hamsters telemetry data list
  const hamsters = [
    { name: "Biscuit", activity: "Running on Wheel", metric: "48 RPM", temp: "37.1°C", status: "active" },
    { name: "Cinnamon", activity: "Eating at Feeder", metric: "Feeder #2", temp: "36.8°C", status: "active" },
    { name: "Peanut", activity: "Sleeping in Nest", metric: "Quiet", temp: "37.5°C", status: "sleep" },
    { name: "Cocoa", activity: "Exploring Tube Grid", metric: "Level 3", temp: "36.9°C", status: "idle" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          Welcome, {session.user?.name || "User"}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor cage configurations, feed dispensers, and wheel speeds in real time.
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1 */}
        <Card className="transition-all duration-300 hover:scale-[1.01] hover:shadow-md border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hamsters Monitored</CardTitle>
            <span className="text-lg">🐹</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">4 Active</div>
            <p className="text-xs text-muted-foreground mt-1">All cages synced</p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="transition-all duration-300 hover:scale-[1.01] hover:shadow-md border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Running Wheel Speed</CardTitle>
            <span className="text-lg text-orange-500">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">4,200 RPM</div>
            <p className="text-xs text-muted-foreground mt-1">Telemetry peaks at 9:00 PM</p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="transition-all duration-300 hover:scale-[1.01] hover:shadow-md border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Feed Dispenser Status</CardTitle>
            <span className="text-lg">🥣</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">94% Optimal</div>
            <p className="text-xs text-muted-foreground mt-1">Refill estimate: 3 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Telemetry Stream */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Active Telemetry Stream</CardTitle>
          <CardDescription>
            Live updates direct from connected sensors and activity feeds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full border border-border rounded-lg">
            <table className="w-full text-sm text-left text-foreground">
              <thead className="text-xs uppercase bg-muted border-b border-border text-muted-foreground font-bold">
                <tr>
                  <th scope="col" className="px-6 py-2.5">Hamster</th>
                  <th scope="col" className="px-6 py-2.5">Current Activity</th>
                  <th scope="col" className="px-6 py-2.5">Metric / Location</th>
                  <th scope="col" className="px-6 py-2.5">Temp</th>
                  <th scope="col" className="px-6 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hamsters.map((h, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                      <span className="text-base">🐹</span> {h.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{h.activity}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{h.metric}</td>
                    <td className="px-6 py-4 text-muted-foreground">{h.temp}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          h.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : h.status === "sleep"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${
                          h.status === "active"
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : h.status === "sleep"
                            ? "bg-blue-500 dark:bg-blue-400"
                            : "bg-amber-500 dark:bg-amber-400"
                        }`} />
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostics Card */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>System Telemetry & Diagnostics</CardTitle>
          <CardDescription>
            Session credentials and database connectivity logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-border bg-muted/30 rounded-lg p-4 font-mono text-xs text-muted-foreground space-y-2 overflow-x-auto">
            <div>[SYSTEM INFO] Bootstrapped Next.js Framework ... OK</div>
            <div>[DATABASE] Drizzle ORM connecting to Docker ... OK</div>
            <div>[AUTH] Active session token generated for: {session.user?.email}</div>
            <div>[AUTH] Authentication Strategy: Credentials (JWT)</div>
            <div>[STYLES] Tailwind CSS v4 Engine ... OK</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
