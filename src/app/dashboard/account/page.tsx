import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { EditOrganizationForm } from "@/components/edit-organization-form";
import { getOrganizationCategories } from "@/app/actions/organizations";

export const metadata = {
  title: "Account Details - Dashboard",
  description: "Manage your organization account settings and credentials.",
};

export default async function DashboardAccountPage() {
  const session = await auth();

  if (!session) {
    redirect("/dashboard/login");
  }

  const id = session.user.id;

  const [organization] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      organizationCategory: users.organizationCategory,
      phoneNumber: users.phoneNumber,
      recoveryEmail: users.recoveryEmail,
      address: users.address,
      addressCountry: users.addressCountry,
      addressState: users.addressState,
      addressCity: users.addressCity,
      addressLine: users.addressLine,
      addressZip: users.addressZip,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!organization || organization.role !== "organization") {
    notFound();
  }

  const organizationCategoryList = await getOrganizationCategories();

  return (
    <div className="max-w-5xl">
      <EditOrganizationForm
        organization={organization}
        organizationCategoryList={organizationCategoryList}
      />
    </div>
  );
}
