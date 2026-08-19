import { describe, expect, it } from "vitest";
import {
  ROMANIAN_CITY_CARTIERE,
  getCartiereForCity,
  isCitySupported,
  normalizeCityName,
} from "./romanian-cartiere";

describe("romanian-cartiere module", () => {
  it("should contain at least 101 major cities including Bucharest, Cluj-Napoca, Turda, Mangalia, Buftea, and Otopeni", () => {
    const keys = Object.keys(ROMANIAN_CITY_CARTIERE);
    expect(keys.length).toBeGreaterThanOrEqual(101);
    expect(ROMANIAN_CITY_CARTIERE["București"]).toBeDefined();
    expect(ROMANIAN_CITY_CARTIERE["Cluj-Napoca"]).toBeDefined();
    expect(ROMANIAN_CITY_CARTIERE["Turda"]).toBeDefined();
    expect(ROMANIAN_CITY_CARTIERE["Mangalia"]).toBeDefined();
    expect(ROMANIAN_CITY_CARTIERE["Buftea"]).toBeDefined();
    expect(ROMANIAN_CITY_CARTIERE["Otopeni"]).toBeDefined();
  });

  it("should correctly normalize city names with diacritics and formatting", () => {
    expect(normalizeCityName("Cluj-Napoca")).toBe("clujnapoca");
    expect(normalizeCityName("București")).toBe("bucuresti");
    expect(normalizeCityName(" Târgu Mureș ")).toBe("targumures");
  });

  it("should return cartiere array for supported cities regardless of casing or diacritics", () => {
    const clujCartiere = getCartiereForCity("cluj napoca");
    expect(clujCartiere).not.toBeNull();
    expect(clujCartiere).toContain("Mănăștur");
    expect(clujCartiere).toContain("Grigorescu");

    const bucurestiCartiere = getCartiereForCity("Bucuresti");
    expect(bucurestiCartiere).not.toBeNull();
    expect(bucurestiCartiere).toContain("Titan");
  });

  it("should return null and false for unsupported cities", () => {
    expect(getCartiereForCity("Random Village 123")).toBeNull();
    expect(isCitySupported("Random Village 123")).toBe(false);
  });

  it("should return true for supported cities", () => {
    expect(isCitySupported("Cluj-Napoca")).toBe(true);
    expect(isCitySupported("Timișoara")).toBe(true);
    expect(isCitySupported("Brașov")).toBe(true);
  });

  it("should handle null and empty string inputs gracefully", () => {
    expect(normalizeCityName("")).toBe("");
    expect(normalizeCityName(null as unknown as string)).toBe("");
    expect(getCartiereForCity("")).toBeNull();
    expect(getCartiereForCity(null as unknown as string)).toBeNull();
    expect(isCitySupported("")).toBe(false);
    expect(isCitySupported(null as unknown as string)).toBe(false);
  });
});
