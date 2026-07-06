// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import React from "react";
import { ThemeProvider, useTheme } from "./theme-provider";

// Stub dynamic import of updateUserThemeAction so theme persist doesn't error
vi.mock("@/app/actions/auth", () => ({
  updateUserThemeAction: vi.fn().mockResolvedValue(undefined),
}));

// Helper: wrap children in ThemeProvider
function ProviderWrapper({
  initialTheme,
  children,
}: {
  initialTheme?: "light" | "dark";
  children: React.ReactNode;
}) {
  return <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>;
}

describe("ThemeProvider / useTheme", () => {
  beforeEach(() => {
    // Reset DOM state and localStorage before each test
    document.documentElement.classList.remove("dark");
    localStorage.clear();

    // Stub matchMedia for JSDOM
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("should throw if useTheme is called outside of ThemeProvider", () => {
    // Suppress the expected React error boundary noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within a ThemeProvider");
    spy.mockRestore();
  });

  it("should initialise with the supplied initialTheme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ProviderWrapper initialTheme="dark">{children}</ProviderWrapper>
      ),
    });
    expect(result.current.theme).toBe("dark");
  });

  it("should add 'dark' class to documentElement when setTheme('dark') is called", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ProviderWrapper initialTheme="light">{children}</ProviderWrapper>
      ),
    });

    await act(async () => {
      await result.current.setTheme("dark");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(result.current.theme).toBe("dark");
  });

  it("should remove 'dark' class from documentElement when setTheme('light') is called", async () => {
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ProviderWrapper initialTheme="dark">{children}</ProviderWrapper>
      ),
    });

    await act(async () => {
      await result.current.setTheme("light");
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(result.current.theme).toBe("light");
  });

  it("should persist theme in localStorage when setTheme is called", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ProviderWrapper initialTheme="light">{children}</ProviderWrapper>
      ),
    });

    await act(async () => {
      await result.current.setTheme("dark");
    });

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("should toggle from light to dark with toggleTheme()", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ProviderWrapper initialTheme="light">{children}</ProviderWrapper>
      ),
    });

    // DOM class is set synchronously inside setTheme — check it after act
    await act(async () => {
      result.current.toggleTheme();
    });

    // The 'dark' class should have been added to the documentElement
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should toggle from dark to light with toggleTheme()", async () => {
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ProviderWrapper initialTheme="dark">{children}</ProviderWrapper>
      ),
    });

    await act(async () => {
      result.current.toggleTheme();
    });

    // The 'dark' class should have been removed from the documentElement
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should read theme from localStorage on mount if savedTheme exists", async () => {
    localStorage.setItem("theme", "dark");

    // Mount and allow useEffect to run
    let hookResult!: ReturnType<typeof useTheme>;
    await act(async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <ProviderWrapper initialTheme="light">{children}</ProviderWrapper>
        ),
      });
      hookResult = result.current;
    });

    // After the effect runs with a saved "dark" value, the DOM class should be added
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
