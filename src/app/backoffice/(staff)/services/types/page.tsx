import { ServiceTypesTable } from "@/components/service-types-table";

export const metadata = {
  title: "Service Types - Backoffice",
  description: "Static service types configured directly in code.",
};

export default function ServiceTypesPage() {
  return <ServiceTypesTable />;
}
