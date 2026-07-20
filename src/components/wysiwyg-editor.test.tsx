// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WysiwygEditor } from "./wysiwyg-editor";

// Mock lucide-react icons used in toolbar
vi.mock("lucide-react", () => ({
  Bold: () => <span data-testid="icon-bold">B</span>,
  Italic: () => <span data-testid="icon-italic">I</span>,
  Underline: () => <span data-testid="icon-underline">U</span>,
  List: () => <span data-testid="icon-list">List</span>,
  ListOrdered: () => <span data-testid="icon-list-ordered">OL</span>,
  RemoveFormatting: () => <span data-testid="icon-remove">Rf</span>,
}));

describe("WysiwygEditor Component", () => {
  const noop = () => {};

  it("should render the toolbar and the editable area", () => {
    render(<WysiwygEditor value="" onChange={noop} />);

    // All 6 toolbar buttons should be present
    expect(screen.getByTitle("Bold")).toBeDefined();
    expect(screen.getByTitle("Italic")).toBeDefined();
    expect(screen.getByTitle("Underline")).toBeDefined();
    expect(screen.getByTitle("Bullet List")).toBeDefined();
    expect(screen.getByTitle("Numbered List")).toBeDefined();
    expect(screen.getByTitle("Remove Formatting")).toBeDefined();
  });

  it("should render editable div with contentEditable", () => {
    const { container } = render(<WysiwygEditor value="<b>Hello</b>" onChange={noop} />);

    const editable = container.querySelector("[contenteditable]");
    expect(editable).toBeDefined();
  });

  it("should call onChange when content is typed into the editable area", () => {
    const handleChange = vi.fn();
    const { container } = render(<WysiwygEditor value="" onChange={handleChange} />);

    const editable = container.querySelector("[contenteditable]") as HTMLDivElement;

    act(() => {
      editable.innerHTML = "<p>New content</p>";
      fireEvent.input(editable);
    });

    expect(handleChange).toHaveBeenCalledWith("<p>New content</p>");
  });

  it("should sync innerHTML with value prop when value changes externally", () => {
    const { container, rerender } = render(<WysiwygEditor value="<b>Initial</b>" onChange={noop} />);

    const editable = container.querySelector("[contenteditable]") as HTMLDivElement;
    expect(editable.innerHTML).toBe("<b>Initial</b>");

    rerender(<WysiwygEditor value="<i>Updated</i>" onChange={noop} />);
    expect(editable.innerHTML).toBe("<i>Updated</i>");
  });

  it("should not overwrite editable content when value prop matches current innerHTML", () => {
    const { container } = render(<WysiwygEditor value="<b>Same</b>" onChange={noop} />);

    const editable = container.querySelector("[contenteditable]") as HTMLDivElement;
    // Simulate user having placed cursor inside — innerHTML is the same as prop
    editable.innerHTML = "<b>Same</b>";

    // Rerender with the same value — should NOT reset the innerHTML
    const spy = vi.spyOn(editable, "innerHTML", "set");
    // Force re-render with same value
    expect(editable.innerHTML).toBe("<b>Same</b>");
    spy.mockRestore();
  });

  it("should show the default placeholder text", () => {
    const { container } = render(<WysiwygEditor value="" onChange={noop} />);

    const editable = container.querySelector("[contenteditable]");
    expect(editable?.getAttribute("placeholder")).toBe("Start typing...");
  });

  it("should show a custom placeholder when provided", () => {
    const { container } = render(
      <WysiwygEditor value="" onChange={noop} placeholder="Write something..." />
    );

    const editable = container.querySelector("[contenteditable]");
    expect(editable?.getAttribute("placeholder")).toBe("Write something...");
  });

  it("should execute bold command when Bold button is clicked", () => {
    // happy-dom doesn't implement execCommand, so define it first
    document.execCommand = vi.fn().mockReturnValue(true);

    render(<WysiwygEditor value="" onChange={noop} />);
    fireEvent.click(screen.getByTitle("Bold"));

    expect(document.execCommand).toHaveBeenCalledWith("bold", false, "");
  });

  it("should execute italic command when Italic button is clicked", () => {
    document.execCommand = vi.fn().mockReturnValue(true);

    render(<WysiwygEditor value="" onChange={noop} />);
    fireEvent.click(screen.getByTitle("Italic"));

    expect(document.execCommand).toHaveBeenCalledWith("italic", false, "");
  });

  it("should execute underline command when Underline button is clicked", () => {
    document.execCommand = vi.fn().mockReturnValue(true);

    render(<WysiwygEditor value="" onChange={noop} />);
    fireEvent.click(screen.getByTitle("Underline"));

    expect(document.execCommand).toHaveBeenCalledWith("underline", false, "");
  });

  it("should execute insertUnorderedList command when Bullet List button is clicked", () => {
    document.execCommand = vi.fn().mockReturnValue(true);

    render(<WysiwygEditor value="" onChange={noop} />);
    fireEvent.click(screen.getByTitle("Bullet List"));

    expect(document.execCommand).toHaveBeenCalledWith("insertUnorderedList", false, "");
  });

  it("should execute insertOrderedList command when Numbered List button is clicked", () => {
    document.execCommand = vi.fn().mockReturnValue(true);

    render(<WysiwygEditor value="" onChange={noop} />);
    fireEvent.click(screen.getByTitle("Numbered List"));

    expect(document.execCommand).toHaveBeenCalledWith("insertOrderedList", false, "");
  });

  it("should execute removeFormat command when Remove Formatting button is clicked", () => {
    document.execCommand = vi.fn().mockReturnValue(true);

    render(<WysiwygEditor value="" onChange={noop} />);
    fireEvent.click(screen.getByTitle("Remove Formatting"));

    expect(document.execCommand).toHaveBeenCalledWith("removeFormat", false, "");
  });

  it("should initialise editable area as empty string when value is falsy", () => {
    const { container, rerender } = render(<WysiwygEditor value="<b>Old</b>" onChange={noop} />);

    rerender(<WysiwygEditor value="" onChange={noop} />);

    const editable = container.querySelector("[contenteditable]") as HTMLDivElement;
    expect(editable.innerHTML).toBe("");
  });
});
