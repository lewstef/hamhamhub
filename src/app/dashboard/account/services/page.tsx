import { getDashboardAccountData } from "../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

export const metadata = {
  title: "Account Services - Dashboard",
  description: "View and configure organization services.",
};

export default async function AccountServicesPage() {
  const { organization, organizationCategoryList, servicesList } = await getDashboardAccountData();

  return (
    <div className="max-w-5xl">
      <EditOrganizationForm
        organization={organization}
        organizationCategoryList={organizationCategoryList}
        servicesList={servicesList}
        activeTabProp="services"
      />
    </div>
  );
}
