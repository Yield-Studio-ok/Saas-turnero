import { Metadata } from "next";
import { PublicLanding } from "@/components/public-landing";

export const metadata: Metadata = {
  title: "Reservar Turno | Barbería Vintage",
  description: "Reserva tu turno de manera rápida y sencilla en nuestra landing pública.",
};

export default function ReservarDefaultPage() {
  return <PublicLanding initialSlug="barberia-vintage" />;
}
