// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { parseCoverageZones, serializeCoverageZones, CoverageZonesData } from "./course";

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
      expect(parseCoverageZones(12345 as any)).toEqual({ primary: [], secondary: [] });
      expect(parseCoverageZones({ invalid: true } as any)).toEqual({ primary: [], secondary: [] });
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
});
