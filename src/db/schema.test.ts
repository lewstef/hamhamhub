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
    const usersUpdatedAt = (schema.users as any).updatedAt;
    expect(usersUpdatedAt).toBeDefined();
    if (usersUpdatedAt && typeof usersUpdatedAt.onUpdateFn === "function") {
      const date = usersUpdatedAt.onUpdateFn();
      expect(date).toBeInstanceOf(Date);
    }

    const settingsUpdatedAt = (schema.systemSettings as any).updatedAt;
    expect(settingsUpdatedAt).toBeDefined();
    if (settingsUpdatedAt && typeof settingsUpdatedAt.onUpdateFn === "function") {
      const date = settingsUpdatedAt.onUpdateFn();
      expect(date).toBeInstanceOf(Date);
    }
  });

  it("verifies courses table contains all required sub-service columns", () => {
    const cols = schema.courses;
    expect((cols as any).acceptedDogSizesEnabled).toBeDefined();
    expect((cols as any).acceptedDogSizes).toBeDefined();
    expect((cols as any).trainingFormat).toBeDefined();
    expect((cols as any).maxDogsPerGroup).toBeDefined();
    expect((cols as any).indoorFacility).toBeDefined();
    expect((cols as any).indoorFacilityDescription).toBeDefined();
    expect((cols as any).playYard).toBeDefined();
    expect((cols as any).playYardDetails).toBeDefined();
    expect((cols as any).pool).toBeDefined();
    expect((cols as any).poolDetails).toBeDefined();
    expect((cols as any).socializationPolicy).toBeDefined();
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
      for (const col of Object.values(table)) {
        if (col && typeof (col as any).reference === "function") {
          const ref = (col as any).reference();
          expect(ref).toBeDefined();
        }
      }
    }
  });
});
