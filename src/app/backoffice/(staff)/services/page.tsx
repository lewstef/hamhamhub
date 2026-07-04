import { db } from "@/db";
import { services } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ServicesTable } from "@/components/services-table";

export const metadata = {
  title: "Services - Backoffice",
  description: "Manage the master list of services linked to business types.",
};

export default async function ServicesPage() {
  let serviceList: (typeof services.$inferSelect)[] = [];
  try {
    serviceList = await db
      .select()
      .from(services)
      .orderBy(desc(services.createdAt));
  } catch (error) {
    console.error("Failed to query services master list:", error);
  }

  return <ServicesTable serviceList={serviceList} />;
}
