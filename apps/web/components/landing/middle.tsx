"use client";

// ProblemSolution, ClientShowcase, ModulesExplorer and BentoFeatures.
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Bell,
  Bot,
  Building2,
  CalendarClock,
  Check,
  Copy,
  Download,
  Gift,
  Lock,
  MessageSquareHeart,
  Package,
  Plus,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  Store,
  Trash2,
  Trophy,
  Wallet,
  UserRound,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingScreen } from "./top";
import { Avatar, Chip, Reveal, SectionHeading, rise, spring, stagger, type Status } from "./shared";

/* ---------- Problem vs Solution ---------- */
export function ProblemSolution() {
  return (
    <section className="bg-gradient-to-b from-background to-muted py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="El problema"
          title="El caos de WhatsApp vs. una agenda en piloto automático"
          text="Cada mensaje que respondés tarde es un turno que se va a otro local."
        />
        <div className="relative mt-14 grid gap-8 md:grid-cols-2">
          <Reveal>
            <div className="h-full -rotate-1 rounded-2xl border border-border bg-muted p-6 transition duration-300 hover:rotate-0">
              <div className="space-y-2.5">
                {[
                  ["¿Tenés lugar hoy a las 19?", "18:12"],
                  ["Holaaa? sigue en pie lo del sábado?", "21:30"],
                  ["Necesito cancelar mañana perdón 🙏", "23:47"],
                  ["Hola?? me re colgué jajá", "00:15"],
                ].map(([m, t], i) => (
                  <div
                    key={m}
                    className={cn(
                      "max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-card px-3 py-2 shadow-sm",
                      i % 2 && "ml-6",
                    )}
                  >
                    <p className="text-sm text-foreground">{m}</p>
                    <p className="mt-0.5 text-right text-[10px] text-cancel">{t} · sin responder</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rotate-1 rounded-xl border border-dashed border-cancel/40 bg-card p-3 font-mono text-xs text-muted-foreground">
                <p>
                  Mar 14 — <span className="line-through">16hs Ana</span> 16:30?? Lucía
                </p>
                <p>
                  Mié 15 — Diego (no vino) <span className="text-cancel">✗</span>
                </p>
              </div>
              <p className="mt-5 text-sm font-semibold text-cancel">
                Sin Turnero: respondés cuando podés y perdés turnos mientras dormís.
              </p>
            </div>
          </Reveal>
          <span className="absolute left-1/2 top-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card text-sm font-extrabold text-primary elevation-2 md:grid">
            VS
          </span>
          <Reveal delay={0.1}>
            <div className="h-full rotate-1 rounded-2xl border border-border bg-card p-6 shadow-xl transition duration-300 hover:rotate-0">
              <div className="rounded-xl border border-border p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-gradient-ai text-primary-foreground">
                    <Bot className="h-3 w-3" />
                  </span>
                  <span className="text-gradient-ai">Asistente IA · 23:47</span>
                </p>
                <p className="mt-1.5 text-sm text-foreground">
                  ¡Hola! Para hoy tengo 19:00 o 19:45 con Lucas. ¿Te reservo?
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-success/25 bg-success-soft p-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-success text-primary-foreground">
                  <Check className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-success">Reserva confirmada</p>
                  <p className="text-xs text-muted-foreground">Corte · Lucas · Hoy 19:00</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {(["done", "ok", "ok", "pending", "ok", "ok", "ok", "ok"] as Status[]).map(
                  (s, i) => (
                    <Chip key={i} status={s} title={`${10 + i}:00`} />
                  ),
                )}
              </div>
              <p className="mt-5 text-sm font-semibold text-success">
                Con Turnero: el cliente reserva solo, la IA responde y vos dormís tranquilo.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Client booking showcase ---------- */
const steps = [
  ["Elegí el servicio", "Catálogo con precios y duración reales, sin idas y vueltas."],
  ["Elegí profesional y horario", "Solo ve horarios libres de verdad, cruzados con cada agenda."],
  ["Confirmá en segundos", "Recordatorios automáticos para que nadie se olvide."],
];

export function ClientShowcase() {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText("turnero.com/book/tu-local");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="como-reserva" className="bg-gradient-to-b from-muted to-background py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[3fr_2fr]">
        <div>
          <SectionHeading
            center={false}
            eyebrow="Experiencia del cliente"
            title="Así reserva tu cliente"
            text="Sin descargar nada. Un link en tu bio y tu local queda abierto las 24 horas."
          />
          <div className="relative mt-10 space-y-3" role="tablist" aria-label="Pasos de reserva">
            <div className="absolute bottom-6 left-[1.4rem] top-6 w-0.5 bg-border">
              <motion.div
                className="w-full bg-primary"
                animate={{ height: `${(step / 2) * 100}%` }}
                transition={spring}
              />
            </div>
            {steps.map(([t, d], i) => (
              <button
                key={t}
                role="tab"
                aria-selected={step === i}
                onClick={() => setStep(i)}
                className={cn(
                  "relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  step === i
                    ? "border-border bg-card shadow-sm"
                    : "border-transparent hover:bg-card/60",
                )}
              >
                <span
                  className={cn(
                    "relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                    step >= i
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold text-foreground">{t}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{d}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-sm text-foreground shadow-sm hover:border-primary/40"
            >
              turnero.com/book/tu-local{" "}
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">{copied ? "Copiado" : "Copiar link"}</span>
            </button>
            {copied && <span className="text-xs font-medium text-success">¡Copiado!</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Listo para bio de Instagram y TikTok",
              "Google Reserve ready",
              "Sin app: funciona en el navegador",
            ].map((b) => (
              <span
                key={b}
                className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mx-auto w-64 rounded-[2.4rem] border-[6px] border-navy bg-navy p-1 shadow-2xl">
            <div className="h-[30rem] overflow-hidden rounded-[2rem] bg-card p-4">
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-border" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookingScreen step={step} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Modules explorer ---------- */
const tabs = [
  { id: "agenda", label: "Agenda inteligente", icon: CalendarDays },
  { id: "empleado", label: "Portal del empleado", icon: UserRound },
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "ia", label: "IA Gemini", icon: Sparkles },
  { id: "inventario", label: "Inventario & Catálogo", icon: Package },
  { id: "fidelizacion", label: "Fidelización", icon: Gift },
] as const;
type TabId = (typeof tabs)[number]["id"];

function AgendaVignette() {
  const cols: [string, [number, number, Status, string][]][] = [
    [
      "Martina",
      [
        [0, 2, "done", "Corte · Juan"],
        [3, 2, "ok", "Color · Lucía"],
        [7, 1, "pending", "Brushing"],
        [9, 2, "ok", "Mechas · Flor"],
      ],
    ],
    [
      "Lucas",
      [
        [1, 1, "ok", "Barba · Tomás"],
        [2, 1, "cancel", "Corte · Diego"],
        [5, 2, "ok", "Corte + barba"],
        [8, 1, "ok", "Fade · Nico"],
      ],
    ],
    [
      "Sofía",
      [
        [0, 1, "ok", "Uñas · Caro"],
        [2, 3, "pending", "Spa facial"],
        [6, 1, "ok", "Kapping"],
        [10, 1, "pending", "Pedicura"],
      ],
    ],
  ];
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-foreground">Hoy · 3 profesionales</p>
        <div className="flex items-center gap-2">
          <span className="relative rounded-lg border border-border p-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cancel" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            <Plus className="h-3.5 w-3.5" />
            Nuevo turno (walk-in)
          </span>
        </div>
      </div>
      <div className="grid grid-cols-[2.5rem_repeat(3,minmax(0,1fr))] gap-2">
        <div className="grid grid-rows-11 gap-1 pt-6">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className="h-7 text-[10px] text-muted-foreground">
              {9 + i}:00
            </span>
          ))}
        </div>
        {cols.map(([n, items]) => (
          <div key={n}>
            <p className="h-6 text-center text-xs font-semibold text-foreground">{n}</p>
            <div className="grid grid-rows-11 gap-1 rounded-lg bg-muted p-1">
              {items.map(([r, s, st, t]) => (
                <Chip key={t} status={st} title={t} style={{ gridRow: `${r + 1} / span ${s}` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeVignette() {
  const [on, setOn] = useState(false);
  const [days, setDays] = useState([true, true, false, true, true, true, false]);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-border p-6 text-center">
        <Avatar name="Lucas Pérez" className="mx-auto h-14 w-14 text-base" />
        <p className="mt-3 font-semibold text-foreground">Hola, Lucas</p>
        <p className="text-sm text-muted-foreground">
          {on ? "Entrada registrada 09:02" : "Todavía no fichaste hoy"}
        </p>
        <button
          onClick={() => setOn(!on)}
          className={cn(
            "mt-5 w-full rounded-xl py-4 text-base font-bold text-primary-foreground transition cursor-pointer",
            on ? "bg-cancel" : "bg-success",
          )}
        >
          {on ? "Clock-Out" : "Clock-In"}
        </button>
      </div>
      <div className="rounded-2xl border border-border p-6">
        <p className="font-semibold text-foreground">Mi disponibilidad semanal</p>
        <div className="mt-4 space-y-2">
          {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(
            (d, i) => (
              <label key={d} className="flex items-center justify-between text-sm text-foreground">
                {d}
                <button
                  type="button"
                  role="switch"
                  aria-checked={days[i]}
                  aria-label={d}
                  onClick={() => setDays(days.map((v, j) => (j === i ? !v : v)))}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition cursor-pointer",
                    days[i] ? "bg-primary" : "bg-border",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-card transition-all",
                      days[i] ? "left-4.5" : "left-0.5",
                    )}
                  />
                </button>
              </label>
            ),
          )}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Cada profesional ve solo su agenda
        </p>
      </div>
    </div>
  );
}

const fin = [
  ["Ene", 820, 410],
  ["Feb", 910, 430],
  ["Mar", 1040, 470],
  ["Abr", 980, 450],
  ["May", 1180, 480],
  ["Jun", 1320, 500],
].map(([m, f, g]) => ({ m, f, g }));

function FinanceVignette() {
  const [mode, setMode] = useState<"area" | "bar">("area");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Facturación", "$1,32M", "+12%", true],
          ["Gastos", "$500k", "+4%", false],
          ["Margen neto", "62%", "+3 pts", true],
          ["Ausentismo", "4,1%", "-38%", true],
        ].map(([l, v, d, good]) => (
          <div key={l as string} className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-1 text-xl font-extrabold text-foreground">{v}</p>
            <p
              className={cn(
                "text-xs font-semibold",
                good ? "text-success" : "text-muted-foreground",
              )}
            >
              {d}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-muted p-1 text-xs">
            {(["area", "bar"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setMode(k)}
                className={cn(
                  "rounded-md px-3 py-1 font-medium cursor-pointer",
                  mode === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {k === "area" ? "Área" : "Barras"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {["CSV", "PDF con membrete"].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground"
              >
                <Download className="h-3 w-3" />
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            {mode === "area" ? (
              <AreaChart data={fin}>
                <defs>
                  <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="f"
                  name="Facturación (k)"
                  stroke="var(--primary)"
                  fill="url(#fg)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="g"
                  name="Gastos (k)"
                  stroke="var(--muted-foreground)"
                  fill="transparent"
                  strokeDasharray="4 4"
                />
              </AreaChart>
            ) : (
              <BarChart data={fin}>
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip />
                <Bar
                  dataKey="f"
                  name="Facturación (k)"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar dataKey="g" name="Gastos (k)" fill="var(--border)" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <Trophy className="h-5 w-5 text-pending" />
          <div>
            <p className="text-xs text-muted-foreground">Empleado estrella</p>
            <p className="text-sm font-semibold text-foreground">Martina · 86 turnos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <Star className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Top cliente</p>
            <p className="text-sm font-semibold text-foreground">Lucía R. · 14 visitas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIVignette() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-ai text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          Asistente Turnero
        </p>
        <span className="rounded-full bg-gradient-ai px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
          Entrenado con los datos de tu local
        </span>
      </div>
      <div className="space-y-3 p-4">
        <p className="ml-auto w-fit rounded-2xl rounded-br-sm bg-muted px-3 py-2 text-sm text-foreground">
          ¿Tenés lugar el sábado?
        </p>
        <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm border border-border px-3 py-2 text-sm text-foreground">
          ¡Sí! El sábado tengo estos horarios para corte:
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["10:00", "11:30", "15:00", "17:30"].map((t) => (
              <span
                key={t}
                className="rounded-lg border border-primary/30 bg-primary-soft px-2 py-1 text-xs font-semibold text-primary"
              >
                {t}
              </span>
            ))}
          </div>
          <span className="mt-3 inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            Reservar 11:30
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <span className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Escribí un mensaje…
        </span>
        <Send className="h-4 w-4 text-primary" />
      </div>
    </div>
  );
}

function InventoryVignette() {
  const [items, setItems] = useState([
    ["Shampoo Kerastase 500ml", 24, true],
    ["Cera mate Reuzel", 3, false],
    ["Esmalte semipermanente", 41, true],
    ["Aceite de barba", 5, false],
  ] as [string, number, boolean][]);
  const [removed, setRemoved] = useState<[string, number, boolean] | null>(null);

  return (
    <div className="relative">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="py-2 font-medium">Producto</th>
            <th className="font-medium">Stock</th>
            <th className="font-medium">Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it[0]} className="border-b border-border">
              <td className="py-3 font-medium text-foreground">{it[0]}</td>
              <td className="text-foreground">{it[1]}</td>
              <td>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    it[2] ? "bg-success-soft text-success" : "bg-pending-soft text-pending",
                  )}
                >
                  {it[2] ? "Disponible" : "Bajo stock"}
                </span>
              </td>
              <td className="text-right">
                <button
                  type="button"
                  aria-label={`Eliminar ${it[0]}`}
                  onClick={() => {
                    setItems(items.filter((x) => x !== it));
                    setRemoved(it);
                  }}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AnimatePresence>
        {removed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-sm text-navy-foreground"
          >
            Movido a la papelera: {removed[0]}
            <button
              onClick={() => {
                setItems([...items, removed]);
                setRemoved(null);
              }}
              className="inline-flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoyaltyVignette() {
  const pts = 70;
  const c = 2 * Math.PI * 52;
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 rounded-2xl border border-border p-6 sm:flex-row">
      <svg viewBox="0 0 120 120" className="h-32 w-32 shrink-0 -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - pts / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        />
        <text
          x="60"
          y="66"
          textAnchor="middle"
          className="rotate-90 fill-foreground text-xl font-extrabold"
          transform="rotate(90 60 60)"
        >
          {pts}/100
        </text>
      </svg>
      <div>
        <p className="font-semibold text-foreground">Lucía R. · Nivel Oro</p>
        <p className="mt-1 text-sm text-muted-foreground">
          10 pts por cada reseña de 5★ → servicio gratis
        </p>
        <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
          <Gift className="h-3.5 w-3.5" />
          Faltan 30 pts para un brushing gratis
        </p>
      </div>
    </div>
  );
}

const urls: Record<TabId, string> = {
  agenda: "agenda",
  empleado: "equipo",
  finanzas: "finanzas",
  ia: "ia",
  inventario: "inventario",
  fidelizacion: "fidelidad",
};

const vignettes: Record<TabId, () => React.ReactElement> = {
  agenda: AgendaVignette,
  empleado: EmployeeVignette,
  finanzas: FinanceVignette,
  ia: AIVignette,
  inventario: InventoryVignette,
  fidelizacion: LoyaltyVignette,
};

export function ModulesExplorer() {
  const [tab, setTab] = useState<TabId>("agenda");
  const V = vignettes[tab];
  return (
    <section
      id="modulos"
      className="bg-gradient-to-b from-background via-background to-muted py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-end">
          <SectionHeading
            center={false}
            eyebrow="Módulos"
            title="Todo tu local, en un solo lugar"
            text="Agenda, equipo, plata, stock y clientes fieles. Probalo tocando cada módulo."
          />
          <div
            role="tablist"
            aria-label="Módulos de Turnero"
            className="flex gap-1 overflow-x-auto border-b border-border lg:flex-wrap lg:justify-end lg:overflow-visible"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                  tab === id ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {tab === id && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                    transition={spring}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card elevation-1">
          <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cancel/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-pending/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <span className="mx-auto rounded-md border border-border bg-card px-3 py-1 font-mono text-[11px] text-muted-foreground">
              turnero.app/{urls[tab]}
            </span>
            <span className="w-10" />
          </div>
          <div className="p-4 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                id={`panel-${tab}`}
                role="tabpanel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <V />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Bento ---------- */
const bento = [
  {
    i: MessageSquareHeart,
    t: "Reseñas mutuas",
    d: "Vos calificás al cliente, él te califica a vos.",
    v: (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="h-4 w-4 fill-success text-success" />
        ))}
      </div>
    ),
  },
  {
    i: ShieldAlert,
    t: "Políticas anti no-show",
    d: "Aviso mínimo de 2h y créditos por cancelar a tiempo.",
    v: (
      <span className="rounded-full bg-pending-soft px-2.5 py-1 text-xs font-semibold text-pending">
        Cancelación: mín. 2h
      </span>
    ),
  },
  {
    i: CalendarClock,
    t: "Recordatorios automáticos",
    d: "24h y 2h antes, por WhatsApp y mail.",
    v: (
      <span className="rounded-lg border border-border px-2.5 py-1 text-xs text-foreground">
        Mañana 16:30 con Martina
      </span>
    ),
  },
  {
    i: Store,
    t: "Marketplace /explorar",
    d: "Nuevos clientes te encuentran por zona y rubro.",
    v: (
      <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
        ● Abierto ahora
      </span>
    ),
  },
  {
    i: Building2,
    t: "Multi-sucursal y roles",
    d: "Dueño, encargado y profesional, cada uno con su acceso.",
    v: (
      <div className="flex -space-x-2">
        <Avatar name="Ana G" className="h-7 w-7 text-[10px] ring-2 ring-card" />
        <Avatar name="Leo M" className="h-7 w-7 text-[10px] ring-2 ring-card" />
        <Avatar name="Sol P" className="h-7 w-7 text-[10px] ring-2 ring-card" />
      </div>
    ),
  },
  {
    i: Trash2,
    t: "Papelera con recuperación",
    d: "¿Borraste algo sin querer? Lo recuperás al instante.",
    v: (
      <span className="inline-flex items-center gap-1 rounded-lg bg-navy px-2.5 py-1 text-xs text-navy-foreground">
        <RotateCcw className="h-3.5 w-3.5" />
        Restaurar
      </span>
    ),
  },
];

export function BentoFeatures() {
  return (
    <section className="bg-gradient-to-b from-muted to-background py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Y además" title="Los detalles que te ahorran dolores de cabeza" />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {bento.map(({ i: Icon, t, d, v }) => (
            <motion.div
              key={t}
              variants={rise}
              className="rounded-2xl bg-card p-6 elevation-1 transition duration-300 hover:elevation-2"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                {v}
              </div>
              <h3 className="mt-5 font-bold text-foreground">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
