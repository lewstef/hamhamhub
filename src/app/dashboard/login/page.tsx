import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export const metadata = {
  title: "User Sign In - HamHamHub",
  description: "Sign in as a standard user on HamHamHub.",
};

export default function UserLoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 overflow-hidden">
      {/* Background Gradients (Amber theme for standard users) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-500/10 via-zinc-950 to-zinc-950 pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Header/Logo */}
      <div className="z-10 mb-8 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            HamHamHub
          </span>
        </Link>
        <span className="text-xs text-amber-500/80 font-semibold tracking-wide uppercase mt-1">
          User Portal
        </span>
      </div>

      {/* Form Container */}
      <div className="z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
