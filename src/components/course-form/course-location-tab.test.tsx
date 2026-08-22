// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { CourseLocationTab } from "./course-location-tab";
import { requestNewCartierAction } from "@/app/actions/organizations";

vi.mock("@/app/actions/organizations", () => ({
  requestNewCartierAction: vi.fn(),
}));

vi.mock("@/components/wysiwyg-editor", () => ({
  WysiwygEditor: ({ value, onChange, placeholder }: any) => (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="wysiwyg-mock"
    />
  ),
}));

vi.mock("lucide-react", () => ({
  Plus: () => <div data-testid="plus" />,
  Trash2: () => <div data-testid="trash2" />,
  MapPin: () => <div data-testid="map-pin" />,
  X: () => <div data-testid="x" />,
  CheckCircle2: () => <div data-testid="check-circle2" />,
  Loader2: () => <div data-testid="loader2" />,
  Globe: () => <div data-testid="globe" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  Search: () => <div data-testid="search" />,
  Check: () => <div data-testid="check" />,
  Building: () => <div data-testid="building" />,
  Truck: () => <div data-testid="truck" />,
  Zap: () => <div data-testid="zap" />,
  Droplets: () => <div data-testid="droplets" />,
  Car: () => <div data-testid="car" />,
  FileText: () => <div data-testid="file-text" />,
}));

