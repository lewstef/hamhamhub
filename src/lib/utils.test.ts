import { describe, it, expect } from "vitest";
import { cn, normalizeSearchText } from "./utils";

describe("cn() utility", () => {
  it("should return an empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("should return an empty string for falsy inputs", () => {
    expect(cn(undefined, null, false, "")).toBe("");
  });

  it("should concatenate multiple class strings", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("should handle conditional classes via object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("should handle array inputs", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("should resolve conflicting Tailwind padding classes (last wins)", () => {
    // tailwind-merge keeps p-2 because it comes after p-4
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("should resolve conflicting Tailwind text-size classes", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("should preserve non-conflicting classes from both arguments", () => {
    const result = cn("flex items-center", "gap-4");
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("gap-4");
  });

  it("should handle a mix of strings, conditionals, and arrays", () => {
    const active = true;
    const result = cn("base", { "text-white": active, "text-black": !active }, ["rounded"]);
    expect(result).toContain("base");
    expect(result).toContain("text-white");
    expect(result).toContain("rounded");
    expect(result).not.toContain("text-black");
  });
});

describe("normalizeSearchText() utility", () => {
  it("should return empty string for falsy or empty inputs", () => {
    expect(normalizeSearchText("")).toBe("");
    expect(normalizeSearchText(null)).toBe("");
    expect(normalizeSearchText(undefined)).toBe("");
  });

  it("should convert text to lowercase and trim spaces", () => {
    expect(normalizeSearchText("  DOG TRAINING  ")).toBe("dog training");
  });

  it("should normalize Romanian diacritics (ă, â, î, ș, ş, ț, ţ)", () => {
    expect(normalizeSearchText("Învățare cățeluși")).toBe("invatare catelusi");
    expect(normalizeSearchText("Școală de dresaj")).toBe("scoala de dresaj");
    expect(normalizeSearchText("Târgu Mureș")).toBe("targu mures");
    expect(normalizeSearchText("Găzduire câini")).toBe("gazduire caini");
  });

  it("should match when query uses diacritics and target does not, and vice-versa", () => {
    const targetWithDiacritics = "Dresaj Cățeluși Începători";
    const targetPlain = "Dresaj Catelusi Incepatori";

    const queryWithDiacritics = "cățeluși";
    const queryPlain = "catelusi";

    const normalizedTarget1 = normalizeSearchText(targetWithDiacritics);
    const normalizedTarget2 = normalizeSearchText(targetPlain);
    const normalizedQuery1 = normalizeSearchText(queryWithDiacritics);
    const normalizedQuery2 = normalizeSearchText(queryPlain);

    expect(normalizedTarget1.includes(normalizedQuery1)).toBe(true);
    expect(normalizedTarget1.includes(normalizedQuery2)).toBe(true);
    expect(normalizedTarget2.includes(normalizedQuery1)).toBe(true);
    expect(normalizedTarget2.includes(normalizedQuery2)).toBe(true);
  });

  it("should normalize European accented characters", () => {
    expect(normalizeSearchText("Café & Crème")).toBe("cafe & creme");
    expect(normalizeSearchText("München Über")).toBe("munchen uber");
    expect(normalizeSearchText("Niño Señor")).toBe("nino senor");
  });
});

