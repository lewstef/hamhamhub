import { db } from "@/db";
import { users, services, serviceTypes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return {
    title: `Edit ${slug} - Backoffice`,
    description: `Configure service settings in backoffice`,
  };
}

export default async function BackofficeOrganizationServicePage({ params }: PageProps) {
  const { id, slug } = await params;

  // Fetch the organization details
  const [organization] = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
      organizationCategory: users.organizationCategory,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!organization || organization.role !== "organization") {
    notFound();
  }

  // Convert hyphens to underscores to match database primary key ID (e.g. dog-training -> dog_training)
  const dbId = slug.replace(/-/g, "_");

  // Fetch the specific service details
  const [service] = await db
    .select({
      id: services.id,
      name: services.name,
      description: serviceTypes.description,
    })
    .from(services)
    .leftJoin(serviceTypes, eq(services.name, serviceTypes.name))
    .where(and(
      eq(serviceTypes.id, dbId),
      eq(services.organizationCategory, organization.organizationCategory || "")
    ))
    .limit(1);

  if (!service) {
    notFound();
  }

  const isDogTraining = slug === "dog-training";

  return (
    <div className="space-y-6 w-full max-w-4xl p-6">
      {/* Back Button */}
      <div>
        <Link
          href={`/backoffice/organizations/edit/${organization.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Organization Edit
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {service.name} Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure courses for organization: {organization.name}
        </p>
      </div>

      <Card className="border border-border bg-card shadow-lg relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Service Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-lg border border-border/50">
              {service.description}
            </p>
          </div>


        </CardContent>
      </Card>
    </div>
  );
}
