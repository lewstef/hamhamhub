import { db } from "@/db";
import { services } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ServicesTable } from "@/components/services-table";
import { getOrganizationCategories } from "@/app/actions/organizations";
import { getServiceTypesAction } from "@/app/actions/service-types";

export const metadata = {
  title: "Services - Backoffice",
  description: "Manage the master list of services linked to business types.",
};

export default async function ServicesPage() {
  let serviceList: (typeof services.$inferSelect)[] = [];
  let organizationCategoryList: any[] = [];
  let serviceTypeList: any[] = [];
  
  try {
    serviceList = await db
      .select()
      .from(services)
      .orderBy(services.sortOrder, services.createdAt);
    organizationCategoryList = await getOrganizationCategories();
    serviceTypeList = await getServiceTypesAction();
  } catch (error) {
    console.error("Failed to query services master list:", error);
  }

  return (
    <ServicesTable
      serviceList={serviceList}
      organizationCategoryList={organizationCategoryList}
      serviceTypeList={serviceTypeList}
    />
  );
}
