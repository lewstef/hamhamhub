"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import {
  createOrganizationAction,
  deleteOrganizationAction,
  createOrganizationCategoryAction,
  deleteOrganizationCategoryAction,
  updateOrganizationCategoryAction,
} from "@/app/actions/organizations";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, X, Trash2, Pencil, ChevronLeft, ChevronRight, Eye, EyeOff, Search, Building2, Layers } from "lucide-react";
import { PasswordStrength } from "@/components/password-strength";

interface Organization {
  id: string;
  name: string;
  email: string | null;
  organizationCategory: string | null;
  createdAt: Date;
}

interface OrganizationCategory {
  id: string;
  name: string;
  description: string | null;
}

interface OrganizationsTableProps {
  organizationList: Organization[];
  organizationCategoryList: OrganizationCategory[];
}

export function OrganizationsTable({ organizationList, organizationCategoryList }: OrganizationsTableProps) {
  const [activeTab, setActiveTab] = useState<"list" | "types">("list");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const PAGE_SIZE = 10;
  
  const [state, formAction, isPending] = useActionState(createOrganizationAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Organization Category actions
  const [categoryState, categoryFormAction, isCategoryPending] = useActionState(createOrganizationCategoryAction, null);
  const [deleteCategoryState, deleteCategoryAction, isDeleteCategoryPending] = useActionState(deleteOrganizationCategoryAction, null);
  const [editCategoryState, editCategoryFormAction, isEditCategoryPending] = useActionState(updateOrganizationCategoryAction, null);
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const editCategoryFormRef = useRef<HTMLFormElement>(null);
  
  const [editCategoryTarget, setEditCategoryTarget] = useState<OrganizationCategory | null>(null);

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

  // Reset category creation form on success
  useEffect(() => {
    if (categoryState?.success) {
      const timer = setTimeout(() => {
        setShowCategoryForm(false);
        categoryFormRef.current?.reset();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [categoryState]);

  // Reset category editing form on success
  useEffect(() => {
    if (editCategoryState?.success) {
      const timer = setTimeout(() => {
        setShowEditCategoryForm(false);
        setEditCategoryTarget(null);
        editCategoryFormRef.current?.reset();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editCategoryState]);

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

  // Filter organizations by search query
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

  // Filter categories by search query
  const filteredCategories = categorySearch.trim()
    ? organizationCategoryList.filter((c) => {
        const q = categorySearch.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
        );
      })
    : organizationCategoryList;

  const showCategoryPagination = filteredCategories.length > 10;
  const totalCategoryPages = showCategoryPagination ? Math.ceil(filteredCategories.length / PAGE_SIZE) : 1;
  const safeCategoryPage = Math.min(categoryPage, Math.max(1, totalCategoryPages));
  const pagedCategories = showCategoryPagination
    ? filteredCategories.slice((safeCategoryPage - 1) * PAGE_SIZE, safeCategoryPage * PAGE_SIZE)
    : filteredCategories;

  const passwordsMatch = passwordVal === confirmPasswordVal;
  const isSubmitDisabled = isAnyPending || !passwordsMatch || passwordVal === "" || confirmPasswordVal === "";

  // Dynamic Category badges
  const getCategoryBadgeStyles = (id: string | null) => {
    switch (id) {
      case "ngo":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "dog_kennel":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      case "dog_service_provider":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20";
      case "cynological_association":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats Grid */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
            Organizations
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage partner accounts, categories, services, and profile credentials.
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-44 bg-card border border-border/80 shadow-sm p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
              <Building2 className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Organizations</p>
              <p className="text-xl font-bold text-foreground leading-none mt-1">{organizationList.length}</p>
            </div>
          </div>
          <div className="flex-1 md:w-44 bg-card border border-border/80 shadow-sm p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-lg shrink-0">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Categories</p>
              <p className="text-xl font-bold text-foreground leading-none mt-1">{organizationCategoryList.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation & Search Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 border border-border/60 p-2 rounded-2xl">
        {/* Pill Tabs */}
        <div className="flex bg-muted/60 p-1 rounded-xl shadow-inner shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Organizations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("types")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "types"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Categories
          </button>
        </div>

        {/* Dynamic Actions Based on Tab */}
        {activeTab === "list" ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs transition-shadow focus-visible:ring-primary/20 rounded-xl"
              />
            </div>
            <Button onClick={() => setShowForm(true)} size="sm" className="gap-2 cursor-pointer h-9 px-4 rounded-xl shrink-0">
              <Plus className="size-3.5" />
              Create Organization
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => {
                  setCategorySearch(e.target.value);
                  setCategoryPage(1);
                }}
                className="pl-9 h-9 text-xs transition-shadow focus-visible:ring-primary/20 rounded-xl"
              />
            </div>
            <Button onClick={() => setShowCategoryForm(true)} size="sm" className="gap-2 cursor-pointer h-9 px-4 rounded-xl shrink-0">
              <Plus className="size-3.5" />
              Add Category
            </Button>
          </div>
        )}
      </div>

      {/* List Tab Content */}
      {activeTab === "list" && (
        <>
          {/* Organizations Table */}
          <Card className="overflow-hidden py-0 border border-border/80 shadow-sm rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse table-fixed">
                  <colgroup>
                    <col className="w-[30%]" />
                    <col className="w-[30%]" />
                    <col className="w-[20%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th scope="col" className="px-5 py-3.5 font-bold">Name</th>
                      <th scope="col" className="px-5 py-3.5 font-bold">Email Address</th>
                      <th scope="col" className="px-5 py-3.5 font-bold">Organization Category</th>
                      <th scope="col" className="px-5 py-3.5 font-bold">Joined Date</th>
                      <th scope="col" className="px-5 py-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[13px] text-foreground">
                    {filteredOrganizations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground font-medium bg-muted/5">
                          No organization accounts found.
                        </td>
                      </tr>
                    ) : (
                      pagedOrganizations.map((o) => (
                        <tr key={o.id} className="hover:bg-muted/20 transition-colors h-14">
                          <td className="px-5 py-3 max-w-0">
                            <span title={o.name} className="block truncate font-semibold text-foreground">
                              {o.name}
                            </span>
                          </td>
                          <td className="px-5 py-3 max-w-0">
                            <span title={o.email ?? undefined} className="block truncate text-muted-foreground font-mono text-xs">
                              {o.email || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3 max-w-0">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border uppercase ${getCategoryBadgeStyles(o.organizationCategory)}`}>
                              {organizationCategoryList.find((t) => t.id === o.organizationCategory)?.name || o.organizationCategory || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-muted-foreground text-xs font-medium">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right space-x-1 whitespace-nowrap">
                            <Link
                              href={`/backoffice/organizations/edit/${o.id}`}
                              className={buttonVariants({ variant: "outline", size: "icon-sm" }) + " rounded-lg border-border/80 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"}
                              title="Edit Organization"
                            >
                              <Pencil className="size-3" />
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              type="button"
                              className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                              onClick={() => {
                                setDeleteTargetId(o.id);
                                setShowDeleteConfirm(true);
                              }}
                              title="Delete Organization"
                            >
                              <Trash2 className="size-3.5" />
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
              <p className="text-xs text-muted-foreground font-medium">
                Showing{" "}
                <span className="font-bold text-foreground">
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filteredOrganizations.length)}
                </span>{" "}
                of <span className="font-bold text-foreground">{filteredOrganizations.length}</span>{" "}
                organizations
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded-lg border-border/80 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === safePage ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setPage(p)}
                    className="rounded-lg cursor-pointer"
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-lg border-border/80 cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Organization Categories Tab Content */}
      {activeTab === "types" && (
        <>
          {/* Categories Table */}
          <Card className="overflow-hidden py-0 border border-border/80 shadow-sm rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse table-fixed">
                  <colgroup>
                    <col className="w-[50%]" />
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th scope="col" className="px-5 py-3.5 font-bold">Category Name</th>
                      <th scope="col" className="px-5 py-3.5 font-bold">Category ID</th>
                      <th scope="col" className="px-5 py-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[13px] text-foreground">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center text-muted-foreground font-medium bg-muted/5">
                          No categories found.
                        </td>
                      </tr>
                    ) : (
                      pagedCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-muted/20 transition-colors h-14">
                          <td className="px-5 py-3 max-w-0">
                            <span title={category.name} className="block truncate font-semibold text-foreground">
                              {category.name}
                            </span>
                          </td>
                          <td className="px-5 py-3 max-w-0">
                            <span className="inline-flex font-mono text-[10px] text-muted-foreground bg-muted/60 py-0.5 px-2 rounded-md font-semibold tracking-wider">
                              {category.id}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right space-x-1 whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              type="button"
                              className="rounded-lg border-border/80 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
                              onClick={() => {
                                setEditCategoryTarget(category);
                                setShowEditCategoryForm(true);
                              }}
                              title="Edit Category"
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <form action={deleteCategoryAction} className="inline-block">
                              <input type="hidden" name="id" value={category.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="icon-sm"
                                disabled={isDeleteCategoryPending}
                                className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground cursor-pointer rounded-lg transition-colors"
                                title="Delete Category"
                              >
                                  <Trash2 className="size-3.5" />
                              </Button>
                            </form>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Delete Category Error Message */}
          {(deleteCategoryState as any)?.error && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {(deleteCategoryState as any).error}
            </div>
          )}

          {/* Categories Pagination */}
          {showCategoryPagination && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground font-medium">
                Showing{" "}
                <span className="font-bold text-foreground">
                  {(safeCategoryPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safeCategoryPage * PAGE_SIZE, filteredCategories.length)}
                </span>{" "}
                of <span className="font-bold text-foreground">{filteredCategories.length}</span>{" "}
                categories
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setCategoryPage((p) => Math.max(1, p - 1))}
                  disabled={safeCategoryPage === 1}
                  className="rounded-lg border-border/80 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalCategoryPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === safeCategoryPage ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setCategoryPage(p)}
                    className="rounded-lg cursor-pointer"
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setCategoryPage((p) => Math.min(totalCategoryPages, p + 1))}
                  disabled={safeCategoryPage === totalCategoryPages}
                  className="rounded-lg border-border/80 cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Organization Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="relative w-full max-w-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
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
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border/60">
              <CardTitle className="text-lg font-bold">Register Organization</CardTitle>
              <CardDescription className="text-xs mt-1">
                Enter name and login credentials to create an organization profile.
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
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Organization Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="HamHam Corp"
                      required
                      disabled={isAnyPending}
                      className="rounded-xl h-9 text-xs transition-shadow focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="info@hamhamcorp.com"
                      required
                      disabled={isAnyPending}
                      className="rounded-xl h-9 text-xs transition-shadow focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                        className="pr-10 rounded-xl h-9 text-xs transition-shadow focus-visible:ring-primary/20"
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
                    <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                        className="pr-10 rounded-xl h-9 text-xs transition-shadow focus-visible:ring-primary/20"
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
                    <Label htmlFor="organizationCategory" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Organization Category
                    </Label>
                    <select
                      id="organizationCategory"
                      name="organizationCategory"
                      defaultValue={organizationCategoryList[0]?.id || ""}
                      required
                      disabled={isAnyPending}
                      className="flex h-9 w-full rounded-xl border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      {organizationCategoryList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/60 mt-6">
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
                    className="rounded-xl h-9 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitDisabled} className="rounded-xl h-9 text-xs font-semibold">
                    {isAnyPending ? "Saving..." : "Save Organization"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="relative w-full max-w-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCategoryForm(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border/60">
              <CardTitle className="text-lg font-bold text-foreground">Add Category</CardTitle>
              <CardDescription className="text-xs mt-1 text-muted-foreground">
                Create a new dynamic category for partner organizations.
              </CardDescription>
            </CardHeader>
            <form ref={categoryFormRef} action={categoryFormAction}>
              <CardContent className="p-6 space-y-4">
                {(categoryState as any)?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {(categoryState as any).error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="categoryName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Category Name
                    </Label>
                    <Input
                      id="categoryName"
                      name="name"
                      type="text"
                      placeholder="e.g., Dog Groomer"
                      required
                      disabled={isCategoryPending}
                      className="rounded-xl h-9 text-xs transition-shadow focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="categoryDescription" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Description
                    </Label>
                    <textarea
                      id="categoryDescription"
                      name="description"
                      placeholder="Describe how this category is used..."
                      disabled={isCategoryPending}
                      className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/60 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoryForm(false)}
                    disabled={isCategoryPending}
                    className="rounded-xl h-9 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl h-9 text-xs font-semibold" disabled={isCategoryPending}>
                    {isCategoryPending ? "Adding..." : "Add Category"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryForm && editCategoryTarget && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="relative w-full max-w-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowEditCategoryForm(false);
                setEditCategoryTarget(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border/60">
              <CardTitle className="text-lg font-bold text-foreground">Edit Category</CardTitle>
              <CardDescription className="text-xs mt-1 text-muted-foreground">
                Update name and description details for category "{editCategoryTarget.id}".
              </CardDescription>
            </CardHeader>
            <form ref={editCategoryFormRef} action={editCategoryFormAction}>
              <input type="hidden" name="id" value={editCategoryTarget.id} />
              <CardContent className="p-6 space-y-4">
                {(editCategoryState as any)?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {(editCategoryState as any).error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="editCategoryName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Category Name
                    </Label>
                    <Input
                      id="editCategoryName"
                      name="name"
                      type="text"
                      defaultValue={editCategoryTarget.name}
                      required
                      disabled={isEditCategoryPending}
                      className="rounded-xl h-9 text-xs transition-shadow focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editCategoryDescription" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Description
                    </Label>
                    <textarea
                      id="editCategoryDescription"
                      name="description"
                      defaultValue={editCategoryTarget.description || ""}
                      placeholder="Describe how this category is used..."
                      disabled={isEditCategoryPending}
                      className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/60 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditCategoryForm(false);
                      setEditCategoryTarget(null);
                    }}
                    disabled={isEditCategoryPending}
                    className="rounded-xl h-9 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl h-9 text-xs font-semibold" disabled={isEditCategoryPending}>
                    {isEditCategoryPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTargetId && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="relative w-full max-w-sm shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteTargetId(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border/60">
              <CardTitle className="text-lg font-bold">Delete Organization</CardTitle>
              <CardDescription className="text-xs mt-1 text-muted-foreground">
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
                    className="rounded-xl h-9 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive" disabled={deletePending} className="rounded-xl h-9 text-xs font-semibold">
                    {deletePending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
