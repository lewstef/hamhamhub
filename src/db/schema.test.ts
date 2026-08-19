// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import * as schema from "./schema";

describe("Database Schema (src/db/schema.ts)", () => {
  it("exports all expected tables", () => {
    expect(schema.organizationCategories).toBeDefined();
    expect(schema.users).toBeDefined();
    expect(schema.services).toBeDefined();
    expect(schema.serviceTypes).toBeDefined();
    expect(schema.courses).toBeDefined();
    expect(schema.systemSettings).toBeDefined();
    expect(schema.organizationEnabledServices).toBeDefined();
    expect(schema.organizationEnabledCourses).toBeDefined();
  });

  it("triggers $onUpdate handlers for updatedAt columns", () => {
    const usersCols = schema.users as unknown as Record<string, { onUpdateFn?: () => unknown }>;
    const usersUpdatedAt = usersCols.updatedAt;
    expect(usersUpdatedAt).toBeDefined();
    if (usersUpdatedAt && typeof usersUpdatedAt.onUpdateFn === "function") {
      const date = usersUpdatedAt.onUpdateFn();
      expect(date).toBeInstanceOf(Date);
    }

    const settingsCols = schema.systemSettings as unknown as Record<string, { onUpdateFn?: () => unknown }>;
    const settingsUpdatedAt = settingsCols.updatedAt;
    expect(settingsUpdatedAt).toBeDefined();
    if (settingsUpdatedAt && typeof settingsUpdatedAt.onUpdateFn === "function") {
      const date = settingsUpdatedAt.onUpdateFn();
      expect(date).toBeInstanceOf(Date);
    }
  });

  it("verifies courses table contains all required sub-service columns", () => {
    const cols = schema.courses as unknown as Record<string, unknown>;
    expect(cols.acceptedDogSizesEnabled).toBeDefined();
    expect(cols.acceptedDogSizes).toBeDefined();
    expect(cols.trainingFormat).toBeDefined();
    expect(cols.maxDogsPerGroup).toBeDefined();
    expect(cols.indoorFacility).toBeDefined();
    expect(cols.indoorFacilityDescription).toBeDefined();
    expect(cols.playYard).toBeDefined();
    expect(cols.playYardDetails).toBeDefined();
    expect(cols.pool).toBeDefined();
    expect(cols.poolDetails).toBeDefined();
    expect(cols.socializationPolicy).toBeDefined();
  });

  it("evaluates foreign key reference functions across all tables", () => {
    const allTables = [
      schema.users,
      schema.services,
      schema.courses,
      schema.organizationEnabledServices,
      schema.organizationEnabledCourses,
    ];

    for (const table of allTables) {
      for (const col of Object.values(table as unknown as Record<string, unknown>)) {
        if (col && typeof col === "object" && "reference" in col && typeof (col as { reference: () => unknown }).reference === "function") {
          const ref = (col as { reference: () => unknown }).reference();
          expect(ref).toBeDefined();
        }
      }
    }
  });
});
