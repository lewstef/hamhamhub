"use client";

import React, { useRef, useEffect, useState } from "react";
import { Bold, Italic, List, ListOrdered, RemoveFormatting } from "lucide-react";
import { cn } from "@/lib/utils";

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  ariaLabelledBy?: string;
}

export function WYSIWYGEditor({ value, onChange, placeholder, disabled, id, ariaLabelledBy }: WYSIWYGEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keep editor content in sync with the value prop on initial mount or external change
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

  const executeCommand = (command: string, arg: string = "") => {
    if (disabled) return;
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      className={cn(
        "w-full rounded-lg border border-input bg-transparent text-base transition-all outline-none focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm dark:bg-input/30",
        isFocused && "border-ring ring-3 ring-ring/50",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-border/80 p-1.5 bg-muted/20 rounded-t-lg select-none">
        <button
          type="button"
          disabled={disabled}
          onClick={() => executeCommand("bold")}
          title="Bold"
          className="p-1.5 rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <Bold className="size-4" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => executeCommand("italic")}
          title="Italic"
          className="p-1.5 rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <Italic className="size-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          disabled={disabled}
          onClick={() => executeCommand("insertUnorderedList")}
          title="Bullet List"
          className="p-1.5 rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <List className="size-4" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => executeCommand("insertOrderedList")}
          title="Numbered List"
          className="p-1.5 rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <ListOrdered className="size-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          disabled={disabled}
          onClick={() => executeCommand("removeFormat")}
          title="Clear Formatting"
          className="p-1.5 rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RemoveFormatting className="size-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        id={id}
        ref={editorRef}
        contentEditable={!disabled}
        role="textbox"
        aria-labelledby={ariaLabelledBy}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          handleInput();
        }}
        data-placeholder={placeholder || "Start typing..."}
        className={cn(
          "min-h-[120px] w-full px-3 py-2 outline-none break-words text-foreground font-sans prose prose-sm dark:prose-invert max-w-none focus:outline-none [&_ol]:list-decimal [&_ol]:ml-4 [&_ul]:list-disc [&_ul]:ml-4 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
        )}
        style={{
          caretColor: "currentColor",
        }}
        data-testid="wysiwyg-editor"
      />
    </div>
  );
}
