"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Globe } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  organizationCategory: string | null;
  phoneNumber?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  description?: string | null;
}

interface OrgEditContactModalProps {
  showPhoneModal: boolean;
  showWebsiteModal: boolean;
  showFacebookModal: boolean;
  showInstagramModal: boolean;
  showTikTokModal: boolean;
  showLinkedinModal: boolean;
  onCloseModal: (setter: React.Dispatch<React.SetStateAction<boolean>>) => void;
  setShowPhoneModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowWebsiteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFacebookModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowInstagramModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTikTokModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLinkedinModal: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseAllModals: () => void;
  organization: Organization;
  personalAction: (payload: FormData) => void;
  personalError: string | null;
  isPending: boolean;
  phonePlaceholder: string;
  phonePatternInfo?: { prefix: string; placeholder: string } | null;
  selectedCountry?: string | null;
}

export function OrgEditContactModal({
  showPhoneModal,
  showWebsiteModal,
  showFacebookModal,
  showInstagramModal,
  showTikTokModal,
  showLinkedinModal,
  onCloseModal,
  setShowPhoneModal,
  setShowWebsiteModal,
  setShowFacebookModal,
  setShowInstagramModal,
  setShowTikTokModal,
  setShowLinkedinModal,
  onCloseAllModals,
  organization,
  personalAction,
  personalError,
  isPending,
  phonePlaceholder,
  phonePatternInfo,
  selectedCountry,
}: OrgEditContactModalProps) {
  return (
    <>
      {/* POPUP 3: Edit Phone Number */}
      {showPhoneModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Phone className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Phone Number</CardTitle>
                <CardDescription className="text-xs">Update organization main primary phone contact.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-4">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Phone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="text"
                        defaultValue={organization.phoneNumber || ""}
                        placeholder={phonePlaceholder}
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                    {phonePatternInfo && (
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        Expected format for {selectedCountry}: <span className="font-mono text-foreground font-semibold">{phonePatternInfo.placeholder}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowPhoneModal)} disabled={isPending}>
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

      {/* POPUP 3.5: Edit Website */}
      {showWebsiteModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Globe className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Website</CardTitle>
                <CardDescription className="text-xs">Update organization official website URL address.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />
              <input type="hidden" name="phoneNumber" value={organization.phoneNumber || ""} />
              <input type="hidden" name="description" value={organization.description || ""} />

              <CardContent className="p-6 space-y-4">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="website" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Website
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        defaultValue={organization.website || ""}
                        placeholder="https://example.com"
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      (e.g., https://example.com)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowWebsiteModal)} disabled={isPending}>
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

      {/* POPUP 3.6: Edit Facebook */}
      {showFacebookModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Globe className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Facebook Page</CardTitle>
                <CardDescription className="text-xs">Update organization official Facebook URL.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-4">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="facebook" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Facebook URL
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="facebook"
                        name="facebook"
                        type="url"
                        defaultValue={organization.facebook || ""}
                        placeholder="https://facebook.com/yourpage"
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      (e.g., https://facebook.com/yourpage)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowFacebookModal)} disabled={isPending}>
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

      {/* POPUP 3.7: Edit Instagram */}
      {showInstagramModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Globe className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Instagram Profile</CardTitle>
                <CardDescription className="text-xs">Update organization official Instagram URL.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-4">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="instagram" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Instagram URL
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="instagram"
                        name="instagram"
                        type="url"
                        defaultValue={organization.instagram || ""}
                        placeholder="https://instagram.com/yourpage"
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      (e.g., https://instagram.com/yourpage)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowInstagramModal)} disabled={isPending}>
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

      {/* POPUP 3.8: Edit TikTok */}
      {showTikTokModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Globe className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit TikTok Profile</CardTitle>
                <CardDescription className="text-xs">Update organization official TikTok URL.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-4">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tiktok" className="text-sm font-medium normal-case text-muted-foreground/80">
                      TikTok URL
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="tiktok"
                        name="tiktok"
                        type="url"
                        defaultValue={organization.tiktok || ""}
                        placeholder="https://tiktok.com/@yourprofile"
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      (e.g., https://tiktok.com/@yourprofile)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowTikTokModal)} disabled={isPending}>
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

      {/* POPUP 3.9: Edit LinkedIn */}
      {showLinkedinModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-md shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Globe className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit LinkedIn Profile</CardTitle>
                <CardDescription className="text-xs">Update organization official LinkedIn URL.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-4">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="linkedin" className="text-sm font-medium normal-case text-muted-foreground/80">
                      LinkedIn URL
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        defaultValue={organization.linkedin || ""}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="pl-9 focus-visible:ring-primary/20"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      (e.g., https://linkedin.com/in/yourprofile)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowLinkedinModal)} disabled={isPending}>
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
