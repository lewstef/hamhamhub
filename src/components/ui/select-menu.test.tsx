// @vitest-environment happy-dom

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SelectMenu, SelectMenuItem } from "./select-menu";

describe("SelectMenu & SelectMenuItem Primitives (src/components/ui/select-menu.tsx)", () => {
  describe("SelectMenu Component", () => {
    it("should render listbox container with children and custom scrollbar classes", () => {
      render(
        <SelectMenu data-testid="select-menu-container">
          <div>Option 1</div>
        </SelectMenu>
      );

      const menu = screen.getByTestId("select-menu-container");
      expect(menu).toBeDefined();
      expect(menu.getAttribute("role")).toBe("listbox");
      expect(menu.className).toContain("custom-scrollbar");
      expect(menu.className).toContain("bg-popover");
      expect(screen.getByText("Option 1")).toBeDefined();
    });

    it("should apply custom minWidthClass and maxHeightClass when provided", () => {
      render(
        <SelectMenu data-testid="select-menu-custom" minWidthClass="min-w-[200px]" maxHeightClass="max-h-40">
          <div>Option</div>
        </SelectMenu>
      );

      const menu = screen.getByTestId("select-menu-custom");
      expect(menu.className).toContain("min-w-[200px]");
      expect(menu.className).toContain("max-h-40");
    });
  });

  describe("SelectMenuItem Component", () => {
    it("should render item label and hide checkmark when isSelected is false", () => {
      render(
        <SelectMenuItem
          label="Test Option"
          isSelected={false}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByText("Test Option")).toBeDefined();
      expect(screen.queryByRole("img", { hidden: true })).toBeNull();
    });

    it("should render checkmark icon when isSelected is true", () => {
      const { container } = render(
        <SelectMenuItem
          label="Selected Option"
          isSelected={true}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByText("Selected Option")).toBeDefined();
      const svgCheck = container.querySelector("svg.lucide-check");
      expect(svgCheck).not.toBeNull();
    });

    it("should apply highlighted state classes when isHighlighted is true", () => {
      render(
        <SelectMenuItem
          label="Highlighted Option"
          isHighlighted={true}
          onClick={vi.fn()}
        />
      );

      const btn = screen.getByRole("button", { name: "Highlighted Option" });
      expect(btn.className).toContain("bg-accent");
      expect(btn.className).toContain("text-accent-foreground");
    });

    it("should trigger onClick callback when clicked", () => {
      const handleClick = vi.fn();
      render(
        <SelectMenuItem
          label="Clickable Option"
          onClick={handleClick}
        />
      );

      const btn = screen.getByRole("button", { name: "Clickable Option" });
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should disable button when disabled prop is true", () => {
      const handleClick = vi.fn();
      render(
        <SelectMenuItem
          label="Disabled Option"
          disabled={true}
          onClick={handleClick}
        />
      );

      const btn = screen.getByRole("button", { name: "Disabled Option" }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });
  });
});
