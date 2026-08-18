import { db } from "@/db";
import { users, services, serviceTypes, organizationEnabledServices, organizationEnabledCourses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardServicesList } from "@/components/dashboard-services-list";
import { getServiceTypesAction } from "@/app/actions/service-types";

export const metadata = {
  title: "Services - Dashboard",
  description: "Configure your organization services.",
};

export default async function DashboardServicesPage() {
  const session = await auth();

  if (!session) {
    redirect("/dashboard/login");
  }

  const id = session.user.id;

  const [organization] = await db
    .select({
      id: users.id,
      role: users.role,
      organizationCategory: users.organizationCategory,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!organization || organization.role !== "organization") {
    notFound();
  }

  // Get all services belonging to this organization category joined with their descriptions
  let matchingServices: { id: string; name: string; slug: string; description: string; coursesOrder?: string | null }[] = [];
  if (organization.organizationCategory) {
    const serviceTypeList = await getServiceTypesAction();
    const applicableTypes = serviceTypeList.filter((st) => st.applicableTo.includes(organization.organizationCategory!));

    const existingServices = await db
      .select({ name: services.name })
      .from(services)
      .where(eq(services.organizationCategory, organization.organizationCategory));

    const existingNames = new Set(existingServices.map((s) => s.name));
    const missing = applicableTypes.filter((st) => !existingNames.has(st.name));

    if (missing.length > 0) {
      await db.insert(services).values(
        missing.map((st) => ({
          name: st.name,
          organizationCategory: organization.organizationCategory!,
        }))
      );
    }

    matchingServices = await db
      .select({
        id: services.id,
        name: services.name,
        serviceTypeId: serviceTypes.id,
        description: serviceTypes.description,
        coursesOrder: services.coursesOrder,
      })
      .from(services)
      .leftJoin(serviceTypes, eq(services.name, serviceTypes.name))
      .where(eq(services.organizationCategory, organization.organizationCategory))
      .orderBy(services.sortOrder, services.createdAt)
      .then((rows) =>
        rows.map((r) => {
          const fallbackSlug = r.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
          return {
            id: r.id,
            name: r.name,
            slug: r.serviceTypeId ? r.serviceTypeId.replace(/_/g, "-") : fallbackSlug,
            description: r.description || "Operational service listing.",
            coursesOrder: r.coursesOrder,
          };
        })
      );
  }

  const [enabledServicesRows, enabledCoursesRows] = await Promise.all([
    db
      .select({ serviceId: organizationEnabledServices.serviceId })
      .from(organizationEnabledServices)
      .where(eq(organizationEnabledServices.organizationId, organization.id)),
    db
      .select({ courseId: organizationEnabledCourses.courseId })
      .from(organizationEnabledCourses)
      .where(eq(organizationEnabledCourses.organizationId, organization.id)),
  ]);

  const initialEnabledIds = enabledServicesRows.map((r) => r.serviceId);
  const initialEnabledCourseIds = enabledCoursesRows.map((r) => r.courseId);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Services</h1>
        <p className="text-sm text-muted-foreground">
          Select the operational services you would like to enable for your organization. Enabled services will appear in your sidebar menu.
        </p>
      </div>

      <DashboardServicesList
        organizationId={organization.id}
        services={matchingServices}
        initialEnabledIds={initialEnabledIds}
        initialEnabledCourseIds={initialEnabledCourseIds}
      />
    </div>
  );
}
