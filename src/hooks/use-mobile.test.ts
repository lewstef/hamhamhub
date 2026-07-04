// @vitest-environment happy-dom
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  let changeCallback: (() => void) | null = null;

  beforeEach(() => {
    changeCallback = null;

    // Stub window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: window.innerWidth < 768,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event, callback) => {
          if (event === "change") {
            changeCallback = callback;
          }
        }),
        removeEventListener: vi.fn((event, callback) => {
          if (event === "change" && changeCallback === callback) {
            changeCallback = null;
          }
        }),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("should return true when viewport width is mobile (less than 768px)", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should return false when viewport width is desktop (768px or more)", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("should update when window resize triggers change listener", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    // Change window.innerWidth to desktop size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Fire the mock media query listener change
    if (changeCallback) {
      act(() => {
        changeCallback!();
      });
    }

    expect(result.current).toBe(false);
  });
});
