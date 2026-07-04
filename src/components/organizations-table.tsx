"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { createOrganizationAction, deleteOrganizationAction } from "@/app/actions/organizations";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, X, Trash2, Pencil, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  email: string | null;
  organizationType: "dog_service_provider" | "dog_kennel" | "cynological_association" | "ngo" | null;
  createdAt: Date;
}

interface OrganizationsTableProps {
  organizationList: Organization[];
}

export function OrganizationsTable({ organizationList }: OrganizationsTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [state, formAction, isPending] = useActionState(createOrganizationAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Password matching and visibility toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordVal, setPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");

  // Delete organization state/actions
  const [deleteState, deleteAction, deletePending] = useActionState(deleteOrganizationAction, null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Close form on successful creation
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setShowForm(false);
        formRef.current?.reset();
        setPasswordVal("");
        setConfirmPasswordVal("");
        setShowPassword(false);
        setShowConfirmPassword(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Close delete confirm on successful deletion
  useEffect(() => {
    if (deleteState && (deleteState as { success?: boolean }).success) {
      const timer = setTimeout(() => {
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [deleteState]);

  const isAnyPending = isPending || deletePending;

  const filteredOrganizations = search.trim()
    ? organizationList.filter((o) => {
        const q = search.toLowerCase();
        return (
          (o.name && o.name.toLowerCase().includes(q)) ||
          (o.email && o.email.toLowerCase().includes(q))
        );
      })
    : organizationList;

  const showPagination = filteredOrganizations.length > 10;
  const totalPages = showPagination ? Math.ceil(filteredOrganizations.length / PAGE_SIZE) : 1;
  const safePage = Math.min(page, Math.max(1, totalPages));
  const pagedOrganizations = showPagination
    ? filteredOrganizations.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    : filteredOrganizations;

  const passwordsMatch = passwordVal === confirmPasswordVal;
  const isSubmitDisabled = isAnyPending || !passwordsMatch || passwordVal === "" || confirmPasswordVal === "";

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organizations</h1>
        </div>
        <div className="flex-1">
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
        </div>
        <div className="shrink-0">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="size-4" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Create Organization Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="relative w-full max-w-md shadow-2xl">
            <button
              onClick={() => {
                setShowForm(false);
                setPasswordVal("");
                setConfirmPasswordVal("");
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">Register New Organization</CardTitle>
              <CardDescription className="text-xs mt-1">
                Add credentials to create a new organization account.
              </CardDescription>
            </CardHeader>
            <form ref={formRef} action={formAction}>
              <CardContent className="p-6 space-y-4">
                {state?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {state.error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider">
                      Organization Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="HamHam Corp"
                      required
                      disabled={isAnyPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="info@hamhamcorp.com"
                      required
                      disabled={isAnyPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={passwordVal}
                        onChange={(e) => setPasswordVal(e.target.value)}
                        disabled={isAnyPending}
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
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={confirmPasswordVal}
                        onChange={(e) => setConfirmPasswordVal(e.target.value)}
                        disabled={isAnyPending}
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
                  <div className="space-y-1.5">
                    <Label htmlFor="organizationType" className="text-xs font-bold uppercase tracking-wider">
                      Organization Type
                    </Label>
                    <select
                      id="organizationType"
                      name="organizationType"
                      defaultValue="dog_service_provider"
                      required
                      disabled={isAnyPending}
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      <option value="dog_service_provider">Dog Service Provider</option>
                      <option value="dog_kennel">Dog Kennel</option>
                      <option value="cynological_association">Official Cynological Association</option>
                      <option value="ngo">NGO</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setPasswordVal("");
                      setConfirmPasswordVal("");
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    disabled={isAnyPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitDisabled}>
                    {isAnyPending ? "Saving..." : "Save Organization"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTargetId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="relative w-full max-sm shadow-2xl">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteTargetId(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">Delete Organization</CardTitle>
              <CardDescription className="text-xs mt-1">
                Are you sure you want to permanently delete this organization? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={deleteTargetId} />
              <CardContent className="p-6 space-y-4">
                {deleteState?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {deleteState.error}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteTargetId(null);
                    }}
                    disabled={deletePending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive" disabled={deletePending}>
                    {deletePending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Organizations Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[25%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="bg-muted/50 border-b border-border h-11 text-[11px] font-semibold text-muted-foreground tracking-wider">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Email Address
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Organization Type
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Joined Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[13px] text-foreground">
                {filteredOrganizations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground font-medium"
                    >
                      No organization accounts found.
                    </td>
                  </tr>
                ) : (
                  pagedOrganizations.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 max-w-0">
                        <span title={o.name} className="block truncate font-medium">
                          {o.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-0">
                        <span
                          title={o.email ?? undefined}
                          className="block truncate text-muted-foreground font-mono text-xs"
                        >
                          {o.email || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-0">
                        <span className="capitalize text-muted-foreground text-xs">
                          {o.organizationType ? o.organizationType.replace(/_/g, " ") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-muted-foreground text-xs">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1">
                        <Link
                          href={`/backoffice/organizations/edit/${o.id}`}
                          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                        >
                          <Pencil className="size-3" />
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          type="button"
                          onClick={() => {
                            setDeleteTargetId(o.id);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredOrganizations.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{filteredOrganizations.length}</span>{" "}
            organizations
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "outline"}
                size="icon-sm"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
