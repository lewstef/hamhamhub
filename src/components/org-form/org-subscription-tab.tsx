"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Sparkles,
  CreditCard,
  Download,
  ShieldCheck,
  Zap,
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight,
  Receipt,
  Check,
  Star,
} from "lucide-react";
import type { Organization } from "./types";

interface OrgSubscriptionTabProps {
  organization?: Organization;
}

interface PlanTier {
  id: string;
  name: string;
  priceMonthly: string;
  priceAnnually: string;
  description: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

const SUBSCRIPTION_PLANS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: "0 RON / mo",
    priceAnnually: "0 RON / yr",
    description: "Essential listing & direct inquiry features for local dog professionals.",
    features: [
      "1 Active Service Category",
      "Up to 3 Course / Service Offerings",
      "Standard Directory Listing",
      "Direct Client Inquiries & Contact Info",
      "Community Support",
    ],
  },
  {
    id: "pro",
    name: "Professional",
    priceMonthly: "149 RON / mo",
    priceAnnually: "1,490 RON / yr",
    description: "Full suite of management tools, multi-neighborhood coverage, and verified status.",
    popular: true,
    badge: "Most Popular",
    features: [
      "All Service Categories (Training, Boarding, Walking, Sitting, Grooming)",
      "Unlimited Courses & Service Listings",
      "Primary & Secondary City Coverage Zones",
      "Verified Organization Badge Eligibility",
      "Weekly Schedule & Special Closures Builder",
      "Detailed Client Care Protocols & Reports",
      "Priority Search Placement in Directory",
      "Priority Email & Chat Support",
    ],
  },
  {
    id: "enterprise",
    name: "Kennel & School Enterprise",
    priceMonthly: "299 RON / mo",
    priceAnnually: "2,990 RON / yr",
    description: "Dedicated branding, staff management, and custom integrations for high-volume kennels.",
    badge: "Enterprise",
    features: [
      "Everything in Professional",
      "Unlimited Staff & Employee Accounts",
      "Featured Top-of-City Placement",
      "Custom Direct Booking Widgets",
      "Dedicated Account Manager & Onboarding",
      "Custom Contract & Invoice Customization",
    ],
  },
];

interface MockInvoice {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: "Paid" | "Processing" | "Pending";
  planName: string;
}

const MOCK_INVOICES: MockInvoice[] = [
  {
    id: "inv-001",
    number: "HHH-2026-0042",
    date: "15 Jul 2026",
    amount: "149.00 RON",
    status: "Paid",
    planName: "Professional Plan — Monthly",
  },
  {
    id: "inv-002",
    number: "HHH-2026-0018",
    date: "15 Jun 2026",
    amount: "149.00 RON",
    status: "Paid",
    planName: "Professional Plan — Monthly",
  },
  {
    id: "inv-003",
    number: "HHH-2026-0003",
    date: "15 May 2026",
    amount: "149.00 RON",
    status: "Paid",
    planName: "Professional Plan — Monthly",
  },
];

/**
 * OrgSubscriptionTab Component
 *
 * Renders the organization subscription details, active plan status, feature limits,
 * tier upgrade cards, and invoice history table.
 */
