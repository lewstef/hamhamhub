"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import type { Course, SecondaryCoverageZone, CoverageZonesData } from "@/types/course";
import { parseCoverageZones, serializeCoverageZones } from "@/types/course";
import { createCourseAction, updateCourseAction } from "@/app/actions/courses";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BooleanToggleField } from "@/components/ui/boolean-toggle-field";
import { ArrowLeft, Loader2, AlertCircle, FileText, HelpCircle, DollarSign, MapPin, Calendar, FileCheck, Sliders, X } from "lucide-react";
import { parseDateString } from "@/components/ui/date-picker-input";
import { getCartiereForCity } from "@/config/romanian-cartiere";
import { CourseGeneralTab } from "./course-form/course-general-tab";
import { CoursePricingTab } from "./course-form/course-pricing-tab";
import { CourseScheduleTab, DayScheduleGrid } from "./course-form/course-schedule-tab";
import { CourseCareTab } from "./course-form/course-care-tab";
import { CourseLocationTab } from "./course-form/course-location-tab";
import { CourseFaqTab } from "./course-form/course-faq-tab";
import { TrainerAttributesCard } from "./course-form/sections/trainer-attributes-card";
import { AgeLimitsSection } from "./course-form/sections/age-limits-section";
import type {
  CoursePricingItem,
  ClosedPeriodItem,
  SpecialOpeningItem,
  DayKey,
  DayScheduleItem,
  CourseFormProps,
} from "./course-form/types";

export type {
  CoursePricingItem,
  ClosedPeriodItem,
  SpecialOpeningItem,
  DayKey,
  DayScheduleItem,
  CourseFormProps,
};

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
          return parsed.map((item: any) => ({
            amount: typeof item === "object" && item?.amount !== undefined ? String(item.amount) : String(item),
            type: typeof item === "object" && item?.type ? String(item.type) : priceType || defaultType,
            label: typeof item === "object" && item?.label ? String(item.label) : "",
          }));
        }
      } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Array.isArray(parsed.weeklySchedule) && parsed.weeklySchedule.length === 7) {
        return parsed.weeklySchedule;
      }
    } catch (e) { }
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

/**
 * CourseForm Component
 *
 * Form rendering panel for creating or editing sub-service items (Training Courses, Dog Sports, Boarding, Grooming, Walking, Sitting).
 * Dog Sport, Dog Training, Dog Boarding, Dog Walking, and Dog Sitting services render a clean tabbed layout.
 * Grooming and other services render a responsive two-column layout.
 */
