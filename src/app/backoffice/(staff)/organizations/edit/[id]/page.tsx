import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOrganizationPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/backoffice/organizations/information/${id}`);
}
