"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Settings } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";

interface Organization {
  id: string;
  name: string;
  organizationCategory: string | null;
  phoneNumber?: string | null;
  addressCountry?: string | null;
  addressState?: string | null;
  addressCity?: string | null;
  addressLine?: string | null;
  addressZip?: string | null;
}

interface OrganizationCategory {
  id: string;
  name: string;
}

interface OrgEditNameCategoryModalProps {
  showNameModal: boolean;
  showCategoryModal: boolean;
  onCloseModal: (setter: React.Dispatch<React.SetStateAction<boolean>>) => void;
  setShowNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseAllModals: () => void;
  organization: Organization;
  organizationCategoryList: OrganizationCategory[];
  personalAction: (payload: FormData) => void;
  personalError: string | null;
  isPending: boolean;
}

export function OrgEditNameCategoryModal({
  showNameModal,
  showCategoryModal,
  onCloseModal,
  setShowNameModal,
  setShowCategoryModal,
  onCloseAllModals,
  organization,
  organizationCategoryList,
  personalAction,
  personalError,
  isPending,
}: OrgEditNameCategoryModalProps) {
  return (
    <>
      {/* POPUP 1: Edit Name */}
      {showNameModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Building className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Organization Name</CardTitle>
                <CardDescription className="text-xs">Update your organization official registered title.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />
              <input type="hidden" name="phoneNumber" value={organization.phoneNumber || ""} />

              <CardContent className="p-6 space-y-4">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Organization Name
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        defaultValue={organization.name}
                        required
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowNameModal)} disabled={isPending}>
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

      {/* POPUP 1.5: Edit Category */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Settings className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Category</CardTitle>
                <CardDescription className="text-xs">Update organization Operational Category classification.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="phoneNumber" value={organization.phoneNumber || ""} />
              <input type="hidden" name="addressCountry" value={organization.addressCountry || ""} />
              <input type="hidden" name="addressState" value={organization.addressState || ""} />
              <input type="hidden" name="addressCity" value={organization.addressCity || ""} />
              <input type="hidden" name="addressLine" value={organization.addressLine || ""} />
              <input type="hidden" name="addressZip" value={organization.addressZip || ""} />

              <CardContent className="p-6 space-y-4">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="organizationCategory" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Organization Category
                    </Label>
                    <CustomSelect
                      id="organizationCategory"
                      name="organizationCategory"
                      defaultValue={organization.organizationCategory || ""}
                      required
                      options={organizationCategoryList.map((t) => ({
                        value: t.id,
                        label: t.name,
                      }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowCategoryModal)} disabled={isPending}>
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
    </>
  );
}
