"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MapPin, Map, Home, Hash, ChevronDown, X, Check } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  organizationCategory: string | null;
  phoneNumber?: string | null;
  addressLine?: string | null;
  addressZip?: string | null;
}

interface OrgEditAddressModalProps {
  showAddressModal: boolean;
  onCloseModal: (setter: React.Dispatch<React.SetStateAction<boolean>>) => void;
  setShowAddressModal: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseAllModals: () => void;
  organization: Organization;
  personalAction: (payload: FormData) => void;
  personalError: string | null;
  isPending: boolean;
  countyDropdownRef: React.RefObject<HTMLDivElement | null>;
  editCounty: string;
  setEditCounty: (val: string) => void;
  countySearch: string;
  setCountySearch: (val: string) => void;
  showCountyDropdown: boolean;
  setShowCountyDropdown: (val: boolean) => void;
  filteredCounties: string[];
  countyHighlightIndex: number;
  setCountyHighlightIndex: (val: number) => void;
  selectCounty: (countyName: string) => void;
  handleCountyKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  localityDropdownRef: React.RefObject<HTMLDivElement | null>;
  localityInputRef: React.RefObject<HTMLInputElement | null>;
  editLocality: string;
  setEditLocality: (val: string) => void;
  localitySearch: string;
  setLocalitySearch: (val: string) => void;
  showLocalityDropdown: boolean;
  setShowLocalityDropdown: (val: boolean) => void;
  filteredLocalities: string[];
  localityHighlightIndex: number;
  setLocalityHighlightIndex: (val: number) => void;
  handleLocalityKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function OrgEditAddressModal({
  showAddressModal,
  onCloseModal,
  setShowAddressModal,
  onCloseAllModals,
  organization,
  personalAction,
  personalError,
  isPending,
  countyDropdownRef,
  editCounty,
  setEditCounty,
  countySearch,
  setCountySearch,
  showCountyDropdown,
  setShowCountyDropdown,
  filteredCounties,
  countyHighlightIndex,
  setCountyHighlightIndex,
  selectCounty,
  handleCountyKeyDown,
  localityDropdownRef,
  localityInputRef,
  editLocality,
  setEditLocality,
  localitySearch,
  setLocalitySearch,
  showLocalityDropdown,
  setShowLocalityDropdown,
  filteredLocalities,
  localityHighlightIndex,
  setLocalityHighlightIndex,
  handleLocalityKeyDown,
}: OrgEditAddressModalProps) {
  if (!showAddressModal) return null;

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
            <MapPin className="size-5" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-base font-semibold">Edit Address Details</CardTitle>
            <CardDescription className="text-xs">Update your organization's physical billing coordinates.</CardDescription>
          </div>
        </CardHeader>
        <form action={personalAction}>
          <input type="hidden" name="id" value={organization.id} />
          <input type="hidden" name="name" value={organization.name} />
          <input type="hidden" name="organizationCategory" value={organization.organizationCategory || ""} />
          <input type="hidden" name="phoneNumber" value={organization.phoneNumber || ""} />
          <input type="hidden" name="addressCountry" value="Romania" />

          <CardContent className="p-6 space-y-4 bg-muted/5">
            {personalError && (
              <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {personalError}
              </div>
            )}
            <div className="space-y-4">
              {/* County & Locality */}
              <div className="grid gap-4 grid-cols-2">
                {/* County Search Select */}
                <div className="space-y-1.5 relative" ref={countyDropdownRef}>
                  <input type="hidden" name="addressState" value={editCounty} />
                  <Label htmlFor="addressState" className="text-sm font-medium normal-case text-muted-foreground/80">
                    County <span className="text-destructive font-semibold">*</span>
                  </Label>
                  <div className="relative">
                    <Map className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                    <Input
                      id="addressState"
                      type="text"
                      value={countySearch}
                      onChange={(e) => {
                        setCountySearch(e.target.value);
                        setEditCounty(e.target.value);
                        setShowCountyDropdown(true);
                      }}
                      onFocus={() => setShowCountyDropdown(true)}
                      onKeyDown={handleCountyKeyDown}
                      placeholder="Search county..."
                      required
                      className="pl-9 pr-10 focus-visible:ring-primary/20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {countySearch && (
                        <button
                          type="button"
                          aria-label="Clear county selection"
                          onClick={() => {
                            setCountySearch("");
                            setEditCounty("");
                            setLocalitySearch("");
                            setEditLocality("");
                            setShowCountyDropdown(false);
                          }}
                          className="text-muted-foreground/60 hover:text-foreground/90 transition-colors p-0.5"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                      <ChevronDown className="size-4 text-muted-foreground/60 pointer-events-none" />
                    </div>
                  </div>

                  {showCountyDropdown && filteredCounties.length > 0 && (
                    <div className="absolute z-50 w-full mt-1.5 bg-popover border border-border/80 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200 p-1.5 backdrop-blur-md">
                      {filteredCounties.map((c, index) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => selectCounty(c)}
                          onMouseEnter={() => setCountyHighlightIndex(index)}
                          className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 focus:outline-none flex items-center justify-between font-medium cursor-pointer mb-0.5 last:mb-0 ${
                            countyHighlightIndex === index
                              ? "bg-accent text-accent-foreground"
                              : "text-popover-foreground hover:bg-accent/80 hover:text-accent-foreground"
                          }`}
                        >
                          <span>{c}</span>
                          {editCounty === c && <Check className="size-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Locality Search Select */}
                <div className="space-y-1.5 relative" ref={localityDropdownRef}>
                  <input type="hidden" name="addressCity" value={editLocality} />
                  <Label htmlFor="addressCity" className="text-sm font-medium normal-case text-muted-foreground/80">
                    Locality <span className="text-destructive font-semibold">*</span>
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                    <Input
                      id="addressCity"
                      ref={localityInputRef}
                      type="text"
                      value={localitySearch}
                      disabled={!editCounty}
                      onChange={(e) => {
                        setLocalitySearch(e.target.value);
                        setEditLocality(e.target.value);
                        setShowLocalityDropdown(true);
                      }}
                      onFocus={() => {
                        if (editCounty) setShowLocalityDropdown(true);
                      }}
                      onKeyDown={handleLocalityKeyDown}
                      placeholder={editCounty ? "Search locality..." : "Select county first..."}
                      required
                      className="pl-9 pr-10 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {localitySearch && (
                        <button
                          type="button"
                          aria-label="Clear locality selection"
                          onClick={() => {
                            setLocalitySearch("");
                            setEditLocality("");
                            setShowLocalityDropdown(false);
                          }}
                          className="text-muted-foreground/60 hover:text-foreground/90 transition-colors p-0.5"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                      <ChevronDown className="size-4 text-muted-foreground/60 pointer-events-none" />
                    </div>
                  </div>

                  {showLocalityDropdown && editCounty && filteredLocalities.length > 0 && (
                    <div className="absolute z-50 w-full mt-1.5 bg-popover border border-border/80 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200 p-1.5 backdrop-blur-md">
                      {filteredLocalities.map((loc, index) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setEditLocality(loc);
                            setLocalitySearch(loc);
                            setShowLocalityDropdown(false);
                          }}
                          onMouseEnter={() => setLocalityHighlightIndex(index)}
                          className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 focus:outline-none flex items-center justify-between font-medium cursor-pointer mb-0.5 last:mb-0 ${
                            localityHighlightIndex === index
                              ? "bg-accent text-accent-foreground"
                              : "text-popover-foreground hover:bg-accent/80 hover:text-accent-foreground"
                          }`}
                        >
                          <span>{loc}</span>
                          {editLocality === loc && <Check className="size-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1.5">
                <Label htmlFor="addressLine" className="text-sm font-medium normal-case text-muted-foreground/80">
                  Street Address <span className="text-destructive font-semibold">*</span>
                </Label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                  <Input
                    id="addressLine"
                    name="addressLine"
                    type="text"
                    defaultValue={organization.addressLine || ""}
                    placeholder="123 Main Street, Suite 100"
                    required
                    className="pl-9 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              {/* Zip Code */}
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="addressZip" className="text-sm font-medium normal-case text-muted-foreground/80">
                    Zip code
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80" />
                    <Input
                      id="addressZip"
                      name="addressZip"
                      type="text"
                      defaultValue={organization.addressZip || ""}
                      placeholder="12345"
                      className="pl-9 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={() => onCloseModal(setShowAddressModal)} disabled={isPending}>
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
