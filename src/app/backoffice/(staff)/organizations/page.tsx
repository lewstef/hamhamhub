import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { OrganizationsTable } from "@/components/organizations-table";

import { getOrganizationCategories } from "@/app/actions/organizations";

export const metadata = {
  title: "Organizations - Backoffice",
  description: "Manage and inspect organization client accounts.",
};

export default async function OrganizationsDirectoryPage() {
  let organizationList: (typeof users.$inferSelect)[] = [];
  let organizationCategoryList: any[] = [];
  try {
    organizationList = await db
      .select()
      .from(users)
      .where(eq(users.role, "organization"))
      .orderBy(desc(users.createdAt));
    organizationCategoryList = await getOrganizationCategories();
  } catch (error) {
    console.error("Failed to query organizations directory:", error);
  }

  return (
    <OrganizationsTable
      organizationList={organizationList}
      organizationCategoryList={organizationCategoryList}
    />
  );
}
