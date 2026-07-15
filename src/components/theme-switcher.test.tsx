// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeSwitcher } from "./theme-switcher";
import { ThemeProvider } from "./theme-provider";

// Mock the updateUserThemeAction from auth action so theme updates are bypassed during tests
vi.mock("@/app/actions/auth", () => ({
  updateUserThemeAction: vi.fn().mockResolvedValue(undefined),
}));

describe("ThemeSwitcher Component", () => {
  it("should render a toggle button with the correct aria-label", () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    const button = screen.getByRole("button", { name: "Toggle Theme" });
    expect(button).toBeDefined();
  });

  it("should toggle the theme when button is clicked", () => {
    const { container } = render(
      <ThemeProvider initialTheme="light">
        <ThemeSwitcher />
      </ThemeProvider>
    );

    const button = screen.getByRole("button", { name: "Toggle Theme" });
    
    // Initial State: light theme, document element shouldn't contain dark class
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Trigger toggleTheme
    fireEvent.click(button);

    // ThemeProvider sets state asynchronously, verify class exists on element
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
