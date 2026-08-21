"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Plus,
  Trash2,
  MapPin,
  X,
  CheckCircle2,
  Loader2,
  Globe,
  Building,
  Truck,
  Zap,
  Droplets,
  Car,
  FileText,
} from "lucide-react";
import { getCartiereForCity, ROMANIAN_CITY_CARTIERE } from "@/config/romanian-cartiere";
import { requestNewCartierAction } from "@/app/actions/organizations";
import type { SecondaryCoverageZone } from "@/types/course";

interface CourseLocationTabProps {
  layout: "tabbed" | "flat";
  isDogWalking: boolean;
  isDogSitter?: boolean;
  isGrooming?: boolean;
  isBoarding: boolean;
  cityName: string;
  cartiereList: string[] | null;
  selectedCartiere: string[];
  onSelectedCartiereChange: (c: string[]) => void;
  secondaryZones: SecondaryCoverageZone[];
  onAddSecondaryZone?: () => void;
  onRemoveSecondaryZone?: (idx: number) => void;
  onSecondaryCityChange?: (idx: number, city: string) => void;
  onSecondaryCartiereChange?: (idx: number, cartiere: string[]) => void;
  trainingFieldAddress: string;
  onTrainingFieldAddressChange: (v: string) => void;
  trainingFieldGoogleBusinessProfile: string;
  onGbpChange: (v: string) => void;
  trainingFieldGoogleMapsLink: string;
  onMapsChange: (v: string) => void;
  dedicatedField: boolean;
  onDedicatedFieldChange: (v: boolean) => void;
  trainingFieldDescription: string;
  onTrainingFieldDescriptionChange: (v: string) => void;
  indoorFacility?: boolean;
  onIndoorFacilityChange?: (v: boolean) => void;
  indoorFacilityDescription?: string;
  onIndoorFacilityDescriptionChange?: (v: string) => void;
  parking: boolean;
  onParkingChange: (v: boolean) => void;
  parkingDescription: string;
  onParkingDescriptionChange: (v: string) => void;
  hideDedicatedField?: boolean;
  hideParking?: boolean;
  groomingLocationType?: "salon" | "mobile_van" | "both" | string;
  onGroomingLocationTypeChange?: (v: "salon" | "mobile_van" | "both") => void;
  mobileVanAutonomousPower?: boolean;
  onMobileVanAutonomousPowerChange?: (v: boolean) => void;
  mobileVanAutonomousWater?: boolean;
  onMobileVanAutonomousWaterChange?: (v: boolean) => void;
  mobileVanNeedsPowerPlug?: boolean;
  onMobileVanNeedsPowerPlugChange?: (v: boolean) => void;
  mobileVanNeedsWaterHookup?: boolean;
  onMobileVanNeedsWaterHookupChange?: (v: boolean) => void;
  mobileVanSpaceRequirement?: string;
  onMobileVanSpaceRequirementChange?: (v: string) => void;
  mobileVanTravelFeePolicy?: string;
  onMobileVanTravelFeePolicyChange?: (v: string) => void;
}

/**
 * CourseLocationTab Component
 *
 * Renders City / Address fields, Primary & Secondary Cartiere Coverage Zones (Dog Walking, Dog Sitter & Dog Grooming),
 * Dedicated Training Field toggle, Parking options, and Dog Grooming Salon vs. Mobile Van provider modes.
 */
