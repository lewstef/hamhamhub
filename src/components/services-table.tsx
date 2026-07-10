"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import {
  createServiceAction,
  deleteServiceAction,
  reorderServicesAction,
  reorderSubServicesAction,
} from "@/app/actions/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  Trash2,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Home,
  Activity,
  Footprints,
  Check,
  Search,
  GripVertical,
} from "lucide-react";
import { DOG_TRAINING_SUB_SERVICES, getSortedSubServices } from "@/config/dog-training";

interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "textarea";
  suffix?: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  applicableTo: string[];
  fields: FormField[];
}

interface Service {
  id: string;
  name: string;
  organizationCategory: string;
  subServicesOrder?: string | null;
}

interface OrganizationCategory {
  id: string;
  name: string;
}

interface ServicesTableProps {
  serviceList: Service[];
  organizationCategoryList: OrganizationCategory[];
  serviceTypeList: ServiceType[];
}



const getServiceDetails = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("training") && normalized.includes("sport")) {
    return {
      description: "Advanced canine sports, agility, and competition coaching.",
      icon: <Activity className="size-4 text-purple-500" />,
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    };
  }
  if (normalized.includes("training")) {
    return {
      description: "Obedience lessons, behavioral coaching, and socialization.",
      icon: <GraduationCap className="size-4 text-emerald-500" />,
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    };
  }
  if (normalized.includes("boarding") || normalized.includes("kennel")) {
    return {
      description: "Overnight lodging, meals, and secure room accommodations.",
      icon: <Home className="size-4 text-blue-500" />,
      colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    };
  }
  if (normalized.includes("walking")) {
    return {
      description: "Outdoor exercise runs, safety walks, and park adventures.",
      icon: <Footprints className="size-4 text-amber-500" />,
      colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    };
  }
  return {
    description: "General dog services and master allocations.",
    icon: <Sparkles className="size-4 text-slate-500" />,
    colorClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
  };
};

