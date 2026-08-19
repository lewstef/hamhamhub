"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { CustomSelect } from "@/components/ui/custom-select";

import { SPOKEN_LANGUAGES_LIST } from "@/types/course";

export interface CourseCareTabProps {
  isDogWalking?: boolean;
  isDogSitter?: boolean;
  dailyWalks?: number;
  onDailyWalksChange?: (v: number) => void;
  medicationAdministration?: boolean;
  onMedicationAdministrationChange?: (v: boolean) => void;
  medicationAdministrationDetails?: string;
  onMedicationAdministrationDetailsChange?: (v: string) => void;
  surveillance247?: boolean;
  onSurveillance247Change?: (v: boolean) => void;
  surveillance247Details?: string;
  onSurveillance247DetailsChange?: (v: string) => void;
  webCam?: boolean;
  onWebCamChange?: (v: boolean) => void;
  webCamDetails?: string;
  onWebCamDetailsChange?: (v: string) => void;
  ownerCommunication?: boolean;
  onOwnerCommunicationChange?: (v: boolean) => void;
  ownerCommunicationDetails?: string;
  onOwnerCommunicationDetailsChange?: (v: string) => void;
  personalizedMealPlan?: boolean;
  onPersonalizedMealPlanChange?: (v: boolean) => void;
  personalizedMealPlanDetails?: string;
  onPersonalizedMealPlanDetailsChange?: (v: string) => void;
  emergencyVetTransport?: boolean;
  onEmergencyVetTransportChange?: (v: boolean) => void;
  emergencyVetTransportDetails?: string;
  onEmergencyVetTransportDetailsChange?: (v: string) => void;
  plantWatering?: boolean;
  onPlantWateringChange?: (v: boolean) => void;
  plantWateringDetails?: string;
  onPlantWateringDetailsChange?: (v: string) => void;
  nonSmoker?: boolean;
  onNonSmokerChange?: (v: boolean) => void;
  maxPetsPerVisit?: number;
  onMaxPetsPerVisitChange?: (v: number) => void;
  additionalPetPolicy?: string;
  onAdditionalPetPolicyChange?: (v: string) => void;
}

/**
 * CourseCareTab Component
 *
 * Renders boarding/sitting-specific care amenity toggles:
 * daily walks, medication administration, emergency vet transport, plant watering,
 * non-smoker, multi-pet policy,
 * 24/7 surveillance, personalized meal plan, webcam access, and communication/GPS reports.
 */
