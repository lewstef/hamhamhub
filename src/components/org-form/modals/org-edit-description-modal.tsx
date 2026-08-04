"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { WysiwygEditor } from "../../wysiwyg-editor";

interface Organization {
  id: string;
  name: string;
  organizationCategory: string | null;
}

interface OrgEditDescriptionModalProps {
  showDescriptionModal: boolean;
  onCloseModal: (setter: React.Dispatch<React.SetStateAction<boolean>>) => void;
  setShowDescriptionModal: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseAllModals: () => void;
  organization: Organization;
  personalAction: (payload: FormData) => void;
  personalError: string | null;
  isPending: boolean;
  editDescription: string;
  setEditDescription: (val: string) => void;
}

export function OrgEditDescriptionModal({
  showDescriptionModal,
  onCloseModal,
  setShowDescriptionModal,
  onCloseAllModals,
  organization,
  personalAction,
  personalError,
  isPending,
  editDescription,
  setEditDescription,
}: OrgEditDescriptionModalProps) {
  if (!showDescriptionModal) return null;

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCloseAllModals();
      }}
    >
      <Card className="w-full max-w-2xl shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Settings className="size-5" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-base font-semibold">Edit Description</CardTitle>
            <CardDescription className="text-xs">Update your organization's public rich-text profile description.</CardDescription>
          </div>
        </CardHeader>
        <form action={personalAction}>
          <input type="hidden" name="id" value={organization.id} />
          <input type="hidden" name="name" value={organization.name} />
          <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />
          <input type="hidden" name="description" value={editDescription} />

          <CardContent className="p-6 space-y-6">
            {personalError && (
              <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {personalError}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium normal-case text-muted-foreground/80">
                Description
              </Label>
              <WysiwygEditor
                value={editDescription}
                onChange={setEditDescription}
                placeholder="Provide a detailed description of your organization, services, and operations..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={() => onCloseModal(setShowDescriptionModal)} disabled={isPending}>
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
  );
}
