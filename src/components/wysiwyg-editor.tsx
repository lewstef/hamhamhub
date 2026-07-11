"use client";

import React, { useRef, useEffect } from "react";
import { Bold, Italic, Underline, List, ListOrdered, RemoveFormatting } from "lucide-react";

interface WysiwygEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function WysiwygEditor({ value, onChange, placeholder = "Start typing..." }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync value from prop to DOM only if it changed from outside to prevent cursor jumps
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-muted/40 border-b border-border/80 flex-wrap">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            executeCommand("bold");
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Bold"
        >
          <Bold className="size-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            executeCommand("italic");
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Italic"
        >
          <Italic className="size-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            executeCommand("underline");
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Underline"
        >
          <Underline className="size-4" />
        </button>
        <div className="w-px h-5 bg-border/80 mx-1" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            executeCommand("insertUnorderedList");
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Bullet List"
        >
          <List className="size-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            executeCommand("insertOrderedList");
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </button>
        <div className="w-px h-5 bg-border/80 mx-1" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            executeCommand("removeFormat");
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Remove Formatting"
        >
          <RemoveFormatting className="size-4" />
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[140px] max-h-[300px] overflow-y-auto focus:outline-none text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
        {...({ placeholder } as any)}
        style={{ outline: "none" }}
      />
    </div>
  );
}
