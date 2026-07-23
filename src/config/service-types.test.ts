import { describe, it, expect } from "vitest";
import { serviceTypesList, type ServiceType, type FormField } from "./service-types";

describe("serviceTypesList config", () => {
  it("should export exactly 5 service types", () => {
    expect(serviceTypesList).toHaveLength(5);
  });

  it("should have a unique id for every service type", () => {
    const ids = serviceTypesList.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have a non-empty name for every service type", () => {
    for (const st of serviceTypesList) {
      expect(st.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("should have a non-empty description for every service type", () => {
    for (const st of serviceTypesList) {
      expect(st.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("should have at least one applicableTo category for every service type", () => {
    for (const st of serviceTypesList) {
      expect(st.applicableTo.length).toBeGreaterThan(0);
    }
  });

  it("should have at least one field for configurable service types", () => {
    for (const st of serviceTypesList.filter((s) => s.id !== "dog_grooming")) {
      expect(st.fields.length).toBeGreaterThan(0);
    }
  });

  it("should have valid field types for every field", () => {
    const validTypes: FormField["type"][] = [
      "text", "number", "select", "checkbox", "textarea",
    ];
    for (const st of serviceTypesList) {
      for (const field of st.fields) {
        expect(validTypes).toContain(field.type);
      }
    }
  });

  it("should have a non-empty name and label for every field", () => {
    for (const st of serviceTypesList) {
      for (const field of st.fields) {
        expect(field.name.trim().length).toBeGreaterThan(0);
        expect(field.label.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("should have non-empty options arrays for all select-type fields", () => {
    for (const st of serviceTypesList) {
      for (const field of st.fields) {
        if (field.type === "select") {
          expect(field.options).toBeDefined();
          expect(field.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  // ── Spot-check specific service types ──────────────────────────────────

  it("should include a 'dog_training' service type with required fields", () => {
    const dt = serviceTypesList.find((s) => s.id === "dog_training");
    expect(dt).toBeDefined();
    expect(dt!.name).toBe("Dog training");

    const targetLevel = dt!.fields.find((f) => f.name === "targetLevel");
    expect(targetLevel).toBeDefined();
    expect(targetLevel!.required).toBe(true);
    expect(targetLevel!.type).toBe("select");
    expect(targetLevel!.options).toContain("Puppy Basic Socialization");

    const sessions = dt!.fields.find((f) => f.name === "sessions");
    expect(sessions).toBeDefined();
    expect(sessions!.required).toBe(true);
    expect(sessions!.type).toBe("number");
  });

  it("should include a 'dog_boarding' service type with an optional dietary field", () => {
    const db = serviceTypesList.find((s) => s.id === "dog_boarding");
    expect(db).toBeDefined();

    const dietary = db!.fields.find((f) => f.name === "dietaryNeeds");
    expect(dietary).toBeDefined();
    expect(dietary!.required).toBe(false);
    expect(dietary!.type).toBe("textarea");
  });

  it("should include a 'dog_walking' service type with distance and time fields", () => {
    const dw = serviceTypesList.find((s) => s.id === "dog_walking");
    expect(dw).toBeDefined();

    const distance = dw!.fields.find((f) => f.name === "distance");
    expect(distance?.suffix).toBe("Km");

    const time = dw!.fields.find((f) => f.name === "time");
    expect(time?.suffix).toBe("Minute");
  });

  it("should include a 'sport_dog_training' service type applicable to cynological associations", () => {
    const sdt = serviceTypesList.find((s) => s.id === "sport_dog_training");
    expect(sdt).toBeDefined();
    expect(sdt!.name).toBe("Dog sports training");
    expect(sdt!.applicableTo).toContain("cynological_association");
  });

  it("should include a 'dog_grooming' service type applicable to dog_service_provider", () => {
    const dg = serviceTypesList.find((s) => s.id === "dog_grooming");
    expect(dg).toBeDefined();
    expect(dg!.name).toBe("Dog grooming");
    expect(dg!.applicableTo).toContain("dog_service_provider");
  });
});
