import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { PostHogProvider } from "@/components/providers/posthog-provider";
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
