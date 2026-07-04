import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { UsersTable } from "@/components/users-table";

export const metadata = {
  title: "Users - Backoffice",
  description: "Manage and inspect client user accounts.",
};

export default async function UsersDirectoryPage() {
  let userList: (typeof users.$inferSelect)[] = [];
  try {
    userList = await db
      .select()
      .from(users)
      .where(eq(users.role, "user"))
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Failed to query users directory:", error);
  }

  return <UsersTable userList={userList} />;
}
