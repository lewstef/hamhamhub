"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eye, Pencil, X } from "lucide-react";
import { updateServiceTypeAction } from "@/app/actions/service-types";

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

interface ServiceTypesTableProps {
  serviceTypesList: ServiceType[];
}

export function ServiceTypesTable({ serviceTypesList }: ServiceTypesTableProps) {
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceType | null>(null);

  const [state, editFormAction, isPending] = useActionState(updateServiceTypeAction, null);
  const editFormRef = useRef<HTMLFormElement>(null);

  // Close modal on successful update
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setShowEditModal(false);
        setEditTarget(null);
        editFormRef.current?.reset();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const filtered = serviceTypesList.filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Service Types</h1>
        <p className="text-sm text-muted-foreground">
          Definitions of services available for dynamic allocations. You can customize names and descriptions.
        </p>
      </div>

      {/* Filter and search block */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search service types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md w-full"
          />
        </div>
      </div>

      {/* Grid or Table display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[60%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="bg-muted/50 border-b border-border h-11 text-[11px] font-semibold text-muted-foreground tracking-wider">
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Description</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[13px] text-foreground">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground font-medium">
                      No service types found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors h-14">
                      <td className="px-4 py-3 max-w-0 font-semibold text-foreground truncate" title={item.name}>
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate" title={item.description}>
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          type="button"
                          className="rounded-lg border-border/80 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
                          onClick={() => {
                            setEditTarget(item);
                            setShowEditModal(true);
                          }}
                          title={`Edit ${item.name}`}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Link
                          href={`/backoffice/services/types/preview/${item.id}`}
                          className={buttonVariants({ variant: "outline", size: "icon-sm" }) + " rounded-lg border-border/80 hover:bg-primary/5 hover:text-primary transition-colors"}
                          title={`Preview ${item.name} Form`}
                        >
                          <Eye className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Service Type Modal */}
      {showEditModal && editTarget && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="relative w-full max-w-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditTarget(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border/60">
              <CardTitle className="text-lg font-bold">Edit Service Type</CardTitle>
              <CardDescription className="text-xs mt-1">
                Modify name and description for service type "{editTarget.id}".
              </CardDescription>
            </CardHeader>
            <form ref={editFormRef} action={editFormAction}>
              <input type="hidden" name="id" value={editTarget.id} />
              <CardContent className="p-6 space-y-4">
                {state?.error && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {state.error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="editName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Service Type Name
                    </Label>
                    <Input
                      id="editName"
                      name="name"
                      type="text"
                      defaultValue={editTarget.name}
                      required
                      disabled={isPending}
                      className="rounded-xl h-9 text-xs transition-shadow focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editDescription" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Description
                    </Label>
                    <textarea
                      id="editDescription"
                      name="description"
                      defaultValue={editTarget.description}
                      required
                      disabled={isPending}
                      className="flex min-h-[96px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/60 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditTarget(null);
                    }}
                    disabled={isPending}
                    className="rounded-xl h-9 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl h-9 text-xs font-semibold" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
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
