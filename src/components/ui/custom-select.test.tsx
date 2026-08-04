// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CustomSelect } from "./custom-select";

vi.mock("lucide-react", () => ({
  ChevronDown: () => <div data-testid="chevron-down" />,
  Check: () => <div data-testid="check" />,
  Search: () => <div data-testid="search" />,
  X: () => <div data-testid="x" />,
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

  it("updates internal state in uncontrolled mode when an option is selected", () => {
    const { container } = render(
      <CustomSelect
        id="test-select"
        defaultValue="opt1"
        options={options}
      />
    );

    const trigger = screen.getByRole("button", { name: "Option One" });
    fireEvent.click(trigger);

    const popover = container.querySelector(".custom-scrollbar");
    const optionBtns = popover?.querySelectorAll("button");
    if (optionBtns && optionBtns[1]) {
      fireEvent.click(optionBtns[1]);
    }

    expect(screen.getByRole("button", { name: "Option Two" })).toBeDefined();
  });

  it("triggers handleSelect when hidden select element fires change event", () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        id="test-select"
        value="opt1"
        onChange={onChange}
        options={options}
      />
    );

    const hiddenSelect = document.getElementById("test-select") as HTMLSelectElement;
    fireEvent.change(hiddenSelect, { target: { value: "opt2" } });

    expect(onChange).toHaveBeenCalledWith("opt2");
  });

  it("filters options diacritic-insensitively when searchable is true", () => {
    const { container } = render(
      <CustomSelect
        id="test-select"
        searchable
        searchPlaceholder="Search cities..."
        options={[
          { value: "cluj", label: "Cluj-Napoca" },
          { value: "timis", label: "Timișoara" },
          { value: "brasov", label: "Brașov" },
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: /Select option\.\.\./i });
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText("Search cities...");
    expect(searchInput).toBeDefined();

    // Type query with diacritics / without diacritics
    fireEvent.change(searchInput, { target: { value: "timis" } });

    const popover = container.querySelector(".custom-scrollbar");
    expect(popover?.textContent).toContain("Timișoara");
    expect(popover?.textContent).not.toContain("Cluj-Napoca");
  });

  it("supports keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)", () => {
    const onChange = vi.fn();
    const { container } = render(
      <CustomSelect
        id="test-select"
        onChange={onChange}
        options={[
          { value: "opt1", label: "Option One" },
          { value: "opt2", label: "Option Two" },
          { value: "opt3", label: "Option Three" },
        ]}
      />
    );

    const containerDiv = container.firstChild as HTMLElement;

    // Press ArrowDown on closed trigger to open popover
    fireEvent.keyDown(containerDiv, { key: "ArrowDown" });
    expect(container.querySelector(".custom-scrollbar")).not.toBeNull();

    // Press ArrowDown to navigate to Option Two
    fireEvent.keyDown(containerDiv, { key: "ArrowDown" });

    // Press Enter to select Option Two
    fireEvent.keyDown(containerDiv, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("opt2");
    expect(container.querySelector(".custom-scrollbar")).toBeNull();
  });

  it("supports Home, End, Escape, and Tab keys", () => {
    const { container } = render(
      <CustomSelect
        id="test-select"
        options={[
          { value: "opt1", label: "Option One" },
          { value: "opt2", label: "Option Two" },
          { value: "opt3", label: "Option Three" },
        ]}
      />
    );

    const containerDiv = container.firstChild as HTMLElement;
    fireEvent.keyDown(containerDiv, { key: "ArrowDown" });
    expect(container.querySelector(".custom-scrollbar")).not.toBeNull();

    // Home key
    fireEvent.keyDown(containerDiv, { key: "Home" });
    // End key
    fireEvent.keyDown(containerDiv, { key: "End" });
    // Tab key
    fireEvent.keyDown(containerDiv, { key: "Tab" });
    expect(container.querySelector(".custom-scrollbar")).toBeNull();

    // Reopen and test Escape
    fireEvent.keyDown(containerDiv, { key: "ArrowDown" });
    expect(container.querySelector(".custom-scrollbar")).not.toBeNull();
    fireEvent.keyDown(containerDiv, { key: "Escape" });
    expect(container.querySelector(".custom-scrollbar")).toBeNull();
  });

  it("clears search input when clear button is clicked and shows empty message when no options match", () => {
    const { container } = render(
      <CustomSelect
        id="test-select"
        searchable
        options={[
          { value: "cluj", label: "Cluj-Napoca" },
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: /Select option\.\.\./i });
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "NonExistentCity" } });

    expect(screen.getByText("No matching options found")).toBeDefined();

    const clearBtn = container.querySelector("button.absolute.right-2");
    if (clearBtn) {
      fireEvent.click(clearBtn);
    }

    expect(container.querySelector(".custom-scrollbar")?.textContent).toContain("Cluj-Napoca");
  });
});
