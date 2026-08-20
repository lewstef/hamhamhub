// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import {
  parseCoverageZones,
  serializeCoverageZones,
  CoverageZonesData,
  SPOKEN_LANGUAGES_LIST,
  DOG_SPORT_DISCIPLINES,
  DOG_TRAINING_TOPICS,
  DOG_TRAINING_FORMATS,
  DOG_GROOMING_WEIGHT_TIERS,
  formatWeightRanges,
} from "./course";

describe("Course Types & Coverage Zone Helpers (src/types/course.ts)", () => {
  describe("parseCoverageZones", () => {
    it("returns empty arrays when raw input is null, undefined, or empty string", () => {
      expect(parseCoverageZones(null)).toEqual({ primary: [], secondary: [] });
      expect(parseCoverageZones(undefined)).toEqual({ primary: [], secondary: [] });
      expect(parseCoverageZones("")).toEqual({ primary: [], secondary: [] });
    });

    it("parses valid JSON array of strings as legacy primary coverage zones", () => {
      const result = parseCoverageZones(JSON.stringify([" Mănăștur ", "Gheorgheni", ""]));
      expect(result).toEqual({
        primary: ["Mănăștur", "Gheorgheni"],
        secondary: [],
      });
    });

    it("parses structured CoverageZonesData JSON object", () => {
      const data: CoverageZonesData = {
        primary: ["Centru", " Zorilor "],
        secondary: [
          { city: "Timișoara", cartiere: [" Iosefin ", "Fabric"] },
          { city: " Brașov ", cartiere: [" Astra "] },
        ],
      };

      const result = parseCoverageZones(JSON.stringify(data));
      expect(result).toEqual({
        primary: ["Centru", "Zorilor"],
        secondary: [
          { city: "Timișoara", cartiere: ["Iosefin", "Fabric"] },
          { city: "Brașov", cartiere: ["Astra"] },
        ],
      });
    });

    it("handles structured object with missing or non-array primary/secondary properties", () => {
      const result = parseCoverageZones(JSON.stringify({ primary: "not-an-array", secondary: null }));
      expect(result).toEqual({ primary: [], secondary: [] });
    });

    it("filters out malformed items inside secondary array", () => {
      const rawObj = {
        primary: ["Centru"],
        secondary: [
          null,
          "invalid-string-item",
          { city: 123, cartiere: ["Astra"] },
          { city: "Brașov", cartiere: "not-an-array" },
          { city: "Timișoara", cartiere: ["Fabric"] },
        ],
      };
      const result = parseCoverageZones(JSON.stringify(rawObj));
      expect(result).toEqual({
        primary: ["Centru"],
        secondary: [{ city: "Timișoara", cartiere: ["Fabric"] }],
      });
    });

    it("falls back to comma-separated string splitting on JSON parse error for string input", () => {
      const result = parseCoverageZones("Mănăștur, Gheorgheni, Zorilor");
      expect(result).toEqual({
        primary: ["Mănăștur", "Gheorgheni", "Zorilor"],
        secondary: [],
      });
    });

    it("returns empty arrays if raw input is non-string non-JSON object or number", () => {
      expect(parseCoverageZones(12345 as unknown as string)).toEqual({ primary: [], secondary: [] });
      expect(parseCoverageZones({ invalid: true } as unknown as string)).toEqual({ primary: [], secondary: [] });
    });
  });

  describe("serializeCoverageZones", () => {
    it("serializes CoverageZonesData into a JSON string", () => {
      const data: CoverageZonesData = {
        primary: ["Mănăștur"],
        secondary: [{ city: "Timișoara", cartiere: ["Fabric"] }],
      };
      const jsonStr = serializeCoverageZones(data);
      expect(jsonStr).toBe(JSON.stringify(data));
      expect(parseCoverageZones(jsonStr)).toEqual(data);
    });
  });

  describe("SPOKEN_LANGUAGES_LIST", () => {
    it("contains Romanian, English, Hungarian, German, French, Italian, Spanish, and Ukrainian", () => {
      expect(SPOKEN_LANGUAGES_LIST).toContain("Romanian");
      expect(SPOKEN_LANGUAGES_LIST).toContain("English");
      expect(SPOKEN_LANGUAGES_LIST).toContain("Hungarian");
      expect(SPOKEN_LANGUAGES_LIST).toContain("German");
      expect(SPOKEN_LANGUAGES_LIST).toContain("French");
      expect(SPOKEN_LANGUAGES_LIST).toContain("Italian");
      expect(SPOKEN_LANGUAGES_LIST).toContain("Spanish");
      expect(SPOKEN_LANGUAGES_LIST).toContain("Ukrainian");
      expect(SPOKEN_LANGUAGES_LIST.length).toBe(8);
    });
  });

  describe("DOG_SPORT_DISCIPLINES", () => {
    it("contains Mantrailing and Search & rescue along with other core disciplines", () => {
      expect(DOG_SPORT_DISCIPLINES).toContain("Mantrailing");
      expect(DOG_SPORT_DISCIPLINES).toContain("Search & rescue");
      expect(DOG_SPORT_DISCIPLINES).toContain("Agility");
      expect(DOG_SPORT_DISCIPLINES).toContain("IGP / Schutzhund");
      expect(DOG_SPORT_DISCIPLINES).toContain("Mondioring");
    });
  });

  describe("DOG_TRAINING_TOPICS", () => {
    it("contains Puppy Socialization, Basic Obedience, Truffle hunting, Show handling, Security & Protection", () => {
      expect(DOG_TRAINING_TOPICS).toContain("Puppy Socialization");
      expect(DOG_TRAINING_TOPICS).toContain("Basic Obedience");
      expect(DOG_TRAINING_TOPICS).toContain("Advanced Obedience");
      expect(DOG_TRAINING_TOPICS).toContain("Behavior Modification");
      expect(DOG_TRAINING_TOPICS).toContain("Truffle hunting");
      expect(DOG_TRAINING_TOPICS).toContain("Show handling");
      expect(DOG_TRAINING_TOPICS).toContain("Security & Protection");
    });
  });

  describe("DOG_TRAINING_FORMATS", () => {
    it("contains delivery modes: Group Class, Private 1-on-1 Session, In-Home Training, Board & Train, Online Consultation", () => {
      expect(DOG_TRAINING_FORMATS).toEqual([
        "Group Class",
        "Private 1-on-1 Session",
        "In-Home Training",
        "Board & Train",
        "Online Consultation",
      ]);
    });
  });

  describe("DOG_GROOMING_WEIGHT_TIERS & formatWeightRanges", () => {
    it("contains the standard 5 dog breed presets", () => {
      const labels = DOG_GROOMING_WEIGHT_TIERS.map((t) => t.label);
      expect(labels).toEqual([
        "Mini Breed",
        "Small Breed",
        "Medium Breed",
        "Large Breed",
        "Giant Breed",
      ]);
      expect(DOG_GROOMING_WEIGHT_TIERS[0]).toEqual({
        id: "mini",
        label: "Mini Breed",
        rangeLabel: "1 – 4 kg",
        start: 1,
        end: 4,
      });
      expect(DOG_GROOMING_WEIGHT_TIERS[4]).toEqual({
        id: "giant",
        label: "Giant Breed",
        rangeLabel: "45 – 100+ kg",
        start: 45,
        end: 100,
      });
    });

    it("formats weight ranges correctly including 100+ kg", () => {
      expect(formatWeightRanges([])).toBe("None");
      expect(formatWeightRanges(["1", "2", "3", "4"])).toBe("1–4 kg");
      expect(formatWeightRanges(["10", "11", "12"])).toBe("10–12 kg");
      expect(formatWeightRanges(["45", "46", "100"])).toBe("45–46 kg, 100+ kg");
      expect(formatWeightRanges(Array.from({ length: 100 }, (_, i) => String(i + 1)))).toBe("All weights (1–100+ kg)");
    });
  });
});
