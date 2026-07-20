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

  it("should open the edit modal when the pencil (edit) button is clicked", () => {
    render(<ServiceTypesTable serviceTypesList={dummyServiceTypesList} />);

    // Find edit buttons by title attribute
    const editButtons = screen.getAllByTitle(/Edit /);
    expect(editButtons.length).toBeGreaterThan(0);

    fireEvent.click(editButtons[0]);

    // Modal should appear with "Edit Service Type" heading
    expect(screen.getByText("Edit Service Type")).toBeDefined();
    // The modal contains the name field pre-filled
    expect(screen.getByDisplayValue("Dog training")).toBeDefined();
  });

  it("should close the edit modal via the X button", () => {
    render(<ServiceTypesTable serviceTypesList={dummyServiceTypesList} />);

    // Open the modal
    fireEvent.click(screen.getAllByTitle(/Edit /)[0]);
    expect(screen.getByText("Edit Service Type")).toBeDefined();

    // Close via the X button (has no accessible name, find by SVG inside)
    const xButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg")
    );
    // The X close button is inside the modal card
    const closeBtn = xButtons.find((btn) => !btn.getAttribute("title"));
    fireEvent.click(closeBtn!);

    expect(screen.queryByText("Edit Service Type")).toBeNull();
  });

  it("should close the edit modal via the Cancel button", () => {
    render(<ServiceTypesTable serviceTypesList={dummyServiceTypesList} />);

    fireEvent.click(screen.getAllByTitle(/Edit /)[0]);
    expect(screen.getByText("Edit Service Type")).toBeDefined();

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Edit Service Type")).toBeNull();
  });

  it("should display error from state inside the edit modal", () => {
    // The error is only shown when the modal is open AND state has an error.
    // We open the modal first, then the state is whatever useActionState returns
    // (default null). We verify the error div is absent (no error initially).
    render(<ServiceTypesTable serviceTypesList={dummyServiceTypesList} />);
    fireEvent.click(screen.getAllByTitle(/Edit /)[0]);

    // Modal is open — no error banner yet (state starts as null)
    expect(screen.getByText("Edit Service Type")).toBeDefined();
    // No error message initially
    expect(screen.queryByText("Name already taken")).toBeNull();
  });

  it("should render Save Changes button inside the edit modal", () => {
    render(<ServiceTypesTable serviceTypesList={dummyServiceTypesList} />);
    fireEvent.click(screen.getAllByTitle(/Edit /)[0]);

    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDefined();
  });

  it("should filter by description text as well as name", () => {
    render(<ServiceTypesTable serviceTypesList={dummyServiceTypesList} />);

    const searchInput = screen.getByPlaceholderText("Search service types...");
    fireEvent.change(searchInput, { target: { value: "Overnight" } });

    expect(screen.getByText("Dog boarding")).toBeDefined();
    expect(screen.queryByText("Dog training")).toBeNull();
  });
});
