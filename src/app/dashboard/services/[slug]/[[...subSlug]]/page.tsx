import { db } from "@/db";
import { users, services, serviceTypes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardServiceDetail } from "@/components/dashboard-service-detail";

interface PageProps {
  params: Promise<{ slug: string; subSlug?: string[] }>;
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
      enabledSubServices: users.enabledSubServices,
      basicHasField: users.basicHasField,
      basicFieldDesc: users.basicFieldDesc,
      basicHasParking: users.basicHasParking,
      basicParkingDesc: users.basicParkingDesc,
      basicSchedule: users.basicSchedule,
      basicTerms: users.basicTerms,
      basicProgramIncludes: users.basicProgramIncludes,
      basicHasCertifiedTrainer: users.basicHasCertifiedTrainer,
      basicTrainerInstitution: users.basicTrainerInstitution,
      groupHasField: users.groupHasField,
      groupFieldDesc: users.groupFieldDesc,
      groupHasParking: users.groupHasParking,
      groupParkingDesc: users.groupParkingDesc,
      groupSchedule: users.groupSchedule,
      groupTerms: users.groupTerms,
      groupProgramIncludes: users.groupProgramIncludes,
      groupHasCertifiedTrainer: users.groupHasCertifiedTrainer,
      groupTrainerInstitution: users.groupTrainerInstitution,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!organization || organization.role !== "organization") {
    notFound();
  }

  const { slug, subSlug } = await params;
  const activeSubServiceTab = subSlug?.[0];
  
  // Convert hyphens to underscores to match database primary key ID (e.g. dog-training -> dog_training)
  const dbId = slug.replace(/-/g, "_");

  // Fetch the specific service details
  const [service] = await db
    .select({
      id: services.id,
      name: services.name,
      organizationCategory: services.organizationCategory,
      description: serviceTypes.description,
      subServicesOrder: services.subServicesOrder,
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
    subServicesOrder: service.subServicesOrder,
  };

  const enabledSubServiceIds = organization.enabledSubServices
    ? organization.enabledSubServices.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <DashboardServiceDetail
      organization={organization}
      service={formattedService}
      initialIsEnabled={isEnabled}
      slug={slug}
      activeSubServiceTab={activeSubServiceTab}
      enabledSubServiceIds={enabledSubServiceIds}
    />
  );
}
