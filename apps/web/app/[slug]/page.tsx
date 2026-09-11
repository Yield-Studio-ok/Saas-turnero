import { Metadata } from "next";
import { PublicLanding } from "@/components/public-landing";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${title} | Reservar Turno`,
    description: `Reserva tu turno online en ${title}. Selecciona tu servicio y horario de atención.`,
  };
}

export default async function PublicTenantLandingPage({ params }: PageProps) {
  const { slug } = await params;

  return <PublicLanding initialSlug={slug} />;
}
