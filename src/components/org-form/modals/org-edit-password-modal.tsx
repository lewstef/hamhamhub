"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Key, Shield, Mail } from "lucide-react";
import { PasswordStrength } from "@/components/password-strength";

interface Organization {
  id: string;
  email: string | null;
  recoveryEmail?: string | null;
}

interface OrgEditPasswordModalProps {
  showEmailModal: boolean;
  showRecoveryEmailModal: boolean;
  showPasswordModal: boolean;
  onCloseModal: (setter: React.Dispatch<React.SetStateAction<boolean>>) => void;
  setShowEmailModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRecoveryEmailModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseAllModals: () => void;
  organization: Organization;
  accountAction: (payload: FormData) => void;
  accountError: string | null;
  isPending: boolean;
  isDashboard: boolean;
}

export function OrgEditPasswordModal({
  showEmailModal,
  showRecoveryEmailModal,
  showPasswordModal,
  onCloseModal,
  setShowEmailModal,
  setShowRecoveryEmailModal,
  setShowPasswordModal,
  onCloseAllModals,
  organization,
  accountAction,
  accountError,
  isPending,
  isDashboard,
}: OrgEditPasswordModalProps) {
  const [passwordVal, setPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = passwordVal === confirmPasswordVal;
  const isPasswordSubmitDisabled =
    isPending || !passwordVal || !confirmPasswordVal || !passwordsMatch;

  return (
    <>
      {/* POPUP 4: Edit Email */}
      {showEmailModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Mail className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Email</CardTitle>
                <CardDescription className="text-xs">Modify login email credentials.</CardDescription>
              </div>
            </CardHeader>
            <form action={accountAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="recoveryEmail" value={organization.recoveryEmail || ""} />
              <CardContent className="p-6 space-y-4">
                {accountError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {accountError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={organization.email || ""}
                        required
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowEmailModal)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 4.5: Edit Recovery Email */}
      {showRecoveryEmailModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Shield className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Recovery Email</CardTitle>
                <CardDescription className="text-xs">Modify account backup recovery contact mail.</CardDescription>
              </div>
            </CardHeader>
            <form action={accountAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="email" value={organization.email || ""} />
              <CardContent className="p-6 space-y-4">
                {accountError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {accountError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="recoveryEmail" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Recovery email
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="recoveryEmail"
                        name="recoveryEmail"
                        type="email"
                        defaultValue={organization.recoveryEmail || ""}
                        placeholder="backup@example.com"
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowRecoveryEmailModal)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* POPUP 5: Edit Password */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Lock className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                <CardDescription className="text-xs">Set a new operational access password for safety.</CardDescription>
              </div>
            </CardHeader>
            <form action={accountAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="email" value={organization.email || ""} />
              <input type="hidden" name="recoveryEmail" value={organization.recoveryEmail || ""} />

              <CardContent className="p-6 space-y-4">
                {accountError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {accountError}
                  </div>
                )}
                <div className="space-y-4">
                  {isDashboard && (
                    <div className="space-y-1.5">
                      <Label htmlFor="currentPassword" className="text-sm font-medium normal-case text-muted-foreground/80">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          placeholder="••••••••"
                          required
                          className="pl-9 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium normal-case text-muted-foreground/80">
                      New Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={passwordVal}
                        onChange={(e) => setPasswordVal(e.target.value)}
                        className="pl-9 pr-10 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={passwordVal} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={confirmPasswordVal}
                        onChange={(e) => setConfirmPasswordVal(e.target.value)}
                        className="pl-9 pr-10 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {passwordVal !== "" && confirmPasswordVal !== "" && !passwordsMatch && (
                      <p className="text-xs font-medium text-destructive mt-1">Passwords do not match.</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowPasswordModal)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPasswordSubmitDisabled}>
                    {isPending ? "Saving..." : "Change Password"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
