import { getOrganizationData } from "../../utils";
import { EditOrganizationForm } from "@/components/edit-organization-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: "Services - Backoffice",
  description: "View organization services.",
};

export default async function ServicesPage({ params }: PageProps) {
  const { slug } = await params;
  const { organization, organizationCategoryList, servicesList } = await getOrganizationData(slug);

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
