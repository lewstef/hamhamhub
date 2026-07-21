import { describe, it, expect } from "vitest";
import { ROMANIAN_COUNTIES, ROMANIAN_LOCALITIES_BY_COUNTY, getCountyLocalities } from "./romanian-territory";

describe("Romanian Territory Configuration", () => {
  it("should contain 42 Romanian counties", () => {
    expect(ROMANIAN_COUNTIES.length).toBe(42);
    expect(ROMANIAN_COUNTIES).toContain("Cluj");
    expect(ROMANIAN_COUNTIES).toContain("București");
    expect(ROMANIAN_COUNTIES).toContain("Timiș");
  });

  it("should return localities for an exact county match", () => {
    const clujLocalities = getCountyLocalities("Cluj");
    expect(clujLocalities).toContain("Cluj-Napoca");
    expect(clujLocalities).toContain("Florești");
    expect(clujLocalities).toContain("Turda");
  });

  it("should return localities for normalized county input with or without diacritics", () => {
    const timisLocalities = getCountyLocalities("Timis");
    expect(timisLocalities).toContain("Timișoara");

    const brasovLocalities = getCountyLocalities("BRASOV");
    expect(brasovLocalities).toContain("Brașov");
  });

  it("should return empty array for invalid or missing county input", () => {
    expect(getCountyLocalities(null)).toEqual([]);
    expect(getCountyLocalities("InvalidCounty")).toEqual([]);
  });
});
