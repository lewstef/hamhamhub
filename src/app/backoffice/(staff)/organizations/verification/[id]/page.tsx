import { getOrganizationData } from "../../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Category Verification - Backoffice",
  description: "Review and manage organization category verification status.",
};

export default async function AccountVerificationPage({ params }: PageProps) {
  const { id } = await params;
  const { organization, organizationCategoryList, servicesList } = await getOrganizationData(id);

  return (
    <div className="w-full">
      <EditOrganizationForm
        organization={organization}
        organizationCategoryList={organizationCategoryList}
        servicesList={servicesList}
        activeTabProp="verification"
      />
    </div>
  );
}