describe("CourseLocationTab Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders flat layout with locationInputs for non-walking service", () => {
    const onTrainingFieldAddressChange = vi.fn();
    const onGbpChange = vi.fn();
    const onMapsChange = vi.fn();

    render(
      <CourseLocationTab
        layout="flat"
        isDogWalking={false}
        isBoarding={false}
        cityName="Bucharest"
        cartiereList={null}
        selectedCartiere={[]}
        onSelectedCartiereChange={vi.fn()}
        secondaryZones={[]}
        trainingFieldAddress="123 Field Way"
        onTrainingFieldAddressChange={onTrainingFieldAddressChange}
        trainingFieldGoogleBusinessProfile="https://business.google.com/test"
        onGbpChange={onGbpChange}
        trainingFieldGoogleMapsLink="https://maps.google.com/test"
        onMapsChange={onMapsChange}
        dedicatedField={true}
        onDedicatedFieldChange={vi.fn()}
        trainingFieldDescription="Great outdoor grass field"
        onTrainingFieldDescriptionChange={vi.fn()}
        parking={true}
        onParkingChange={vi.fn()}
        parkingDescription="Free parking"
        onParkingDescriptionChange={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue("Bucharest")).toBeDefined();
    expect(screen.getByDisplayValue("123 Field Way")).toBeDefined();
    expect(screen.getByDisplayValue("https://business.google.com/test")).toBeDefined();
    expect(screen.getByDisplayValue("https://maps.google.com/test")).toBeDefined();

    // Trigger address change
    fireEvent.change(screen.getByDisplayValue("123 Field Way"), {
      target: { value: "456 Bark Road" },
    });
    expect(onTrainingFieldAddressChange).toHaveBeenCalledWith("456 Bark Road");
  });

  it("handles Coverage Zones selection, select all, and deselect all for Dog Walking", () => {
    const onSelectedCartiereChange = vi.fn();

    render(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={true}
        isBoarding={false}
        cityName="Cluj-Napoca"
        cartiereList={["Centru", "Manastur", "Gheorgheni", "Marasti"]}
        selectedCartiere={["Centru"]}
        onSelectedCartiereChange={onSelectedCartiereChange}
        secondaryZones={[]}
        trainingFieldAddress=""
        onTrainingFieldAddressChange={vi.fn()}
        trainingFieldGoogleBusinessProfile=""
        onGbpChange={vi.fn()}
        trainingFieldGoogleMapsLink=""
        onMapsChange={vi.fn()}
        dedicatedField={false}
        onDedicatedFieldChange={vi.fn()}
        trainingFieldDescription=""
        onTrainingFieldDescriptionChange={vi.fn()}
        parking={false}
        onParkingChange={vi.fn()}
        parkingDescription=""
        onParkingDescriptionChange={vi.fn()}
      />
    );

    expect(screen.getByText("Neighborhood Coverage Zones (Cartiere)")).toBeDefined();

    // Select all
    fireEvent.click(screen.getByRole("button", { name: "Select All" }));
    expect(onSelectedCartiereChange).toHaveBeenCalledWith(["Centru", "Manastur", "Gheorgheni", "Marasti"]);

    // Deselect all
    fireEvent.click(screen.getByRole("button", { name: "Deselect All" }));
    expect(onSelectedCartiereChange).toHaveBeenCalledWith([]);

    // Click on unselected cartier (Manastur) to add
    fireEvent.click(screen.getByRole("button", { name: "Manastur" }));
    expect(onSelectedCartiereChange).toHaveBeenCalledWith(["Centru", "Manastur"]);

    // Click on selected cartier (Centru) to remove
    fireEvent.click(screen.getByRole("button", { name: "Centru" }));
    expect(onSelectedCartiereChange).toHaveBeenCalledWith([]);
  });

  it("handles Secondary Coverage Zones addition, city change, and removal", () => {
    const onAddSecondaryZone = vi.fn();
    const onRemoveSecondaryZone = vi.fn();
    const onSecondaryCityChange = vi.fn();
    const onSecondaryCartiereChange = vi.fn();

    render(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={true}
        isBoarding={false}
        cityName="Bucharest"
        cartiereList={["Sector 1", "Sector 2"]}
        selectedCartiere={["Sector 1"]}
        onSelectedCartiereChange={vi.fn()}
        secondaryZones={[
          { city: "Brasov", cartiere: ["Centru"] },
        ]}
        onAddSecondaryZone={onAddSecondaryZone}
        onRemoveSecondaryZone={onRemoveSecondaryZone}
        onSecondaryCityChange={onSecondaryCityChange}
        onSecondaryCartiereChange={onSecondaryCartiereChange}
        trainingFieldAddress=""
        onTrainingFieldAddressChange={vi.fn()}
        trainingFieldGoogleBusinessProfile=""
        onGbpChange={vi.fn()}
        trainingFieldGoogleMapsLink=""
        onMapsChange={vi.fn()}
        dedicatedField={false}
        onDedicatedFieldChange={vi.fn()}
        trainingFieldDescription=""
        onTrainingFieldDescriptionChange={vi.fn()}
        parking={false}
        onParkingChange={vi.fn()}
        parkingDescription=""
        onParkingDescriptionChange={vi.fn()}
      />
    );

    expect(screen.getByText("Secondary Coverage Zones")).toBeDefined();

    // Click Add Secondary Zone button
    fireEvent.click(screen.getByRole("button", { name: /Add Secondary Coverage Zone/ }));
    expect(onAddSecondaryZone).toHaveBeenCalled();

    // Click Remove Secondary Zone button
    const removeButtons = screen.getAllByRole("button").filter((b) => b.querySelector("[data-testid='trash2']"));
    expect(removeButtons.length).toBeGreaterThan(0);
    fireEvent.click(removeButtons[0]);
    expect(onRemoveSecondaryZone).toHaveBeenCalledWith(0);
  });

  it("handles Dedicated Field, Indoor Facility, and Parking toggles and descriptions", () => {
    const onDedicatedFieldChange = vi.fn();
    const onTrainingFieldDescriptionChange = vi.fn();
    const onIndoorFacilityChange = vi.fn();
    const onIndoorFacilityDescriptionChange = vi.fn();
    const onParkingChange = vi.fn();
    const onParkingDescriptionChange = vi.fn();

    render(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={false}
        isBoarding={false}
        cityName="Cluj-Napoca"
        cartiereList={null}
        selectedCartiere={[]}
        onSelectedCartiereChange={vi.fn()}
        secondaryZones={[]}
        trainingFieldAddress="Strada Campului 1"
        onTrainingFieldAddressChange={vi.fn()}
        trainingFieldGoogleBusinessProfile=""
        onGbpChange={vi.fn()}
        trainingFieldGoogleMapsLink=""
        onMapsChange={vi.fn()}
        dedicatedField={true}
        onDedicatedFieldChange={onDedicatedFieldChange}
        trainingFieldDescription="Fenced 500sqm field"
        onTrainingFieldDescriptionChange={onTrainingFieldDescriptionChange}
        indoorFacility={true}
        onIndoorFacilityChange={onIndoorFacilityChange}
        indoorFacilityDescription="Heated 200sqm indoor hall"
        onIndoorFacilityDescriptionChange={onIndoorFacilityDescriptionChange}
        parking={true}
        onParkingChange={onParkingChange}
        parkingDescription="10 parking spots"
        onParkingDescriptionChange={onParkingDescriptionChange}
      />
    );

    expect(screen.getByText("Dedicated Training Field")).toBeDefined();
    expect(screen.getByDisplayValue("Fenced 500sqm field")).toBeDefined();
    expect(screen.getByText("Indoor / Covered Training Hall")).toBeDefined();
    expect(screen.getByDisplayValue("Heated 200sqm indoor hall")).toBeDefined();
    expect(screen.getByText("Dedicated Parking")).toBeDefined();
    expect(screen.getByDisplayValue("10 parking spots")).toBeDefined();

    // Trigger changes
    fireEvent.change(screen.getByDisplayValue("Fenced 500sqm field"), {
      target: { value: "Updated field description" },
    });
    expect(onTrainingFieldDescriptionChange).toHaveBeenCalledWith("Updated field description");

    fireEvent.change(screen.getByDisplayValue("Heated 200sqm indoor hall"), {
      target: { value: "Updated indoor hall" },
    });
    expect(onIndoorFacilityDescriptionChange).toHaveBeenCalledWith("Updated indoor hall");

    fireEvent.change(screen.getByDisplayValue("10 parking spots"), {
      target: { value: "Updated parking" },
    });
    expect(onParkingDescriptionChange).toHaveBeenCalledWith("Updated parking");
  });

  it("handles Request New Cartier modal open, submit success, and submit failure", async () => {
    vi.mocked(requestNewCartierAction).mockResolvedValueOnce({
      success: true,
      message: "Cartier request submitted successfully!",
    } as any);

    render(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={true}
        isBoarding={false}
        cityName="Timisoara"
        cartiereList={["Cetate", "Iosefin"]}
        selectedCartiere={["Cetate"]}
        onSelectedCartiereChange={vi.fn()}
        secondaryZones={[]}
        trainingFieldAddress=""
        onTrainingFieldAddressChange={vi.fn()}
        trainingFieldGoogleBusinessProfile=""
        onGbpChange={vi.fn()}
        trainingFieldGoogleMapsLink=""
        onMapsChange={vi.fn()}
        dedicatedField={false}
        onDedicatedFieldChange={vi.fn()}
        trainingFieldDescription=""
        onTrainingFieldDescriptionChange={vi.fn()}
        parking={false}
        onParkingChange={vi.fn()}
        parkingDescription=""
        onParkingDescriptionChange={vi.fn()}
      />
    );

    // Click open request cartier
    fireEvent.click(screen.getByRole("button", { name: /Request new Coverage zone \(Cartier\)/i }));
    expect(screen.getAllByText("Request new Coverage zone (Cartier)").length).toBeGreaterThan(0);

    // Type new cartier name and notes
    fireEvent.change(screen.getByPlaceholderText("e.g. Mănăștur Nord, Borhanci Est"), {
      target: { value: "Dumbravita Zone" },
    });
    fireEvent.change(screen.getByPlaceholderText("Any specific landmarks or zone boundary details..."), {
      target: { value: "Near the north ring road" },
    });

    // Submit request
    fireEvent.click(screen.getByRole("button", { name: "Submit Request" }));

    await waitFor(() => {
      expect(requestNewCartierAction).toHaveBeenCalledWith({
        cityName: "Timisoara",
        cartierName: "Dumbravita Zone",
        notes: "Near the north ring road",
      });
      expect(screen.getByText("Request Submitted Successfully!")).toBeDefined();
    });

    // Test error flow
    vi.mocked(requestNewCartierAction).mockResolvedValueOnce({
      error: "City not found in registry.",
    } as any);

    // Reopen modal if needed
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: /Request new Coverage zone \(Cartier\)/i }));

    fireEvent.change(screen.getByPlaceholderText("e.g. Mănăștur Nord, Borhanci Est"), {
      target: { value: "Unknown Area" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit Request" }));

    await waitFor(() => {
      expect(screen.getByText("City not found in registry.")).toBeDefined();
    });
  });

  it("handles Secondary Zone cartiere select all, deselect all, individual toggle, and search", () => {
    const onSecondaryCartiereChange = vi.fn();
    const onSecondaryCityChange = vi.fn();
    const onRemoveSecondaryZone = vi.fn();

    render(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={true}
        isBoarding={false}
        cityName="Cluj-Napoca"
        cartiereList={["Centru"]}
        selectedCartiere={["Centru"]}
        onSelectedCartiereChange={vi.fn()}
        secondaryZones={[
          { city: "Brasov", cartiere: ["Centru"] },
        ]}
        onSecondaryCartiereChange={onSecondaryCartiereChange}
        onSecondaryCityChange={onSecondaryCityChange}
        onRemoveSecondaryZone={onRemoveSecondaryZone}
        trainingFieldAddress=""
        onTrainingFieldAddressChange={vi.fn()}
        trainingFieldGoogleBusinessProfile=""
        onGbpChange={vi.fn()}
        trainingFieldGoogleMapsLink=""
        onMapsChange={vi.fn()}
        dedicatedField={false}
        onDedicatedFieldChange={vi.fn()}
        trainingFieldDescription=""
        onTrainingFieldDescriptionChange={vi.fn()}
        parking={false}
        onParkingChange={vi.fn()}
        parkingDescription=""
        onParkingDescriptionChange={vi.fn()}
      />
    );

    // Verify secondary zone header
    expect(screen.getByText("Secondary Coverage Zones")).toBeDefined();

    // Select all cartiere in secondary zone
    const selectAllBtns = screen.getAllByRole("button", { name: "Select All" });
    fireEvent.click(selectAllBtns[selectAllBtns.length - 1]);
    expect(onSecondaryCartiereChange).toHaveBeenCalled();

    // Deselect all cartiere in secondary zone
    const deselectAllBtns = screen.getAllByRole("button", { name: "Deselect All" });
    fireEvent.click(deselectAllBtns[deselectAllBtns.length - 1]);
    expect(onSecondaryCartiereChange).toHaveBeenCalledWith(0, []);

    // Remove secondary zone
    const removeBtns = screen.getAllByRole("button", { name: "Remove Zone" });
    fireEvent.click(removeBtns[0]);
    expect(onRemoveSecondaryZone).toHaveBeenCalledWith(0);
  });

  it("handles Dog Grooming location provider modes (salon, mobile_van, both) and mobile van specs", () => {
    const onGroomingLocationTypeChange = vi.fn();
    const onMobileVanAutonomousPowerChange = vi.fn();
    const onMobileVanAutonomousWaterChange = vi.fn();
    const onMobileVanNeedsPowerPlugChange = vi.fn();
    const onMobileVanNeedsWaterHookupChange = vi.fn();
    const onMobileVanSpaceRequirementChange = vi.fn();
    const onMobileVanTravelFeePolicyChange = vi.fn();

    const { rerender } = render(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={false}
        isDogSitter={false}
        isGrooming={true}
        isBoarding={false}
        cityName="Cluj-Napoca"
        cartiereList={["Centru", "Manastur"]}
        selectedCartiere={["Centru"]}
        onSelectedCartiereChange={vi.fn()}
        secondaryZones={[]}
        trainingFieldAddress="Str. Memorandumului 15"
        onTrainingFieldAddressChange={vi.fn()}
        trainingFieldGoogleBusinessProfile=""
        onGbpChange={vi.fn()}
        trainingFieldGoogleMapsLink=""
        onMapsChange={vi.fn()}
        dedicatedField={false}
        onDedicatedFieldChange={vi.fn()}
        trainingFieldDescription=""
        onTrainingFieldDescriptionChange={vi.fn()}
        parking={true}
        onParkingChange={vi.fn()}
        parkingDescription="Free salon parking"
        onParkingDescriptionChange={vi.fn()}
        groomingLocationType="salon"
        onGroomingLocationTypeChange={onGroomingLocationTypeChange}
        mobileVanAutonomousPower={false}
        onMobileVanAutonomousPowerChange={onMobileVanAutonomousPowerChange}
        mobileVanAutonomousWater={false}
        onMobileVanAutonomousWaterChange={onMobileVanAutonomousWaterChange}
        mobileVanNeedsPowerPlug={false}
        onMobileVanNeedsPowerPlugChange={onMobileVanNeedsPowerPlugChange}
        mobileVanNeedsWaterHookup={false}
        onMobileVanNeedsWaterHookupChange={onMobileVanNeedsWaterHookupChange}
        mobileVanSpaceRequirement=""
        onMobileVanSpaceRequirementChange={onMobileVanSpaceRequirementChange}
        mobileVanTravelFeePolicy=""
        onMobileVanTravelFeePolicyChange={onMobileVanTravelFeePolicyChange}
      />
    );

    // In 'salon' mode: Provider mode selector and Salon address are rendered, but van specs and coverage zones are hidden
    expect(screen.getByText("Grooming Service Provider Mode")).toBeDefined();
    expect(screen.getByText("Physical Salon Location & Address")).toBeDefined();
    expect(screen.getByDisplayValue("Str. Memorandumului 15")).toBeDefined();
    expect(screen.queryByText("Mobile Van Specifications & Client Utility Requirements")).toBeNull();
    expect(screen.queryByText("Mobile Van Coverage Zones")).toBeNull();

    // Click 'Mobile Grooming Van' mode
    const mobileVanButton = screen.getByRole("button", { name: /Mobile Grooming Van/i });
    fireEvent.click(mobileVanButton);
    expect(onGroomingLocationTypeChange).toHaveBeenCalledWith("mobile_van");

    // Rerender in 'mobile_van' mode
    rerender(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={false}
        isDogSitter={false}
        isGrooming={true}
        isBoarding={false}
        cityName="Cluj-Napoca"
        cartiereList={["Centru", "Manastur"]}
        selectedCartiere={["Centru"]}
        onSelectedCartiereChange={vi.fn()}
        secondaryZones={[]}
        trainingFieldAddress=""
        onTrainingFieldAddressChange={vi.fn()}
        trainingFieldGoogleBusinessProfile=""
        onGbpChange={vi.fn()}
        trainingFieldGoogleMapsLink=""
        onMapsChange={vi.fn()}
        dedicatedField={false}
        onDedicatedFieldChange={vi.fn()}
        trainingFieldDescription=""
        onTrainingFieldDescriptionChange={vi.fn()}
        parking={false}
        onParkingChange={vi.fn()}
        parkingDescription=""
        onParkingDescriptionChange={vi.fn()}
        groomingLocationType="mobile_van"
        onGroomingLocationTypeChange={onGroomingLocationTypeChange}
        mobileVanAutonomousPower={true}
        onMobileVanAutonomousPowerChange={onMobileVanAutonomousPowerChange}
        mobileVanAutonomousWater={true}
        onMobileVanAutonomousWaterChange={onMobileVanAutonomousWaterChange}
        mobileVanNeedsPowerPlug={false}
        onMobileVanNeedsPowerPlugChange={onMobileVanNeedsPowerPlugChange}
        mobileVanNeedsWaterHookup={false}
        onMobileVanNeedsWaterHookupChange={onMobileVanNeedsWaterHookupChange}
        mobileVanSpaceRequirement="6m driveway"
        onMobileVanSpaceRequirementChange={onMobileVanSpaceRequirementChange}
        mobileVanTravelFeePolicy="Free in Cluj"
        onMobileVanTravelFeePolicyChange={onMobileVanTravelFeePolicyChange}
      />
    );

    // Salon address should now be hidden, but Coverage Zones and Van Specs should be visible
    expect(screen.queryByText("Physical Salon Location & Address")).toBeNull();
    expect(screen.getByText("Mobile Van Coverage Zones")).toBeDefined();
    expect(screen.getByText("Mobile Van Specifications & Client Utility Requirements")).toBeDefined();
    expect(screen.getByDisplayValue("6m driveway")).toBeDefined();
    expect(screen.getByDisplayValue("Free in Cluj")).toBeDefined();

    // Toggle space requirement and travel policy inputs
    fireEvent.change(screen.getByDisplayValue("6m driveway"), {
      target: { value: "7m street curb" },
    });
    expect(onMobileVanSpaceRequirementChange).toHaveBeenCalledWith("7m street curb");

    fireEvent.change(screen.getByDisplayValue("Free in Cluj"), {
      target: { value: "2 lei/km outside Cluj" },
    });
    expect(onMobileVanTravelFeePolicyChange).toHaveBeenCalledWith("2 lei/km outside Cluj");
  });

  it("handles Cartier request submission failure gracefully", async () => {
    vi.mocked(requestNewCartierAction).mockResolvedValueOnce({
      error: "Server timeout",
    });

    render(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={true}
        cityName="Cluj-Napoca"
        cartiereList={["Centru", "Mănăștur"]}
        selectedCartiere={[]}
        onSelectedCartiereChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/Request new Coverage zone/i));
    const cartierInput = screen.getByPlaceholderText(/Mănăștur Nord, Borhanci Est/i);
    fireEvent.change(cartierInput, { target: { value: "Nou Cartier" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit Request/i }));

    await waitFor(() => {
      expect(screen.getByText("Server timeout")).toBeDefined();
    });
  });

  it("handles toggling cartiere items in dog walking mode", () => {
    const onSelectedCartiereChange = vi.fn();
    render(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={true}
        cityName="Cluj-Napoca"
        cartiereList={["Centru", "Mănăștur", "Gheorgheni"]}
        selectedCartiere={["Centru"]}
        onSelectedCartiereChange={onSelectedCartiereChange}
      />
    );

    // Toggle unselected cartier (Mănăștur)
    const manasturBtn = screen.getByRole("button", { name: "Mănăștur" });
    fireEvent.click(manasturBtn);
    expect(onSelectedCartiereChange).toHaveBeenCalledWith(["Centru", "Mănăștur"]);

    // Toggle already selected cartier (Centru)
    const centruBtn = screen.getByRole("button", { name: "Centru" });
    fireEvent.click(centruBtn);
    expect(onSelectedCartiereChange).toHaveBeenCalledWith([]);
  });

  it("renders both salon and van sections in grooming both mode", () => {
    render(
      <CourseLocationTab
        layout="tabbed"
        isGrooming={true}
        cityName="Cluj-Napoca"
        cartiereList={["Centru"]}
        selectedCartiere={["Centru"]}
        onSelectedCartiereChange={vi.fn()}
        groomingLocationType="both"
      />
    );

    expect(screen.getByText("Physical Salon Location & Address")).toBeDefined();
    expect(screen.getByText("Mobile Van Coverage Zones")).toBeDefined();
    expect(screen.getByText("Mobile Van Specifications & Client Utility Requirements")).toBeDefined();
  });

  it("handles removing secondary zones", () => {
    const onRemoveSecondaryZone = vi.fn();
    render(
      <CourseLocationTab
        layout="tabbed"
        isDogWalking={true}
        cityName="Cluj-Napoca"
        cartiereList={["Centru"]}
        selectedCartiere={["Centru"]}
        onSelectedCartiereChange={vi.fn()}
        secondaryZones={[
          { city: "Florești", cartiere: ["Centru"] },
          { city: "Baciu", cartiere: [] },
        ]}
        onRemoveSecondaryZone={onRemoveSecondaryZone}
      />
    );

    const removeButtons = screen.getAllByRole("button", { name: /Remove Zone/i });
    expect(removeButtons.length).toBe(2);

    fireEvent.click(removeButtons[0]);
    expect(onRemoveSecondaryZone).toHaveBeenCalledWith(0);
  });
});