export function CourseCareTab({
  isDogWalking = false,
  isDogSitter = false,
  dailyWalks = 1,
  onDailyWalksChange = () => {},
  medicationAdministration = false,
  onMedicationAdministrationChange = () => {},
  medicationAdministrationDetails = "",
  onMedicationAdministrationDetailsChange = () => {},
  surveillance247 = false,
  onSurveillance247Change = () => {},
  surveillance247Details = "",
  onSurveillance247DetailsChange = () => {},
  webCam = false,
  onWebCamChange = () => {},
  webCamDetails = "",
  onWebCamDetailsChange = () => {},
  ownerCommunication = false,
  onOwnerCommunicationChange = () => {},
  ownerCommunicationDetails = "",
  onOwnerCommunicationDetailsChange = () => {},
  personalizedMealPlan = false,
  onPersonalizedMealPlanChange = () => {},
  personalizedMealPlanDetails = "",
  onPersonalizedMealPlanDetailsChange = () => {},
  emergencyVetTransport = false,
  onEmergencyVetTransportChange = () => {},
  emergencyVetTransportDetails = "",
  onEmergencyVetTransportDetailsChange = () => {},
  plantWatering = false,
  onPlantWateringChange = () => {},
  plantWateringDetails = "",
  onPlantWateringDetailsChange = () => {},
  nonSmoker = false,
  onNonSmokerChange = () => {},
  maxPetsPerVisit = 1,
  onMaxPetsPerVisitChange = () => {},
  additionalPetPolicy = "",
  onAdditionalPetPolicyChange = () => {},
}: CourseCareTabProps) {
  if (isDogSitter) {
    return (
      <>
        {/* Non-Smoker Sitter */}
        <BooleanToggleField
          label="Non-Smoker Sitter"
          description="Is the pet sitter a non-smoker for smoke-free in-home sitting?"
          checked={nonSmoker}
          onChange={onNonSmokerChange || (() => {})}
        />

        <div className="h-px bg-border/60" />

        {/* Plant & Garden Watering */}
        <BooleanToggleField
          label="Plant & Garden Watering"
          description="Can you water indoor houseplants or garden plants during visits?"
          checked={plantWatering}
          onChange={onPlantWateringChange || (() => {})}
        >
          <div className="space-y-2">
            <Label>Plant Watering Instructions &amp; Capacity</Label>
            <WysiwygEditor
              value={plantWateringDetails}
              onChange={onPlantWateringDetailsChange || (() => {})}
              placeholder="e.g. Daily balcony plant watering, indoor houseplant care, garden sprinkler scheduling..."
            />
          </div>
        </BooleanToggleField>

        <div className="h-px bg-border/60" />

        {/* Medication Administration */}
        <BooleanToggleField
          label="Medication Administration"
          description="Can you administer medication or medical care to pets during visits?"
          checked={medicationAdministration}
          onChange={onMedicationAdministrationChange}
        >
          <div className="space-y-2">
            <Label>Medication Administration Instructions</Label>
            <WysiwygEditor
              value={medicationAdministrationDetails}
              onChange={onMedicationAdministrationDetailsChange}
              placeholder="e.g. oral tablets, injections, insulin administration, schedule limitations"
            />
          </div>
        </BooleanToggleField>

        <div className="h-px bg-border/60" />

        {/* Emergency Vet Transport & First Aid */}
        <BooleanToggleField
          label="Emergency Vet Transport & First Aid"
          description="Do you have a vehicle and pet first-aid capabilities to transport pets to an emergency veterinary clinic?"
          checked={emergencyVetTransport}
          onChange={onEmergencyVetTransportChange || (() => {})}
        >
          <div className="space-y-2">
            <Label>Emergency Transport &amp; Vet Protocol</Label>
            <WysiwygEditor
              value={emergencyVetTransportDetails}
              onChange={onEmergencyVetTransportDetailsChange || (() => {})}
              placeholder="e.g. Pet first-aid certified, 24/7 dedicated vehicle on standby, direct partnership with local 24/7 emergency clinic..."
            />
          </div>
        </BooleanToggleField>

        <div className="h-px bg-border/60" />

        {/* Multi-Pet Accommodation */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-pets" className="text-xs font-semibold">Maximum Pets Per Visit / Booking</Label>
              <span className="text-[11px] text-muted-foreground">Select max pets accommodated simultaneously</span>
            </div>
            <CustomSelect
              id="max-pets"
              value={maxPetsPerVisit || 1}
              onChange={(val) => onMaxPetsPerVisitChange?.(parseInt(val, 10))}
              options={[
                { value: 1, label: "1 pet per visit" },
                { value: 2, label: "2 pets from same household" },
                { value: 3, label: "3 pets from same household" },
                { value: 4, label: "4 pets from same household" },
                { value: 5, label: "5+ pets (custom multi-pet)" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Pet Policy &amp; Rates</Label>
            <WysiwygEditor
              value={additionalPetPolicy}
              onChange={onAdditionalPetPolicyChange || (() => {})}
              placeholder="e.g. +20 RON/hour for each additional dog from the same household. Cats and small pets welcomed at flat rate..."
            />
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Communication with Owner */}
        <BooleanToggleField
          label="Communication with the Owner"
          description="Will you provide regular photo/video updates to the owner?"
          checked={ownerCommunication}
          onChange={onOwnerCommunicationChange}
        >
          <div className="space-y-2">
            <Label>Communication Updates Details</Label>
            <WysiwygEditor
              value={ownerCommunicationDetails}
              onChange={onOwnerCommunicationDetailsChange}
              placeholder="e.g. daily photos via WhatsApp, sitting visit summaries"
            />
          </div>
        </BooleanToggleField>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="daily-walks" className="text-xs font-semibold">Daily Walks</Label>
        <CustomSelect
          id="daily-walks"
          value={dailyWalks}
          onChange={(val) => onDailyWalksChange(parseInt(val, 10))}
          options={[
            { value: 1, label: "1 walk per day" },
            { value: 2, label: "2 walks per day" },
            { value: 3, label: "3 walks per day" },
            { value: 4, label: "4 walks per day" },
          ]}
        />
      </div>

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label={isDogWalking ? "Key Access & Home Entry Protocol" : "Medication Administration"}
        description={
          isDogWalking
            ? "Specify home entry instructions (lockbox codes, key pickup, concierge, alarm codes)."
            : "Can you administer medication or medical care?"
        }
        checked={medicationAdministration}
        onChange={onMedicationAdministrationChange}
      >
        <div className="space-y-2">
          <Label>
            {isDogWalking ? "Home Access & Key Handling Instructions" : "Medication Administration Instructions"}
          </Label>
          <WysiwygEditor
            value={medicationAdministrationDetails}
            onChange={onMedicationAdministrationDetailsChange}
            placeholder={
              isDogWalking
                ? "e.g. Lockbox code 1234 on side gate, concierge key handoff, alarm disarm code 5678, key drop-off in mailbox"
                : "e.g. oral tablets, injections, schedule limitations"
            }
          />
        </div>
      </BooleanToggleField>

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label="24/7 Surveillance"
        description="Do you provide 24/7 continuous staff presence and surveillance for boarded pets?"
        checked={surveillance247}
        onChange={onSurveillance247Change}
      >
        <div className="space-y-2">
          <Label>24/7 Surveillance Details</Label>
          <WysiwygEditor
            value={surveillance247Details}
            onChange={onSurveillance247DetailsChange}
            placeholder="e.g. 24/7 on-site staff supervision, live CCTV camera monitoring, night security protocol"
          />
        </div>
      </BooleanToggleField>

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label={isDogWalking ? "Post-Walk Feeding & Treat Customization" : "Personalized Meal Plan"}
        description={
          isDogWalking
            ? "Can you feed or provide custom treats to the dog after the walk?"
            : "Can you provide a customized meal plan or accommodate special diets?"
        }
        checked={personalizedMealPlan}
        onChange={onPersonalizedMealPlanChange}
      >
        <div className="space-y-2">
          <Label>{isDogWalking ? "Post-Walk Feeding Instructions" : "Meal Plan Details"}</Label>
          <WysiwygEditor
            value={personalizedMealPlanDetails}
            onChange={onPersonalizedMealPlanDetailsChange}
            placeholder={
              isDogWalking
                ? "e.g. Post-walk kibble feeding, custom treat administration, dietary restriction adherence"
                : "e.g. BARF diet support, raw food storage, customized portions"
            }
          />
        </div>
      </BooleanToggleField>

      {!isDogWalking && (
        <>
          <div className="h-px bg-border/60" />

          <BooleanToggleField
            label="Webcam"
            description="Do you offer live video/webcam access to owners?"
            checked={webCam}
            onChange={onWebCamChange}
          >
            <div className="space-y-2">
              <Label>Webcam Access Instructions</Label>
              <WysiwygEditor
                value={webCamDetails}
                onChange={onWebCamDetailsChange}
                placeholder="e.g. live stream link provided upon check-in, 24/7 access"
              />
            </div>
          </BooleanToggleField>
        </>
      )}

      <div className="h-px bg-border/60" />

      <BooleanToggleField
        label={isDogWalking ? "GPS Route Tracking & Post-Walk Reports" : "Communication with the Owner"}
        description={
          isDogWalking
            ? "Will you provide live GPS route tracking, walk photos, potty status, and post-walk summaries?"
            : "Will you provide regular photo/video updates to the owner?"
        }
        checked={ownerCommunication}
        onChange={onOwnerCommunicationChange}
      >
        <div className="space-y-2">
          <Label>{isDogWalking ? "GPS & Walk Report Details" : "Communication Updates Details"}</Label>
          <WysiwygEditor
            value={ownerCommunicationDetails}
            onChange={onOwnerCommunicationDetailsChange}
            placeholder={
              isDogWalking
                ? "e.g. Photo & video update sent after walk, potty status tracking (pee/poop), fresh water refill, paw wipe on rainy days"
                : "e.g. daily photos via WhatsApp, weekly email progress"
            }
          />
        </div>
      </BooleanToggleField>

      {!isDogWalking && (
        <>
          <div className="h-px bg-border/60" />

          {/* Emergency Vet Transport & First Aid */}
          <BooleanToggleField
            label="Emergency Vet Transport & First Aid"
            description="Do you have a dedicated vehicle and clinic protocol on standby for emergency veterinary visits?"
            checked={emergencyVetTransport}
            onChange={onEmergencyVetTransportChange || (() => {})}
          >
            <div className="space-y-2">
              <Label>Emergency Transport &amp; Vet Protocol</Label>
              <WysiwygEditor
                value={emergencyVetTransportDetails}
                onChange={onEmergencyVetTransportDetailsChange || (() => {})}
                placeholder="e.g. Pet first-aid certified staff on-site 24/7, direct partnership with local 24-hour veterinary emergency hospital, dedicated emergency transport vehicle on standby..."
              />
            </div>
          </BooleanToggleField>
        </>
      )}
    </>
  );
}
