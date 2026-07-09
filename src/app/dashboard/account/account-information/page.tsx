import { getDashboardAccountData } from "../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

export const metadata = {
  title: "Account Information - Dashboard",
  description: "View and edit organization details.",
};

export default async function AccountInformationPage() {
  const { organization, organizationCategoryList, servicesList } = await getDashboardAccountData();

  return (
    <div className="max-w-5xl">
      <EditOrganizationForm
        organization={organization}
        organizationCategoryList={organizationCategoryList}
        servicesList={servicesList}
        activeTabProp="personal"
      />
    </div>
  );
}
