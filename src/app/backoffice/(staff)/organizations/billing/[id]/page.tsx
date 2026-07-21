import { getOrganizationData } from "../../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Billing - Backoffice",
  description: "Update organization billing details.",
};

export default async function BillingPage({ params }: PageProps) {
  const { id } = await params;
  const { organization, organizationCategoryList, servicesList } = await getOrganizationData(id);

  return (
    <div className="w-full">
      <EditOrganizationForm
        organization={organization}
        organizationCategoryList={organizationCategoryList}
        servicesList={servicesList}
        activeTabProp="billing"
      />
    </div>
  );
}
