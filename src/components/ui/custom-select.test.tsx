// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CustomSelect } from "./custom-select";

vi.mock("lucide-react", () => ({
  ChevronDown: () => <div data-testid="chevron-down" />,
  Check: () => <div data-testid="check" />,
}));

describe("CustomSelect Component", () => {
  const options = [
    { value: "opt1", label: "Option One" },
    { value: "opt2", label: "Option Two" },
    { value: "opt3", label: "Option Three", disabled: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button with placeholder when no value is provided", () => {
    render(
      <CustomSelect
        id="test-select"
        name="testSelect"
        options={options}
        placeholder="Choose an item..."
      />
    );

    const trigger = screen.getByRole("button", { name: /Choose an item\.\.\./i });
    expect(trigger).toBeDefined();

    const hiddenSelect = document.getElementById("test-select") as HTMLSelectElement;
    expect(hiddenSelect).toBeDefined();
    expect(hiddenSelect.name).toBe("testSelect");
  });

  it("renders trigger button with selected option label when value is set", () => {
    render(
      <CustomSelect
        id="test-select"
        value="opt2"
        options={options}
      />
    );

    const trigger = screen.getByRole("button", { name: /Option Two/i });
    expect(trigger).toBeDefined();
  });

  it("opens popover menu when trigger button is clicked", () => {
    const { container } = render(
      <CustomSelect
        id="test-select"
        options={options}
        placeholder="Select..."
      />
    );

    const trigger = screen.getByRole("button", { name: /Select\.\.\./i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".custom-scrollbar")).toBeNull();

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const popover = container.querySelector(".custom-scrollbar");
    expect(popover).not.toBeNull();
    expect(popover?.textContent).toContain("Option One");
    expect(popover?.textContent).toContain("Option Two");
  });

  it("calls onChange and closes popover when an enabled option is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <CustomSelect
        id="test-select"
        value="opt1"
        onChange={onChange}
        options={options}
      />
    );

    const trigger = screen.getByRole("button", { name: /Option One/i });
    fireEvent.click(trigger);

    const popover = container.querySelector(".custom-scrollbar");
    expect(popover).not.toBeNull();

    // Click on Option Two option button inside popover
    const optionBtns = popover?.querySelectorAll("button");
    expect(optionBtns?.length).toBe(3);
    if (optionBtns && optionBtns[1]) {
      fireEvent.click(optionBtns[1]);
    }

    expect(onChange).toHaveBeenCalledWith("opt2");
    // Popover should close
    expect(container.querySelector(".custom-scrollbar")).toBeNull();
  });

  it("renders Check icon next to the selected option in popover", () => {
    render(
      <CustomSelect
        id="test-select"
        value="opt1"
        options={options}
      />
    );

    const trigger = screen.getByRole("button", { name: /Option One/i });
    fireEvent.click(trigger);

    const checkIcons = screen.getAllByTestId("check");
    expect(checkIcons.length).toBe(1);
  });

  it("closes popover when clicking outside the component", () => {
    const { container } = render(
      <div>
        <div data-testid="outside">Outside area</div>
        <CustomSelect
          id="test-select"
          options={options}
          placeholder="Select..."
        />
      </div>
    );

    const trigger = screen.getByRole("button", { name: /Select\.\.\./i });
    fireEvent.click(trigger);
    expect(container.querySelector(".custom-scrollbar")).not.toBeNull();

    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);

    expect(container.querySelector(".custom-scrollbar")).toBeNull();
  });

  it("does not open popover when disabled", () => {
    const { container } = render(
      <CustomSelect
        id="test-select"
        disabled
        options={options}
        placeholder="Select..."
      />
    );

    const trigger = screen.getByRole("button", { name: /Select\.\.\./i });
    fireEvent.click(trigger);

    expect(container.querySelector(".custom-scrollbar")).toBeNull();
  });

  it("supports string and number array options formatting", () => {
    render(
      <CustomSelect
        id="test-select"
        value="2"
        options={[1, 2, 3]}
      />
    );

    const trigger = screen.getByRole("button", { name: "2" });
    expect(trigger).toBeDefined();
  });
});
