import { redirect } from "next/navigation";

/**
 * /backoffice/organizations/services
 *
 * Redirects to the main Organizations Directory (/backoffice/organizations)
 * since service management requires specifying an organization ID
 * (e.g. /backoffice/organizations/services/[id]).
 */
export default function ServicesParentPage() {
  redirect("/backoffice/organizations");
}
