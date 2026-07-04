"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BackofficeLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="relative overflow-hidden w-full border-slate-800/80 bg-slate-900/30 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-slate-800 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_60px_-12px_rgba(99,102,241,0.15)]">
      
      {/* Top glowing accent border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      
      <CardHeader className="space-y-1 px-6 pt-7 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
          Sign In
        </CardTitle>
        <CardDescription className="text-slate-500 text-xs">
          Authentication required for staff access
        </CardDescription>
      </CardHeader>
      
      <form action={formAction}>
        <input type="hidden" name="loginType" value="staff" />
        
        <CardContent className="space-y-5 px-6 pb-7">
          {state?.error && (
            <div className="p-3 text-xs font-semibold text-red-400 bg-red-950/15 border border-red-900/20 rounded-lg">
              {state.error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Username
            </Label>
            <div className="relative group">
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="admin"
                required
                disabled={isPending}
                className="h-11 px-4 bg-slate-950/40 border-slate-800/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-slate-100 placeholder:text-slate-700 transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Password
            </Label>
            <div className="relative flex items-center">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                disabled={isPending}
                className="h-11 pl-4 pr-10 w-full bg-slate-950/40 border-slate-800/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-slate-100 placeholder:text-slate-700 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
                className="absolute right-3 text-slate-500 hover:text-slate-350 active:scale-95 focus:outline-none transition-all duration-200"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300 transform active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sign-In Processing...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
