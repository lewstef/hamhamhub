import { db } from "@/db";
import { users, services, serviceTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrganizationCategories } from "@/app/actions/organizations";

/**
 * Fetches data for the authenticated organization user's dashboard account pages.
 * Includes user profiles, categories list, services list, and custom billing details.
 *
 * @returns `{ organization, organizationCategoryList, servicesList }`
 * @throws Redirects to `/dashboard/login` if the user is not authenticated.
 * @securityGuard Auth session check
 */
export async function getDashboardAccountData() {
  const session = await auth();

  if (!session) {
    redirect("/dashboard/login");
  }

  const id = session.user.id;

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
      billingCompanyName: users.billingCompanyName,
      billingTaxId: users.billingTaxId,
      billingTradeRegistryNumber: users.billingTradeRegistryNumber,
      billingEuid: users.billingEuid,
      billingBankAccountNumber: users.billingBankAccountNumber,
      billingBankName: users.billingBankName,
      billingContactName: users.billingContactName,
      billingContactPhone: users.billingContactPhone,
      billingContactEmail: users.billingContactEmail,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!organization || organization.role !== "organization") {
    notFound();
  }

  const organizationCategoryList = await getOrganizationCategories();

  let servicesList: any[] = [];
  if (organization.organizationCategory) {
    servicesList = await db
      .select({
        id: services.id,
        name: services.name,
        organizationCategory: services.organizationCategory,
        serviceTypeId: serviceTypes.id,
        description: serviceTypes.description,
      })
      .from(services)
      .leftJoin(serviceTypes, eq(services.name, serviceTypes.name))
      .where(eq(services.organizationCategory, organization.organizationCategory))
      .then((rows) =>
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          organizationCategory: r.organizationCategory,
          slug: (r.serviceTypeId || "").replace(/_/g, "-"),
          description: r.description || "Operational service listing.",
        }))
      );
  }

  return {
    organization,
    organizationCategoryList,
    servicesList,
  };
}
