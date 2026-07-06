"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { createServiceAction, deleteServiceAction } from "@/app/actions/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Trash2, ChevronRight, Sparkles } from "lucide-react";

interface Service {
  id: string;
  name: string;
  organizationCategory: string;
}

interface OrganizationCategory {
  id: string;
  name: string;
}

interface ServicesTableProps {
  serviceList: Service[];
  organizationCategoryList: OrganizationCategory[];
}

export function ServicesTable({ serviceList, organizationCategoryList }: ServicesTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [formOrgCategory, setFormOrgCategory] = useState<string>(
    organizationCategoryList[0]?.id || "dog_service_provider"
  );
  
  const [state, formAction, isPending] = useActionState(createServiceAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Delete service state/actions
  const [deleteState, deleteAction, deletePending] = useActionState(deleteServiceAction, null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Close form on successful creation
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setShowForm(false);
        formRef.current?.reset();
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

  const handleAddService = (category?: string) => {
    setFormOrgCategory(
      category ||
        (selectedTypeFilter !== "all"
          ? selectedTypeFilter
          : organizationCategoryList[0]?.id || "dog_service_provider")
    );
    setShowForm(true);
  };

  // Filter services by category and name query
  const filteredServices = serviceList.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedTypeFilter === "all" || s.organizationCategory === selectedTypeFilter;
    return matchesSearch && matchesCategory;
  });

  // Group services dynamically by organization category
  const grouped: Record<string, Service[]> = {};
  for (const category of organizationCategoryList) {
    grouped[category.id] = filteredServices.filter((s) => s.organizationCategory === category.id);
  }

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Services Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage the master list of services available for each organization category.
          </p>
        </div>
        <Button onClick={() => handleAddService()} className="sm:w-auto w-full cursor-pointer">
          Add Service
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search services by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md w-full"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTypeFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              selectedTypeFilter === "all"
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories
          </button>
          {organizationCategoryList.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedTypeFilter(category.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                selectedTypeFilter === category.id
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Services Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {organizationCategoryList.map((category) => {
          const categoryServices = grouped[category.id] || [];
          if (selectedTypeFilter !== "all" && selectedTypeFilter !== category.id) return null;

          return (
            <Card key={category.id} className="overflow-hidden flex flex-col h-full border border-border/80 shadow-sm hover:shadow-md transition-shadow py-0">
              <CardHeader className="bg-muted/30 px-6 py-4 border-b border-border flex flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <CardTitle className="text-sm font-bold tracking-tight text-foreground truncate">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {categoryServices.length} service{categoryServices.length !== 1 && "s"} registered
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    onClick={() => handleAddService(category.id)}
                  >
                    + Add
                  </Button>
                  <Sparkles className="size-4 text-primary/70 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                {categoryServices.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-8 text-center">
                    No services defined for this category.
                  </p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {categoryServices.map((s) => (
                      <div
                        key={s.id}
                        className="py-3 flex items-center justify-between group/item hover:bg-muted/20 px-2 -mx-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <ChevronRight className="size-3 text-primary/70" />
                          <span className="text-sm font-medium text-foreground">{s.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive text-muted-foreground focus:opacity-100"
                          onClick={() => {
                            setDeleteTargetId(s.id);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Service Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="relative w-full max-w-md shadow-2xl">
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">Create Master Service</CardTitle>
              <CardDescription className="text-xs mt-1">
                Define a new service and allocate it to a specific category.
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
                      Service Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g., Dog Boarding, Pedigree Registration"
                      required
                      disabled={isAnyPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="organizationCategory" className="text-xs font-bold uppercase tracking-wider">
                      Organization Category
                    </Label>
                    <select
                      id="organizationCategory"
                      name="organizationCategory"
                      value={formOrgCategory}
                      onChange={(e) => setFormOrgCategory(e.target.value)}
                      required
                      disabled={isAnyPending}
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      {organizationCategoryList.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isAnyPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAnyPending}>
                    {isAnyPending ? "Saving..." : "Save Service"}
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
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteTargetId(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">Delete Service</CardTitle>
              <CardDescription className="text-xs mt-1">
                Are you sure you want to delete this service? This will remove it from the master directory.
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
    </div>
  );
}
