import { getDashboardAccountData } from "../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

export const metadata = {
  title: "Security - Dashboard",
  description: "View and edit organization credentials.",
};

export default async function AccountSecurityPage() {
  const { organization, organizationCategoryList, servicesList } = await getDashboardAccountData();

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
