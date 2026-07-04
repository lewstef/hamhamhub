import { db } from "@/db";
import { users } from "@/db/schema";
import { inArray, desc } from "drizzle-orm";
import { EmployeesTable } from "@/components/employees-table";

export const metadata = {
  title: "Employees - Backoffice",
  description: "Inspect administrative and employee staff accounts.",
};

export default async function EmployeesDirectoryPage() {
  let staffList: (typeof users.$inferSelect)[] = [];
  try {
    staffList = await db
      .select()
      .from(users)
      .where(inArray(users.role, ["employee", "admin"]))
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Failed to query staff directory:", error);
  }

  return <EmployeesTable staffList={staffList} />;
}
