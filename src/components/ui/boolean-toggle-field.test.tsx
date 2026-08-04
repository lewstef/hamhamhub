// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { BooleanToggleField } from "./boolean-toggle-field";

describe("BooleanToggleField Component", () => {
  it("renders label, description, and toggle switch", () => {
    render(
      <BooleanToggleField
        label="Certified Trainer"
        description="Has official certification credentials"
        checked={false}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Certified Trainer")).toBeDefined();
    expect(screen.getByText("Has official certification credentials")).toBeDefined();
  });

  it("calls onChange when label/description area is clicked in enabled state", () => {
    const onChange = vi.fn();
    render(
      <BooleanToggleField
        label="Certified Trainer"
        description="Has official certification credentials"
        checked={false}
        onChange={onChange}
      />
    );

    const labelDiv = screen.getByText("Certified Trainer");
    fireEvent.click(labelDiv);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when clicked while disabled", () => {
    const onChange = vi.fn();
    render(
      <BooleanToggleField
        label="Certified Trainer"
        description="Has official certification credentials"
        checked={false}
        onChange={onChange}
        disabled={true}
      />
    );

    const labelDiv = screen.getByText("Certified Trainer");
    fireEvent.click(labelDiv);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders children slot when checked is true", () => {
    render(
      <BooleanToggleField
        label="Certified Trainer"
        description="Has official certification credentials"
        checked={true}
        onChange={() => {}}
      >
        <div data-testid="expanded-details">Expanded Trainer Details</div>
      </BooleanToggleField>
    );

    expect(screen.getByTestId("expanded-details")).toBeDefined();
  });

  it("does not render children slot when checked is false", () => {
    render(
      <BooleanToggleField
        label="Certified Trainer"
        description="Has official certification credentials"
        checked={false}
        onChange={() => {}}
      >
        <div data-testid="expanded-details">Expanded Trainer Details</div>
      </BooleanToggleField>
    );

    expect(screen.queryByTestId("expanded-details")).toBeNull();
  });
});
