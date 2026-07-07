"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordStrength } from "@/components/password-strength";

export function SignupForm() {
  const router = useRouter();
  const [roleType, setRoleType] = useState<"user" | "staff">("user");
  const [passwordVal, setPasswordVal] = useState("");
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/80 text-zinc-100 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Create an Account
        </CardTitle>
        <CardDescription className="text-zinc-400 text-center">
          Enter your details to create an account
        </CardDescription>
      </CardHeader>
      
      <form action={formAction}>
        {/* Hidden inputs to pass state */}
        <input type="hidden" name="roleType" value="user" />

        <CardContent className="space-y-4">
          {state?.error && (
            <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="p-3 text-sm text-emerald-400 bg-emerald-950/50 border border-emerald-900 rounded-md">
              Registration successful! Redirecting to login...
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Hammy McHamster"
              required
              disabled={isPending || state?.success}
              className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500 focus:ring-orange-500 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="hammy@hamhamhub.com"
              required
              disabled={isPending || state?.success}
              className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500 focus:ring-orange-500 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
              disabled={isPending || state?.success}
              className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500 focus:ring-orange-500 text-zinc-100 placeholder:text-zinc-600"
            />
            <PasswordStrength password={passwordVal} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            disabled={isPending || state?.success}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-orange-500/20 transition-all duration-300 transform active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </Button>
          <p className="text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/dashboard/login"
              className="text-orange-400 hover:underline hover:text-orange-300 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
