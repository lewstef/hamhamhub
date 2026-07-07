"use client";

import { useState, useActionState, useEffect } from "react";
import { createAdminAction } from "@/app/actions/initialization";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordStrength } from "@/components/password-strength";

export function InitializationForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(createAdminAction, null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.refresh();
        window.location.href = "/backoffice";
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  const isSubmitDisabled =
    isPending ||
    !passwordsMatch ||
    password.length < 6 ||
    confirmPassword === "";

  if (state?.success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-radial from-background via-background/95 to-muted/20 p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <Card className="w-full max-w-md relative z-10 border border-border/80 shadow-2xl backdrop-blur-md bg-card/95 p-8 space-y-6 text-center hover:border-primary/20 transition-all duration-300">
          <div className="mx-auto w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/20">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold tracking-tight">Platform Initialized</CardTitle>
            <CardDescription className="text-xs leading-relaxed text-muted-foreground">
              The administrator account <strong>admin</strong> has been created successfully. Setup is complete and the platform is ready.
            </CardDescription>
          </div>
          <div className="pt-2">
            <Link
              href="/backoffice"
              className={buttonVariants({ className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/10 transition-all duration-200" })}
            >
              Go to Backoffice
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-background via-background/95 to-muted/20 p-4 relative overflow-hidden">
      {/* Decorative gradient blur backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 border border-border/80 shadow-2xl backdrop-blur-md bg-card/95 hover:border-primary/20 transition-all duration-300">
        <CardHeader className="space-y-2.5 pb-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Sparkles className="size-5 animate-pulse" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">First-Time Setup</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Welcome to HamHamHub
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed text-muted-foreground">
            No administrator account was detected. Let&apos;s initialize the platform by setting a secure password for the primary <strong>admin</strong> user.
          </CardDescription>
        </CardHeader>

        <form action={action} autoComplete="off">
          <CardContent className="p-6 space-y-5">
            {state?.error && (
              <div className="flex gap-2 p-3.5 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                <ShieldAlert className="size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Username Input (Disabled) */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Administrator Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="admin"
                  defaultValue="admin"
                  disabled
                  autoComplete="off"
                  className="bg-muted/40 border-muted text-muted-foreground cursor-not-allowed select-none font-mono"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    autoComplete="new-password"
                    className="pr-10 focus-visible:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
                {password !== "" && password.length < 6 && (
                  <p className="text-[10px] text-destructive font-medium">
                    Password must be at least 6 characters.
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-wider">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPending}
                    autoComplete="new-password"
                    className="pr-10 focus-visible:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {password !== "" && confirmPassword !== "" && !passwordsMatch && (
                  <p className="text-[10px] text-destructive font-medium">
                    Passwords do not match.
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/10 transition-all duration-200"
            >
              {isPending ? "Configuring Admin..." : "Initialize Platform"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
