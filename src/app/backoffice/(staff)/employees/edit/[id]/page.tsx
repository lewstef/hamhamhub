import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditEmployeeForm } from "@/components/edit-employee-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Employee - Backoffice",
  description: "Update staff details.",
};

export default async function EditEmployeePage({ params }: PageProps) {
  const { id } = await params;

  const [employee] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!employee || employee.role === "user") {
    notFound();
  }

  return (
    <div className="max-w-5xl">
      <EditEmployeeForm employee={employee} />
    </div>
  );
}
