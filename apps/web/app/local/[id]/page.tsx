import { Metadata } from "next";
import { ResilientLocalLanding } from "./resilient-local-landing";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchLocalProfile(id: string) {
  const envUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const urlsToTry = Array.from(
    new Set(
      [
        envUrl,
        envUrl?.replace("localhost", "127.0.0.1"),
        "http://127.0.0.1:3001",
        "http://localhost:3001",
        "http://api:3001",
      ].filter(Boolean) as string[],
    ),
  );

  for (const rootUrl of urlsToTry) {
    try {
      const res = await fetch(`${rootUrl}/business/public/${id}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Intenta siguiente URL
    }
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const profile = await fetchLocalProfile(id);
  const title =
    profile?.name ||
    id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return {
    title: `${title} | Reservar Turno`,
    description: `Reserva tu turno online en ${title}. Selecciona tu servicio y horario de atención.`,
  };
}

export default async function PublicTenantLandingPage({ params }: PageProps) {
  const { id } = await params;

  const profile = await fetchLocalProfile(id);

  return <ResilientLocalLanding id={id} initialProfile={profile} />;
}
