"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User, ChevronDown, X, Check } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  organizationCategory: string | null;
  billingCompanyName?: string | null;
  billingTaxId?: string | null;
  billingTradeRegistryNumber?: string | null;
  billingEuid?: string | null;
  billingBankAccountNumber?: string | null;
  billingBankName?: string | null;
  billingContactName?: string | null;
  billingContactPhone?: string | null;
  billingContactEmail?: string | null;
  billingSecondaryContactName?: string | null;
  billingSecondaryContactPhone?: string | null;
  billingSecondaryContactEmail?: string | null;
}

interface OrgEditBillingModalProps {
  showBillingModal: boolean;
  showPrimaryContactModal: boolean;
  showSecondaryContactModal: boolean;
  onCloseModal: (setter: React.Dispatch<React.SetStateAction<boolean>>) => void;
  setShowBillingModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPrimaryContactModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSecondaryContactModal: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseAllModals: () => void;
  organization: Organization;
  personalAction: (payload: FormData) => void;
  personalError: string | null;
  isPending: boolean;
  bankDropdownRef: React.RefObject<HTMLDivElement | null>;
  editBank: string;
  setEditBank: (val: string) => void;
  bankSearch: string;
  setBankSearch: (val: string) => void;
  showBankDropdown: boolean;
  setShowBankDropdown: (val: boolean) => void;
  filteredBanks: string[];
  bankHighlightIndex: number;
  setBankHighlightIndex: (val: number) => void;
  handleBankKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function OrgEditBillingModal({
  showBillingModal,
  showPrimaryContactModal,
  showSecondaryContactModal,
  onCloseModal,
  setShowBillingModal,
  setShowPrimaryContactModal,
  setShowSecondaryContactModal,
  onCloseAllModals,
  organization,
  personalAction,
  personalError,
  isPending,
  bankDropdownRef,
  editBank,
  setEditBank,
  bankSearch,
  setBankSearch,
  showBankDropdown,
  setShowBankDropdown,
  filteredBanks,
  bankHighlightIndex,
  setBankHighlightIndex,
  handleBankKeyDown,
}: OrgEditBillingModalProps) {
  return (
    <>
      {/* POPUP 6: Edit Billing Details */}
      {showBillingModal && (
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
                <CardTitle className="text-base font-semibold">Edit Company details</CardTitle>
                <CardDescription className="text-xs">Update your organization billing details used on invoices.</CardDescription>
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
                    <Label htmlFor="billingCompanyName" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Company name <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingCompanyName"
                      name="billingCompanyName"
                      type="text"
                      key={organization.billingCompanyName || ""}
                      defaultValue={organization.billingCompanyName || ""}
                      required
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingTaxId" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Tax ID <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingTaxId"
                      name="billingTaxId"
                      type="text"
                      key={organization.billingTaxId || ""}
                      defaultValue={organization.billingTaxId || ""}
                      required
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingTradeRegistryNumber" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Trade Registry Number <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingTradeRegistryNumber"
                      name="billingTradeRegistryNumber"
                      type="text"
                      key={organization.billingTradeRegistryNumber || ""}
                      defaultValue={organization.billingTradeRegistryNumber || ""}
                      placeholder="J40/1234/2020"
                      required
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingEuid" className="text-sm font-medium normal-case text-muted-foreground/80">
                      EUID <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingEuid"
                      name="billingEuid"
                      type="text"
                      key={organization.billingEuid || ""}
                      defaultValue={organization.billingEuid || ""}
                      required
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  {/* Bank select with suggestions */}
                  <div className="space-y-1.5 relative" ref={bankDropdownRef}>
                    <Label htmlFor="billingBankName" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Bank
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                      <Input
                        id="billingBankName"
                        name="billingBankName"
                        type="text"
                        value={bankSearch}
                        onChange={(e) => {
                          setBankSearch(e.target.value);
                          setEditBank(e.target.value);
                          setShowBankDropdown(true);
                        }}
                        onFocus={() => setShowBankDropdown(true)}
                        onKeyDown={handleBankKeyDown}
                        placeholder="Search or select bank..."
                        className="pl-9 pr-10 focus-visible:ring-primary/20"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {bankSearch && (
                          <button
                            type="button"
                            aria-label="Clear bank selection"
                            onClick={() => {
                              setBankSearch("");
                              setEditBank("");
                              setShowBankDropdown(false);
                            }}
                            className="text-muted-foreground/60 hover:text-foreground/90 transition-colors p-0.5"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                        <ChevronDown className="size-4 text-muted-foreground/60 pointer-events-none" />
                      </div>
                    </div>

                    {showBankDropdown && filteredBanks.length > 0 && (
                      <div className="absolute z-50 w-full mt-1.5 bg-popover border border-border/80 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200 p-1.5 backdrop-blur-md">
                        {filteredBanks.map((b, index) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setEditBank(b);
                              setBankSearch(b);
                              setShowBankDropdown(false);
                            }}
                            onMouseEnter={() => setBankHighlightIndex(index)}
                            className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 focus:outline-none flex items-center justify-between font-medium cursor-pointer mb-0.5 last:mb-0 ${
                              bankHighlightIndex === index
                                ? "bg-accent text-accent-foreground"
                                : "text-popover-foreground hover:bg-accent/80 hover:text-accent-foreground"
                            }`}
                          >
                            <span>{b}</span>
                            {editBank === b && <Check className="size-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingBankAccountNumber" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Bank Account Number
                    </Label>
                    <Input
                      id="billingBankAccountNumber"
                      name="billingBankAccountNumber"
                      type="text"
                      key={organization.billingBankAccountNumber || ""}
                      defaultValue={organization.billingBankAccountNumber || ""}
                      className="focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowBillingModal)} disabled={isPending}>
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

      {/* POPUP 7: Edit Primary Contact Details */}
      {showPrimaryContactModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-lg shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <User className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Primary Contact</CardTitle>
                <CardDescription className="text-xs">Update your organization's primary contact details.</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-6">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingContactName" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Name <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingContactName"
                      name="billingContactName"
                      type="text"
                      key={organization.billingContactName || ""}
                      defaultValue={organization.billingContactName || ""}
                      required
                      placeholder="e.g. Jane Doe"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingContactPhone" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Phone <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingContactPhone"
                      name="billingContactPhone"
                      type="text"
                      key={organization.billingContactPhone || ""}
                      defaultValue={organization.billingContactPhone || ""}
                      required
                      placeholder="0723456789"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingContactEmail" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Email <span className="text-destructive font-semibold">*</span>
                    </Label>
                    <Input
                      id="billingContactEmail"
                      name="billingContactEmail"
                      type="email"
                      key={organization.billingContactEmail || ""}
                      defaultValue={organization.billingContactEmail || ""}
                      required
                      placeholder="jane@organization.org"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowPrimaryContactModal)} disabled={isPending}>
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

      {/* POPUP 8: Edit Secondary Contact Details */}
      {showSecondaryContactModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAllModals();
          }}
        >
          <Card className="w-full max-w-lg shadow-2xl relative border border-border animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <User className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">Edit Secondary Contact</CardTitle>
                <CardDescription className="text-xs">Update your organization's secondary contact details (optional).</CardDescription>
              </div>
            </CardHeader>
            <form action={personalAction}>
              <input type="hidden" name="id" value={organization.id} />
              <input type="hidden" name="name" value={organization.name} />
              <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />

              <CardContent className="p-6 space-y-6">
                {personalError && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {personalError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="billingSecondaryContactName" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Name
                    </Label>
                    <Input
                      id="billingSecondaryContactName"
                      name="billingSecondaryContactName"
                      type="text"
                      key={organization.billingSecondaryContactName || ""}
                      defaultValue={organization.billingSecondaryContactName || ""}
                      placeholder="e.g. John Smith"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingSecondaryContactPhone" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Phone
                    </Label>
                    <Input
                      id="billingSecondaryContactPhone"
                      name="billingSecondaryContactPhone"
                      type="text"
                      key={organization.billingSecondaryContactPhone || ""}
                      defaultValue={organization.billingSecondaryContactPhone || ""}
                      placeholder="0723456789"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billingSecondaryContactEmail" className="text-sm font-medium normal-case text-muted-foreground/80">
                      Email
                    </Label>
                    <Input
                      id="billingSecondaryContactEmail"
                      name="billingSecondaryContactEmail"
                      type="email"
                      key={organization.billingSecondaryContactEmail || ""}
                      defaultValue={organization.billingSecondaryContactEmail || ""}
                      placeholder="john@organization.org"
                      className="focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="outline" onClick={() => onCloseModal(setShowSecondaryContactModal)} disabled={isPending}>
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
