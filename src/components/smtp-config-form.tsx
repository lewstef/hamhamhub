"use client";

import React, { useState, useActionState } from "react";
import { updateSmtpConfigAction, sendTestEmailAction } from "@/app/actions/system";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { Server, Mail, ShieldCheck, Eye, EyeOff, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface SmtpConfigFormProps {
  initialConfig?: {
    smtpHost: string;
    smtpPort: string;
    smtpSecurity: string;
    smtpUsername?: string;
    senderName: string;
    senderEmail: string;
  };
}

export function SmtpConfigForm({ initialConfig }: SmtpConfigFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);

  const [saveState, saveAction, isSaving] = useActionState(updateSmtpConfigAction, null);
  const [testState, testAction, isTesting] = useActionState(sendTestEmailAction, null);

  const [host, setHost] = useState(initialConfig?.smtpHost || "smtp.gmail.com");
  const [port, setPort] = useState(initialConfig?.smtpPort || "587");
  const [security, setSecurity] = useState(initialConfig?.smtpSecurity || "TLS");
  const [username, setUsername] = useState(initialConfig?.smtpUsername || "notifications@hamhamhub.ro");
  const [password, setPassword] = useState("");
  const [senderName, setSenderName] = useState(initialConfig?.senderName || "HamHamHub System");
  const [senderEmail, setSenderEmail] = useState(initialConfig?.senderEmail || "no-reply@hamhamhub.ro");
  const [testRecipient, setTestRecipient] = useState("");

  const [prevConfig, setPrevConfig] = useState(initialConfig);
  if (initialConfig !== prevConfig) {
    setPrevConfig(initialConfig);
    if (initialConfig) {
      if (initialConfig.smtpHost) setHost(initialConfig.smtpHost);
      if (initialConfig.smtpPort) setPort(initialConfig.smtpPort);
      if (initialConfig.smtpSecurity) setSecurity(initialConfig.smtpSecurity);
      if (initialConfig.smtpUsername !== undefined) setUsername(initialConfig.smtpUsername);
      if (initialConfig.senderName) setSenderName(initialConfig.senderName);
      if (initialConfig.senderEmail) setSenderEmail(initialConfig.senderEmail);
    }
  }

  const [testModalKey, setTestModalKey] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);

  const openTestModal = () => {
    setTestRecipient("");
    setTestSubmitted(false);
    setTestModalKey((prev) => prev + 1);
    setTestModalOpen(true);
  };

  const closeTestModal = () => {
    setTestModalOpen(false);
    setTestRecipient("");
    setTestSubmitted(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary flex items-start gap-3">
        <Server className="size-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider">SMTP Server Configuration</p>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Configure outgoing mail transport credentials and default sender identity for automated notifications, transactional receipts, and system alerts.
          </p>
        </div>
      </div>

      <form action={saveAction} className="space-y-6">
        <Card className="border border-border/80 shadow-md">
          <CardHeader className="border-b border-border bg-muted/20 px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Mail Server Credentials & Protocol
            </CardTitle>
            <CardDescription className="text-xs">
              Configure server domain, port, transport security, and authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {saveState?.error && (
              <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-destructive" />
                {saveState.error}
              </div>
            )}

            {saveState?.success && (
              <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                SMTP server configuration updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="smtpHost" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  SMTP Host <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="smtpHost"
                  name="smtpHost"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. smtp.gmail.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="smtpPort" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Port <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="smtpPort"
                  name="smtpPort"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="587"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="smtpSecurity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Encryption Protocol <span className="text-destructive">*</span>
              </Label>
              <CustomSelect
                id="smtpSecurity"
                name="smtpSecurity"
                value={security}
                onChange={setSecurity}
                options={["TLS", "SSL", "None"]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="smtpUsername" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  SMTP Username / Account Email
                </Label>
                <Input
                  id="smtpUsername"
                  name="smtpUsername"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="notifications@domain.com"
                />
              </div>

              <div className="space-y-1.5 relative">
                <Label htmlFor="smtpPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  SMTP Password / App Secret
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="smtpPassword"
                    name="smtpPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sender Identity Card */}
        <Card className="border border-border/80 shadow-md">
          <CardHeader className="border-b border-border bg-muted/20 px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              Default Sender Identity
            </CardTitle>
            <CardDescription className="text-xs">
              Define display name and email address for system emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="senderName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sender Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="senderName"
                  name="senderName"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. HamHamHub System"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senderEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sender Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="senderEmail"
                  name="senderEmail"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="no-reply@hamhamhub.ro"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={openTestModal}
            className="gap-2"
          >
            <Send className="size-4" />
            Send Test Email
          </Button>

          <Button type="submit" disabled={isSaving} className="gap-2 px-6">
            {isSaving ? "Saving Configuration..." : "Save Configuration"}
          </Button>
        </div>
      </form>

      {/* Test Email Modal */}
      {testModalOpen && (
        <div key={testModalKey} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Send className="size-4 text-primary" />
                Send Test Connection Email
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter a target recipient email address to verify transport connectivity and credentials.
              </p>
            </div>

            {testSubmitted && testState?.error && (
              <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {testState.error}
              </div>
            )}

            {testSubmitted && testState?.success && (
              <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                Test email sent successfully! Transport connection verified.
              </div>
            )}

            <form
              action={(formData) => {
                setTestSubmitted(true);
                testAction(formData);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="testRecipientEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Recipient Email Address
                </Label>
                <Input
                  id="testRecipientEmail"
                  name="testRecipientEmail"
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="admin@hamhamhub.ro"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeTestModal}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isTesting}>
                  {isTesting ? "Sending..." : "Dispatch Test Email"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
