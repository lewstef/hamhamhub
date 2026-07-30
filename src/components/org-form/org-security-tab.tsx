"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ChevronRight, Mail } from "lucide-react";
import { Organization } from "./types";

interface OrgSecurityTabProps {
  organization: Organization;
  isPending: boolean;
  onOpenEmailModal: () => void;
  onOpenRecoveryEmailModal: () => void;
  onOpenPasswordModal: () => void;
  renderLinkValue: (value: string | null | undefined, type?: "link" | "email" | "phone") => React.ReactNode;
}

export function OrgSecurityTab({
  organization,
  isPending,
  onOpenEmailModal,
  onOpenRecoveryEmailModal,
  onOpenPasswordModal,
  renderLinkValue,
}: OrgSecurityTabProps) {
  return (
    <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
      <div className="px-6 py-4.5 border-b border-border flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Mail className="size-5" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">Security</CardTitle>
      </div>
      <CardContent className="p-0">
        <div className="px-6 py-4 text-xs font-semibold text-muted-foreground/80 border-b border-border/50 bg-muted/5">
          Manage your login credentials, recovery email, and security settings
        </div>
        <div className="divide-y divide-border/50">
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

          {/* Recovery Email Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Recovery email</span>
              {renderLinkValue(organization.recoveryEmail, "email")}
            </div>
            <button
              type="button"
              onClick={onOpenRecoveryEmailModal}
              aria-label="Edit Recovery email"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Recovery email"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Password Row */}
          <div className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left group">
            <div className="flex flex-1 items-center min-w-0 pr-4">
              <span className="w-1/3 sm:w-64 text-sm font-medium text-muted-foreground/80 shrink-0">Password</span>
              <span className="text-sm font-mono text-foreground/80">••••••••</span>
            </div>
            <button
              type="button"
              onClick={onOpenPasswordModal}
              aria-label="Edit Password"
              disabled={isPending}
              className="p-1.5 -mr-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer group/edit focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              title="Edit Password"
            >
              <ChevronRight className="size-4.5 text-primary opacity-80 group-hover/edit:opacity-100 group-hover/edit:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
