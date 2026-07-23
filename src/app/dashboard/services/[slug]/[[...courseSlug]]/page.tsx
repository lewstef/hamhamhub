import { db } from "@/db";
import { users, services, serviceTypes, courses } from "@/db/schema";
import { and, eq, or, isNull } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardServiceDetail } from "@/components/dashboard-service-detail";

interface PageProps {
  params: Promise<{ slug: string; courseSlug?: string[] }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return {
    title: `Service Settings - Dashboard`,
    description: `Configure service settings for ${slug}`,
  };
}

export default async function DashboardServiceDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/dashboard/login");
  }

  const userId = session.user.id;

  // Fetch the organization details
  const [organization] = await db
    .select({
      id: users.id,
      role: users.role,
      organizationCategory: users.organizationCategory,
      enabledServices: users.enabledServices,
      enabledCourses: users.enabledCourses,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!organization || organization.role !== "organization") {
    notFound();
  }

  const { slug, courseSlug } = await params;
  const activeCourseTab = courseSlug?.[0];
  
  // Convert hyphens to underscores to match database primary key ID (e.g. dog-training -> dog_training)
  const dbId = slug.replace(/-/g, "_");

  // Fetch the specific service details
  const allCatServices = await db
    .select({
      id: services.id,
      name: services.name,
      organizationCategory: services.organizationCategory,
      serviceTypeId: serviceTypes.id,
      description: serviceTypes.description,
      coursesOrder: services.coursesOrder,
    })
    .from(services)
    .leftJoin(serviceTypes, eq(services.name, serviceTypes.name))
    .where(eq(services.organizationCategory, organization.organizationCategory || ""));

  const service = allCatServices.find((s) => {
    const sSlug = s.serviceTypeId ? s.serviceTypeId.replace(/_/g, "-") : s.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    return sSlug === slug || s.serviceTypeId === dbId || s.id === slug;
  });

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

  let orgCourses: any[] = [];
  if (slug === "dog-training") {
    orgCourses = await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.organizationId, organization.id),
          or(eq(courses.serviceId, service.id), isNull(courses.serviceId))
        )
      )
      .orderBy(courses.sortOrder, courses.createdAt);
  } else if (slug === "sport-dog-training" || slug === "dog-boarding" || slug === "dog-grooming") {
    orgCourses = await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.organizationId, organization.id),
          eq(courses.serviceId, service.id)
        )
      )
      .orderBy(courses.sortOrder, courses.createdAt);
  }

  return (
    <DashboardServiceDetail
      organizationId={organization.id}
      service={formattedService}
      initialIsEnabled={isEnabled}
      slug={slug}
      activeCourseTab={activeCourseTab}
      enabledCourseIds={enabledCourseIds}
      courses={orgCourses}
    />
  );
}
