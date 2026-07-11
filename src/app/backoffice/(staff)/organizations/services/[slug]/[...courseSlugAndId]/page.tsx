import { db } from "@/db";
import { users, services, serviceTypes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ slug: string; courseSlugAndId: string[] }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return {
    title: `Edit ${slug} - Backoffice`,
    description: `Configure service settings in backoffice`,
  };
}

export default async function BackofficeOrganizationServicePage({ params }: PageProps) {
  const { slug, courseSlugAndId } = await params;

  let activeCourseTab: string | undefined = undefined;
  let id: string = "";

  if (courseSlugAndId.length === 1) {
    id = courseSlugAndId[0];
  } else if (courseSlugAndId.length === 2) {
    activeCourseTab = courseSlugAndId[0];
    id = courseSlugAndId[1];
  } else {
    notFound();
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  // Fetch the organization details
  const [organization] = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
      organizationCategory: users.organizationCategory,
      enabledCourses: users.enabledCourses,
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
      coursesOrder: services.coursesOrder,
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
    <div className="space-y-6 w-full p-6">
      {/* Back Button */}
      <div>
        <Link
          href={`/backoffice/organizations/services/${organization.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Organization Services
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {service.name} Settings
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
          Configure courses for organization:
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm">
            {organization.name}
          </span>
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

        </CardContent>
      </Card>
    </div>
  );
}
