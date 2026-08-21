"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { Plus, Trash2 } from "lucide-react";
import type { FaqItem } from "./types";

interface CourseFaqTabProps {
  itemNoun: string;
  faqs: FaqItem[];
  onAdd: () => void;
  onUpdate: (index: number, key: "question" | "answer", value: string) => void;
  onRemove: (index: number) => void;
  compact?: boolean;
}

/**
 * CourseFaqTab Component
 *
 * Renders the FAQ management section in both tabbed (card wrapper) and flat (inline) layouts.
 */
export function CourseFaqTab({
  itemNoun,
  faqs,
  onAdd,
  onUpdate,
  onRemove,
  compact = false,
}: CourseFaqTabProps) {
  const faqItems = (
    <div className="space-y-3">
      {faqs.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-border rounded-xl text-xs text-muted-foreground bg-muted/5">
          No FAQs added yet. Click &quot;Add FAQ Item&quot; below to start.
        </div>
      ) : (
        <div className="space-y-3" data-testid="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  FAQ Item #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Remove FAQ"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor={`faq-q-${index}`} className="text-xs font-semibold">Question</Label>
                  <Input
                    id={`faq-q-${index}`}
                    type="text"
                    placeholder="e.g. Is there a vaccination requirement?"
                    value={faq.question}
                    onChange={(e) => onUpdate(index, "question", e.target.value)}
                    className="bg-background h-8 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Answer</Label>
                  <WysiwygEditor
                    value={faq.answer}
                    onChange={(val) => onUpdate(index, "answer", val)}
                    placeholder="e.g. Yes, all dogs must have up-to-date DHPP and Rabies vaccines."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="w-full font-bold text-xs py-5 rounded-xl border-dashed border-2 border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
      >
        <Plus className="size-3.5 mr-1.5" />
        Add FAQ Item
      </Button>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-bold">Frequently Asked Questions (FAQ)</Label>
          <p className="text-xs text-muted-foreground">
            Add Q&amp;A pairs for clients regarding this {(itemNoun || "course").toLowerCase()}.
          </p>
        </div>
        {faqItems}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
        <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
          <h3 className="text-base font-bold text-foreground">Frequently Asked Questions (FAQ)</h3>
          <p className="text-xs text-muted-foreground">
            Add Q&amp;A pairs for clients regarding rules, gear requirements, and participation for this{" "}
            {(itemNoun || "course").toLowerCase()}.
          </p>
        </div>
        {faqItems}
      </div>
    </div>
  );
}
