"use client";

// Shared primitives for the Turnero landing: reveal motion, count-up, headings, logo, status chips.
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { CalendarCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

/** Fade + rise when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container + item. */
export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
export const rise = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
} as const;

/** Number that counts up once when visible. */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const c = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => c.stop();
  }, [inView, to, reduce]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toLocaleString("es-AR")}
      {suffix}
    </span>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-widest text-primary", className)}>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  center = true,
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <Reveal className={cn("max-w-3xl", center && "mx-auto text-center")}>
      <Eyebrow className={dark ? "text-navy-foreground/70" : undefined}>{eyebrow}</Eyebrow>
      <h2
        className={cn(
          "mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl",
          dark ? "text-navy-foreground" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {text && (
        <p
          className={cn("mt-4 text-lg", dark ? "text-navy-foreground/70" : "text-muted-foreground")}
        >
          {text}
        </p>
      )}
    </Reveal>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <a
      href="#top"
      className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-cta">
        <CalendarCheck2 className="h-4.5 w-4.5" />
      </span>
      <span
        className={cn(
          "text-lg font-extrabold tracking-tight",
          dark ? "text-navy-foreground" : "text-foreground",
        )}
      >
        Turnero
      </span>
    </a>
  );
}

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
export const btnPrimary = cn(
  btnBase,
  "bg-primary text-primary-foreground shadow-lg shadow-cta hover:bg-primary-hover",
);
export const btnSecondary = cn(
  btnBase,
  "border border-border bg-card text-foreground hover:border-foreground/25",
);

export type Status = "ok" | "pending" | "done" | "cancel";
const statusStyle: Record<Status, string> = {
  ok: "bg-success-soft text-success border-success/25",
  pending: "bg-pending-soft text-pending border-pending/25",
  done: "bg-muted text-muted-foreground border-border",
  cancel: "bg-cancel-soft text-cancel border-cancel/25 line-through",
};
export const statusLabel: Record<Status, string> = {
  ok: "Confirmado",
  pending: "Pendiente",
  done: "Completado",
  cancel: "Cancelado",
};

export function Chip({
  status,
  title,
  time,
  className,
  style,
}: {
  status: Status;
  title: string;
  time?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "rounded-md border px-2 py-1 text-[10px] leading-tight",
        statusStyle[status],
        className,
      )}
    >
      <p className="truncate font-semibold">{title}</p>
      {time && <p className="truncate opacity-80">{time}</p>}
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-ai text-xs font-bold text-primary-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}
