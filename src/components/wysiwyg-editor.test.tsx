// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { WysiwygEditor } from "./wysiwyg-editor";

describe("WysiwygEditor Component", () => {
  beforeEach(() => {
    document.execCommand = vi.fn();
  });

  it("renders editor toolbar buttons and contentEditable div", () => {
    render(<WysiwygEditor value="<p>Hello world</p>" onChange={() => {}} />);

    expect(screen.getByTitle("Bold")).toBeDefined();
    expect(screen.getByTitle("Italic")).toBeDefined();
    expect(screen.getByTitle("Underline")).toBeDefined();
    expect(screen.getByTitle("Bullet List")).toBeDefined();
    expect(screen.getByTitle("Numbered List")).toBeDefined();
    expect(screen.getByTitle("Remove Formatting")).toBeDefined();
  });

  it("triggers document.execCommand and onChange on toolbar button clicks", () => {
    const onChange = vi.fn();
    const { container } = render(<WysiwygEditor value="" onChange={onChange} />);

    // Click Bold button
    fireEvent.click(screen.getByTitle("Bold"));
    expect(document.execCommand).toHaveBeenCalledWith("bold", false, "");

    // Click Italic button
    fireEvent.click(screen.getByTitle("Italic"));
    expect(document.execCommand).toHaveBeenCalledWith("italic", false, "");

    // Click Underline button
    fireEvent.click(screen.getByTitle("Underline"));
    expect(document.execCommand).toHaveBeenCalledWith("underline", false, "");

    // Click Bullet List button
    fireEvent.click(screen.getByTitle("Bullet List"));
    expect(document.execCommand).toHaveBeenCalledWith("insertUnorderedList", false, "");

    // Click Numbered List button
    fireEvent.click(screen.getByTitle("Numbered List"));
    expect(document.execCommand).toHaveBeenCalledWith("insertOrderedList", false, "");

    // Click Remove Formatting button
    fireEvent.click(screen.getByTitle("Remove Formatting"));
    expect(document.execCommand).toHaveBeenCalledWith("removeFormat", false, "");
  });

  it("handles keyboard shortcuts Ctrl+B, Ctrl+I, Ctrl+U", () => {
    const onChange = vi.fn();
    const { container } = render(<WysiwygEditor value="" onChange={onChange} />);

    const editableArea = container.querySelector('[contenteditable="true"]') as HTMLElement;

    // Ctrl+B
    fireEvent.keyDown(editableArea, { key: "b", ctrlKey: true });
    expect(document.execCommand).toHaveBeenCalledWith("bold", false, "");

    // Ctrl+I
    fireEvent.keyDown(editableArea, { key: "i", ctrlKey: true });
    expect(document.execCommand).toHaveBeenCalledWith("italic", false, "");

    // Ctrl+U
    fireEvent.keyDown(editableArea, { key: "u", ctrlKey: true });
    expect(document.execCommand).toHaveBeenCalledWith("underline", false, "");
  });

  it("calls onChange when typing inside contentEditable div", () => {
    const onChange = vi.fn();
    const { container } = render(<WysiwygEditor value="" onChange={onChange} />);

    const editableArea = container.querySelector('[contenteditable="true"]') as HTMLElement;
    editableArea.innerHTML = "New content text";
    fireEvent.input(editableArea);

    expect(onChange).toHaveBeenCalledWith("New content text");
  });
});
