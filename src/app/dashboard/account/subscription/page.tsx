import { getDashboardAccountData } from "../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

export const metadata = {
  title: "Subscription - Dashboard",
  description: "View subscription details.",
};

export default async function AccountSubscriptionPage() {
  const { organization, organizationCategoryList, servicesList } = await getDashboardAccountData();

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
