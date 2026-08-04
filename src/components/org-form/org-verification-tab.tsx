"use client";

import { useState, useTransition } from "react";
import { Organization, OrganizationCategory } from "./types";
import { requestOrganizationVerificationAction, updateOrganizationVerificationStatusAction } from "@/app/actions/organizations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  FileCheck,
  Building2,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Send,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface OrgVerificationTabProps {
  organization: Organization;
  organizationCategoryList: OrganizationCategory[];
  isBackoffice?: boolean;
}

/**
 * OrgVerificationTab Component
 *
 * Renders the Category Verification guide, status overview, verification request submission form,
 * and backoffice admin controls.
 *
 * Used in both `/dashboard/account/verification` and `/backoffice/organizations/verification/[id]`.
 *
 * @param {OrgVerificationTabProps} props - Component props.
 * @returns {React.ReactElement} Verification tab content.
 */
export function OrgVerificationTab({
  organization,
  organizationCategoryList,
  isBackoffice = false,
}: OrgVerificationTabProps) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<{ success?: string; error?: string } | null>(null);

  const categoryName =
    organizationCategoryList.find((c) => c.id === organization.organizationCategory)?.name ||
    organization.organizationCategory ||
    "General";

  const status = organization.verificationStatus || "unverified";

  const handleRequestVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await requestOrganizationVerificationAction(organization.id, notes);
      if (res.error) {
        setFeedback({ error: res.error });
      } else if (res.message) {
        setFeedback({ success: res.message });
      }
    });
  };

  const handleAdminUpdateStatus = (newStatus: "unverified" | "pending" | "verified") => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateOrganizationVerificationStatusAction(organization.id, newStatus);
      if (res.error) {
        setFeedback({ error: res.error });
      } else if (res.message) {
        setFeedback({ success: res.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                Category Verification
              </h2>
              {status === "verified" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="size-3.5" />
                  Verified Provider
                </span>
              )}
              {status === "pending" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Clock className="size-3.5" />
                  Under Review
                </span>
              )}
              {status === "unverified" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                  Not Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Official trust accreditation for {organization.name} in the <strong className="text-foreground">{categoryName}</strong> category.
            </p>
          </div>

          {/* Admin Controls in Backoffice */}
          {isBackoffice && (
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              {status !== "verified" && (
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={isPending}
                  onClick={() => handleAdminUpdateStatus("verified")}
                  className="h-9 px-4 font-bold text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  {isPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="size-3.5 mr-1.5" />}
                  Approve Verification
                </Button>
              )}
              {status === "pending" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleAdminUpdateStatus("unverified")}
                  className="h-9 px-3 font-semibold text-xs rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <XCircle className="size-3.5 mr-1.5" />
                  Reject Request
                </Button>
              )}
              {status === "verified" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleAdminUpdateStatus("unverified")}
                  className="h-9 px-3 font-semibold text-xs rounded-xl text-muted-foreground hover:text-destructive"
                >
                  Revoke Verification
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Status Alert Banner */}
        {feedback?.error && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs font-semibold">
            <AlertCircle className="size-4 shrink-0" />
            <span>{feedback.error}</span>
          </div>
        )}

        {feedback?.success && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{feedback.success}</span>
          </div>
        )}

        {status === "verified" && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
              <CheckCircle2 className="size-4.5" />
              Verified Provider Status Active
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your organization has been officially verified for the <strong>{categoryName}</strong> category. The Verified Provider Badge is active on your public profile and service listings, granting higher search priority and client trust.
            </p>
          </div>
        )}

        {status === "pending" && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
              <Clock className="size-4.5" />
              Verification Request Submitted &amp; Under Review
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your verification request was submitted on{" "}
              <strong>
                {organization.verificationRequestedAt
                  ? new Date(organization.verificationRequestedAt).toLocaleString()
                  : "recently"}
              </strong>
              . Our review team is validating your contact details and category credentials. An email update will be sent upon completion.
            </p>
            {organization.verificationNotes && (
              <div className="pt-2 border-t border-amber-500/20 text-xs">
                <span className="font-semibold text-amber-700">Submitted Notes:</span>
                <p className="italic text-muted-foreground mt-0.5 bg-background/50 p-2.5 rounded-lg border border-border/50">
                  &ldquo;{organization.verificationNotes}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3-Step Process Explanation Card */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            How Category Verification Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileCheck className="size-3.5 text-primary" />
                  Legal &amp; Credentials Check
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Verification of CUI/CIF business registration, official certificates, licenses, or professional qualifications for {categoryName}.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary" />
                  Facility &amp; Safety Audit
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Validation of physical address, dedicated training fields, boarding amenities, key access protocols, or coverage zone radii.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Award className="size-3.5 text-primary" />
                  Verified Badge &amp; Top Search
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Earn the prominent Verified Badge (`Verified Provider`) on all listings, boosting booking conversion rates and category search rankings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Profile Summary & Request Form */}
      {status !== "verified" && (
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5">
          <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
            <h3 className="text-base font-bold text-foreground">
              {status === "pending" ? "Submitted Verification Profile" : "Submit Verification Request"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {status === "pending"
                ? "The parameters below were submitted for validation to stefan.wrabeli@gmail.com."
                : "Review your organization contact profile below and click submit to dispatch your verification request."}
            </p>
          </div>

          {/* Profile Overview Card */}
          <div className="p-4 rounded-xl border border-border/70 bg-muted/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Organization Name</span>
              <p className="font-semibold text-foreground">{organization.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Business Category</span>
              <p className="font-semibold text-foreground">{categoryName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contact Email</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="size-3 text-muted-foreground" />
                {organization.email || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="size-3 text-muted-foreground" />
                {organization.phoneNumber || "—"}
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Headquarters Address</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="size-3 text-muted-foreground" />
                {organization.addressCity ? `${organization.addressCity}, ${organization.addressLine || ""}` : organization.address || "—"}
              </p>
            </div>
          </div>

          {/* Request Form */}
          {status === "unverified" && (
            <form onSubmit={handleRequestVerification} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="verification-notes" className="text-xs font-semibold flex items-center justify-between">
                  <span>Additional Accreditation Notes (Optional)</span>
                  <span className="text-[11px] text-muted-foreground font-normal">CUI/CIF, certificates, website links</span>
                </Label>
                <textarea
                  id="verification-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. CUI RO12345678, Certified Dog Trainer Diploma #8472, Link to ANSVSA boarding permit..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                  Submitting will send an automated notification to <strong>stefan.wrabeli@gmail.com</strong>.
                </p>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-10 px-6 font-bold text-xs rounded-xl shadow-md shadow-primary/10 shrink-0"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-2" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5 mr-2" />
                      Request Category Verification
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
