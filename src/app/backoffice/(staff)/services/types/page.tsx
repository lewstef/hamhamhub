import { ServiceTypesTable } from "@/components/service-types-table";
import { getServiceTypesAction } from "@/app/actions/service-types";

export const metadata = {
  title: "Service Types - Backoffice",
  description: "Configure name and descriptions for service types.",
};

export default async function ServiceTypesPage() {
  const serviceTypesList = await getServiceTypesAction();
  return <ServiceTypesTable serviceTypesList={serviceTypesList} />;
}