export function ServicesTable({ serviceList, organizationCategoryList, serviceTypeList }: ServicesTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [formOrgCategory, setFormOrgCategory] = useState<string>(
    organizationCategoryList[0]?.id || "dog_service_provider"
  );
  
  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>([]);
  const [state, formAction, isPending] = useActionState(createServiceAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  const [deleteState, deleteAction, deletePending] = useActionState(deleteServiceAction, null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reordering states
  const [services, setServices] = useState<Service[]>(serviceList);
  const [subServicesMap, setSubServicesMap] = useState<Record<string, typeof DOG_TRAINING_SUB_SERVICES>>({});
  
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [draggedServiceCategory, setDraggedServiceCategory] = useState<string | null>(null);
  
  const [draggedSubServiceId, setDraggedSubServiceId] = useState<string | null>(null);
  const [draggedSubServiceParentId, setDraggedSubServiceParentId] = useState<string | null>(null);

  // Sync services state with prop
  useEffect(() => {
    setServices(serviceList);
  }, [serviceList]);

  // Sync sub-services lists with custom orders
  useEffect(() => {
    const nextMap: Record<string, typeof DOG_TRAINING_SUB_SERVICES> = {};
    for (const s of services) {
      if (s.name.toLowerCase() === "dog training") {
        nextMap[s.id] = getSortedSubServices(s.subServicesOrder);
      }
    }
    setSubServicesMap(nextMap);
  }, [services]);

  // Set selections to currently registered services when switching category or when serviceList changes
  useEffect(() => {
    const registered = serviceList
      .filter((s) => s.organizationCategory === formOrgCategory)
      .map((s) => s.name);
    setSelectedServiceNames(registered);
  }, [formOrgCategory, serviceList]);

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
    const nextCategory = category ||
      (selectedTypeFilter !== "all"
        ? selectedTypeFilter
        : organizationCategoryList[0]?.id || "dog_service_provider");
    setFormOrgCategory(nextCategory);

    const registered = serviceList
      .filter((s) => s.organizationCategory === nextCategory)
      .map((s) => s.name);
    setSelectedServiceNames(registered);
    setShowForm(true);
  };

  // Drag and Drop Handlers for Main Services
  const handleServiceDragStart = (e: React.DragEvent, id: string, categoryId: string) => {
    setDraggedServiceId(id);
    setDraggedServiceCategory(categoryId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleServiceDragOver = (e: React.DragEvent, targetId: string, categoryId: string) => {
    e.preventDefault();
    if (!draggedServiceId || draggedServiceCategory !== categoryId || draggedServiceId === targetId) return;

    const listForCat = services.filter((s) => s.organizationCategory === categoryId);
    const draggedIdx = listForCat.findIndex((s) => s.id === draggedServiceId);
    const targetIdx = listForCat.findIndex((s) => s.id === targetId);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      const newServices = [...services];
      const draggedItemIdx = newServices.findIndex((s) => s.id === draggedServiceId);
      const targetItemIdx = newServices.findIndex((s) => s.id === targetId);

      const [draggedItem] = newServices.splice(draggedItemIdx, 1);
      newServices.splice(targetItemIdx, 0, draggedItem);
      setServices(newServices);
    }
  };

  const handleServiceDragEnd = async () => {
    setDraggedServiceId(null);
    setDraggedServiceCategory(null);
    const orderedIds = services.map((s) => s.id);
    await reorderServicesAction(orderedIds);
  };

  // Drag and Drop Handlers for Sub-services
  const handleSubServiceDragStart = (e: React.DragEvent, id: string, serviceId: string) => {
    setDraggedSubServiceId(id);
    setDraggedSubServiceParentId(serviceId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSubServiceDragOver = (e: React.DragEvent, targetId: string, serviceId: string) => {
    e.preventDefault();
    if (!draggedSubServiceId || draggedSubServiceParentId !== serviceId || draggedSubServiceId === targetId) return;

    const list = [...(subServicesMap[serviceId] || [])];
    const draggedIdx = list.findIndex((x) => x.id === draggedSubServiceId);
    const targetIdx = list.findIndex((x) => x.id === targetId);
    if (draggedIdx !== -1 && targetIdx !== -1) {
      const [draggedItem] = list.splice(draggedIdx, 1);
      list.splice(targetIdx, 0, draggedItem);
      setSubServicesMap({
        ...subServicesMap,
        [serviceId]: list,
      });
    }
  };

  const handleSubServiceDragEnd = async (serviceId: string) => {
    setDraggedSubServiceId(null);
    setDraggedSubServiceParentId(null);
    const list = subServicesMap[serviceId] || [];
    const orderedIds = list.map((x) => x.id);
    await reorderSubServicesAction(serviceId, orderedIds);
  };

  // Filter services by category and name query
  const filteredServices = services.filter((s) => {
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
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search services by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
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

      {/* Grouped Services Layout - single column row-like cards */}
      <div className="flex flex-col gap-6 w-full">
        {organizationCategoryList.map((category) => {
          const categoryServices = grouped[category.id] || [];
          if (selectedTypeFilter !== "all" && selectedTypeFilter !== category.id) return null;

          return (
            <Card key={category.id} className="overflow-hidden w-full border border-border/80 shadow-sm hover:shadow-md transition-shadow py-0">
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
                    Add Service Type
                  </Button>
                  <Sparkles className="size-4 text-primary/70 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {categoryServices.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-8 text-center">
                    No services defined for this category.
                  </p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {categoryServices.map((s) => {
                      const details = getServiceDetails(s.name);
                      const isDogTraining = s.name.toLowerCase() === "dog training";
                      const isServiceDragged = draggedServiceId === s.id;

                      return (
                        <div
                          key={s.id}
                          className={`flex flex-col py-1 transition-all duration-150 ${
                            isServiceDragged ? "opacity-40 bg-muted/20 border-dashed border-2 border-primary/20 scale-[0.99] rounded-xl my-2" : ""
                          }`}
                          draggable={true}
                          onDragStart={(e) => handleServiceDragStart(e, s.id, category.id)}
                          onDragOver={(e) => handleServiceDragOver(e, s.id, category.id)}
                          onDragEnd={handleServiceDragEnd}
                        >
                          <div className="py-3 flex items-start justify-between group/item hover:bg-muted/20 px-3 rounded-xl transition-all">
                            <div className="flex gap-3.5 items-start min-w-0 flex-1">
                              {/* Drag Handle */}
                              <div
                                className="text-muted-foreground/60 hover:text-primary transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted"
                                title="Drag to reorder services"
                              >
                                <GripVertical className="size-4" />
                              </div>

                              <div className={`p-2 rounded-lg shrink-0 ${details.colorClass.split(" ")[0]} border border-border/40`}>
                                {details.icon}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-sm font-semibold text-foreground block truncate">{s.name}</span>
                                <span className="text-[11px] text-muted-foreground line-clamp-1 leading-normal">
                                  {details.description}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive text-muted-foreground focus:opacity-100 shrink-0 ml-2"
                              onClick={() => {
                                setDeleteTargetId(s.id);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>

                          {/* Nested Sub-Services Accordion (for Dog training) */}
                          {isDogTraining && subServicesMap[s.id] && (
                            <div className="pl-12 pr-3 pb-3 space-y-2 mt-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 pl-2">
                                Sub-Services (Drag to reorder)
                              </div>
                              <div className="divide-y divide-border/20 border border-border/40 rounded-xl bg-card overflow-hidden">
                                {(subServicesMap[s.id] || []).map((sub) => {
                                  const isSubDragged = draggedSubServiceId === sub.id;

                                  return (
                                    <div
                                      key={sub.id}
                                      className={`flex items-center justify-between p-3 pl-4 hover:bg-muted/10 transition-all duration-150 ${
                                        isSubDragged ? "opacity-40 bg-muted/20 border-dashed border-2 border-primary/20 scale-[0.99]" : ""
                                      }`}
                                      draggable={true}
                                      onDragStart={(e) => handleSubServiceDragStart(e, sub.id, s.id)}
                                      onDragOver={(e) => handleSubServiceDragOver(e, sub.id, s.id)}
                                      onDragEnd={() => handleSubServiceDragEnd(s.id)}
                                    >
                                      <div className="flex items-center gap-3">
                                        {/* Sub-Service Drag Handle */}
                                        <div
                                          className="text-muted-foreground/60 hover:text-primary transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted"
                                          title="Drag to reorder sub-services"
                                        >
                                          <GripVertical className="size-3.5" />
                                        </div>
                                        <span className="text-xs font-semibold text-foreground/90">
                                          {sub.label}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
          <Card className="relative w-full max-w-lg shadow-2xl">
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border">
              <CardTitle className="text-lg font-bold">
                Add Service Types to{" "}
                <span className="text-primary">
                  {organizationCategoryList.find((c) => c.id === formOrgCategory)?.name ?? formOrgCategory}
                </span>
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Select one or more service types to register under this category. Already-registered types are locked.
              </CardDescription>
            </CardHeader>
            <form ref={formRef} action={formAction}>
              {/* Hidden Inputs for Form Submission (Submit only new selections) */}
              {selectedServiceNames.map((name) => (
                <input key={name} type="hidden" name="name" value={name} />
              ))}
              
              <CardContent className="p-6 space-y-4">
                {state?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {state.error}
                  </div>
                )}
                <div className="space-y-4">
                  {/* Custom Multi-Select Grid */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Select Services (Toggle one or more)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {serviceTypeList.map((st) => {
                        const isSelected = selectedServiceNames.includes(st.name);
                        const details = getServiceDetails(st.name);
                        return (
                          <button
                            type="button"
                            key={st.id}
                            onClick={() => {
                              if (selectedServiceNames.includes(st.name)) {
                                setSelectedServiceNames(selectedServiceNames.filter((n) => n !== st.name));
                              } else {
                                setSelectedServiceNames([...selectedServiceNames, st.name]);
                              }
                            }}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all hover:shadow-sm cursor-pointer ${
                              isSelected
                                ? "bg-primary/5 border-primary ring-2 ring-primary/20"
                                : "bg-card border-border hover:bg-muted/30"
                            }`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {details.icon}
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 justify-between">
                                <span className="font-bold text-xs text-foreground truncate">{st.name}</span>
                                {isSelected ? (
                                  <Check className="size-3 text-primary shrink-0" />
                                ) : null}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                                {st.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Read-only locked category indicator */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Organization Category
                    </Label>
                    <input type="hidden" name="organizationCategory" value={formOrgCategory} />
                    <div className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-muted/40 text-sm font-medium text-foreground select-none">
                      <span className="flex-1 truncate">
                        {organizationCategoryList.find((c) => c.id === formOrgCategory)?.name ?? formOrgCategory}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border/60 px-1.5 py-0.5 rounded-full shrink-0">
                        Locked
                      </span>
                    </div>
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