export function OrgSubscriptionTab({ organization }: OrgSubscriptionTabProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [currentPlanId, setCurrentPlanId] = useState<string>("pro");
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<string | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const activePlan = SUBSCRIPTION_PLANS.find((p) => p.id === currentPlanId) || SUBSCRIPTION_PLANS[1];

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlanId) return;
    setSelectedPlanForUpgrade(planId);
  };

  const handleConfirmPlanChange = () => {
    if (!selectedPlanForUpgrade) return;
    setIsChangingPlan(true);
    setTimeout(() => {
      setCurrentPlanId(selectedPlanForUpgrade);
      setSelectedPlanForUpgrade(null);
      setIsChangingPlan(false);
      setNotificationMsg(`Successfully switched to the ${SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanForUpgrade)?.name} plan.`);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Notification Toast */}
      {notificationMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{notificationMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationMsg(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* ── CURRENT PLAN OVERVIEW CARD ── */}
      <Card className="border border-border/80 shadow-sm rounded-2xl bg-card overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border-b border-border/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-primary/10 text-primary border-primary/25 rounded-full">
                  <Zap className="size-3 mr-1 fill-primary" /> Active Subscription
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Clock className="size-3.5" /> Renews on 15 Sep 2026
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
                {activePlan.name} Tier
                {activePlan.popular && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Pro Verified
                  </span>
                )}
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                {activePlan.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 bg-card/60 backdrop-blur-sm p-4 rounded-xl border border-border/60 min-w-[200px]">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Current Billing Rate
                </span>
                <span className="text-xl font-black text-foreground">
                  {billingCycle === "monthly" ? activePlan.priceMonthly : activePlan.priceAnnually}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-3 mr-1" /> Active &amp; Verified
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-border/70 bg-muted/10 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Active Services
              </span>
              <p className="text-lg font-black text-foreground">Unlimited</p>
              <p className="text-[11px] text-muted-foreground">All 5 service domains enabled</p>
            </div>
            <div className="p-4 rounded-xl border border-border/70 bg-muted/10 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Coverage Zones
              </span>
              <p className="text-lg font-black text-foreground">Multi-City</p>
              <p className="text-[11px] text-muted-foreground">Primary &amp; secondary zones</p>
            </div>
            <div className="p-4 rounded-xl border border-border/70 bg-muted/10 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Verification Badge
              </span>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="size-5" /> Eligible
              </p>
              <p className="text-[11px] text-muted-foreground">Trust badge in search</p>
            </div>
            <div className="p-4 rounded-xl border border-border/70 bg-muted/10 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Directory Placement
              </span>
              <p className="text-lg font-black text-foreground flex items-center gap-1.5">
                <Star className="size-4 text-amber-500 fill-amber-500" /> Priority
              </p>
              <p className="text-[11px] text-muted-foreground">Ranked above free listings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── PLAN SELECTION / UPGRADE TIERS ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="size-4.5 text-primary" />
              Subscription Plans &amp; Tiers
            </h3>
            <p className="text-xs text-muted-foreground">
              Select the plan that fits the scale of your dog business, training school, or boarding facility.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/70 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annually")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "annually"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual Billing
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <Card
                key={plan.id}
                className={`relative rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? "border-primary bg-primary/[0.02] shadow-md ring-2 ring-primary/20"
                    : plan.popular
                    ? "border-primary/40 bg-card shadow-sm hover:border-primary/60"
                    : "border-border/80 bg-card hover:border-border"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-primary text-primary-foreground shadow-xs">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <CardHeader className="pt-7 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-black text-foreground">
                      {plan.name}
                    </CardTitle>
                    {isCurrent && (
                      <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground min-h-[32px] pt-1">
                    {plan.description}
                  </CardDescription>
                  <div className="pt-3 pb-1">
                    <span className="text-2xl font-black text-foreground tracking-tight">
                      {billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnually}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-6 flex-1">
                  <div className="h-px bg-border/50 mb-3" />
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Included Features:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium">
                        <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-2 pb-6 border-t border-border/40">
                  <Button
                    type="button"
                    variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrent}
                    className={`w-full font-bold text-xs h-10 rounded-xl cursor-pointer ${
                      isCurrent ? "opacity-75 cursor-default" : ""
                    }`}
                  >
                    {isCurrent ? "Current Active Plan" : `Switch to ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── BILLING HISTORY & INVOICES ── */}
      <Card className="border border-border/80 shadow-sm rounded-2xl bg-card">
        <CardHeader className="p-6 pb-4 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Receipt className="size-4.5 text-primary" />
                Billing History &amp; Invoices
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Download past invoices, receipts, and VAT payment statements for tax compliance.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg gap-1.5 self-start sm:self-auto">
              <CreditCard className="size-3.5" /> Update Payment Method
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Plan / Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/15 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-foreground">
                      {inv.number}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-medium">
                      {inv.date}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {inv.planName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {inv.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="secondary" className="text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] font-semibold text-muted-foreground hover:text-foreground gap-1 px-2.5 rounded-lg"
                        onClick={() => alert(`Downloading invoice ${inv.number}...`)}
                      >
                        <Download className="size-3.5" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── PLAN CHANGE CONFIRMATION MODAL ── */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 relative">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Confirm Plan Change
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                You are switching your organization subscription to:
              </p>
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-1.5">
                <p className="text-sm font-black text-foreground">
                  {SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanForUpgrade)?.name} Tier
                </p>
                <p className="text-xs font-bold text-primary">
                  {billingCycle === "monthly"
                    ? SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanForUpgrade)?.priceMonthly
                    : SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanForUpgrade)?.priceAnnually}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanForUpgrade)?.description}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your new billing rate will take effect immediately. Any prorated amounts will be adjusted on your next billing statement.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedPlanForUpgrade(null)}
                disabled={isChangingPlan}
                className="rounded-xl h-9 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmPlanChange}
                disabled={isChangingPlan}
                className="rounded-xl h-9 text-xs font-semibold gap-1.5"
              >
                {isChangingPlan ? "Updating..." : "Confirm & Update Plan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
