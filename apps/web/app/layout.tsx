import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import LegalNoticeModal from "@/components/legal-notice-modal";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Turnero — Software todo en uno para salones, barberías y spas",
  description:
    "Llená tu agenda, eliminá el ausentismo y poné tus finanzas en piloto automático. Tus clientes reservan en menos de 30 segundos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} ${inter.variable}`}>
      <body className="antialiased">
        <PostHogProvider>
          <AuthProvider>
            <LegalNoticeModal />
            {children}
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
