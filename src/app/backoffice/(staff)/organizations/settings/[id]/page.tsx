import { getOrganizationData } from "../../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Account Settings - Backoffice",
  description: "Update organization account settings.",
};

export default async function AccountSettingsPage({ params }: PageProps) {
  const { id } = await params;
  const { organization, organizationCategoryList, servicesList } = await getOrganizationData(id);

  return (
    <div className="w-full">
      <EditOrganizationForm
        organization={organization}
        organizationCategoryList={organizationCategoryList}
        servicesList={servicesList}
        activeTabProp="account"
      />
    </div>
  );
}
