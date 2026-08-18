// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card";

describe("Card UI Component Suite (src/components/ui/card.tsx)", () => {
  it("renders all card subcomponents including CardAction and CardFooter", () => {
    render(
      <Card size="sm" className="custom-card">
        <CardHeader>
          <CardTitle>Card Header Title</CardTitle>
          <CardDescription>Card Header Description</CardDescription>
          <CardAction>
            <button>Action Button</button>
          </CardAction>
        </CardHeader>
        <CardContent className="p-4">
          <p>Main body content</p>
        </CardContent>
        <CardFooter className="p-4">
          <span>Footer note</span>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText("Card Header Title")).toBeDefined();
    expect(screen.getByText("Card Header Description")).toBeDefined();
    expect(screen.getByRole("button", { name: "Action Button" })).toBeDefined();
    expect(screen.getByText("Main body content")).toBeDefined();
    expect(screen.getByText("Footer note")).toBeDefined();
  });
});
