import React, { useState, useMemo } from "react";
import type { Course, CoverageZonesData } from "@/types/course";
import { parseCoverageZones, serializeCoverageZones } from "@/types/course";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";
import { parseDateString } from "@/components/ui/date-picker-input";
import { getCartiereForCity } from "@/config/romanian-cartiere";
import type {
  CoursePricingItem,
  ClosedPeriodItem,
  SpecialOpeningItem,
  DayKey,
  DayScheduleItem,
  CourseFormProps,
} from "./types";

export function getComparableTimestamp(dateStr: string): number | null {
  const parsed = parseDateString(dateStr);
  if (!parsed) return null;
  return Date.UTC(parsed.year, parsed.month, parsed.day);
}

export function parseCoursePricings(
  price?: string | null,
  priceType?: string | null,
  defaultType: string = "course"
): CoursePricingItem[] {
  if (price) {
    const trimmed = price.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: unknown) => {
            const obj = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : null;
            return {
              amount: obj && obj.amount !== undefined ? String(obj.amount) : String(item),
              type: obj && obj.type ? String(obj.type) : priceType || defaultType,
              label: obj && obj.label ? String(obj.label) : "",
            };
          });
        }
      } catch {}
    }
    return [{ amount: price, type: priceType || defaultType, label: "" }];
  }
  return [{ amount: "", type: priceType || defaultType, label: "" }];
}

export function parseClosedPeriods(scheduleJson?: string | null): ClosedPeriodItem[] {
  if (scheduleJson) {
    try {
      const parsed = JSON.parse(scheduleJson);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Array.isArray(parsed.closedPeriods)) {
        return parsed.closedPeriods;
      }
    } catch {}
  }
  return [];
}

export function parseSpecialOpenings(scheduleJson?: string | null): SpecialOpeningItem[] {
  if (scheduleJson) {
    try {
      const parsed = JSON.parse(scheduleJson);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Array.isArray(parsed.specialOpenings)) {
        return parsed.specialOpenings;
      }
    } catch {}
  }
  return [];
}

export const DEFAULT_WEEKLY_SCHEDULE: DayScheduleItem[] = [
  { day: "monday", label: "Monday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "tuesday", label: "Tuesday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "wednesday", label: "Wednesday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "thursday", label: "Thursday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "friday", label: "Friday", enabled: true, checkin: "08:00", checkout: "18:00" },
  { day: "saturday", label: "Saturday", enabled: true, checkin: "09:00", checkout: "16:00" },
  { day: "sunday", label: "Sunday", enabled: true, checkin: "09:00", checkout: "16:00" },
];

export function getInitialWeeklySchedule(initialCourse?: Course | null): DayScheduleItem[] {
  if (initialCourse?.schedule) {
    try {
      const parsed = JSON.parse(initialCourse.schedule);
      if (Array.isArray(parsed) && parsed.length === 7) {
        return parsed;
      }
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        Array.isArray(parsed.weeklySchedule) &&
        parsed.weeklySchedule.length === 7
      ) {
        return parsed.weeklySchedule;
      }
    } catch {}
  }
  const workIn = initialCourse?.checkin || "08:00";
  const workOut = initialCourse?.checkout || "18:00";
  const weekIn = initialCourse?.checkinWeekend || "09:00";
  const weekOut = initialCourse?.checkoutWeekend || "16:00";

  return [
    { day: "monday", label: "Monday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "tuesday", label: "Tuesday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "wednesday", label: "Wednesday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "thursday", label: "Thursday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "friday", label: "Friday", enabled: true, checkin: workIn, checkout: workOut },
    { day: "saturday", label: "Saturday", enabled: true, checkin: weekIn, checkout: weekOut },
    { day: "sunday", label: "Sunday", enabled: true, checkin: weekIn, checkout: weekOut },
  ];
}

export type CourseActiveTab =
  | "general"
  | "terms"
  | "faq"
  | "pricing"
  | "schedule"
  | "location"
  | "others"
  | "playYard";

