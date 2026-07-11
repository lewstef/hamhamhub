import { db } from "@/db";
import { users, services, serviceTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getOrganizationCategories } from "@/app/actions/organizations";

export async function getOrganizationData(id: string) {
  const [organization] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      organizationCategory: users.organizationCategory,
      phoneNumber: users.phoneNumber,
      recoveryEmail: users.recoveryEmail,
      address: users.address,
      addressCountry: users.addressCountry,
      addressState: users.addressState,
      addressCity: users.addressCity,
      addressLine: users.addressLine,
      addressZip: users.addressZip,
      facebook: users.facebook,
      instagram: users.instagram,
      tiktok: users.tiktok,
      youtube: users.youtube,
      website: users.website,
      googleBusinessProfile: users.googleBusinessProfile,
      createdAt: users.createdAt,
      enabledServices: users.enabledServices,
      enabledCourses: users.enabledCourses,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  // Security check: Only allow editing users with 'organization' role on this page
  if (!organization || organization.role !== "organization") {
    notFound();
  }

  const organizationCategoryList = await getOrganizationCategories();

  // Fetch all services matching organization category
  let servicesList: any[] = [];
  if (organization.organizationCategory) {
    const rawServices = await db
      .select({
        id: services.id,
        name: services.name,
        organizationCategory: services.organizationCategory,
        slug: serviceTypes.id,
        description: serviceTypes.description,
        coursesOrder: services.coursesOrder,
      })
      .from(services)
      .leftJoin(serviceTypes, eq(services.name, serviceTypes.name))
      .where(eq(services.organizationCategory, organization.organizationCategory))
      .orderBy(services.sortOrder);

    servicesList = rawServices.map((s) => ({
      ...s,
      slug: s.slug ? s.slug.replace(/_/g, "-") : null,
    }));
  }

  return {
    organization,
    organizationCategoryList,
    servicesList,
  };
}
