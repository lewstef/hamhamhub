import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
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
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/5 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-500/5 via-zinc-950 to-zinc-950 pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Navigation */}
      <header className="z-10 border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            HamHamHub
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400 hidden sm:inline">
            Logged in as <span className="text-zinc-200 font-medium">{session.user?.email}</span>
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900/80 hover:text-zinc-100 px-3 py-1.5 rounded-lg"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 flex-1 p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            Welcome, {session.user?.name || "User"}!
          </h1>
          <p className="text-zinc-400">
            Monitor cage configurations, feed dispensers, and wheel speeds in real time.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Hamsters Monitored</CardTitle>
              <span className="text-amber-500 text-lg">🐹</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-100">4 Active</div>
              <p className="text-xs text-zinc-500">All cages synced</p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Running Wheel Speed</CardTitle>
              <span className="text-orange-500 text-lg">⚡</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-100">4,200 RPM</div>
              <p className="text-xs text-zinc-500">Telemetry peaks at 9:00 PM</p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Feed Dispenser Status</CardTitle>
              <span className="text-yellow-500 text-lg">🥣</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-100">94% Optimal</div>
              <p className="text-xs text-zinc-500">Refill estimate: 3 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Telemetry Stream */}
        <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-zinc-200">Active Telemetry Stream</CardTitle>
            <CardDescription className="text-zinc-500">
              Live updates direct from connected sensors and activity feeds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full border border-zinc-850 rounded-lg">
              <table className="w-full text-sm text-left text-zinc-300">
                <thead className="text-xs uppercase bg-zinc-900/70 border-b border-zinc-800 text-zinc-400 font-bold">
                  <tr>
                    <th scope="col" className="px-6 py-2.5">Hamster</th>
                    <th scope="col" className="px-6 py-2.5">Current Activity</th>
                    <th scope="col" className="px-6 py-2.5">Metric / Location</th>
                    <th scope="col" className="px-6 py-2.5">Temp</th>
                    <th scope="col" className="px-6 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {hamsters.map((h, i) => (
                    <tr key={i} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-100 flex items-center gap-2">
                        <span className="text-base">🐹</span> {h.name}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{h.activity}</td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{h.metric}</td>
                      <td className="px-6 py-4 text-zinc-400">{h.temp}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            h.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : h.status === "sleep"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${
                            h.status === "active"
                              ? "bg-emerald-400"
                              : h.status === "sleep"
                              ? "bg-blue-400"
                              : "bg-amber-400"
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
        <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-zinc-200">System Telemetry & Diagnostics</CardTitle>
            <CardDescription className="text-zinc-500">
              Session credentials and database connectivity logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-zinc-850 bg-black/40 rounded-lg p-4 font-mono text-xs text-zinc-400 space-y-2 overflow-x-auto">
              <div>[SYSTEM INFO] Bootstrapped Next.js Framework ... OK</div>
              <div>[DATABASE] Drizzle ORM connecting to Docker ... OK</div>
              <div>[AUTH] Active session token generated for: {session.user?.email}</div>
              <div>[AUTH] Authentication Strategy: Credentials (JWT)</div>
              <div>[STYLES] Tailwind CSS v4 Engine ... OK</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
