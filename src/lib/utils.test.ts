import { describe, it, expect } from "vitest";
import { cn } from "./utils";

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
