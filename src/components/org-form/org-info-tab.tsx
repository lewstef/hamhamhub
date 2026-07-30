"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ChevronRight, User } from "lucide-react";
import { Organization } from "./types";

interface OrgInfoTabProps {
  organization: Organization;
  selectedCategoryName: string;
  formattedRegistrationDate: string;
  isPending: boolean;
  onOpenNameModal: () => void;
  onOpenEmailModal: () => void;
  onOpenPhoneModal: () => void;
  onOpenWebsiteModal: () => void;
  onOpenFacebookModal: () => void;
  onOpenInstagramModal: () => void;
  onOpenTikTokModal: () => void;
  onOpenLinkedinModal: () => void;
  onOpenDescriptionModal: () => void;
  onOpenCategoryModal: () => void;
  renderLinkValue: (value: string | null | undefined, type?: "link" | "email" | "phone") => React.ReactNode;
}

export function OrgInfoTab({
  organization,
  selectedCategoryName,
  formattedRegistrationDate,
  isPending,
  onOpenNameModal,
  onOpenEmailModal,
  onOpenPhoneModal,
  onOpenWebsiteModal,
  onOpenFacebookModal,
  onOpenInstagramModal,
  onOpenTikTokModal,
  onOpenLinkedinModal,
  onOpenDescriptionModal,
  onOpenCategoryModal,
  renderLinkValue,
}: OrgInfoTabProps) {
  return (
    <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
      <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <User className="size-5" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Information</CardTitle>
      </div>
      <CardContent className="p-0">
        <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
          Manage your basic organization profile details
        </div>
        <div className="divide-y divide-border/50">
          {/* Name Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Name</span>
              <span className="text-sm font-semibold text-foreground truncate">{organization.name}</span>
            </div>
            <button
              type="button"
              onClick={onOpenNameModal}
              aria-label="Edit Name"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Name"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Email Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Email</span>
              {renderLinkValue(organization.email, "email")}
            </div>
            <button
              type="button"
              onClick={onOpenEmailModal}
              aria-label="Edit Email"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Email"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Phone Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Phone</span>
              {renderLinkValue(organization.phoneNumber, "phone")}
            </div>
            <button
              type="button"
              onClick={onOpenPhoneModal}
              aria-label="Edit Phone"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Phone"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Website Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group border-t border-border/40">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Website</span>
              {renderLinkValue(organization.website, "link")}
            </div>
            <button
              type="button"
              onClick={onOpenWebsiteModal}
              aria-label="Edit Website"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Website"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Facebook Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group border-t border-border/40">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Facebook</span>
              {renderLinkValue(organization.facebook, "link")}
            </div>
            <button
              type="button"
              onClick={onOpenFacebookModal}
              aria-label="Edit Facebook"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Facebook"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Instagram Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group border-t border-border/40">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Instagram</span>
              {renderLinkValue(organization.instagram, "link")}
            </div>
            <button
              type="button"
              onClick={onOpenInstagramModal}
              aria-label="Edit Instagram"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Instagram"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* TikTok Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group border-t border-border/40">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">TikTok</span>
              {renderLinkValue(organization.tiktok, "link")}
            </div>
            <button
              type="button"
              onClick={onOpenTikTokModal}
              aria-label="Edit TikTok"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit TikTok"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* LinkedIn Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group border-t border-border/40">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">LinkedIn</span>
              {renderLinkValue(organization.linkedin, "link")}
            </div>
            <button
              type="button"
              onClick={onOpenLinkedinModal}
              aria-label="Edit LinkedIn"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit LinkedIn"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Description Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Description</span>
              <span className="text-sm text-foreground/90 font-medium truncate max-w-xs sm:max-w-md md:max-w-lg">
                {organization.description ? organization.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "-" : "-"}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenDescriptionModal}
              aria-label="Edit Description"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Description"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Category Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Category</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {selectedCategoryName}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenCategoryModal}
              aria-label="Edit Category"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Category"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Member since Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 text-left">
            <div className="flex flex-1 items-center">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Member since</span>
              <span className="text-sm text-foreground/90 font-medium">{formattedRegistrationDate}</span>
            </div>
          </div>

          {/* Subscription Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 text-left">
            <div className="flex flex-1 items-center">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80">Subscription</span>
              <span className="text-sm text-foreground/90 font-medium">-</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