export function useCourseForm({
  organizationId,
  serviceId,
  itemNoun,
  initialCourse,
  onCancel,
  onSubmitSuccess,
  serviceSlug,
  orgCity,
}: CourseFormProps) {
  const isEdit = !!initialCourse?.id;
  const isBoarding = serviceSlug === "dog-boarding" || itemNoun === "Boarding service";
  const isGrooming = serviceSlug === "dog-grooming" || itemNoun === "Grooming service";
  const isDogSport = serviceSlug === "sport-dog-training" || itemNoun === "Dog Sport";
  const isDogTraining = serviceSlug === "dog-training" || itemNoun === "Course";
  const isDogWalking = serviceSlug === "dog-walking" || itemNoun === "Walking service";
  const isDogSitter = serviceSlug === "dog-sitter" || itemNoun === "Sitting service";
  const isTabbedLayout = isDogSport || isDogTraining || isBoarding || isDogWalking || isDogSitter || isGrooming;
  const cityName = orgCity || "Cluj-Napoca";
  const cartiereList = getCartiereForCity(cityName);
  const [activeTab, setActiveTab] = useState<CourseActiveTab>("general");
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialCourse?.name || "");
  const [certifiedTrainer, setCertifiedTrainer] = useState(initialCourse?.certifiedTrainer || false);
  const [certifierName, setCertifierName] = useState(initialCourse?.certifierName || "");
  const [trainerExperienceDescription, setTrainerExperienceDescription] = useState(
    initialCourse?.trainerExperienceDescription || ""
  );
  const [veterinaryTraining, setVeterinaryTraining] = useState(initialCourse?.veterinaryTraining || false);
  const [veterinaryTrainingCertifier, setVeterinaryTrainingCertifier] = useState(
    initialCourse?.veterinaryTrainingCertifier || ""
  );
  const [veterinaryTrainingDetails, setVeterinaryTrainingDetails] = useState(
    initialCourse?.veterinaryTrainingDetails || ""
  );
  const [ageLimitsEnabled, setAgeLimitsEnabled] = useState(initialCourse?.ageLimitsEnabled || false);
  const [selectedAgeLimits, setSelectedAgeLimits] = useState<string[]>(
    initialCourse?.ageLimits
      ? initialCourse.ageLimits.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );
  const [dogSizesEnabled, setDogSizesEnabled] = useState(initialCourse?.acceptedDogSizesEnabled || false);
  const [selectedDogSizes, setSelectedDogSizes] = useState<string[]>(
    initialCourse?.acceptedDogSizes
      ? initialCourse.acceptedDogSizes.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );

  const handleToggleAgeLimit = (limit: string) => {
    setSelectedAgeLimits((prev) =>
      prev.includes(limit) ? prev.filter((a) => a !== limit) : [...prev, limit]
    );
  };
  const [dedicatedField, setDedicatedField] = useState(initialCourse?.dedicatedField || false);
  const [trainingFieldDescription, setTrainingFieldDescription] = useState(
    initialCourse?.trainingFieldDescription || ""
  );
  const [trainingFieldAddress, setTrainingFieldAddress] = useState(initialCourse?.trainingFieldAddress || "");
  const [trainingFieldGoogleBusinessProfile, setTrainingFieldGoogleBusinessProfile] = useState(
    initialCourse?.trainingFieldGoogleBusinessProfile || ""
  );
  const [trainingFieldGoogleMapsLink, setTrainingFieldGoogleMapsLink] = useState(
    initialCourse?.trainingFieldGoogleMapsLink || ""
  );
  const [parking, setParking] = useState(initialCourse?.parking || false);
  const [parkingDescription, setParkingDescription] = useState(initialCourse?.parkingDescription || "");
  const [details, setDetails] = useState(initialCourse?.details || "");
  const [observationsAndDisclaimers, setObservationsAndDisclaimers] = useState(
    initialCourse?.observationsAndDisclaimers || ""
  );
  const [termsOfParticipation, setTermsOfParticipation] = useState(initialCourse?.termsOfParticipation || "");

  const defaultPriceType = isBoarding
    ? "night"
    : isGrooming
    ? "service"
    : isDogSitter
    ? "1h"
    : isDogWalking
    ? "walk"
    : "course";
  const [pricings, setPricings] = useState<CoursePricingItem[]>(() =>
    parseCoursePricings(initialCourse?.price, initialCourse?.priceType, defaultPriceType)
  );
  const [medicationAdministration, setMedicationAdministration] = useState(
    initialCourse?.medicationAdministration || false
  );
  const [medicationAdministrationDetails, setMedicationAdministrationDetails] = useState(
    initialCourse?.medicationAdministrationDetails || ""
  );
  const [surveillance247, setSurveillance247] = useState(initialCourse?.surveillance247 || false);
  const [surveillance247Details, setSurveillance247Details] = useState(
    initialCourse?.surveillance247Details || ""
  );
  const [webCam, setWebCam] = useState(initialCourse?.webCam || false);
  const [webCamDetails, setWebCamDetails] = useState(initialCourse?.webCamDetails || "");
  const [dailyWalks, setDailyWalks] = useState(initialCourse?.dailyWalks || 1);
  const [ownerCommunication, setOwnerCommunication] = useState(initialCourse?.ownerCommunication || false);
  const [ownerCommunicationDetails, setOwnerCommunicationDetails] = useState(
    initialCourse?.ownerCommunicationDetails || ""
  );
  const [personalizedMealPlan, setPersonalizedMealPlan] = useState(initialCourse?.personalizedMealPlan || false);
  const [personalizedMealPlanDetails, setPersonalizedMealPlanDetails] = useState(
    initialCourse?.personalizedMealPlanDetails || ""
  );
  const [emergencyVetTransport, setEmergencyVetTransport] = useState(
    initialCourse?.emergencyVetTransport || false
  );
  const [emergencyVetTransportDetails, setEmergencyVetTransportDetails] = useState(
    initialCourse?.emergencyVetTransportDetails || ""
  );
  const [plantWatering, setPlantWatering] = useState(initialCourse?.plantWatering || false);
  const [plantWateringDetails, setPlantWateringDetails] = useState(initialCourse?.plantWateringDetails || "");
  const [nonSmoker, setNonSmoker] = useState(initialCourse?.nonSmoker || false);
  const [groomingLocationType, setGroomingLocationType] = useState<"salon" | "mobile_van" | "both">(() => {
    const val = initialCourse?.groomingLocationType;
    if (val === "mobile_van" || val === "both" || val === "salon") return val;
    return "salon";
  });
  const [mobileVanAutonomousPower, setMobileVanAutonomousPower] = useState(
    initialCourse?.mobileVanAutonomousPower || false
  );
  const [mobileVanAutonomousWater, setMobileVanAutonomousWater] = useState(
    initialCourse?.mobileVanAutonomousWater || false
  );
  const [mobileVanNeedsPowerPlug, setMobileVanNeedsPowerPlug] = useState(
    initialCourse?.mobileVanNeedsPowerPlug || false
  );
  const [mobileVanNeedsWaterHookup, setMobileVanNeedsWaterHookup] = useState(
    initialCourse?.mobileVanNeedsWaterHookup || false
  );
  const [mobileVanSpaceRequirement, setMobileVanSpaceRequirement] = useState(
    initialCourse?.mobileVanSpaceRequirement || ""
  );
  const [mobileVanTravelFeePolicy, setMobileVanTravelFeePolicy] = useState(
    initialCourse?.mobileVanTravelFeePolicy || ""
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    if (!initialCourse?.spokenLanguages) return ["Romanian", "English"];
    return initialCourse.spokenLanguages.split(",").map((s) => s.trim()).filter(Boolean);
  });

  const handleToggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const [acceptedDogWeight, setAcceptedDogWeight] = useState<string[]>(() => {
    if (!initialCourse?.acceptedDogWeight) return [];
    return initialCourse.acceptedDogWeight.split(",").map((s) => s.trim()).filter(Boolean);
  });

  const handleToggleWeight = (kg: number | string) => {
    const kgStr = String(kg);
    setAcceptedDogWeight((prev) =>
      prev.includes(kgStr) ? prev.filter((w) => w !== kgStr) : [...prev, kgStr]
    );
  };

  const handleSelectAllWeight = () => {
    setAcceptedDogWeight(Array.from({ length: 100 }, (_, i) => String(i + 1)));
  };

  const handleClearWeight = () => {
    setAcceptedDogWeight([]);
  };

  const handleSetExactWeightRange = (start: number, end: number) => {
    const clampedMin = Math.max(1, Math.min(100, Math.min(start, end)));
    const clampedMax = Math.max(1, Math.min(100, Math.max(start, end)));
    const rangeKgs = Array.from(
      { length: clampedMax - clampedMin + 1 },
      (_, i) => String(clampedMin + i)
    );
    setAcceptedDogWeight(rangeKgs);
  };
  const [maxPetsPerVisit, setMaxPetsPerVisit] = useState(initialCourse?.maxPetsPerVisit || 1);
  const [additionalPetPolicy, setAdditionalPetPolicy] = useState(initialCourse?.additionalPetPolicy || "");
  const [playYard, setPlayYard] = useState(initialCourse?.playYard || false);
  const [playYardDetails, setPlayYardDetails] = useState(initialCourse?.playYardDetails || "");
  const [pool, setPool] = useState(initialCourse?.pool || false);
  const [poolDetails, setPoolDetails] = useState(initialCourse?.poolDetails || "");
  const [socializationPolicy, setSocializationPolicy] = useState(initialCourse?.socializationPolicy || "");
  const [trainingFormat, setTrainingFormat] = useState(initialCourse?.trainingFormat || "");
  const [maxDogsPerGroup, setMaxDogsPerGroup] = useState<number | null>(initialCourse?.maxDogsPerGroup ?? null);
  const [indoorFacility, setIndoorFacility] = useState(initialCourse?.indoorFacility || false);
  const [indoorFacilityDescription, setIndoorFacilityDescription] = useState(
    initialCourse?.indoorFacilityDescription || ""
  );

  // Boarding check-in and check-out times in 24-hour (hh:mm) format (Work week & Weekend)
  const [checkin, setCheckin] = useState(initialCourse?.checkin || "08:00");
  const [checkout, setCheckout] = useState(initialCourse?.checkout || "18:00");
  const [checkinWeekend, setCheckinWeekend] = useState(initialCourse?.checkinWeekend || "09:00");
  const [checkoutWeekend, setCheckoutWeekend] = useState(initialCourse?.checkoutWeekend || "16:00");

  // 7-Day Day-Specific Schedule state
  const [weeklySchedule, setWeeklySchedule] = useState<DayScheduleItem[]>(() =>
    getInitialWeeklySchedule(initialCourse)
  );

  // Closed Periods / Special Closures state
  const [closedPeriods, setClosedPeriods] = useState<ClosedPeriodItem[]>(() =>
    parseClosedPeriods(initialCourse?.schedule)
  );

  // Cartiere Coverage Zones state (Primary & Secondary for Dog Walking)
  const [coverageData, setCoverageData] = useState<CoverageZonesData>(() =>
    parseCoverageZones(initialCourse?.coverageZones)
  );

  const handlePrimaryCartiereChange = (zones: string[]) => {
    setCoverageData((prev) => ({ ...prev, primary: zones }));
  };

  const handleAddSecondaryZone = () => {
    setCoverageData((prev) => ({
      ...prev,
      secondary: [...prev.secondary, { city: "", cartiere: [] }],
    }));
  };

  const handleRemoveSecondaryZone = (index: number) => {
    setCoverageData((prev) => ({
      ...prev,
      secondary: prev.secondary.filter((_, i) => i !== index),
    }));
  };

  const handleSecondaryCityChange = (index: number, newCity: string) => {
    setCoverageData((prev) => {
      const nextSec = [...prev.secondary];
      nextSec[index] = { ...nextSec[index], city: newCity, cartiere: [] };
      return { ...prev, secondary: nextSec };
    });
  };

  const handleSecondaryCartiereChange = (index: number, cartiere: string[]) => {
    setCoverageData((prev) => {
      const nextSec = [...prev.secondary];
      nextSec[index] = { ...nextSec[index], cartiere };
      return { ...prev, secondary: nextSec };
    });
  };

  // Special Openings state
  const [specialOpenings, setSpecialOpenings] = useState<SpecialOpeningItem[]>(() =>
    parseSpecialOpenings(initialCourse?.schedule)
  );

  // Safe Removal Confirmation Guard State
  const [removeConfirm, setRemoveConfirm] = useState<{
    type: "price" | "faq" | "closedPeriod" | "specialOpening" | "secondaryZone";
    index: number;
    title: string;
    description: string;
  } | null>(null);

  // FAQs state
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(() => {
    if (initialCourse?.faq) {
      try {
        const parsed = JSON.parse(initialCourse.faq);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const handleAddPriceTier = () => {
    setPricings((prev) => [...prev, { amount: "", type: defaultPriceType, label: "" }]);
  };

  const handleUpdatePriceTier = (index: number, field: keyof CoursePricingItem, value: string) => {
    setPricings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const requestRemovePriceTier = (index: number) => {
    if (pricings.length <= 1) return;
    const tier = pricings[index];
    const hasData = tier.amount.trim() !== "" || (tier.label && tier.label.trim() !== "");
    if (hasData) {
      setRemoveConfirm({
        type: "price",
        index,
        title: "Remove Price Option",
        description: `Are you sure you want to remove Price Option #${index + 1}?`,
      });
    } else {
      setPricings((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const requestRemoveSecondaryZone = (index: number) => {
    const zone = coverageData.secondary[index];
    const cityNameStr = zone?.city ? ` (${zone.city})` : "";
    setRemoveConfirm({
      type: "secondaryZone",
      index,
      title: "Remove Secondary Coverage Zone",
      description: `Are you sure you want to remove secondary zone${cityNameStr}? All selected neighborhoods for this city will be removed.`,
    });
  };

  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const handleUpdateFaq = (index: number, field: "question" | "answer", value: string) => {
    setFaqs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const requestRemoveFaq = (index: number) => {
    const item = faqs[index];
    const qText = item?.question ? ` "${item.question}"` : "";
    setRemoveConfirm({
      type: "faq",
      index,
      title: "Remove FAQ Item",
      description: `Are you sure you want to remove FAQ Item #${index + 1}${qText}?`,
    });
  };

  const handleAddClosedPeriod = () => {
    setClosedPeriods((prev) => [...prev, { title: "", startDate: "", endDate: "", note: "" }]);
  };

  const handleUpdateClosedPeriod = (index: number, field: keyof ClosedPeriodItem, value: string) => {
    setClosedPeriods((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const requestRemoveClosedPeriod = (index: number) => {
    const item = closedPeriods[index];
    const title = item?.title ? ` "${item.title}"` : "";
    setRemoveConfirm({
      type: "closedPeriod",
      index,
      title: "Remove Closed Period",
      description: `Are you sure you want to remove closed period${title}?`,
    });
  };

  const handleAddSpecialOpening = () => {
    setSpecialOpenings((prev) => [
      ...prev,
      { title: "", startDate: "", endDate: "", checkin: "09:00", checkout: "16:00", note: "" },
    ]);
  };

  const handleUpdateSpecialOpening = (index: number, field: keyof SpecialOpeningItem, value: string) => {
    setSpecialOpenings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const requestRemoveSpecialOpening = (index: number) => {
    const item = specialOpenings[index];
    const title = item?.title ? ` "${item.title}"` : "";
    setRemoveConfirm({
      type: "specialOpening",
      index,
      title: "Remove Special Opening",
      description: `Are you sure you want to remove special opening${title}?`,
    });
  };

  const confirmRemoveItem = () => {
    if (!removeConfirm) return;
    if (removeConfirm.type === "price") {
      setPricings((prev) => prev.filter((_, i) => i !== removeConfirm.index));
    } else if (removeConfirm.type === "faq") {
      setFaqs((prev) => prev.filter((_, i) => i !== removeConfirm.index));
    } else if (removeConfirm.type === "closedPeriod") {
      setClosedPeriods((prev) => prev.filter((_, i) => i !== removeConfirm.index));
    } else if (removeConfirm.type === "specialOpening") {
      setSpecialOpenings((prev) => prev.filter((_, i) => i !== removeConfirm.index));
    } else if (removeConfirm.type === "secondaryZone") {
      handleRemoveSecondaryZone(removeConfirm.index);
    }
    setRemoveConfirm(null);
  };

  const handleUpdateDaySchedule = (dayKey: DayKey, field: keyof DayScheduleItem, value: DayScheduleItem[keyof DayScheduleItem]) => {
    setWeeklySchedule((prev) =>
      prev.map((item) => (item.day === dayKey ? { ...item, [field]: value } : item))
    );
  };

  const handleCopyMonToWorkweek = () => {
    const mon = weeklySchedule.find((d) => d.day === "monday") || weeklySchedule[0];
    setWeeklySchedule((prev) =>
      prev.map((item) =>
        item.day === "saturday" || item.day === "sunday"
          ? item
          : { ...item, checkin: mon.checkin, checkout: mon.checkout, enabled: mon.enabled }
      )
    );
  };

  const handleCopyMonToAll = () => {
    const mon = weeklySchedule.find((d) => d.day === "monday") || weeklySchedule[0];
    setWeeklySchedule((prev) =>
      prev.map((item) => ({ ...item, checkin: mon.checkin, checkout: mon.checkout, enabled: mon.enabled }))
    );
  };

  const scheduleOverlapError = useMemo(() => {
    for (let i = 0; i < closedPeriods.length; i++) {
      const p1 = closedPeriods[i];
      const start1 = getComparableTimestamp(p1.startDate);
      const end1 = getComparableTimestamp(p1.endDate);
      if (!start1 || !end1) continue;

      if (start1 > end1) {
        return `Closed period #${i + 1} (${p1.title || "Untitled"}) has a start date that comes after its end date.`;
      }

      for (let j = i + 1; j < closedPeriods.length; j++) {
        const p2 = closedPeriods[j];
        const start2 = getComparableTimestamp(p2.startDate);
        const end2 = getComparableTimestamp(p2.endDate);
        if (!start2 || !end2) continue;

        if (start1 <= end2 && end1 >= start2) {
          return `Closed period #${i + 1} (${p1.title || "Period 1"}) overlaps with closed period #${j + 1} (${p2.title || "Period 2"}).`;
        }
      }
    }

    for (let i = 0; i < specialOpenings.length; i++) {
      const o1 = specialOpenings[i];
      const start1 = getComparableTimestamp(o1.startDate);
      const end1 = getComparableTimestamp(o1.endDate);
      if (!start1 || !end1) continue;

      if (start1 > end1) {
        return `Special opening #${i + 1} (${o1.title || "Untitled"}) has a start date that comes after its end date.`;
      }

      for (let j = i + 1; j < specialOpenings.length; j++) {
        const o2 = specialOpenings[j];
        const start2 = getComparableTimestamp(o2.startDate);
        const end2 = getComparableTimestamp(o2.endDate);
        if (!start2 || !end2) continue;

        if (start1 <= end2 && end1 >= start2) {
          return `Special opening #${i + 1} (${o1.title || "Opening 1"}) overlaps with special opening #${j + 1} (${o2.title || "Opening 2"}).`;
        }
      }
    }

    for (let i = 0; i < closedPeriods.length; i++) {
      const p = closedPeriods[i];
      const pStart = getComparableTimestamp(p.startDate);
      const pEnd = getComparableTimestamp(p.endDate);
      if (!pStart || !pEnd) continue;

      for (let j = 0; j < specialOpenings.length; j++) {
        const o = specialOpenings[j];
        const oStart = getComparableTimestamp(o.startDate);
        const oEnd = getComparableTimestamp(o.endDate);
        if (!oStart || !oEnd) continue;

        if (pStart <= oEnd && pEnd >= oStart) {
          return `Closed period #${i + 1} (${p.title || "Closure"}) overlaps with special opening #${j + 1} (${o.title || "Opening"}). A course cannot be closed and specially open simultaneously.`;
        }
      }
    }

    return null;
  }, [closedPeriods, specialOpenings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(`${itemNoun} name is required.`);
      return;
    }

    if (scheduleOverlapError) {
      setError(scheduleOverlapError);
      return;
    }

    for (let i = 0; i < pricings.length; i++) {
      const p = pricings[i];
      if (p.amount && p.amount.trim()) {
        const num = Number(p.amount);
        if (isNaN(num) || num <= 0) {
          setError(`Price amount for option #${i + 1} must be a positive number in lei.`);
          return;
        }
      }
    }

    setError(null);
    const formData = new FormData();
    if (isEdit && initialCourse?.id) {
      formData.append("id", initialCourse.id);
    }
    formData.append("organizationId", organizationId);
    formData.append("serviceId", serviceId);
    formData.append("name", name);
    if (pricings.length === 1 && !pricings[0].label) {
      formData.append("price", pricings[0].amount);
      formData.append("priceType", pricings[0].type || defaultPriceType);
    } else {
      formData.append("price", JSON.stringify(pricings));
      formData.append("priceType", pricings[0]?.type || defaultPriceType);
    }
    formData.append("certifiedTrainer", String(certifiedTrainer));
    formData.append("certifierName", certifierName);
    formData.append("trainerExperienceDescription", trainerExperienceDescription);
    formData.append("veterinaryTraining", String(veterinaryTraining));
    formData.append("veterinaryTrainingCertifier", veterinaryTrainingCertifier);
    formData.append("veterinaryTrainingDetails", veterinaryTrainingDetails);
    formData.append("ageLimitsEnabled", String(ageLimitsEnabled));
    formData.append("ageLimits", selectedAgeLimits.join(","));
    formData.append("acceptedDogSizesEnabled", String(dogSizesEnabled));
    formData.append("acceptedDogSizes", selectedDogSizes.join(","));
    formData.append("trainingFormat", trainingFormat);
    if (maxDogsPerGroup !== null && maxDogsPerGroup !== undefined) {
      formData.append("maxDogsPerGroup", String(maxDogsPerGroup));
    }
    formData.append("indoorFacility", String(indoorFacility));
    formData.append("indoorFacilityDescription", indoorFacilityDescription);
    formData.append("playYard", String(playYard));
    formData.append("playYardDetails", playYardDetails);
    formData.append("pool", String(pool));
    formData.append("poolDetails", poolDetails);
    formData.append("socializationPolicy", socializationPolicy);
    formData.append("dedicatedField", String(dedicatedField));
    formData.append("trainingFieldDescription", trainingFieldDescription);
    formData.append("trainingFieldAddress", trainingFieldAddress);
    formData.append("trainingFieldGoogleBusinessProfile", trainingFieldGoogleBusinessProfile);
    formData.append("trainingFieldGoogleMapsLink", trainingFieldGoogleMapsLink);
    formData.append("parking", String(parking));
    formData.append("parkingDescription", parkingDescription);
    formData.append("details", details);
    formData.append("termsOfParticipation", termsOfParticipation);
    formData.append("medicationAdministration", String(medicationAdministration));
    formData.append("medicationAdministrationDetails", medicationAdministrationDetails);
    formData.append("surveillance247", String(surveillance247));
    formData.append("surveillance247Details", surveillance247Details);
    formData.append("webCam", String(webCam));
    formData.append("webCamDetails", webCamDetails);
    formData.append("dailyWalks", String(dailyWalks));
    formData.append("ownerCommunication", String(ownerCommunication));
    formData.append("ownerCommunicationDetails", ownerCommunicationDetails);
    formData.append("personalizedMealPlan", String(personalizedMealPlan));
    formData.append("personalizedMealPlanDetails", personalizedMealPlanDetails);
    formData.append("emergencyVetTransport", String(emergencyVetTransport));
    formData.append("emergencyVetTransportDetails", emergencyVetTransportDetails);
    formData.append("plantWatering", String(plantWatering));
    formData.append("plantWateringDetails", plantWateringDetails);
    formData.append("nonSmoker", String(nonSmoker));
    formData.append("spokenLanguages", selectedLanguages.join(","));
    if (isGrooming) {
      const sortedWeights = [...acceptedDogWeight].sort((a, b) => Number(a) - Number(b));
      formData.append("acceptedDogWeight", sortedWeights.join(","));
      formData.append("observationsAndDisclaimers", observationsAndDisclaimers);
    }
    formData.append("maxPetsPerVisit", String(maxPetsPerVisit));
    formData.append("additionalPetPolicy", additionalPetPolicy);

    if (isBoarding) {
      formData.append("checkin", checkin);
      formData.append("checkout", checkout);
      formData.append("checkinWeekend", checkinWeekend);
      formData.append("checkoutWeekend", checkoutWeekend);
    }

    const activeClosedPeriods = closedPeriods.filter((p) => p.startDate && p.endDate);
    const activeSpecialOpenings = specialOpenings.filter((o) => o.startDate && o.endDate);
    if (activeClosedPeriods.length > 0 || activeSpecialOpenings.length > 0) {
      formData.append(
        "schedule",
        JSON.stringify({
          weeklySchedule,
          closedPeriods: activeClosedPeriods,
          specialOpenings: activeSpecialOpenings,
        })
      );
    } else {
      formData.append("schedule", JSON.stringify(weeklySchedule));
    }

    if (isDogWalking || isDogSitter || isGrooming) {
      formData.append("coverageZones", serializeCoverageZones(coverageData));
    }

    if (isGrooming) {
      formData.append("groomingLocationType", groomingLocationType);
      formData.append("mobileVanAutonomousPower", String(mobileVanAutonomousPower));
      formData.append("mobileVanAutonomousWater", String(mobileVanAutonomousWater));
      formData.append("mobileVanNeedsPowerPlug", String(mobileVanNeedsPowerPlug));
      formData.append("mobileVanNeedsWaterHookup", String(mobileVanNeedsWaterHookup));
      formData.append("mobileVanSpaceRequirement", mobileVanSpaceRequirement);
      formData.append("mobileVanTravelFeePolicy", mobileVanTravelFeePolicy);
    }

    if (faqs.length > 0) {
      formData.append("faq", JSON.stringify(faqs));
    }

    startTransition(async () => {
      const action = isEdit ? updateCourseAction : createCourseAction;
      const res = await action(null, formData);
      if ("success" in res && res.success) {
        onSubmitSuccess();
      } else {
        setError("error" in res ? res.error : `An error occurred while saving the ${(itemNoun || "course").toLowerCase()}.`);
      }
    });
  };

  const isDirty = useMemo(() => {
    if (name !== (initialCourse?.name || "")) return true;
    if (details !== (initialCourse?.details || "")) return true;
    if (observationsAndDisclaimers !== (initialCourse?.observationsAndDisclaimers || "")) return true;
    if (termsOfParticipation !== (initialCourse?.termsOfParticipation || "")) return true;
    if (certifiedTrainer !== (initialCourse?.certifiedTrainer || false)) return true;
    if (certifierName !== (initialCourse?.certifierName || "")) return true;
    if (trainerExperienceDescription !== (initialCourse?.trainerExperienceDescription || "")) return true;
    if (veterinaryTraining !== (initialCourse?.veterinaryTraining || false)) return true;
    if (veterinaryTrainingCertifier !== (initialCourse?.veterinaryTrainingCertifier || "")) return true;
    if (veterinaryTrainingDetails !== (initialCourse?.veterinaryTrainingDetails || "")) return true;
    if (ageLimitsEnabled !== (initialCourse?.ageLimitsEnabled || false)) return true;
    if (dedicatedField !== (initialCourse?.dedicatedField || false)) return true;
    if (trainingFieldDescription !== (initialCourse?.trainingFieldDescription || "")) return true;
    if (trainingFieldAddress !== (initialCourse?.trainingFieldAddress || "")) return true;
    if (trainingFieldGoogleBusinessProfile !== (initialCourse?.trainingFieldGoogleBusinessProfile || ""))
      return true;
    if (trainingFieldGoogleMapsLink !== (initialCourse?.trainingFieldGoogleMapsLink || "")) return true;
    if (parking !== (initialCourse?.parking || false)) return true;
    if (parkingDescription !== (initialCourse?.parkingDescription || "")) return true;
    if (medicationAdministration !== (initialCourse?.medicationAdministration || false)) return true;
    if (medicationAdministrationDetails !== (initialCourse?.medicationAdministrationDetails || "")) return true;
    if (surveillance247 !== (initialCourse?.surveillance247 || false)) return true;
    if (surveillance247Details !== (initialCourse?.surveillance247Details || "")) return true;
    if (webCam !== (initialCourse?.webCam || false)) return true;
    if (webCamDetails !== (initialCourse?.webCamDetails || "")) return true;
    if (dailyWalks !== (initialCourse?.dailyWalks || 1)) return true;
    if (ownerCommunication !== (initialCourse?.ownerCommunication || false)) return true;
    if (ownerCommunicationDetails !== (initialCourse?.ownerCommunicationDetails || "")) return true;
    if (personalizedMealPlan !== (initialCourse?.personalizedMealPlan || false)) return true;
    if (personalizedMealPlanDetails !== (initialCourse?.personalizedMealPlanDetails || "")) return true;
    if (emergencyVetTransport !== (initialCourse?.emergencyVetTransport || false)) return true;
    if (emergencyVetTransportDetails !== (initialCourse?.emergencyVetTransportDetails || "")) return true;
    if (plantWatering !== (initialCourse?.plantWatering || false)) return true;
    if (plantWateringDetails !== (initialCourse?.plantWateringDetails || "")) return true;
    if (nonSmoker !== (initialCourse?.nonSmoker || false)) return true;
    const initialLanguages = initialCourse?.spokenLanguages
      ? initialCourse.spokenLanguages.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Romanian", "English"];
    if (JSON.stringify(selectedLanguages) !== JSON.stringify(initialLanguages)) return true;
    const initialWeights = initialCourse?.acceptedDogWeight
      ? initialCourse.acceptedDogWeight.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    if (JSON.stringify(acceptedDogWeight) !== JSON.stringify(initialWeights)) return true;
    if (groomingLocationType !== ((initialCourse?.groomingLocationType as "salon" | "mobile_van" | "both") || "salon")) return true;
    if (mobileVanAutonomousPower !== (initialCourse?.mobileVanAutonomousPower || false)) return true;
    if (mobileVanAutonomousWater !== (initialCourse?.mobileVanAutonomousWater || false)) return true;
    if (mobileVanNeedsPowerPlug !== (initialCourse?.mobileVanNeedsPowerPlug || false)) return true;
    if (mobileVanNeedsWaterHookup !== (initialCourse?.mobileVanNeedsWaterHookup || false)) return true;
    if (mobileVanSpaceRequirement !== (initialCourse?.mobileVanSpaceRequirement || "")) return true;
    if (mobileVanTravelFeePolicy !== (initialCourse?.mobileVanTravelFeePolicy || "")) return true;
    if (maxPetsPerVisit !== (initialCourse?.maxPetsPerVisit || 1)) return true;
    if (additionalPetPolicy !== (initialCourse?.additionalPetPolicy || "")) return true;
    return false;
  }, [
    name,
    details,
    observationsAndDisclaimers,
    termsOfParticipation,
    certifiedTrainer,
    certifierName,
    trainerExperienceDescription,
    veterinaryTraining,
    veterinaryTrainingCertifier,
    veterinaryTrainingDetails,
    ageLimitsEnabled,
    dedicatedField,
    trainingFieldDescription,
    trainingFieldAddress,
    trainingFieldGoogleBusinessProfile,
    trainingFieldGoogleMapsLink,
    parking,
    parkingDescription,
    medicationAdministration,
    medicationAdministrationDetails,
    surveillance247,
    surveillance247Details,
    webCam,
    webCamDetails,
    dailyWalks,
    ownerCommunication,
    ownerCommunicationDetails,
    personalizedMealPlan,
    personalizedMealPlanDetails,
    emergencyVetTransport,
    emergencyVetTransportDetails,
    plantWatering,
    plantWateringDetails,
    nonSmoker,
    groomingLocationType,
    mobileVanAutonomousPower,
    mobileVanAutonomousWater,
    mobileVanNeedsPowerPlug,
    mobileVanNeedsWaterHookup,
    mobileVanSpaceRequirement,
    mobileVanTravelFeePolicy,
    selectedLanguages,
    acceptedDogWeight,
    maxPetsPerVisit,
    additionalPetPolicy,
    initialCourse,
  ]);

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmLeave) return;
    }
    onCancel();
  };

  return {
    isEdit,
    isBoarding,
    isGrooming,
    isDogSport,
    isDogTraining,
    isDogWalking,
    isDogSitter,
    isTabbedLayout,
    cityName,
    cartiereList,
    activeTab,
    setActiveTab,
    isPending,
    error,
    setError,
    name,
    setName,
    certifiedTrainer,
    setCertifiedTrainer,
    certifierName,
    setCertifierName,
    trainerExperienceDescription,
    setTrainerExperienceDescription,
    veterinaryTraining,
    setVeterinaryTraining,
    veterinaryTrainingCertifier,
    setVeterinaryTrainingCertifier,
    veterinaryTrainingDetails,
    setVeterinaryTrainingDetails,
    ageLimitsEnabled,
    setAgeLimitsEnabled,
    selectedAgeLimits,
    setSelectedAgeLimits,
    handleToggleAgeLimit,
    dogSizesEnabled,
    setDogSizesEnabled,
    selectedDogSizes,
    setSelectedDogSizes,
    dedicatedField,
    setDedicatedField,
    trainingFieldDescription,
    setTrainingFieldDescription,
    trainingFieldAddress,
    setTrainingFieldAddress,
    trainingFieldGoogleBusinessProfile,
    setTrainingFieldGoogleBusinessProfile,
    trainingFieldGoogleMapsLink,
    setTrainingFieldGoogleMapsLink,
    parking,
    setParking,
    parkingDescription,
    setParkingDescription,
    details,
    setDetails,
    observationsAndDisclaimers,
    setObservationsAndDisclaimers,
    termsOfParticipation,
    setTermsOfParticipation,
    pricings,
    setPricings,
    handleAddPriceTier,
    handleUpdatePriceTier,
    requestRemovePriceTier,
    medicationAdministration,
    setMedicationAdministration,
    medicationAdministrationDetails,
    setMedicationAdministrationDetails,
    surveillance247,
    setSurveillance247,
    surveillance247Details,
    setSurveillance247Details,
    webCam,
    setWebCam,
    webCamDetails,
    setWebCamDetails,
    dailyWalks,
    setDailyWalks,
    ownerCommunication,
    setOwnerCommunication,
    ownerCommunicationDetails,
    setOwnerCommunicationDetails,
    personalizedMealPlan,
    setPersonalizedMealPlan,
    personalizedMealPlanDetails,
    setPersonalizedMealPlanDetails,
    emergencyVetTransport,
    setEmergencyVetTransport,
    emergencyVetTransportDetails,
    setEmergencyVetTransportDetails,
    plantWatering,
    setPlantWatering,
    plantWateringDetails,
    setPlantWateringDetails,
    nonSmoker,
    setNonSmoker,
    selectedLanguages,
    setSelectedLanguages,
    handleToggleLanguage,
    acceptedDogWeight,
    setAcceptedDogWeight,
    handleToggleWeight,
    handleSelectAllWeight,
    handleClearWeight,
    handleSetWeightRange: handleSetExactWeightRange,
    handleSetExactWeightRange,
    maxPetsPerVisit,
    setMaxPetsPerVisit,
    additionalPetPolicy,
    setAdditionalPetPolicy,
    playYard,
    setPlayYard,
    playYardDetails,
    setPlayYardDetails,
    pool,
    setPool,
    poolDetails,
    setPoolDetails,
    socializationPolicy,
    setSocializationPolicy,
    trainingFormat,
    setTrainingFormat,
    maxDogsPerGroup,
    setMaxDogsPerGroup,
    indoorFacility,
    setIndoorFacility,
    indoorFacilityDescription,
    setIndoorFacilityDescription,
    checkin,
    setCheckin,
    checkout,
    setCheckout,
    checkinWeekend,
    setCheckinWeekend,
    checkoutWeekend,
    setCheckoutWeekend,
    weeklySchedule,
    handleUpdateDaySchedule,
    handleCopyMonToWorkweek,
    handleCopyMonToAll,
    closedPeriods,
    handleAddClosedPeriod,
    handleUpdateClosedPeriod,
    requestRemoveClosedPeriod,
    specialOpenings,
    handleAddSpecialOpening,
    handleUpdateSpecialOpening,
    requestRemoveSpecialOpening,
    coverageData,
    handlePrimaryCartiereChange,
    handleAddSecondaryZone,
    handleSecondaryCityChange,
    handleSecondaryCartiereChange,
    requestRemoveSecondaryZone,
    groomingLocationType,
    setGroomingLocationType,
    mobileVanAutonomousPower,
    setMobileVanAutonomousPower,
    mobileVanAutonomousWater,
    setMobileVanAutonomousWater,
    mobileVanNeedsPowerPlug,
    setMobileVanNeedsPowerPlug,
    mobileVanNeedsWaterHookup,
    setMobileVanNeedsWaterHookup,
    mobileVanSpaceRequirement,
    setMobileVanSpaceRequirement,
    mobileVanTravelFeePolicy,
    setMobileVanTravelFeePolicy,
    faqs,
    handleAddFaq,
    handleUpdateFaq,
    requestRemoveFaq,
    removeConfirm,
    setRemoveConfirm,
    confirmRemoveItem,
    scheduleOverlapError,
    handleSubmit,
    handleCancel,
    isDirty,
  };
}
