import { BackofficeLoginForm } from "@/components/backoffice-login-form";
import Link from "next/link";

export const metadata = {
  title: "Staff Sign In - HamHamHub",
  description: "Sign in as an administrator or employee on HamHamHub.",
};

export default function BackofficeLoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 px-6 py-12 overflow-hidden font-sans">
      {/* Floating background neon aurora orbs */}
      <div className="absolute top-1/4 left-1/3 size-96 rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/3 size-96 rounded-full bg-blue-600/10 blur-[130px] pointer-events-none animate-float-slower" />
      
      {/* Modern Dot-Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1.5px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Header Logo */}
      <div className="z-10 mb-8 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            HamHamHub
          </span>
        </Link>
        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1.5">
          Backoffice Portal
        </span>
      </div>

      {/* Form Container */}
      <div className="z-10 w-full max-w-sm">
        <BackofficeLoginForm />
      </div>
    </main>
  );
}
