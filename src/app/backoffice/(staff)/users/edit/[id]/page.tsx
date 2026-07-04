import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditUserForm } from "@/components/edit-user-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit User - Backoffice",
  description: "Update user details.",
};

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  // Security check: Only allow editing users with 'user' role on this page
  if (!user || user.role !== "user") {
    notFound();
  }

  return (
    <div className="max-w-5xl">
      <EditUserForm user={user} />
    </div>
  );
}
