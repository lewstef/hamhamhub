import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { OrganizationsTable } from "@/components/organizations-table";

export const metadata = {
  title: "Organizations - Backoffice",
  description: "Manage and inspect organization client accounts.",
};

export default async function OrganizationsDirectoryPage() {
  let organizationList: (typeof users.$inferSelect)[] = [];
  try {
    organizationList = await db
      .select()
      .from(users)
      .where(eq(users.role, "organization"))
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Failed to query organizations directory:", error);
  }

  return <OrganizationsTable organizationList={organizationList} />;
}
