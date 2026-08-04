"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Building, ChevronRight, User } from "lucide-react";
import { Organization } from "./types";

interface OrgBillingTabProps {
  organization: Organization;
  isPending: boolean;
  onOpenBillingModal: () => void;
  onOpenAddressModal: () => void;
  onOpenPrimaryContactModal: () => void;
  onOpenSecondaryContactModal: () => void;
  renderLinkValue: (value: string | null | undefined, type?: "link" | "email" | "phone") => React.ReactNode;
}

export function OrgBillingTab({
  organization,
  isPending,
  onOpenBillingModal,
  onOpenAddressModal,
  onOpenPrimaryContactModal,
  onOpenSecondaryContactModal,
  renderLinkValue,
}: OrgBillingTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
      {/* CARD 1.2: Billing info */}
      <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
        <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Building className="size-5" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">Billing details</CardTitle>
        </div>
        <CardContent className="p-0">
          <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
            Official company invoicing information and bank details
          </div>
          <div className="divide-y divide-border/50">
            {/* Company Name Row */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Company Name</span>
                <span className="text-sm text-foreground/90 font-medium truncate">{organization.billingCompanyName || "-"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenBillingModal}
                aria-label="Edit Billing Company Name"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Billing Company Name"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Tax ID Row */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">CUI / CIF</span>
                <span className="text-sm text-foreground/90 font-medium truncate">{organization.billingTaxId || "-"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenBillingModal}
                aria-label="Edit Billing Tax ID"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Billing Tax ID"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Trade Registry Number Row */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Trade Registry Reg No.</span>
                <span className="text-sm text-foreground/90 font-medium truncate">{organization.billingTradeRegistryNumber || "-"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenBillingModal}
                aria-label="Edit Billing Trade Registry Number"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Billing Trade Registry Number"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* EUID Row */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">EUID</span>
                <span className="text-sm text-foreground/90 font-medium truncate">{organization.billingEuid || "-"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenBillingModal}
                aria-label="Edit Billing EUID"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Billing EUID"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Address Row */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Address</span>
                <span className="text-sm text-foreground/90 font-medium truncate">{organization.address || "-"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenAddressModal}
                aria-label="Edit Address"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Address"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Bank Row */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Bank</span>
                <span className="text-sm text-foreground/90 font-medium truncate">{organization.billingBankName || "-"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenBillingModal}
                aria-label="Edit Billing Bank"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Billing Bank"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Bank Account Number Row */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Bank Account Number</span>
                <span className="text-sm text-foreground/90 font-medium truncate">{organization.billingBankAccountNumber || "-"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenBillingModal}
                aria-label="Edit Billing Bank Account Number"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Billing Bank Account Number"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 1.3: Contact details */}
      <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
        <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <User className="size-5" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">Contact information</CardTitle>
        </div>
        <CardContent className="p-0">
          <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
            Primary and secondary contact persons for this organization
          </div>

          {/* Primary Contact Person Section */}
          <div className="px-6 py-2.5 bg-muted/20 border-b border-border/50 text-xs font-bold text-muted-foreground/90">
            Primary Contact Person
          </div>
          <div className="divide-y divide-border/50 border-b border-border/50">
            {/* Primary Contact Name */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Name</span>
                <span className="text-sm text-foreground/90 font-medium truncate">{organization.billingContactName || "-"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenPrimaryContactModal}
                aria-label="Edit Primary Contact Person Name"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Primary Contact Person Name"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Primary Contact Phone */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Phone</span>
                {renderLinkValue(organization.billingContactPhone, "phone")}
              </div>
              <button
                type="button"
                onClick={onOpenPrimaryContactModal}
                aria-label="Edit Primary Contact Person Phone"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Primary Contact Person Phone"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Primary Contact Email */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Email</span>
                {renderLinkValue(organization.billingContactEmail, "email")}
              </div>
              <button
                type="button"
                onClick={onOpenPrimaryContactModal}
                aria-label="Edit Primary Contact Person Email"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Primary Contact Person Email"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Secondary Contact Person Section */}
          <div className="px-6 py-2.5 bg-muted/20 border-b border-border/50 text-xs font-bold text-muted-foreground/90 flex items-center justify-between">
            <span>Secondary Contact Person</span>
            <span className="text-[10px] font-normal normal-case text-muted-foreground/70">(Optional)</span>
          </div>
          <div className="divide-y divide-border/50">
            {/* Secondary Contact Name */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Name</span>
                <span className="text-sm text-foreground/90 font-medium truncate">{organization.billingSecondaryContactName || "-"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenSecondaryContactModal}
                aria-label="Edit Secondary Contact Person Name"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Secondary Contact Person Name"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Secondary Contact Phone */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Phone</span>
                {renderLinkValue(organization.billingSecondaryContactPhone, "phone")}
              </div>
              <button
                type="button"
                onClick={onOpenSecondaryContactModal}
                aria-label="Edit Secondary Contact Person Phone"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Secondary Contact Person Phone"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Secondary Contact Email */}
            <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
              <div className="flex flex-1 items-center min-w-0 pr-4">
                <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Email</span>
                {renderLinkValue(organization.billingSecondaryContactEmail, "email")}
              </div>
              <button
                type="button"
                onClick={onOpenSecondaryContactModal}
                aria-label="Edit Secondary Contact Person Email"
                disabled={isPending}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Edit Secondary Contact Person Email"
              >
                <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
