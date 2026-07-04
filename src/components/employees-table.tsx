"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { createEmployeeAction, deleteEmployeeAction } from "@/app/actions/employees";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, X, Trash2, Pencil, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  role: "user" | "employee" | "admin" | "organization";
  createdAt: Date;
}

interface EmployeesTableProps {
  staffList: Employee[];
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return <Badge variant="default">{role}</Badge>;
  }
  return <Badge variant="secondary">{role}</Badge>;
}

export function EmployeesTable({ staffList }: EmployeesTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [state, formAction, isPending] = useActionState(createEmployeeAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Password matching and visibility toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordVal, setPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");

  // Delete employee state/actions
  const [deleteState, deleteAction, deletePending] = useActionState(deleteEmployeeAction, null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Close form on successful employee creation
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

  const filteredStaff = search.trim()
    ? staffList.filter((u) => {
        const q = search.toLowerCase();
        return (
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
        );
      })
    : staffList;

  const showPagination = filteredStaff.length > 10;
  const totalPages = showPagination ? Math.ceil(filteredStaff.length / PAGE_SIZE) : 1;
  const safePage = Math.min(page, Math.max(1, totalPages));
  const pagedStaff = showPagination
    ? filteredStaff.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    : filteredStaff;

  const passwordsMatch = passwordVal === confirmPasswordVal;
  const isSubmitDisabled = isAnyPending || !passwordsMatch || passwordVal === "" || confirmPasswordVal === "";

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employees</h1>
        </div>
        <div className="flex-1">
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="max-w-sm"
          />
        </div>
        <div className="shrink-0">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="size-4" />
            Create Employee
          </Button>
        </div>
      </div>

      {/* Create Employee Modal */}
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
              <CardTitle className="text-lg font-bold">Register New Employee</CardTitle>
              <CardDescription className="text-xs mt-1">
                Add staff credentials to create a new administrator or employee account.
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
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider">Full Name</Label>
                    <Input id="name" name="name" type="text" placeholder="John Doe" required disabled={isAnyPending} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider">Username</Label>
                    <Input id="username" name="username" type="text" placeholder="johndoe" required disabled={isAnyPending} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="johndoe@hamhamhub.com" required disabled={isAnyPending} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider">Password</Label>
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
                    <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider">Confirm Password</Label>
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
                    <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider">Role</Label>
                    <select
                      id="role"
                      name="role"
                      defaultValue="employee"
                      required
                      disabled={isAnyPending}
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Administrator</option>
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
                    {isAnyPending ? "Saving..." : "Save Employee"}
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
          <Card className="relative w-full max-w-sm shadow-2xl">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">Delete Employee</CardTitle>
              <CardDescription className="text-xs mt-1">
                Are you sure you want to permanently delete this employee? This action cannot be undone.
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
                  <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deletePending}>
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

      {/* Employees Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[20%]" />
                <col className="w-[28%]" />
                <col className="w-[12%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead>
                <tr className="bg-muted/50 border-b border-border h-11 text-[11px] font-semibold text-muted-foreground tracking-wider">
                  <th scope="col" className="px-4 py-3 font-semibold">Username</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Email Address</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Role</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[13px] text-foreground">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground font-medium">
                      No staff accounts found. Database seeding is required.
                    </td>
                  </tr>
                ) : (
                  pagedStaff.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 max-w-0">
                        <span title={u.username ?? undefined} className="block truncate text-primary font-mono font-semibold text-xs">
                          {u.username}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-0">
                        <span title={u.name} className="block truncate font-medium">{u.name}</span>
                      </td>
                      <td className="px-4 py-3.5 max-w-0">
                        <span title={u.email ?? undefined} className="block truncate text-muted-foreground font-mono text-xs">
                          {u.email || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1">
                        <Link
                          href={`/backoffice/employees/edit/${u.id}`}
                          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                        >
                          <Pencil className="size-3" />
                        </Link>
                        {u.username !== "admin" && (
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            type="button"
                            onClick={() => { setDeleteTargetId(u.id); setShowDeleteConfirm(true); }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        )}
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
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredStaff.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{filteredStaff.length}</span> employees
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
