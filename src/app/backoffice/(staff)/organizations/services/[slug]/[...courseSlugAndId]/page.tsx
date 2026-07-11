import { db } from "@/db";
import { users, services, serviceTypes, courses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DashboardServiceDetail } from "@/components/dashboard-service-detail";

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
      enabledServices: users.enabledServices,
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

  // Parse enabled service list
  const enabledList = organization.enabledServices
    ? organization.enabledServices.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const isEnabled = enabledList.includes(service.id);

  const formattedService = {
    id: service.id,
    name: service.name,
    description: service.description || "Operational service listing.",
    coursesOrder: service.coursesOrder,
  };

  const enabledCourseIds = organization.enabledCourses
    ? organization.enabledCourses.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Load courses for dog-training service
  let orgCourses: any[] = [];
  if (slug === "dog-training") {
    orgCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.organizationId, organization.id))
      .orderBy(courses.createdAt);
  }

  return (
    <div className="space-y-6 w-full p-6">
      {/* Org context banner */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Managing courses for organization:</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm">
          {organization.name}
        </span>
      </div>

      <DashboardServiceDetail
        organizationId={organization.id}
        service={formattedService}
        initialIsEnabled={isEnabled}
        slug={slug}
        activeCourseTab={activeCourseTab}
        enabledCourseIds={enabledCourseIds}
        courses={orgCourses}
        backHref={`/backoffice/organizations/services/${organization.id}`}
        backLabel="Back to Organization Services"
      />
    </div>
  );
}
