// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ServiceTypesTable } from "./service-types-table";

// Mock the server action
vi.mock("@/app/actions/service-types", () => ({
  updateServiceTypeAction: vi.fn(),
}));

describe("ServiceTypesTable Component", () => {
  const dummyServiceTypesList = [
    { id: "dog_training", name: "Dog training", description: "Behavioral training", applicableTo: [], fields: [] },
    { id: "dog_boarding", name: "Dog boarding", description: "Overnight stays", applicableTo: [], fields: [] },
    { id: "sport_dog_training", name: "Dog Sports Training", description: "Advanced training", applicableTo: [], fields: [] },
    { id: "dog_walking", name: "Dog walking", description: "Daily exercise walks", applicableTo: [], fields: [] },
  ];

  it("should render all static service types on initialization", () => {
    render(<ServiceTypesTable serviceTypesList={dummyServiceTypesList} />);

    // Verify all core service types exist in the document
    expect(screen.getByText("Dog training")).toBeDefined();
    expect(screen.getByText("Dog boarding")).toBeDefined();
    expect(screen.getByText("Dog Sports Training")).toBeDefined();
    expect(screen.getByText("Dog walking")).toBeDefined();
  });

  it("should filter service types based on search input (case insensitive)", () => {
    render(<ServiceTypesTable serviceTypesList={dummyServiceTypesList} />);

    const searchInput = screen.getByPlaceholderText("Search service types...");
    
    // Search for "walk"
    fireEvent.change(searchInput, { target: { value: "walk" } });

    // "Dog walking" should remain
    expect(screen.getByText("Dog walking")).toBeDefined();

    // Other categories should be filtered out
    expect(screen.queryByText("Dog boarding")).toBeNull();
    expect(screen.queryByText("Dog training")).toBeNull();
  });

  it("should display a warning/empty message when no matching results are found", () => {
    render(<ServiceTypesTable serviceTypesList={dummyServiceTypesList} />);

    const searchInput = screen.getByPlaceholderText("Search service types...");

    // Search for a nonexistent term
    fireEvent.change(searchInput, { target: { value: "NonExistentServiceQuery" } });

    // Verify empty state message appears
    expect(screen.getByText("No service types found.")).toBeDefined();

    // Verify list items are gone
    expect(screen.queryByText("Dog walking")).toBeNull();
    expect(screen.queryByText("Dog boarding")).toBeNull();
  });
});
