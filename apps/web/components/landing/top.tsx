"use client";

// Announcement bar, Navbar, Hero (layered product composition) and MetricsStrip.
import React, { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Bell,
  Check,
  ChevronRight,
  Droplets,
  Flower2,
  Hand,
  Menu,
  Play,
  Scissors,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { captureEvent } from "@/lib/posthog";
import { Chip, CountUp, Logo, btnPrimary, btnSecondary, type Status } from "./shared";

export interface LandingCmsConfig {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCta?: string;
  prices?: {
    basic: number;
    pro: number;
    premium: number;
  };
}

export function AnnouncementBar() {
  return (
    <a
      href="#modulos"
      className="group block bg-navy px-4 py-2 text-center text-xs font-medium text-navy-foreground hover:bg-navy-deep sm:text-sm"
    >
      <span className="relative mr-2 inline-flex h-2 w-2 align-middle">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      Nuevo: Asistente IA con Gemini atendiendo por vos 24/7
      <ChevronRight className="ml-1 inline h-4 w-4 align-[-3px] transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

const links = [
  ["producto", "Producto"],
  ["modulos", "Módulos"],
  ["precios", "Precios"],
  ["faq", "FAQ"],
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    links.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-lg"
          : "border-b border-transparent",
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"
        aria-label="Principal"
      >
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                active === id
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login?plan=basic"
            onClick={() =>
              captureEvent("landing_cta_clicked", {
                location: "navbar",
                target: "/login?plan=basic",
              })
            }
            className={cn(btnPrimary, "py-2")}
          >
            Empezar gratis
          </Link>
        </div>
        <button
          className="rounded-lg p-2 md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          {links.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium"
            >
              {label}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link href="/login" onClick={() => setOpen(false)} className={btnSecondary}>
              Iniciar sesión
            </Link>
            <Link
              href="/login?plan=basic"
              onClick={() => {
                setOpen(false);
                captureEvent("landing_cta_clicked", {
                  location: "mobile_menu",
                  target: "/login?plan=basic",
                });
              }}
              className={btnPrimary}
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero mockups ---------- */
const pros = ["Martina", "Lucas", "Sofía"];
const grid: { col: number; row: number; span: number; s: Status; t: string; h: string }[] = [
  { col: 0, row: 0, span: 2, s: "done", t: "Corte · Juan", h: "09:00" },
  { col: 0, row: 3, span: 2, s: "ok", t: "Color · Lucía", h: "12:00" },
  { col: 0, row: 6, span: 1, s: "pending", t: "Brushing · Ana", h: "15:00" },
  { col: 1, row: 1, span: 1, s: "ok", t: "Barba · Tomás", h: "10:00" },
  { col: 1, row: 2, span: 1, s: "cancel", t: "Corte · Diego", h: "11:00" },
  { col: 1, row: 4, span: 2, s: "ok", t: "Corte + barba", h: "13:00" },
  { col: 2, row: 0, span: 1, s: "ok", t: "Uñas · Caro", h: "09:00" },
  { col: 2, row: 2, span: 3, s: "pending", t: "Spa facial · Vale", h: "11:00" },
  { col: 2, row: 6, span: 1, s: "ok", t: "Kapping · Mica", h: "15:00" },
];

function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-cancel/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-pending/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground">Agenda · Martes 14</p>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-[2.5rem_repeat(3,minmax(0,1fr))] gap-x-2 p-3 sm:p-4">
        <span />
        {pros.map((p) => (
          <p key={p} className="pb-2 text-center text-[11px] font-semibold text-foreground">
            {p}
          </p>
        ))}
        <div className="grid grid-rows-7 gap-1">
          {["09", "10", "11", "12", "13", "14", "15"].map((h) => (
            <p key={h} className="h-9 text-[10px] text-muted-foreground">
              {h}:00
            </p>
          ))}
        </div>
        {pros.map((_, c) => (
          <div key={c} className="grid grid-rows-7 gap-1 rounded-lg bg-muted/60 p-0.5">
            {grid
              .filter((g) => g.col === c)
              .map((g) => (
                <Chip
                  key={g.t}
                  status={g.s}
                  title={g.t}
                  time={g.h}
                  className="h-full"
                  style={{ gridRow: `${g.row + 1} / span ${g.span}` }}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneMock() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 2600);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="w-44 rounded-[2rem] border-4 border-navy bg-navy p-1 shadow-2xl sm:w-52">
      <div className="h-80 overflow-hidden rounded-[1.6rem] bg-card p-3 sm:h-96">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <BookingScreen step={step} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function BookingScreen({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-foreground">Elegí el servicio</p>
        {[
          ["Corte clásico", "45 min · $9.000"],
          ["Color y peinado", "90 min · $24.000"],
          ["Barba", "30 min · $6.000"],
          ["Brushing", "40 min · $8.000"],
        ].map(([n, d], i) => (
          <div
            key={n}
            className={cn(
              "rounded-xl border p-2",
              i === 1 ? "border-primary bg-primary-soft" : "border-border",
            )}
          >
            <p className="text-[11px] font-semibold text-foreground">{n}</p>
            <p className="text-[10px] text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    );
  if (step === 1)
    return (
      <div>
        <p className="text-[11px] font-bold text-foreground">Profesional y horario</p>
        <div className="mt-2 flex gap-1.5">
          {pros.map((p, i) => (
            <span
              key={p}
              className={cn(
                "rounded-full border px-2 py-1 text-[10px]",
                i === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {p}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">Hoy, martes 14</p>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {["10:00", "11:30", "13:00", "14:30", "16:30", "18:00"].map((t) => (
            <span
              key={t}
              className={cn(
                "rounded-lg border py-1.5 text-center text-[10px] font-medium",
                t === "16:30"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground",
              )}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-primary py-2 text-center text-[11px] font-semibold text-primary-foreground">
          Continuar
        </div>
      </div>
    );
  return (
    <div className="pt-6 text-center">
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success text-primary-foreground"
      >
        <Check className="h-7 w-7" />
      </motion.div>
      <p className="mt-3 text-sm font-bold text-foreground">Turno confirmado</p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Color y peinado · Martina
        <br />
        Hoy 16:30
      </p>
      <p className="mt-3 rounded-lg bg-success-soft p-2 text-[10px] text-success">
        Te mandamos recordatorios automáticos
      </p>
    </div>
  );
}

function Toast() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setShow((s) => !s), 3200);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute -right-2 top-6 z-30 flex items-center gap-2 rounded-xl border border-border bg-card/90 px-3 py-2 shadow-xl backdrop-blur sm:right-6"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">
            <Bell className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">Nueva reserva</p>
            <p className="text-[11px] text-muted-foreground">Hoy 16:30 · Martina</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeroVisual() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0),
    my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <div
      className="relative mx-auto mt-14 max-w-5xl [perspective:1400px]"
      onMouseMove={onMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-10 top-10 -z-10 h-3/4 rounded-full bg-gradient-ai opacity-20 blur-3xl"
      />
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative pb-16 pr-0 sm:pr-24">
        <DashboardMock />
        <Toast />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
          className="absolute -bottom-2 right-0 z-20 sm:-right-4"
        >
          <PhoneMock />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute -left-2 bottom-24 z-20 hidden items-center gap-3 rounded-2xl border border-border bg-card/85 p-3 shadow-xl backdrop-blur sm:flex md:-left-10"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-success-soft text-success">
            <TrendingDown className="h-4 w-4" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-success">-38%</p>
            <p className="text-[11px] text-muted-foreground">ausentismo</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute -left-2 bottom-2 z-20 hidden items-center gap-3 rounded-2xl border border-border bg-card/85 p-3 shadow-xl backdrop-blur sm:flex md:left-16"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-primary">+22%</p>
            <p className="text-[11px] text-muted-foreground">facturación</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const segments = [
  ["Barberías", Scissors],
  ["Salones", Sparkles],
  ["Spas", Flower2],
  ["Estética", Droplets],
  ["Manicura", Hand],
  ["Peluquerías", Scissors],
] as const;

/** Trust band with business types, directly below the metrics. */
export function TrustBand() {
  return (
    <section className="bg-gradient-to-b from-background to-background py-10">
      <p className="text-center text-sm font-medium text-muted-foreground">
        Diseñado para los mejores salones, barberías y spas
      </p>
      <div className="tn-marquee-wrap mt-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="tn-marquee flex w-max gap-3">
          {[...segments, ...segments, ...segments, ...segments].map(([s, Icon], i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground elevation-1"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Hero({ cmsConfig }: { cmsConfig?: LandingCmsConfig }) {
  const title =
    cmsConfig?.heroTitle || "Dejá de perder clientes por no responder WhatsApp a tiempo.";
  const subtitle =
    cmsConfig?.heroSubtitle ||
    "El software todo en uno que llena tu agenda, elimina el ausentismo y pone tus finanzas en piloto automático, mientras tus clientes reservan en menos de 30 segundos.";
  const ctaText = cmsConfig?.heroCta || "Empezar gratis 14 días";

  return (
    <section id="producto" className="relative overflow-hidden pb-16 pt-14 sm:pt-20">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
        >
          <Zap className="h-3.5 w-3.5 text-primary" /> Configurás tu local en 5 minutos · Sin
          tarjeta de crédito
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        >
          {cmsConfig?.heroTitle ? (
            title
          ) : (
            <>
              Dejá de perder clientes por no responder{" "}
              <span className="text-gradient-ai">WhatsApp a tiempo.</span>
            </>
          )}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/login?plan=basic"
            onClick={() =>
              captureEvent("landing_cta_clicked", {
                location: "hero",
                target: "/login?plan=basic",
                label: ctaText,
              })
            }
            className={btnPrimary}
          >
            {ctaText}
          </Link>
          <a href="#como-reserva" className={btnSecondary}>
            <Play className="h-4 w-4 fill-current" /> Ver cómo funciona (2 min)
          </a>
        </motion.div>
        <p className="mt-4 text-xs text-muted-foreground">
          14 días gratis · Sin tarjeta · 0% comisiones ocultas
        </p>
        <HeroVisual />
      </div>
    </section>
  );
}

export function MetricsStrip() {
  const m = [
    { pre: "<", to: 300, suf: " ms", cap: "confirmación de turnos", c: "text-primary" },
    { pre: "-", to: 40, suf: "%", cap: "ausentismo", c: "text-success" },
    { pre: "+", to: 22, suf: "%", cap: "facturación mensual", c: "text-primary" },
    { pre: "", to: 24, suf: "/7", cap: "IA atendiendo", c: "text-primary" },
  ];
  return (
    <section className="bg-gradient-to-b from-background via-muted to-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
        {m.map((x, i) => (
          <div
            key={x.cap}
            className={cn(
              "px-4 py-10 text-center",
              i > 0 && "lg:border-l lg:border-border",
              i % 2 === 1 && "border-l border-border",
            )}
          >
            <CountUp
              to={x.to}
              prefix={x.pre}
              suffix={x.suf}
              className={cn("text-4xl font-extrabold tracking-tight sm:text-5xl", x.c)}
            />
            <p className="mt-2 text-sm text-muted-foreground">{x.cap}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
