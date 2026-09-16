import { Metadata } from "next";
import { PublicLanding } from "@/components/public-landing";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchLocalProfile(id: string) {
  try {
    const rootUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const res = await fetch(`${rootUrl}/business/public/${id}`, {
      next: { revalidate: 60 }, // optional cache revalidation
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching local profile:", err);
    return null;
  }
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

  if (!profile) {
    // If not found, you can show a not found page or just fallback to default for demo purposes
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center p-8 bg-white shadow-xl rounded-3xl max-w-sm w-full">
          <h1 className="text-2xl font-black mb-2">Local no encontrado</h1>
          <p className="text-slate-500 mb-6">No pudimos encontrar el local que buscas.</p>
          <a
            href="/explorar"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Explorar locales
          </a>
        </div>
      </div>
    );
  }

  return (
    <PublicLanding
      initialSlug={id}
      initialLocal={{
        name: profile.name,
        slug: profile.slug,
        tagline: profile.tagline || profile.description || "",
        address: profile.address || "",
        phone: profile.phone || "",
        openHours: profile.openHours || "09:00 - 20:00",
        rating: profile.rating || 5.0,
        reviewCount: profile.reviewCount || 0,
        isOpen: profile.isOpen ?? true,
        // Hack for localId
        ...({ id: profile.id } as any),
      }}
      initialServices={profile.services}
    />
  );
}
