import Link from "next/link";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 overflow-hidden text-zinc-100">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-500/10 via-zinc-950 to-zinc-950 pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="z-10 text-center max-w-2xl px-6 space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
          ✨ Next.js + Tailwind v4 + Drizzle + NextAuth
        </span>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent py-2">
          Welcome to HamHamHub
        </h1>
        
        <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed">
          The ultimate control center and community platform. Manage your configurations, verify connection pools, and secure your session data seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {session ? (
            <div className="space-y-4">
              <p className="text-zinc-300">
                Signed in as <span className="font-semibold text-amber-400">{session.user?.email}</span>
              </p>
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "default",
                  className:
                    "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 rounded-lg text-lg font-semibold shadow-xl hover:shadow-orange-500/20 transition-all duration-300",
                })}
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/dashboard/login"
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className:
                    "w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-6 px-8 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all duration-300",
                })}
              >
                Get Started (Sign In)
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "w-full sm:w-auto border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:text-zinc-100 font-semibold py-6 px-8 rounded-lg",
                })}
              >
                Create Free Account
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
