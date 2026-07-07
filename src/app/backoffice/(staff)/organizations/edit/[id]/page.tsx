import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditOrganizationForm } from "@/components/edit-organization-form";

import { getOrganizationCategories } from "@/app/actions/organizations";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Organization - Backoffice",
  description: "Update organization details.",
};

export default async function EditOrganizationPage({ params }: PageProps) {
  const { id } = await params;

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

  // Security check: Only allow editing users with 'organization' role on this page
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
