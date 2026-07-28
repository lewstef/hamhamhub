import { auth } from "@/auth";
import { SmtpConfigForm } from "@/components/smtp-config-form";
import { getActiveSmtpConfig } from "@/lib/email";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SMTP Configuration | HamHamHub Backoffice",
  description: "Configure outgoing email server settings, encryption protocol, and sender identity.",
};

export default async function SmtpConfigPage() {
  const session = await auth();
  const config = await getActiveSmtpConfig();

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Link href="/backoffice" className="hover:text-foreground transition-colors">
          Backoffice
        </Link>
        <ChevronRight className="size-3.5" />
        <span>System</span>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-semibold">SMTP</span>
      </nav>

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
          SMTP Configuration
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage system email server settings and transport parameters.
        </p>
      </div>

      {/* Form Component */}
      <SmtpConfigForm initialConfig={config} />
    </div>
  );
}
