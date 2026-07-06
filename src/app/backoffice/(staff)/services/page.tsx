import { db } from "@/db";
import { services } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ServicesTable } from "@/components/services-table";

import { getOrganizationCategories } from "@/app/actions/organizations";

export const metadata = {
  title: "Services - Backoffice",
  description: "Manage the master list of services linked to business types.",
};

export default async function ServicesPage() {
  let serviceList: (typeof services.$inferSelect)[] = [];
  let organizationCategoryList: any[] = [];
  try {
    serviceList = await db
      .select()
      .from(services)
      .orderBy(desc(services.createdAt));
    organizationCategoryList = await getOrganizationCategories();
  } catch (error) {
    console.error("Failed to query services master list:", error);
  }

  return (
    <ServicesTable
      serviceList={serviceList}
      organizationCategoryList={organizationCategoryList}
    />
  );
}
