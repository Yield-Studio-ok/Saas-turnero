"use client";

import React, { useEffect, useState } from "react";
import {
  AnnouncementBar,
  Hero,
  MetricsStrip,
  Navbar,
  TrustBand,
  type LandingCmsConfig,
} from "@/components/landing/top";
import {
  BentoFeatures,
  ClientShowcase,
  ModulesExplorer,
  ProblemSolution,
} from "@/components/landing/middle";
import { FAQ, FinalCTA, Footer, Pricing, Testimonials } from "@/components/landing/bottom";

const DEFAULT_CMS_CONFIG: LandingCmsConfig = {
  heroTitle: "Dejá de perder clientes por no responder WhatsApp a tiempo.",
  heroSubtitle:
    "El software todo en uno que llena tu agenda, elimina el ausentismo y pone tus finanzas en piloto automático, mientras tus clientes reservan en menos de 30 segundos.",
  heroCta: "Empezar gratis 14 días",
  prices: {
    basic: 14900,
    pro: 29900,
    premium: 54900,
  },
};

export default function Index() {
  const [cms, setCms] = useState<LandingCmsConfig>(DEFAULT_CMS_CONFIG);

  useEffect(() => {
    const loadCms = () => {
      try {
        const stored = localStorage.getItem("turnero_cms_landing_config");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCms((prev) => ({
            ...prev,
            ...parsed,
            prices: {
              ...prev.prices,
              ...parsed.prices,
            },
          }));
        }
      } catch {
        // use default
      }
    };

    loadCms();
    window.addEventListener("storage", loadCms);
    return () => window.removeEventListener("storage", loadCms);
  }, []);

  return (
    <div id="top" className="turnero min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero cmsConfig={cms} />
        <MetricsStrip />
        <TrustBand />
        <ProblemSolution />
        <ClientShowcase />
        <ModulesExplorer />
        <BentoFeatures />
        <Testimonials />
        <Pricing cmsConfig={cms} />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
