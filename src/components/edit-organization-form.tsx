"use client";

import { useState, useActionState } from "react";
import { updateOrganizationAction, changeOrganizationPasswordAction } from "@/app/actions/organizations";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { PasswordStrength } from "@/components/password-strength";

interface Organization {
  id: string;
  name: string;
  email: string | null;
  organizationCategory: string | null;
}

interface OrganizationCategory {
  id: string;
  name: string;
}

interface EditOrganizationFormProps {
  organization: Organization;
  organizationCategoryList: OrganizationCategory[];
}

export function EditOrganizationForm({ organization, organizationCategoryList }: EditOrganizationFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "password">("general");
  const [generalState, generalAction, generalPending] = useActionState(updateOrganizationAction, null);
  const [passwordState, passwordAction, passwordPending] = useActionState(changeOrganizationPasswordAction, null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordVal, setPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");

  const isPending = generalPending || passwordPending;
  const passwordsMatch = passwordVal === confirmPasswordVal;
  const isPasswordSubmitDisabled = isPending || !passwordsMatch || passwordVal === "" || confirmPasswordVal === "";

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Organization</h1>
        <p className="text-sm text-muted-foreground">
          Modify details for {organization.email}.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border flex gap-6 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`pb-2 px-1 focus:outline-none transition-all cursor-pointer font-semibold ${
            activeTab === "general"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={`pb-2 px-1 focus:outline-none transition-all cursor-pointer font-semibold ${
            activeTab === "password"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Password
        </button>
      </div>

      {/* Tab Content: General Form */}
      {activeTab === "general" && (
        <Card className="max-w-xl">
          <CardHeader className="px-6 py-5 border-b border-border">
            <CardTitle className="text-base font-semibold">Edit Details</CardTitle>
            <CardDescription className="text-xs">
              Submit modifications to the organization profile.
            </CardDescription>
          </CardHeader>
          <form action={generalAction}>
            <input type="hidden" name="id" value={organization.id} />
            <CardContent className="p-6 space-y-4">
              {generalState?.error && (
                <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {generalState.error}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider">Organization Name</Label>
                  <Input id="name" name="name" type="text" defaultValue={organization.name} required disabled={isPending} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider">Email Address</Label>
                  <Input id="email" name="email" type="email" defaultValue={organization.email || ""} required disabled={isPending} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="organizationCategory" className="text-xs font-bold uppercase tracking-wider">
                    Organization Category
                  </Label>
                  <select
                    id="organizationCategory"
                    name="organizationCategory"
                    defaultValue={organization.organizationCategory || ""}
                    required
                    disabled={isPending}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    {organizationCategoryList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <Link href="/backoffice/organizations" className={buttonVariants({ variant: "outline" })}>
                  Cancel
                </Link>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Tab Content: Password Form */}
      {activeTab === "password" && (
        <Card className="max-w-xl">
          <CardHeader className="px-6 py-5 border-b border-border">
            <CardTitle className="text-base font-semibold">Change Password</CardTitle>
            <CardDescription className="text-xs">
              Assign a new login password for the organization account.
            </CardDescription>
          </CardHeader>
          <form action={passwordAction}>
            <input type="hidden" name="id" value={organization.id} />
            <CardContent className="p-6 space-y-4">
              {passwordState?.error && (
                <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {passwordState.error}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={passwordVal}
                      onChange={(e) => setPasswordVal(e.target.value)}
                      disabled={isPending}
                      className="pr-10"
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
                  <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={confirmPasswordVal}
                      onChange={(e) => setConfirmPasswordVal(e.target.value)}
                      disabled={isPending}
                      className="pr-10"
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
                <Link href="/backoffice/organizations" className={buttonVariants({ variant: "outline" })}>
                  Cancel
                </Link>
                <Button type="submit" disabled={isPasswordSubmitDisabled}>
                  {isPending ? "Saving..." : "Change Password"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}
    </div>
  );
}
