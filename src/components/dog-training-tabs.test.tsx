// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DogTrainingTabs } from "./dog-training-tabs";

// Mock next/navigation for the component
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
  usePathname: () => "/dashboard/services/dog-training",
}));

// Wrap with Suspense since the component uses it
function renderWithSuspense(ui: React.ReactElement) {
  return render(
    <React.Suspense fallback={<div>Loading...</div>}>
      {ui}
    </React.Suspense>
  );
}

const ALL_DB_IDS = [
  "dog-training:basic",
  "dog-training:group",
  "dog-training:private",
  "dog-training:sar",
  "dog-training:show",
];

describe("DogTrainingTabs Component", () => {
  it("should render all 5 tab labels in the navigation bar", () => {
    renderWithSuspense(
      <DogTrainingTabs enabledSubServiceIds={ALL_DB_IDS} />
    );

    // Each label appears in both the tab nav and the content panel,
    // so use getAllByText and verify at least one match exists
    expect(screen.getAllByText("Basic Training and Obedience").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Group Basic Obedience Training").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Private training").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Search & Rescue Training").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Show Training and Handling").length).toBeGreaterThan(0);
  });

  it("should default to the first tab (Basic Training and Obedience) when no activeTabProp provided", () => {
    renderWithSuspense(
      <DogTrainingTabs enabledSubServiceIds={ALL_DB_IDS} />
    );

    // First tab link should have the active styling (bg-primary class)
    const firstTabLink = screen.getAllByRole("link")[0];
    expect(firstTabLink.className).toContain("bg-primary");
  });

  it("should pre-select 'Group Basic Obedience Training' when activeTabProp='group-basic-obedience-training'", () => {
    renderWithSuspense(
      <DogTrainingTabs
        activeTabProp="group-basic-obedience-training"
        enabledSubServiceIds={ALL_DB_IDS}
      />
    );

    const links = screen.getAllByRole("link");
    const groupTab = links.find((link) =>
      link.textContent?.includes("Group Basic Obedience Training")
    );
    expect(groupTab).toBeDefined();
    expect(groupTab!.className).toContain("bg-primary");
  });

  it("should pre-select 'Private training' when activeTabProp='private-training'", () => {
    renderWithSuspense(
      <DogTrainingTabs
        activeTabProp="private-training"
        enabledSubServiceIds={ALL_DB_IDS}
      />
    );

    const links = screen.getAllByRole("link");
    const privateTab = links.find((link) =>
      link.textContent?.includes("Private training")
    );
    expect(privateTab).toBeDefined();
    expect(privateTab!.className).toContain("bg-primary");
  });

  it("should pre-select 'Search & Rescue Training' when activeTabProp='search-and-rescue-training'", () => {
    renderWithSuspense(
      <DogTrainingTabs
        activeTabProp="search-and-rescue-training"
        enabledSubServiceIds={ALL_DB_IDS}
      />
    );

    const links = screen.getAllByRole("link");
    const sarTab = links.find((link) =>
      link.textContent?.includes("Search & Rescue Training")
    );
    expect(sarTab).toBeDefined();
    expect(sarTab!.className).toContain("bg-primary");
  });

  it("should pre-select 'Show Training and Handling' when activeTabProp='show-training-and-handling'", () => {
    renderWithSuspense(
      <DogTrainingTabs
        activeTabProp="show-training-and-handling"
        enabledSubServiceIds={ALL_DB_IDS}
      />
    );

    const links = screen.getAllByRole("link");
    const showTab = links.find((link) =>
      link.textContent?.includes("Show Training and Handling")
    );
    expect(showTab).toBeDefined();
    expect(showTab!.className).toContain("bg-primary");
  });

  it("should render enabled sub-services as <Link> elements (clickable)", () => {
    renderWithSuspense(
      <DogTrainingTabs enabledSubServiceIds={ALL_DB_IDS} />
    );

    // All 5 tabs should be links (enabled)
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(5);
  });

  it("should render disabled sub-services as <span> (not clickable)", () => {
    // Only basic is enabled, rest disabled
    renderWithSuspense(
      <DogTrainingTabs enabledSubServiceIds={["dog-training:basic"]} />
    );

    // Only 1 link (basic), other 4 should be spans
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(1);

    // Disabled tabs render as spans — use getAllByText to avoid duplicate match with panel title
    const groupSpans = screen.getAllByText("Group Basic Obedience Training");
    expect(groupSpans.some((el) => el.tagName === "SPAN")).toBe(true);

    const privateSpans = screen.getAllByText("Private training");
    expect(privateSpans.some((el) => el.tagName === "SPAN")).toBe(true);
  });

  it("should build correct href for each tab link based on the current path", () => {
    renderWithSuspense(
      <DogTrainingTabs enabledSubServiceIds={ALL_DB_IDS} />
    );

    const links = screen.getAllByRole("link");
    for (const link of links) {
      expect(link.getAttribute("href")).toContain("/dashboard/services/dog-training/");
    }
  });

  it("should build the group-basic-obedience-training tab href correctly", () => {
    renderWithSuspense(
      <DogTrainingTabs enabledSubServiceIds={ALL_DB_IDS} />
    );

    const links = screen.getAllByRole("link");
    const groupTabLink = links.find((link) =>
      link.getAttribute("href")?.includes("group-basic-obedience-training")
    );
    expect(groupTabLink).toBeDefined();
    expect(groupTabLink!.getAttribute("href")).toBe(
      "/dashboard/services/dog-training/group-basic-obedience-training"
    );
  });

  it("should treat all sub-services as enabled when enabledSubServiceIds is not provided", () => {
    renderWithSuspense(
      <DogTrainingTabs />
    );

    // No enabledSubServiceIds prop → all tabs treated as enabled → 5 links
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(5);
  });
});
