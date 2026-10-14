"use client";

// Testimonials, Pricing, FAQ, FinalCTA, Footer.
import React, { useState, type ElementType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Star,
} from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" />
    </svg>
  );
}
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { captureEvent } from "@/lib/posthog";
import {
  Avatar,
  Logo,
  Reveal,
  SectionHeading,
  btnPrimary,
  btnSecondary,
  rise,
  spring,
  stagger,
} from "./shared";
import type { LandingCmsConfig } from "./top";

const quotes: [string, string, string][] = [
  [
    "Antes perdía 3 o 4 turnos por semana por no contestar a la noche. Ahora la agenda se llena sola mientras duermo.",
    "Martín G.",
    "Barbería Norte, Palermo",
  ],
  [
    "El ausentismo bajó un montón con los recordatorios. Y por fin sé cuánto gano de verdad cada mes.",
    "Sofía R.",
    "Estudio Aura, Recoleta",
  ],
  [
    "Mis clientas reservan desde Instagram en segundos. El equipo ve solo su agenda y no hay más líos.",
    "Valentina M.",
    "Nails & Co, Belgrano",
  ],
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted to-background py-24">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Testimonios" title="Locales que ya duermen tranquilos" />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {quotes.map(([q, n, b]) => (
            <motion.figure
              key={n}
              variants={rise}
              className="rounded-2xl border border-border bg-card p-6 elevation-1"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-rating text-rating" />
                ))}
              </div>
              <blockquote className="mt-4 text-foreground/90">“{q}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar name={n} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{n}</p>
                  <p className="text-xs text-muted-foreground">{b}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
        <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card elevation-1 md:grid-cols-4">
          {(
            [
              [Star, "4,9/5 en reseñas"],
              [LifeBuoy, "Soporte en español"],
              [ShieldCheck, "Datos cifrados"],
              [MapPin, "Hecho en Argentina"],
            ] as [ElementType, string][]
          ).map(([I, x], i) => (
            <li
              key={x}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium text-foreground/80",
                i > 0 && "md:border-l md:border-border",
                i % 2 === 1 && "border-l border-border",
                i > 1 && "border-t border-border md:border-t-0",
              )}
            >
              <I className="h-4 w-4 shrink-0 text-muted-foreground" />
              {x}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Pricing({ cmsConfig }: { cmsConfig?: LandingCmsConfig }) {
  const [annual, setAnnual] = useState(false);

  const basicPrice =
    cmsConfig?.prices?.basic !== undefined && cmsConfig.prices.basic > 0
      ? cmsConfig.prices.basic < 1000
        ? cmsConfig.prices.basic * 1000
        : cmsConfig.prices.basic
      : 14900;

  const proPrice =
    cmsConfig?.prices?.pro !== undefined && cmsConfig.prices.pro > 0
      ? cmsConfig.prices.pro < 1000
        ? cmsConfig.prices.pro * 1000
        : cmsConfig.prices.pro
      : 29900;

  const premiumPrice =
    cmsConfig?.prices?.premium !== undefined && cmsConfig.prices.premium > 0
      ? cmsConfig.prices.premium < 1000
        ? cmsConfig.prices.premium * 1000
        : cmsConfig.prices.premium
      : 54900;

  const plans = [
    {
      n: "Básico",
      planKey: "basic",
      who: "Para profesionales independientes",
      m: basicPrice,
      f: [
        "1 profesional",
        "Reservas online ilimitadas",
        "Recordatorios automáticos",
        "Link para Instagram",
      ],
      no: ["Asistente IA 24/7", "Exportar CSV/PDF"],
    },
    {
      n: "Pro",
      planKey: "pro",
      who: "Para salones en crecimiento",
      m: proPrice,
      hot: true,
      f: [
        "Hasta 5 profesionales",
        "Asistente IA 24/7",
        "Finanzas + exportar CSV/PDF",
        "Portal del empleado",
        "Inventario",
      ],
      no: ["Multi-sucursal"],
    },
    {
      n: "Premium",
      planKey: "premium",
      who: "Para cadenas y spas",
      m: premiumPrice,
      f: [
        "Profesionales ilimitados",
        "Multi-sucursal",
        "Auditoría completa",
        "Lealtad VIP",
        "Todo lo de Pro",
      ],
      no: [],
    },
  ];

  return (
    <section id="precios" className="relative bg-gradient-to-b from-background to-muted py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,var(--primary-soft),transparent_70%)]"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            center={false}
            eyebrow="Precios"
            title="Planes que se pagan solos"
            text="Con recuperar dos turnos por mes, Turnero ya se pagó."
          />
          <div className="flex shrink-0 items-center gap-3">
            <div
              className="relative inline-flex rounded-xl bg-muted p-1"
              role="radiogroup"
              aria-label="Facturación"
            >
              {[false, true].map((a) => (
                <button
                  key={String(a)}
                  role="radio"
                  aria-checked={annual === a}
                  onClick={() => setAnnual(a)}
                  className={cn(
                    "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer",
                    annual === a ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {annual === a && (
                    <motion.span
                      layoutId="bill"
                      className="absolute inset-0 -z-10 rounded-lg bg-card shadow-sm"
                      transition={spring}
                    />
                  )}
                  {a ? "Anual" : "Mensual"}
                </button>
              ))}
            </div>
            <span
              className={cn(
                "rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success transition",
                !annual && "opacity-50",
              )}
            >
              -20%
            </span>
          </div>
        </div>
        <div className="mt-12 grid items-center gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <Reveal key={p.n}>
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-card p-7 transition duration-300",
                  p.hot
                    ? "elevation-3 ring-2 ring-primary lg:scale-105"
                    : "elevation-1 hover:elevation-2",
                )}
              >
                {p.hot && <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-ai" />}
                {p.hot && (
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    Más popular · el más rentable
                  </span>
                )}
                <h3 className={cn("text-xl font-bold text-foreground", p.hot && "mt-3")}>{p.n}</h3>
                <p className="text-sm text-muted-foreground">{p.who}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <motion.span
                    key={String(annual)}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-extrabold tracking-tight text-foreground"
                  >
                    ${Math.round(annual ? p.m * 0.8 : p.m).toLocaleString("es-AR")}
                  </motion.span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </p>
                <p className="h-4 text-xs text-muted-foreground">
                  {annual ? "Facturado anualmente" : ""}
                </p>
                <Link
                  href={`/login?plan=${p.planKey}`}
                  onClick={() =>
                    captureEvent("landing_cta_clicked", {
                      location: "pricing",
                      plan: p.planKey,
                      price: p.m,
                      annual,
                    })
                  }
                  className={cn("mt-6 w-full", p.hot ? btnPrimary : btnSecondary)}
                >
                  {p.hot ? "Empezar 14 días gratis" : `Elegir ${p.n}`}
                </Link>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.f.map((f) => (
                    <li key={f} className="flex gap-2 text-foreground">
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                  {p.no.map((f) => (
                    <li key={f} className="flex gap-2 text-muted-foreground">
                      <Minus className="h-4 w-4 shrink-0 text-border" />
                      {f} <span className="sr-only">(No incluido)</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          0% comisiones sobre tus servicios · Cancelás cuando quieras · Migración de datos asistida
        </p>
      </div>
    </section>
  );
}

const faqs: [string, string][] = [
  [
    "¿Necesito conocimientos técnicos?",
    "Para nada. Si usás WhatsApp, usás Turnero. En 5 minutos cargás tus servicios y ya estás recibiendo reservas.",
  ],
  [
    "¿Mis clientes tienen que descargar una app?",
    "No. Reservan desde el navegador con tu link, en menos de 30 segundos.",
  ],
  ["¿Puedo exportar mis datos?", "Sí, cuando quieras, en CSV o PDF. Tus datos son tuyos."],
  [
    "¿Cómo funciona el asistente IA?",
    "Aprende tus servicios, precios y horarios, y responde consultas ofreciendo turnos libres reales, a cualquier hora.",
  ],
  [
    "¿Qué pasa con los clientes que no aparecen?",
    "Configurás un aviso mínimo para cancelar y créditos; con recordatorios automáticos el ausentismo baja muchísimo.",
  ],
  [
    "¿Puedo cambiar de plan más adelante?",
    "Sí, subís o bajás de plan en un clic y se ajusta en tu próxima factura.",
  ],
];

export function FAQ() {
  return (
    <section id="faq" className="bg-gradient-to-b from-muted to-background py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            center={false}
            eyebrow="Preguntas frecuentes"
            title="Lo que todos nos preguntan"
          />
          <div className="mt-8 rounded-2xl bg-card p-5 elevation-1">
            <p className="font-semibold text-foreground">¿Otra duda? Escribinos por WhatsApp</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Te responde una persona del equipo, no un bot.
            </p>
            <a
              href="https://wa.me/5491100000000"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" />
              Hablar por WhatsApp
            </a>
          </div>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map(([q, a]) => (
            <AccordionItem
              key={q}
              value={q}
              className="rounded-2xl border-none bg-card px-5 elevation-1 [&[data-state=open]_.faq-plus]:rotate-45"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline [&>svg:last-child]:hidden">
                <span className="flex-1">{q}</span>
                <Plus className="faq-plus h-5 w-5 shrink-0 text-primary transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function FinalCTA() {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const slug = slugify(name) || "tu-local";
  const link = `turnero.com/book/${slug}`;
  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-primary-soft/60 to-background">
      <div
        aria-hidden
        className="absolute -right-20 top-1/2 h-96 w-[36rem] -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -left-32 bottom-0 h-72 w-96 rounded-full bg-secondary/20 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[3fr_2fr] lg:items-center">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Empezá hoy</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Digitalizá tu salón hoy. Tu agenda llena mañana.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Sumate a los locales que dejaron de perseguir mensajes y empezaron a llenar su agenda en
            automático.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login?plan=basic"
              onClick={() =>
                captureEvent("landing_cta_clicked", {
                  location: "final_cta",
                  target: "/login?plan=basic",
                })
              }
              className={btnPrimary}
            >
              Empezar gratis 14 días
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="mailto:ventas@turnero.com" className={btnSecondary}>
              Hablar con ventas
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {["Setup en 5 minutos", "14 días gratis", "Sin tarjeta"].map((x) => (
              <li key={x} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-success" />
                {x}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-border bg-card p-6 elevation-2">
            <label htmlFor="local-name" className="text-sm font-semibold text-foreground">
              Probá tu link de reservas
            </label>
            <input
              id="local-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de tu local"
              maxLength={40}
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted py-2 pl-4 pr-2">
              <span className="min-w-0 flex-1 truncate font-mono text-sm text-muted-foreground">
                turnero.com/book/<span className="text-foreground">{slug}</span>
              </span>
              <button
                type="button"
                onClick={copy}
                aria-label="Copiar link"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <Link
              href="/login?plan=basic"
              onClick={() =>
                captureEvent("landing_cta_clicked", {
                  location: "claim_link",
                  slug,
                })
              }
              className={cn(btnPrimary, "mt-5 w-full")}
            >
              Reclamar mi link gratis
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const cols = [
  ["Producto", ["Agenda", "Reservas online", "Asistente IA", "Finanzas", "Precios"]],
  ["Recursos", ["Centro de ayuda", "Blog", "Guía para salones", "Novedades"]],
  ["Legal", ["Términos", "Privacidad", "Cookies"]],
  ["Contacto", ["hola@turnero.com", "Ventas", "Soporte"]],
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Hecho para los que viven del oficio.
          </p>
          <div className="mt-5 flex gap-2">
            {[InstagramIcon, LinkedinIcon, YoutubeIcon].map((I, i) => (
              <a
                key={i}
                href="#top"
                aria-label={["Instagram", "LinkedIn", "YouTube"][i]}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-primary"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map(([t, ls]) => (
          <div key={t}>
            <p className="text-sm font-semibold text-foreground">{t}</p>
            <ul className="mt-3 space-y-2">
              {ls.map((l) => (
                <li key={l}>
                  <a href="#top" className="text-sm text-muted-foreground hover:text-foreground">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Turnero. Todos los derechos reservados.
      </p>
    </footer>
  );
}
