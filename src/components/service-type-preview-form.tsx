"use client";

import { useState } from "react";
import { ServiceType } from "@/config/service-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Eye, CheckCircle2 } from "lucide-react";

interface ServiceTypePreviewFormProps {
  serviceType: ServiceType;
}

export function ServiceTypePreviewForm({ serviceType }: ServiceTypePreviewFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [previewSuccess, setPreviewSuccess] = useState(false);

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting preview data:", formData);
    setPreviewSuccess(true);
    setTimeout(() => setPreviewSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Back navigation */}
      <div>
        <Link
          href="/backoffice/services/types"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
          Back to Service Types
        </Link>
      </div>

      {/* Info notice */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary flex items-start gap-3">
        <Eye className="size-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider">Dashboard View Preview</p>
          <p className="text-muted-foreground font-medium leading-relaxed">
            This demonstrates the form configuration that business entities (Organizations) will fill out in their 
            <strong> /dashboard</strong> panel when registering or editing their <strong>{serviceType.name}</strong> service offerings.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border border-border/80 shadow-md">
        <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
          <CardTitle className="text-lg font-bold text-foreground">
            Configure {serviceType.name} Offer
          </CardTitle>
          <CardDescription className="text-xs">
            Setup rates, boundaries, and specifications.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-5">
            {previewSuccess && (
              <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Preview submission successful! (Form details verified cleanly).
              </div>
            )}

            <div className="space-y-4">
              {serviceType.fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  
                  {field.type === "textarea" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      defaultValue=""
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      <option value="" disabled>Select {field.label.toLowerCase()}...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-2 py-1">
                      <input
                        id={field.name}
                        type="checkbox"
                        required={field.required}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                        className="size-4 rounded border-input text-primary focus:ring-ring"
                      />
                      <span className="text-xs font-medium text-foreground">{field.placeholder || "Enable this feature"}</span>
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={field.suffix ? "pr-16" : ""}
                      />
                      {field.suffix && (
                        <span className="absolute right-3 text-xs font-bold text-muted-foreground uppercase pointer-events-none bg-background/80 pl-2">
                          {field.suffix}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Link href="/backoffice/services/types" className={buttonVariants({ variant: "outline" })}>
                Back
              </Link>
              <Button type="submit">
                Validate & Submit Preview
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
