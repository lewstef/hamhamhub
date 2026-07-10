import { db } from "@/db";
import { users, services, serviceTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardServicesList } from "@/components/dashboard-services-list";

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
      enabledServices: users.enabledServices,
      enabledSubServices: users.enabledSubServices,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!organization || organization.role !== "organization") {
    notFound();
  }

  // Get all services belonging to this organization category joined with their descriptions
  let matchingServices: { id: string; name: string; slug: string; description: string; subServicesOrder?: string | null }[] = [];
  if (organization.organizationCategory) {
    matchingServices = await db
      .select({
        id: services.id,
        name: services.name,
        serviceTypeId: serviceTypes.id,
        description: serviceTypes.description,
        subServicesOrder: services.subServicesOrder,
      })
      .from(services)
      .leftJoin(serviceTypes, eq(services.name, serviceTypes.name))
      .where(eq(services.organizationCategory, organization.organizationCategory))
      .orderBy(services.sortOrder)
      .then((rows) =>
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: (r.serviceTypeId || "").replace(/_/g, "-"),
          description: r.description || "Operational service listing.",
          subServicesOrder: r.subServicesOrder,
        }))
      );
  }

  // Parse list of enabled service IDs
  const initialEnabledIds = organization.enabledServices
    ? organization.enabledServices.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Parse list of enabled sub-service IDs
  const initialEnabledSubServiceIds = organization.enabledSubServices
    ? organization.enabledSubServices.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

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
        initialEnabledSubServiceIds={initialEnabledSubServiceIds}
      />
    </div>
  );
}
