import { notFound } from "next/navigation";
import { getServiceTypesAction } from "@/app/actions/service-types";
import { ServiceTypePreviewForm } from "@/components/service-type-preview-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const serviceTypesList = await getServiceTypesAction();
  const serviceType = serviceTypesList.find((s) => s.id === id);
  return {
    title: serviceType ? `Preview ${serviceType.name} - Backoffice` : "Preview Service - Backoffice",
  };
}

export default async function ServiceTypePreviewPage({ params }: PageProps) {
  const { id } = await params;
  const serviceTypesList = await getServiceTypesAction();
  const serviceType = serviceTypesList.find((s) => s.id === id);

  if (!serviceType) {
    notFound();
  }

  return <ServiceTypePreviewForm serviceType={serviceType} />;
}
