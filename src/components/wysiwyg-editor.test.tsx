// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WysiwygEditor } from "./wysiwyg-editor";

describe("WysiwygEditor Component", () => {
  beforeEach(() => {
    document.execCommand = vi.fn();
  });

  it("should render editor div with initial HTML content", () => {
    const { container } = render(<WysiwygEditor value="<p>Hello World</p>" onChange={() => {}} placeholder="Enter description" />);

    const editorDiv = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
    expect(editorDiv).toBeDefined();
    expect(editorDiv.innerHTML).toBe("<p>Hello World</p>");
  });

  it("should invoke onChange on input event", () => {
    const handleChange = vi.fn();
    const { container } = render(<WysiwygEditor value="" onChange={handleChange} />);

    const editorDiv = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
    editorDiv.innerHTML = "New text";
    fireEvent.input(editorDiv);

    expect(handleChange).toHaveBeenCalledWith("New text");
  });

  it("should execute bold command when Bold toolbar button is clicked", () => {
    render(<WysiwygEditor value="" onChange={() => {}} />);

    const boldButton = screen.getByTitle("Bold");
    fireEvent.click(boldButton);

    expect(document.execCommand).toHaveBeenCalledWith("bold", false, "");
  });

  it("should execute italic command when Ctrl+I key combination is pressed", () => {
    const { container } = render(<WysiwygEditor value="" onChange={() => {}} />);

    const editorDiv = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
    fireEvent.keyDown(editorDiv, { key: "i", ctrlKey: true });

    expect(document.execCommand).toHaveBeenCalledWith("italic", false, "");
  });

  it("should execute underline command when Ctrl+U key combination is pressed", () => {
    const { container } = render(<WysiwygEditor value="" onChange={() => {}} />);

    const editorDiv = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
    fireEvent.keyDown(editorDiv, { key: "u", ctrlKey: true });

    expect(document.execCommand).toHaveBeenCalledWith("underline", false, "");
  });
});
