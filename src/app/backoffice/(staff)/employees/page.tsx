import { db } from "@/db";
import { users } from "@/db/schema";
import { inArray, desc } from "drizzle-orm";
import { EmployeesTable } from "@/components/employees-table";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Employees - Backoffice",
  description: "Inspect administrative and employee staff accounts.",
};

export default async function EmployeesDirectoryPage() {
  let staffList: (typeof users.$inferSelect)[] = [];
  let currentUserRole: "user" | "employee" | "admin" | "organization" = "employee";

  try {
    const session = await auth();
    if (session?.user?.role) {
      currentUserRole = session.user.role;
    }

    staffList = await db
      .select()
      .from(users)
      .where(inArray(users.role, ["employee", "admin"]))
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Failed to query staff directory:", error);
  }

  return <EmployeesTable staffList={staffList} currentUserRole={currentUserRole} />;
}