export function CourseLocationTab({
  layout,
  isDogWalking,
  isDogSitter = false,
  isGrooming = false,
  isBoarding,
  cityName,
  cartiereList,
  selectedCartiere,
  onSelectedCartiereChange,
  secondaryZones,
  onAddSecondaryZone,
  onRemoveSecondaryZone,
  onSecondaryCityChange,
  onSecondaryCartiereChange,
  trainingFieldAddress,
  onTrainingFieldAddressChange,
  trainingFieldGoogleBusinessProfile,
  onGbpChange,
  trainingFieldGoogleMapsLink,
  onMapsChange,
  dedicatedField,
  onDedicatedFieldChange,
  trainingFieldDescription,
  onTrainingFieldDescriptionChange,
  indoorFacility = false,
  onIndoorFacilityChange,
  indoorFacilityDescription = "",
  onIndoorFacilityDescriptionChange,
  parking,
  onParkingChange,
  parkingDescription,
  onParkingDescriptionChange,
  hideDedicatedField = false,
  hideParking = false,
  groomingLocationType = "salon",
  onGroomingLocationTypeChange,
  mobileVanAutonomousPower = false,
  onMobileVanAutonomousPowerChange,
  mobileVanAutonomousWater = false,
  onMobileVanAutonomousWaterChange,
  mobileVanNeedsPowerPlug = false,
  onMobileVanNeedsPowerPlugChange,
  mobileVanNeedsWaterHookup = false,
  onMobileVanNeedsWaterHookupChange,
  mobileVanSpaceRequirement = "",
  onMobileVanSpaceRequirementChange,
  mobileVanTravelFeePolicy = "",
  onMobileVanTravelFeePolicyChange,
}: CourseLocationTabProps) {
  const [isRequestCartierOpen, setIsRequestCartierOpen] = useState(false);
  const [newCartierName, setNewCartierName] = useState("");
  const [newCartierNotes, setNewCartierNotes] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);
  const [requestErrorMsg, setRequestErrorMsg] = useState<string | null>(null);

  const showSalonSection = isGrooming
    ? groomingLocationType === "salon" || groomingLocationType === "both"
    : !isDogWalking && !isDogSitter;

  const showCoverageZonesSection = isGrooming
    ? groomingLocationType === "mobile_van" || groomingLocationType === "both"
    : isDogWalking || isDogSitter;

  const showMobileVanSpecs = isGrooming && (groomingLocationType === "mobile_van" || groomingLocationType === "both");

  const handleSendCartierRequest = async () => {
    if (!newCartierName.trim() || !cityName) return;
    setIsSubmittingRequest(true);
    setRequestErrorMsg(null);
    setRequestSuccessMsg(null);
    try {
      const res = await requestNewCartierAction({
        cityName,
        cartierName: newCartierName.trim(),
        notes: newCartierNotes.trim() || undefined,
      });
      if ("success" in res && res.success) {
        setRequestSuccessMsg(res.message);
        setNewCartierName("");
        setNewCartierNotes("");
      } else if ("error" in res) {
        setRequestErrorMsg(res.error);
      }
    } catch (err: any) {
      setRequestErrorMsg(err?.message || "Failed to submit request.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. DOG GROOMING PROVIDER MODE SELECTOR ── */}
      {isGrooming && (
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-foreground flex items-center gap-2">
              <Building className="size-4 text-primary" />
              Grooming Service Provider Mode
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Select how your dog grooming service is delivered to clients.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Fixed Salon Option */}
            <button
              type="button"
              onClick={() => onGroomingLocationTypeChange?.("salon")}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                groomingLocationType === "salon"
                  ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                  : "bg-background border-border hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <Building className="size-4 text-primary" />
                  <span>Fixed Salon</span>
                </div>
                <input
                  type="radio"
                  name="groomingModeRadio"
                  checked={groomingLocationType === "salon"}
                  onChange={() => onGroomingLocationTypeChange?.("salon")}
                  className="text-primary size-4"
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Clients bring their dogs to your physical salon / parlor address.
              </p>
            </button>

            {/* Mobile Grooming Van Option */}
            <button
              type="button"
              onClick={() => onGroomingLocationTypeChange?.("mobile_van")}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                groomingLocationType === "mobile_van"
                  ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                  : "bg-background border-border hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <Truck className="size-4 text-primary" />
                  <span>Mobile Grooming Van</span>
                </div>
                <input
                  type="radio"
                  name="groomingModeRadio"
                  checked={groomingLocationType === "mobile_van"}
                  onChange={() => onGroomingLocationTypeChange?.("mobile_van")}
                  className="text-primary size-4"
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                You travel with a fully equipped mobile grooming van to the client's home.
              </p>
            </button>

            {/* Both (Salon & Mobile Van) Option */}
            <button
              type="button"
              onClick={() => onGroomingLocationTypeChange?.("both")}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                groomingLocationType === "both"
                  ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                  : "bg-background border-border hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                  <Building className="size-3.5 text-primary" />
                  <span>+</span>
                  <Truck className="size-3.5 text-primary" />
                  <span>Both (Salon & Van)</span>
                </div>
                <input
                  type="radio"
                  name="groomingModeRadio"
                  checked={groomingLocationType === "both"}
                  onChange={() => onGroomingLocationTypeChange?.("both")}
                  className="text-primary size-4"
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                You operate a physical salon AND offer mobile van appointments.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ── 2. FIXED SALON / PHYSICAL LOCATION SECTION ── */}
      {showSalonSection && (
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-foreground flex items-center gap-2">
              <Building className="size-4 text-primary" />
              {isGrooming ? "Physical Salon Location & Address" : "Location & Address"}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {isGrooming
                ? "Physical address where clients bring their dogs for salon appointments."
                : "Address and online location links for your facility."}
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="city-name" className="text-xs font-semibold">
                City / Localitate <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city-name"
                type="text"
                value={cityName || "Cluj-Napoca"}
                readOnly
                disabled
                className="h-9 bg-muted/40 text-xs font-semibold cursor-not-allowed opacity-80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training-field-address" className="text-xs font-semibold">
                {isGrooming ? "Salon Address" : "Address"}
              </Label>
              <Input
                id="training-field-address"
                type="text"
                placeholder={isGrooming ? "e.g. Strada Memorandumului 15, Cluj-Napoca" : "e.g. 123 Canine Lane, Bucharest"}
                value={trainingFieldAddress}
                onChange={(e) => onTrainingFieldAddressChange(e.target.value)}
                className="h-9 bg-background text-xs font-semibold rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training-field-gbp" className="text-xs font-semibold">
                Google Business Profile
              </Label>
              <Input
                id="training-field-gbp"
                type="url"
                placeholder="https://business.google.com/..."
                value={trainingFieldGoogleBusinessProfile}
                onChange={(e) => onGbpChange(e.target.value)}
                className="h-9 bg-background text-xs font-semibold rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training-field-maps" className="text-xs font-semibold">
                Google Maps Link
              </Label>
              <Input
                id="training-field-maps"
                type="url"
                placeholder="https://maps.google.com/..."
                value={trainingFieldGoogleMapsLink}
                onChange={(e) => onMapsChange(e.target.value)}
                className="h-9 bg-background text-xs font-semibold rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. MOBILE VAN COVERAGE ZONES (CARTIERE) ── */}
      {showCoverageZonesSection && (
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-foreground flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {isGrooming ? "Mobile Van Coverage Zones" : "Coverage Zones"}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {isGrooming
                ? `Select the neighborhoods in ${cityName || "your city"} and adjacent cities covered by your mobile grooming van.`
                : `Select the neighborhoods in ${cityName || "your city"} where you offer service.`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverage-city-name" className="text-xs font-semibold">
              Primary City / Localitate <span className="text-destructive">*</span>
            </Label>
            <Input
              id="coverage-city-name"
              type="text"
              value={cityName || "Cluj-Napoca"}
              readOnly
              disabled
              className="h-9 bg-muted/40 text-xs font-semibold cursor-not-allowed opacity-80"
            />
          </div>

          {cartiereList && (
            <div className="space-y-4 pt-2 border-t border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Neighborhood Coverage Zones (Cartiere)
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Configure specific neighborhoods in {cityName} where your {isGrooming ? "mobile van travels" : "service operates"}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectedCartiereChange([...cartiereList])}
                    className="h-7 text-xs font-semibold px-2.5"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectedCartiereChange([])}
                    className="h-7 text-xs font-semibold px-2.5"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                {cartiereList.map((cartier) => {
                  const isSelected = selectedCartiere.includes(cartier);
                  return (
                    <button
                      key={cartier}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          onSelectedCartiereChange(selectedCartiere.filter((c) => c !== cartier));
                        } else {
                          onSelectedCartiereChange([...selectedCartiere, cartier]);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                          : "bg-background border-border text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="size-3.5 rounded border-border text-primary focus:ring-primary/20 pointer-events-none"
                      />
                      <span className="truncate">{cartier}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Can't find your neighborhood in {cityName}?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRequestErrorMsg(null);
                    setRequestSuccessMsg(null);
                    setNewCartierName("");
                    setNewCartierNotes("");
                    setIsRequestCartierOpen(true);
                  }}
                  className="h-7 text-xs font-semibold gap-1.5 px-3 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Request new Coverage zone (Cartier)
                </Button>
              </div>
            </div>
          )}

          {/* Secondary Coverage Zones */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Globe className="size-3.5 text-primary" />
                  Secondary Coverage Zones
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Add other cities or metropolitan areas you service beyond {cityName}.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddSecondaryZone}
                className="h-7 text-xs font-semibold gap-1.5 px-3 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="size-3.5" />
                Add Secondary Coverage Zone
              </Button>
            </div>

            {secondaryZones.length > 0 ? (
              <div className="space-y-4">
                {secondaryZones.map((secZone, idx) => {
                  const availableCities = Object.keys(ROMANIAN_CITY_CARTIERE).filter(
                    (c) => c !== cityName && !secondaryZones.some((sz, szIdx) => szIdx !== idx && sz.city === c)
                  );
                  const secCityName = secZone.city;
                  const secCartiereList = secCityName ? getCartiereForCity(secCityName) : null;

                  return (
                    <div key={idx} className="p-4 rounded-xl border border-border bg-muted/10 shadow-xs space-y-4 relative">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1.5 max-w-xs">
                          <Label className="text-xs font-semibold">Secondary City</Label>
                          <CustomSelect
                            options={[
                              { value: "", label: "Select Secondary City" },
                              ...availableCities.map((c) => ({ value: c, label: c })),
                            ]}
                            value={secCityName}
                            onChange={(val) => onSecondaryCityChange?.(idx, val)}
                            placeholder="Select Secondary City..."
                            searchable
                            searchPlaceholder="Search city..."
                            className="h-9 text-xs font-semibold"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveSecondaryZone?.(idx)}
                          className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10 gap-1.5 self-end cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          Remove Zone
                        </Button>
                      </div>

                      {secCityName && secCartiereList && (
                        <div className="space-y-3 pt-2 border-t border-border/60">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground">
                              Neighborhoods in <strong>{secCityName}</strong>
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onSecondaryCartiereChange?.(idx, [...secCartiereList])}
                                className="h-6 text-[10px] font-semibold px-2"
                              >
                                Select All
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onSecondaryCartiereChange?.(idx, [])}
                                className="h-6 text-[10px] font-semibold px-2"
                              >
                                Deselect All
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                            {secCartiereList.map((cartier) => {
                              const isSelected = secZone.cartiere.includes(cartier);
                              return (
                                <button
                                  key={cartier}
                                  type="button"
                                  onClick={() => {
                                    if (!onSecondaryCartiereChange) return;
                                    const next = isSelected
                                      ? secZone.cartiere.filter((c) => c !== cartier)
                                      : [...secZone.cartiere, cartier];
                                    onSecondaryCartiereChange(idx, next);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                                    isSelected
                                      ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                                      : "bg-background border-border text-foreground hover:bg-muted/40"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="size-3.5 rounded border-border text-primary focus:ring-primary/20 pointer-events-none"
                                  />
                                  <span className="truncate">{cartier}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/5 text-center py-6 space-y-1">
                <p className="text-xs font-semibold text-foreground">No Secondary Coverage Zones Added</p>
                <p className="text-[11px] text-muted-foreground">
                  If you offer services in adjacent cities, click "Add Secondary Coverage Zone" above.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. MOBILE GROOMING VAN SPECIFICATIONS & UTILITIES ── */}
      {showMobileVanSpecs && (
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-foreground flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              Mobile Van Specifications &amp; Client Utility Requirements
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Let dog owners know your van's power &amp; water capabilities and parking requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Autonomous Power */}
            <div className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-amber-500" />
                  Self-Sufficient Power
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Van is powered by onboard generator, battery, or solar.
                </p>
              </div>
              <input
                type="checkbox"
                checked={mobileVanAutonomousPower}
                onChange={(e) => onMobileVanAutonomousPowerChange?.(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
            </div>

            {/* Needs 220V Outlet */}
            <div className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-blue-500" />
                  Needs 220V Power Outlet
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Requires standard electric plug hookup from client's house.
                </p>
              </div>
              <input
                type="checkbox"
                checked={mobileVanNeedsPowerPlug}
                onChange={(e) => onMobileVanNeedsPowerPlugChange?.(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
            </div>

            {/* Autonomous Water */}
            <div className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Droplets className="size-3.5 text-cyan-500" />
                  Self-Sufficient Water Supply
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Onboard fresh and grey water holding tanks.
                </p>
              </div>
              <input
                type="checkbox"
                checked={mobileVanAutonomousWater}
                onChange={(e) => onMobileVanAutonomousWaterChange?.(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
            </div>

            {/* Needs Water Tap */}
            <div className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Droplets className="size-3.5 text-teal-500" />
                  Needs Water Tap / Hose Hookup
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Requires outdoor garden tap or water connection from client.
                </p>
              </div>
              <input
                type="checkbox"
                checked={mobileVanNeedsWaterHookup}
                onChange={(e) => onMobileVanNeedsWaterHookupChange?.(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
            <div className="space-y-1.5">
              <Label htmlFor="van-space-req" className="text-xs font-semibold flex items-center gap-1.5">
                <Car className="size-3.5 text-primary" />
                Van Parking Space Requirement
              </Label>
              <Input
                id="van-space-req"
                type="text"
                placeholder="e.g. Min 6-7 meters driveway space or safe street curb"
                value={mobileVanSpaceRequirement}
                onChange={(e) => onMobileVanSpaceRequirementChange?.(e.target.value)}
                className="h-9 bg-background text-xs font-semibold rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="van-travel-fee" className="text-xs font-semibold flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                Travel Fee &amp; Policy Notes
              </Label>
              <Input
                id="van-travel-fee"
                type="text"
                placeholder="e.g. Free travel in primary zone; 2 lei/km outside"
                value={mobileVanTravelFeePolicy}
                onChange={(e) => onMobileVanTravelFeePolicyChange?.(e.target.value)}
                className="h-9 bg-background text-xs font-semibold rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 5. DEDICATED TRAINING FIELD (Dog Training & Dog Sports only) ── */}
      {!isGrooming && !isBoarding && !hideDedicatedField && (
        <>
          <BooleanToggleField
            label="Dedicated Training Field"
            description="Does the class run on a fully closed, dedicated outdoor training field?"
            checked={dedicatedField}
            onChange={onDedicatedFieldChange}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Training Field Description</Label>
                <WysiwygEditor
                  value={trainingFieldDescription}
                  onChange={onTrainingFieldDescriptionChange}
                  placeholder="Explain field attributes, size, safety fences, etc."
                />
              </div>
            </div>
          </BooleanToggleField>

          <div className="h-px bg-border/60" />

          {/* Indoor / Covered Training Hall */}
          <BooleanToggleField
            label="Indoor / Covered Training Hall"
            description="Do you have an indoor hall or covered facility for training in bad weather or winter?"
            checked={indoorFacility}
            onChange={onIndoorFacilityChange || (() => {})}
          >
            <div className="space-y-2">
              <Label>Indoor Facility Features &amp; Climate Details</Label>
              <WysiwygEditor
                value={indoorFacilityDescription}
                onChange={onIndoorFacilityDescriptionChange || (() => {})}
                placeholder="e.g. 200 sqm heated indoor arena, non-slip rubber agility flooring, winter heating & summer air conditioning, full agility mirror..."
              />
            </div>
          </BooleanToggleField>
        </>
      )}

      {/* ── 6. DEDICATED PARKING TOGGLE (Salon & Training fields) ── */}
      {!hideParking && (!isGrooming || showSalonSection) && (
        <BooleanToggleField
          label={isBoarding ? "Parking" : isGrooming ? "Salon Client Parking" : "Dedicated Parking"}
          description={
            isGrooming
              ? "Is dedicated client parking or curbside drop-off available at your salon?"
              : "Is parking available on site or nearby?"
          }
          checked={parking}
          onChange={onParkingChange}
        >
          <WysiwygEditor
            value={parkingDescription}
            onChange={onParkingDescriptionChange}
            placeholder="Details about parking capacity, location, fee..."
          />
        </BooleanToggleField>
      )}

      {/* ── REQUEST NEW CARTIER MODAL ── */}
      {isRequestCartierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200 space-y-4">
            <button
              type="button"
              onClick={() => setIsRequestCartierOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                <MapPin className="size-4 text-primary" />
                Request new Coverage zone (Cartier)
              </h3>
              <p className="text-xs text-muted-foreground">
                Can't find a neighborhood in <strong className="text-foreground">{cityName}</strong>? Request a new zone for staff review.
              </p>
            </div>

            {requestSuccessMsg ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-3 shadow-xs">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">Request Submitted Successfully!</p>
                    <p className="font-medium text-xs leading-relaxed">{requestSuccessMsg}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsRequestCartierOpen(false)}
                    className="h-8 text-xs font-semibold px-4 cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {requestErrorMsg && (
                  <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {requestErrorMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="req-city-name" className="text-xs font-semibold">City / Localitate</Label>
                  <Input
                    id="req-city-name"
                    value={cityName}
                    disabled
                    readOnly
                    className="h-9 bg-muted/30 text-xs font-semibold cursor-not-allowed opacity-90"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="req-cartier-name" className="text-xs font-semibold">Neighborhood Name (Nume Cartier) *</Label>
                  <Input
                    id="req-cartier-name"
                    type="text"
                    placeholder="e.g. Mănăștur Nord, Borhanci Est"
                    value={newCartierName}
                    onChange={(e) => setNewCartierName(e.target.value)}
                    required
                    className="h-9 text-xs font-semibold bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="req-notes" className="text-xs font-semibold">Additional Notes (Optional)</Label>
                  <textarea
                    id="req-notes"
                    rows={3}
                    placeholder="Any specific landmarks or zone boundary details..."
                    value={newCartierNotes}
                    onChange={(e) => setNewCartierNotes(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium placeholder:text-muted-foreground resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRequestCartierOpen(false)}
                    disabled={isSubmittingRequest}
                    className="h-8 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSendCartierRequest}
                    disabled={isSubmittingRequest || !newCartierName.trim()}
                    className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    {isSubmittingRequest && <Loader2 className="size-3.5 animate-spin" />}
                    Submit Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
