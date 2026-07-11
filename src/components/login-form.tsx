"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/80 text-zinc-100 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-zinc-400 text-center">
          Sign in with your Email
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="loginType" value="user" />
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-zinc-300">Email Address</Label>
            <Input
              id="identifier"
              name="identifier"
              type="email"
              placeholder="hammy@hamhamhub.com"
              required
              disabled={isPending}
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
              disabled={isPending}
              className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500 focus:ring-orange-500 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-orange-500/20 transition-all duration-300 transform active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
          <p className="text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-orange-400 hover:underline hover:text-orange-300 transition-colors">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
