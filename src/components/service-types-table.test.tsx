// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ServiceTypesTable } from "./service-types-table";

describe("ServiceTypesTable Component", () => {
  it("should render all static service types on initialization", () => {
    render(<ServiceTypesTable />);

    // Verify all core service types exist in the document
    expect(screen.getByText("Dog Walking")).toBeDefined();
    expect(screen.getByText("Pet Boarding")).toBeDefined();
    expect(screen.getByText("Dog Training")).toBeDefined();
    expect(screen.getByText("Dog Grooming")).toBeDefined();
    expect(screen.getByText("Pedigree Registration")).toBeDefined();
    expect(screen.getByText("Rescue & Rehoming")).toBeDefined();
  });

  it("should filter service types based on search input (case insensitive)", () => {
    render(<ServiceTypesTable />);

    const searchInput = screen.getByPlaceholderText("Search service types...");
    
    // Search for "walk"
    fireEvent.change(searchInput, { target: { value: "walk" } });

    // "Dog Walking" should remain
    expect(screen.getByText("Dog Walking")).toBeDefined();

    // Other categories should be filtered out
    expect(screen.queryByText("Pet Boarding")).toBeNull();
    expect(screen.queryByText("Dog Training")).toBeNull();
  });

  it("should display a warning/empty message when no matching results are found", () => {
    render(<ServiceTypesTable />);

    const searchInput = screen.getByPlaceholderText("Search service types...");

    // Search for a nonexistent term
    fireEvent.change(searchInput, { target: { value: "NonExistentServiceQuery" } });

    // Verify empty state message appears
    expect(screen.getByText("No service types found.")).toBeDefined();

    // Verify list items are gone
    expect(screen.queryByText("Dog Walking")).toBeNull();
    expect(screen.queryByText("Pet Boarding")).toBeNull();
  });
});
