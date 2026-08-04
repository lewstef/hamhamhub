import { getDashboardAccountData } from "../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

export const metadata = {
  title: "Category Verification - Dashboard",
  description: "Request and view category verification status for your organization.",
};

export default async function AccountVerificationPage() {
  const { organization, organizationCategoryList, servicesList } = await getDashboardAccountData();

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