export function CourseForm({
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
  const isTabbedLayout = isDogSport || isDogTraining || isBoarding || isDogWalking || isDogSitter;
  const cityName = orgCity || "Cluj-Napoca";
  const cartiereList = getCartiereForCity(cityName);
  const [activeTab, setActiveTab] = useState<"general" | "terms" | "faq" | "pricing" | "schedule" | "location" | "others">("general");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialCourse?.name || "");
  const [certifiedTrainer, setCertifiedTrainer] = useState(initialCourse?.certifiedTrainer || false);
  const [certifierName, setCertifierName] = useState(initialCourse?.certifierName || "");
  const [trainerExperienceDescription, setTrainerExperienceDescription] = useState(initialCourse?.trainerExperienceDescription || "");
  const [ageLimitsEnabled, setAgeLimitsEnabled] = useState(initialCourse?.ageLimitsEnabled || false);
  const [selectedAgeLimits, setSelectedAgeLimits] = useState<string[]>(
    initialCourse?.ageLimits
      ? initialCourse.ageLimits.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );

  const handleToggleAgeLimit = (limit: string) => {
    setSelectedAgeLimits((prev) =>
      prev.includes(limit) ? prev.filter((a) => a !== limit) : [...prev, limit]
    );
  };
  const [dedicatedField, setDedicatedField] = useState(initialCourse?.dedicatedField || false);
  const [trainingFieldDescription, setTrainingFieldDescription] = useState(initialCourse?.trainingFieldDescription || "");
  const [trainingFieldAddress, setTrainingFieldAddress] = useState(initialCourse?.trainingFieldAddress || "");
  const [trainingFieldGoogleBusinessProfile, setTrainingFieldGoogleBusinessProfile] = useState(initialCourse?.trainingFieldGoogleBusinessProfile || "");
  const [trainingFieldGoogleMapsLink, setTrainingFieldGoogleMapsLink] = useState(initialCourse?.trainingFieldGoogleMapsLink || "");
  const [parking, setParking] = useState(initialCourse?.parking || false);
  const [parkingDescription, setParkingDescription] = useState(initialCourse?.parkingDescription || "");
  const [details, setDetails] = useState(initialCourse?.details || "");
  const [termsOfParticipation, setTermsOfParticipation] = useState(initialCourse?.termsOfParticipation || "");

  const defaultPriceType = isBoarding ? "night" : isGrooming ? "service" : isDogSitter ? "hour" : "course";
  const [pricings, setPricings] = useState<CoursePricingItem[]>(() =>
    parseCoursePricings(initialCourse?.price, initialCourse?.priceType, defaultPriceType)
  );
  const [medicationAdministration, setMedicationAdministration] = useState(initialCourse?.medicationAdministration || false);
  const [medicationAdministrationDetails, setMedicationAdministrationDetails] = useState(initialCourse?.medicationAdministrationDetails || "");
  const [surveillance247, setSurveillance247] = useState(initialCourse?.surveillance247 || false);
  const [surveillance247Details, setSurveillance247Details] = useState(initialCourse?.surveillance247Details || "");
  const [webCam, setWebCam] = useState(initialCourse?.webCam || false);
  const [webCamDetails, setWebCamDetails] = useState(initialCourse?.webCamDetails || "");
  const [dailyWalks, setDailyWalks] = useState(initialCourse?.dailyWalks || 1);
  const [ownerCommunication, setOwnerCommunication] = useState(initialCourse?.ownerCommunication || false);
  const [ownerCommunicationDetails, setOwnerCommunicationDetails] = useState(initialCourse?.ownerCommunicationDetails || "");
  const [personalizedMealPlan, setPersonalizedMealPlan] = useState(initialCourse?.personalizedMealPlan || false);
  const [personalizedMealPlanDetails, setPersonalizedMealPlanDetails] = useState(initialCourse?.personalizedMealPlanDetails || "");

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
      } catch (e) { }
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
    setSpecialOpenings((prev) => [...prev, { title: "", startDate: "", endDate: "", checkin: "09:00", checkout: "16:00", note: "" }]);
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

  const handleUpdateDaySchedule = (dayKey: DayKey, field: keyof DayScheduleItem, value: any) => {
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
    formData.append("ageLimitsEnabled", String(ageLimitsEnabled));
    formData.append("ageLimits", selectedAgeLimits.join(","));
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

    if (isBoarding) {
      formData.append("checkin", checkin);
      formData.append("checkout", checkout);
      formData.append("checkinWeekend", checkinWeekend);
      formData.append("checkoutWeekend", checkoutWeekend);
    }

    const activeClosedPeriods = closedPeriods.filter((p) => p.startDate && p.endDate);
    const activeSpecialOpenings = specialOpenings.filter((o) => o.startDate && o.endDate);
    if (activeClosedPeriods.length > 0 || activeSpecialOpenings.length > 0) {
      formData.append("schedule", JSON.stringify({ weeklySchedule, closedPeriods: activeClosedPeriods, specialOpenings: activeSpecialOpenings }));
    } else {
      formData.append("schedule", JSON.stringify(weeklySchedule));
    }

    if (isDogWalking || isDogSitter) {
      formData.append("coverageZones", serializeCoverageZones(coverageData));
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
        setError("error" in res ? res.error : `An error occurred while saving the ${itemNoun.toLowerCase()}.`);
      }
    });
  };

  const isDirty = useMemo(() => {
    if (name !== (initialCourse?.name || "")) return true;
    if (details !== (initialCourse?.details || "")) return true;
    if (termsOfParticipation !== (initialCourse?.termsOfParticipation || "")) return true;
    if (certifiedTrainer !== (initialCourse?.certifiedTrainer || false)) return true;
    if (certifierName !== (initialCourse?.certifierName || "")) return true;
    if (trainerExperienceDescription !== (initialCourse?.trainerExperienceDescription || "")) return true;
    if (ageLimitsEnabled !== (initialCourse?.ageLimitsEnabled || false)) return true;
    if (dedicatedField !== (initialCourse?.dedicatedField || false)) return true;
    if (trainingFieldDescription !== (initialCourse?.trainingFieldDescription || "")) return true;
    if (trainingFieldAddress !== (initialCourse?.trainingFieldAddress || "")) return true;
    if (trainingFieldGoogleBusinessProfile !== (initialCourse?.trainingFieldGoogleBusinessProfile || "")) return true;
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
    return false;
  }, [
    name, details, termsOfParticipation, certifiedTrainer, certifierName, trainerExperienceDescription,
    ageLimitsEnabled, dedicatedField, trainingFieldDescription, trainingFieldAddress,
    trainingFieldGoogleBusinessProfile, trainingFieldGoogleMapsLink, parking, parkingDescription,
    medicationAdministration, medicationAdministrationDetails, surveillance247, surveillance247Details,
    webCam, webCamDetails, dailyWalks, ownerCommunication, ownerCommunicationDetails,
    personalizedMealPlan, personalizedMealPlanDetails, initialCourse
  ]);

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmLeave) return;
    }
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header and Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border/60">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group self-start cursor-pointer"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to {itemNoun}s List
          </button>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {isEdit ? `Edit ${itemNoun}: ${initialCourse?.name}` : `Create New ${itemNoun}`}
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure the specific {itemNoun.toLowerCase()} details, pricing structure, and facilities.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-10 px-5 font-semibold text-xs rounded-xl"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="font-bold h-10 px-6 text-xs rounded-xl shadow-md shadow-primary/10"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit ? "Save Changes" : `Create ${itemNoun}`}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-semibold">
          <AlertCircle className="size-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation (tabbed layout only) */}
      {isTabbedLayout && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
          {(
            [
              { key: "general" as const, label: "General", Icon: FileText, hasError: false },
              { key: "terms" as const, label: isBoarding ? "Terms" : "Terms of participation", Icon: FileCheck, hasError: false },
              { key: "pricing" as const, label: "Pricing", Icon: DollarSign, hasError: false },
              { key: "schedule" as const, label: "Schedule", Icon: Calendar, hasError: !!scheduleOverlapError },
              { key: "location" as const, label: "Coverage zones", Icon: MapPin, hasError: false },
              { key: "faq" as const, label: "FAQ", Icon: HelpCircle, hasError: false },
              ...(isBoarding ? [{ key: "others" as const, label: "Care & facilities", Icon: Sliders, hasError: false }] : []),
            ]
          ).map(({ key, label, Icon, hasError }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === key
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
              {hasError && (
                <span className="size-2 rounded-full bg-destructive animate-pulse" title="Overlap Conflict Detected" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── TABBED LAYOUT ────────────────────────────────────── */}
      {isTabbedLayout ? (
        <div className="space-y-6 min-h-[400px]">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <CourseGeneralTab
              name={name}
              onNameChange={setName}
              details={details}
              onDetailsChange={setDetails}
              certifiedTrainer={certifiedTrainer}
              onCertifiedTrainerChange={setCertifiedTrainer}
              certifierName={certifierName}
              onCertifierNameChange={setCertifierName}
              trainerExperienceDescription={trainerExperienceDescription}
              onTrainerExperienceDescriptionChange={setTrainerExperienceDescription}
              ageLimitsEnabled={ageLimitsEnabled}
              onAgeLimitsEnabledChange={setAgeLimitsEnabled}
              selectedAgeLimits={selectedAgeLimits}
              onToggleAgeLimit={handleToggleAgeLimit}
              itemNoun={itemNoun}
              isDogWalking={isDogWalking}
              isDogTraining={isDogTraining}
              isDogSport={isDogSport}
              isDogSitter={isDogSitter}
              hideAgeLimits={isTabbedLayout}
            />
          )}

          {/* TAB 2: TERMS OF PARTICIPATION */}
          {activeTab === "terms" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                  Age Limits &amp; Prerequisites
                </h3>
                <AgeLimitsSection
                  itemNoun={itemNoun}
                  ageLimitsEnabled={ageLimitsEnabled}
                  onAgeLimitsEnabledChange={setAgeLimitsEnabled}
                  selectedAgeLimits={selectedAgeLimits}
                  onSelectedAgeLimitsChange={setSelectedAgeLimits}
                />
              </div>

              <div className="space-y-2">
                <Label>{isBoarding ? "Terms" : "Terms of Participation"}</Label>
                <WysiwygEditor
                  value={termsOfParticipation}
                  onChange={setTermsOfParticipation}
                  placeholder="List prerequisites, mandatory vaccine records, age limits, discipline rules..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <CoursePricingTab
                itemNoun={itemNoun}
                isBoarding={isBoarding}
                isGrooming={isGrooming}
                pricings={pricings}
                onAdd={handleAddPriceTier}
                onUpdate={handleUpdatePriceTier}
                onRemove={requestRemovePriceTier}
                isDogWalking={isDogWalking}
              />
            </div>
          )}

          {/* TAB 4: SCHEDULE */}
          {activeTab === "schedule" && (
            <CourseScheduleTab
              isDogSport={isDogSport}
              scheduleOverlapError={scheduleOverlapError}
              weeklySchedule={weeklySchedule}
              onUpdateDaySchedule={handleUpdateDaySchedule}
              onCopyMonToWorkweek={handleCopyMonToWorkweek}
              onCopyMonToAll={handleCopyMonToAll}
              closedPeriods={closedPeriods}
              onAddClosedPeriod={handleAddClosedPeriod}
              onUpdateClosedPeriod={handleUpdateClosedPeriod}
              onRemoveClosedPeriod={requestRemoveClosedPeriod}
              specialOpenings={specialOpenings}
              onAddSpecialOpening={handleAddSpecialOpening}
              onUpdateSpecialOpening={handleUpdateSpecialOpening}
              onRemoveSpecialOpening={requestRemoveSpecialOpening}
            />
          )}

          {/* TAB 5: LOCATION */}
          {activeTab === "location" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5">
                <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">
                    {(isDogWalking || isDogSitter) ? "Coverage zones" : "Location & Map Details"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {(isDogWalking || isDogSitter)
                      ? `Configure specific neighborhoods and coverage zones in your city where ${isDogSitter ? "dog sitting" : "dog walking"} services are provided.`
                      : "Provide location details, business profile, map links, and parking information for clients."}
                  </p>
                </div>
                <CourseLocationTab
                  layout="tabbed"
                  isBoarding={isBoarding}
                  isDogWalking={isDogWalking}
                  isDogSitter={isDogSitter}
                  cityName={cityName}
                  cartiereList={cartiereList}
                  selectedCartiere={coverageData.primary}
                  onSelectedCartiereChange={handlePrimaryCartiereChange}
                  secondaryZones={coverageData.secondary}
                  onAddSecondaryZone={handleAddSecondaryZone}
                  onRemoveSecondaryZone={requestRemoveSecondaryZone}
                  onSecondaryCityChange={handleSecondaryCityChange}
                  onSecondaryCartiereChange={handleSecondaryCartiereChange}
                  hideDedicatedField={isDogWalking || isDogSitter}
                  hideParking={isDogWalking || isDogSitter}
                  dedicatedField={dedicatedField}
                  onDedicatedFieldChange={setDedicatedField}
                  trainingFieldDescription={trainingFieldDescription}
                  onTrainingFieldDescriptionChange={setTrainingFieldDescription}
                  trainingFieldAddress={trainingFieldAddress}
                  onTrainingFieldAddressChange={setTrainingFieldAddress}
                  trainingFieldGoogleBusinessProfile={trainingFieldGoogleBusinessProfile}
                  onGbpChange={setTrainingFieldGoogleBusinessProfile}
                  trainingFieldGoogleMapsLink={trainingFieldGoogleMapsLink}
                  onMapsChange={setTrainingFieldGoogleMapsLink}
                  parking={parking}
                  onParkingChange={setParking}
                  parkingDescription={parkingDescription}
                  onParkingDescriptionChange={setParkingDescription}
                />
              </div>
            </div>
          )}

          {/* TAB 6: FAQ */}
          {activeTab === "faq" && (
            <CourseFaqTab
              itemNoun={itemNoun}
              faqs={faqs}
              onAdd={handleAddFaq}
              onUpdate={handleUpdateFaq}
              onRemove={requestRemoveFaq}
            />
          )}

          {/* TAB 7: OTHERS (Boarding Details & Care Amenities) */}
          {activeTab === "others" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-5">
                <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">Care &amp; Facilities</h3>
                  <p className="text-xs text-muted-foreground">
                    Configure specialized boarding amenities, webcam access, meal customization, and owner updates.
                  </p>
                </div>
                <CourseCareTab
                  isDogWalking={isDogWalking}
                  dailyWalks={dailyWalks}
                  onDailyWalksChange={setDailyWalks}
                  medicationAdministration={medicationAdministration}
                  onMedicationAdministrationChange={setMedicationAdministration}
                  medicationAdministrationDetails={medicationAdministrationDetails}
                  onMedicationAdministrationDetailsChange={setMedicationAdministrationDetails}
                  surveillance247={surveillance247}
                  onSurveillance247Change={setSurveillance247}
                  surveillance247Details={surveillance247Details}
                  onSurveillance247DetailsChange={setSurveillance247Details}
                  webCam={webCam}
                  onWebCamChange={setWebCam}
                  webCamDetails={webCamDetails}
                  onWebCamDetailsChange={setWebCamDetails}
                  ownerCommunication={ownerCommunication}
                  onOwnerCommunicationChange={setOwnerCommunication}
                  ownerCommunicationDetails={ownerCommunicationDetails}
                  onOwnerCommunicationDetailsChange={setOwnerCommunicationDetails}
                  personalizedMealPlan={personalizedMealPlan}
                  onPersonalizedMealPlanChange={setPersonalizedMealPlan}
                  personalizedMealPlanDetails={personalizedMealPlanDetails}
                  onPersonalizedMealPlanDetailsChange={setPersonalizedMealPlanDetails}
                />
              </div>
            </div>
          )}

          {/* Bottom Action Buttons (tabbed layout) */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 px-6 font-semibold"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="font-bold h-11 px-8 shadow-md shadow-primary/10"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4.5 animate-spin" />}
              {isEdit ? "Save Changes" : `Create ${itemNoun}`}
            </Button>
          </div>
        </div>
      ) : (
        /* ── FLAT LAYOUT (Grooming and other non-tabbed services) ── */
        <div className="grid grid-cols-1 lg:grid-cols-[64%_36%] gap-6">
          {/* Column 1 — 64% Width */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="course-name">{itemNoun} Name</Label>
              <Input
                id="course-name"
                type="text"
                placeholder={
                  itemNoun === "Boarding service"
                    ? "e.g. Standard Room, VIP Cabin"
                    : isGrooming
                    ? "e.g. Full Grooming & Bath"
                    : "e.g. Puppy Socialization Class"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card"
                required
              />
            </div>

            {/* Trainer & Facility Attributes card (not for grooming) */}
            {!isGrooming && (
              <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                  {itemNoun === "Boarding service" ? "Facility Attributes" : "Trainer & Facility Attributes"}
                </h3>

                {itemNoun !== "Boarding service" && (
                  <>
                    <TrainerAttributesCard
                      itemNoun={itemNoun}
                      bare
                      certifiedTrainer={certifiedTrainer}
                      onCertifiedTrainerChange={setCertifiedTrainer}
                      certifierName={certifierName}
                      onCertifierNameChange={setCertifierName}
                      trainerExperienceDescription={trainerExperienceDescription}
                      onTrainerExperienceDescriptionChange={setTrainerExperienceDescription}
                    />

                    <div className="h-px bg-border/40" />

                    {/* Age Limits */}
                    <AgeLimitsSection
                      itemNoun={itemNoun}
                      ageLimitsEnabled={ageLimitsEnabled}
                      onAgeLimitsEnabledChange={setAgeLimitsEnabled}
                      selectedAgeLimits={selectedAgeLimits}
                      onSelectedAgeLimitsChange={setSelectedAgeLimits}
                    />

                    <div className="h-px bg-border/60" />

                    {/* Dedicated Training Field */}
                    <BooleanToggleField
                      label="Dedicated Training Field"
                      description="Does the class run on a fully closed, dedicated training field?"
                      checked={dedicatedField}
                      onChange={setDedicatedField}
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Training Field Description</Label>
                          <WysiwygEditor
                            value={trainingFieldDescription}
                            onChange={setTrainingFieldDescription}
                            placeholder="Explain field attributes, size, safety fences, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="training-field-address">Address</Label>
                          <Input
                            id="training-field-address"
                            type="text"
                            placeholder="e.g. 123 Canine Lane, Bucharest"
                            value={trainingFieldAddress}
                            onChange={(e) => setTrainingFieldAddress(e.target.value)}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="training-field-gbp">Google Business Profile</Label>
                          <Input
                            id="training-field-gbp"
                            type="url"
                            placeholder="https://business.google.com/..."
                            value={trainingFieldGoogleBusinessProfile}
                            onChange={(e) => setTrainingFieldGoogleBusinessProfile(e.target.value)}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="training-field-maps">Google Maps Link</Label>
                          <Input
                            id="training-field-maps"
                            type="url"
                            placeholder="https://maps.google.com/..."
                            value={trainingFieldGoogleMapsLink}
                            onChange={(e) => setTrainingFieldGoogleMapsLink(e.target.value)}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    </BooleanToggleField>

                    <div className="h-px bg-border/60" />
                  </>
                )}

                {/* Parking (all non-grooming services) */}
                <BooleanToggleField
                  label="Parking"
                  description="Is parking available on site or nearby?"
                  checked={parking}
                  onChange={setParking}
                >
                  <WysiwygEditor
                    value={parkingDescription}
                    onChange={setParkingDescription}
                    placeholder="Details about parking capacity, location, fee..."
                  />
                </BooleanToggleField>
              </div>
            )}

            {/* Boarding Details (boarding-only section in flat mode) */}
            {itemNoun === "Boarding service" && (
              <div className="space-y-5 p-5 rounded-2xl border border-border/80 bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/90 mb-3">
                  Care &amp; Facilities
                </h3>
                <CourseCareTab
                  isDogWalking={isDogWalking}
                  dailyWalks={dailyWalks}
                  onDailyWalksChange={setDailyWalks}
                  medicationAdministration={medicationAdministration}
                  onMedicationAdministrationChange={setMedicationAdministration}
                  medicationAdministrationDetails={medicationAdministrationDetails}
                  onMedicationAdministrationDetailsChange={setMedicationAdministrationDetails}
                  surveillance247={surveillance247}
                  onSurveillance247Change={setSurveillance247}
                  surveillance247Details={surveillance247Details}
                  onSurveillance247DetailsChange={setSurveillance247Details}
                  webCam={webCam}
                  onWebCamChange={setWebCam}
                  webCamDetails={webCamDetails}
                  onWebCamDetailsChange={setWebCamDetails}
                  ownerCommunication={ownerCommunication}
                  onOwnerCommunicationChange={setOwnerCommunication}
                  ownerCommunicationDetails={ownerCommunicationDetails}
                  onOwnerCommunicationDetailsChange={setOwnerCommunicationDetails}
                  personalizedMealPlan={personalizedMealPlan}
                  onPersonalizedMealPlanChange={setPersonalizedMealPlan}
                  personalizedMealPlanDetails={personalizedMealPlanDetails}
                  onPersonalizedMealPlanDetailsChange={setPersonalizedMealPlanDetails}
                />
                {isBoarding && (
                  <>
                    <div className="h-px bg-border/60" />
                    <div className="space-y-4">
                      <DayScheduleGrid
                        weeklySchedule={weeklySchedule}
                        useSportLabels={isDogSport}
                        onUpdate={handleUpdateDaySchedule}
                        onCopyMonToWorkweek={handleCopyMonToWorkweek}
                        onCopyMonToAll={handleCopyMonToAll}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Details & Terms Editors */}
            <div className="space-y-2">
              <Label>{itemNoun} Information and Details</Label>
              <WysiwygEditor
                value={details}
                onChange={setDetails}
                placeholder="What does the program include? Explain schedules, details..."
              />
            </div>

            <div className="space-y-2">
              <Label>{isBoarding ? "Terms" : "Terms of Participation"}</Label>
              <WysiwygEditor
                value={termsOfParticipation}
                onChange={setTermsOfParticipation}
                placeholder="List prerequisites, mandatory vaccine records, age, etc."
              />
            </div>

            <CourseFaqTab
              itemNoun={itemNoun}
              faqs={faqs}
              onAdd={handleAddFaq}
              onUpdate={handleUpdateFaq}
              onRemove={requestRemoveFaq}
              compact
            />
          </div>

          {/* Column 2 — 36% Width */}
          <div className="space-y-6">
            <CoursePricingTab
              itemNoun={itemNoun}
              isBoarding={isBoarding}
              isGrooming={isGrooming}
              pricings={pricings}
              onAdd={handleAddPriceTier}
              onUpdate={handleUpdatePriceTier}
              onRemove={requestRemovePriceTier}
              compact
            />

            {/* Submit Actions */}
            <div className="space-y-3">
              {(error || scheduleOverlapError) && (
                <div
                  data-testid="bottom-submit-notification"
                  className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2.5 text-xs font-semibold shadow-sm animate-in fade-in duration-150"
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error || scheduleOverlapError}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  className="flex-1 font-bold h-11 shadow-md shadow-primary/10"
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 size-4.5 animate-spin" />}
                  {isEdit ? "Save Changes" : `Create ${itemNoun}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="h-11 font-semibold"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Confirmation Guard Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              type="button"
              onClick={() => setRemoveConfirm(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <div className="space-y-1.5 pt-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="size-4 text-destructive shrink-0" />
                {removeConfirm.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {removeConfirm.description}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRemoveConfirm(null)}
                className="rounded-xl h-9 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={confirmRemoveItem}
                className="rounded-xl h-9 text-xs font-semibold"
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
