import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import LegalNoticeModal from "@/components/legal-notice-modal";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boilerplate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <LegalNoticeModal />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
