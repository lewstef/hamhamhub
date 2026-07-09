import { getOrganizationData } from "../../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Subscription - Backoffice",
  description: "View organization subscription.",
};

export default async function SubscriptionPage({ params }: PageProps) {
  const { id } = await params;
  const { organization, organizationCategoryList, servicesList } = await getOrganizationData(id);

  return (
    <div className="max-w-5xl">
      <EditOrganizationForm
        organization={organization}
        organizationCategoryList={organizationCategoryList}
        servicesList={servicesList}
        activeTabProp="subscription"
      />
    </div>
  );
}
