"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Turno } from "@/components/turnos/TurnoDetalleModal";
import { Clock, Plus, Calendar, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";

interface Empleado {
  id: string;
  nombre: string;
}

export interface TurnoTimelineGridProps {
  turnos: Turno[];
  empleados: Empleado[];
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  viewMode?: "day" | "week";
  onViewModeChange?: (mode: "day" | "week") => void;
  onSelectTurno: (turno: Turno) => void;
  onSlotClick?: (hora: number, empleadoId: string, date?: Date) => void;
  isEmployeeView?: boolean;
}

const START_HOUR = 8;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const PIXELS_PER_HOUR = 74;
const TOTAL_HEIGHT = TOTAL_HOURS * PIXELS_PER_HOUR;

function getWeekDays(currentDate: Date): Date[] {
  const date = new Date(currentDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay);
  }
  return week;
}

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TurnoTimelineGrid({
  turnos,
  empleados,
  selectedDate = new Date(),
  onDateChange,
  viewMode: controlledViewMode,
  onViewModeChange,
  onSelectTurno,
  onSlotClick,
  isEmployeeView = false,
}: TurnoTimelineGridProps) {
  // Theme state: Default dark aesthetic (Apple Calendar Dark / Cron)
  const [isDark, setIsDark] = useState(true);
  const [internalViewMode, setInternalViewMode] = useState<"day" | "week">("day");
  const currentViewMode = controlledViewMode ?? internalViewMode;

  const setViewMode = (mode: "day" | "week") => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  // Current time tracker for dynamic indicator
  const [currentMinutesFromStart, setCurrentMinutesFromStart] = useState<number | null>(null);

  useEffect(() => {
    function updateCurrentTime() {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const totalMinutes = (currentH - START_HOUR) * 60 + currentM;

      if (currentH >= START_HOUR && currentH < END_HOUR) {
        setCurrentMinutesFromStart(totalMinutes);
      } else {
        setCurrentMinutesFromStart(null);
      }
    }

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const hoursArray = useMemo(() => {
    return Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
  }, []);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const selectedDateStr = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  // Navigate dates
  const handlePrevDay = () => {
    if (!onDateChange) return;
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - (currentViewMode === "week" ? 7 : 1));
    onDateChange(prev);
  };

  const handleNextDay = () => {
    if (!onDateChange) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + (currentViewMode === "week" ? 7 : 1));
    onDateChange(next);
  };

  const handleToday = () => {
    if (onDateChange) onDateChange(new Date());
  };

  // Sorted turnos for current day or list
  const sortedTurnos = useMemo(() => {
    return Array.from(turnos).sort((a, b) => a.horaInicio - b.horaInicio);
  }, [turnos]);

  // Card classes based on theme and status
  const getCardClasses = (estado: Turno["estado"]) => {
    if (isDark) {
      switch (estado) {
        case "confirmado":
          return "bg-blue-950/60 border-blue-800/60 text-blue-100 border-l-4 border-l-blue-500 hover:bg-blue-900/70 hover:border-blue-700";
        case "completado":
          return "bg-emerald-950/60 border-emerald-800/60 text-emerald-100 border-l-4 border-l-emerald-500 hover:bg-emerald-900/70 hover:border-emerald-700";
        case "pendiente":
          return "bg-amber-950/60 border-amber-800/60 text-amber-100 border-l-4 border-l-amber-500 hover:bg-amber-900/70 hover:border-amber-700";
        case "cancelado":
          return "bg-rose-950/40 border-rose-900/40 text-rose-300 border-l-4 border-l-rose-500 opacity-60 hover:opacity-90";
        default:
          return "bg-slate-900/80 border-slate-700 text-slate-200 border-l-4 border-l-slate-500";
      }
    } else {
      switch (estado) {
        case "confirmado":
          return "bg-blue-50/95 border-blue-200 text-blue-950 border-l-4 border-l-blue-600 hover:bg-blue-100 hover:border-blue-300";
        case "completado":
          return "bg-emerald-50/95 border-emerald-200 text-emerald-950 border-l-4 border-l-emerald-600 hover:bg-emerald-100 hover:border-emerald-300";
        case "pendiente":
          return "bg-amber-50/95 border-amber-200 text-amber-950 border-l-4 border-l-amber-500 hover:bg-amber-100 hover:border-amber-300";
        case "cancelado":
          return "bg-rose-50/70 border-rose-200 text-rose-900 border-l-4 border-l-rose-400 opacity-60 hover:opacity-100";
        default:
          return "bg-slate-50 border-slate-200 text-slate-800 border-l-4 border-l-slate-400";
      }
    }
  };

  const getStatusBadge = (estado: Turno["estado"]) => {
    switch (estado) {
      case "confirmado":
        return isDark
          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
          : "bg-blue-100 text-blue-800 border-blue-200";
      case "completado":
        return isDark
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          : "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pendiente":
        return isDark
          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
          : "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelado":
        return isDark
          ? "bg-rose-500/20 text-rose-300 border-rose-500/30 line-through"
          : "bg-rose-100 text-rose-800 border-rose-200 line-through";
      default:
        return isDark
          ? "bg-slate-800 text-slate-300 border-slate-700"
          : "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Capitalized date label (e.g., "Miércoles, 21 de Octubre")
  const dateFormattedTitle = useMemo(() => {
    const raw = selectedDate.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [selectedDate]);

  return (
    <div
      className={`w-full rounded-2xl transition-colors duration-200 border ${
        isDark
          ? "bg-[#090d16] text-slate-100 border-slate-800/80 shadow-2xl"
          : "bg-slate-50 text-slate-900 border-slate-200 shadow-sm"
      }`}
    >
      {/* HEADER CRON / NOTION CALENDAR */}
      <div
        className={`px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? "bg-[#0d1322] border-slate-800/80" : "bg-white border-slate-200"
        }`}
      >
        {/* Date Title & Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border p-0.5 border-slate-700/60 bg-slate-800/40">
            <button
              onClick={handlePrevDay}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Día / Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                isDark ? "hover:bg-slate-700 text-slate-200" : "hover:bg-slate-200 text-slate-800"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={handleNextDay}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Día / Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-2">
            <span>{dateFormattedTitle}</span>
          </h3>
        </div>

        {/* View Switcher, Stats & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Citas counter badge */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              isDark
                ? "bg-slate-800/80 border-slate-700 text-slate-300"
                : "bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{sortedTurnos.length} citas hoy</span>
          </div>

          {/* View Mode Toggle: Día / Semana */}
          <div
            className={`flex items-center p-0.5 rounded-xl border text-xs font-semibold ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                currentViewMode === "day"
                  ? "bg-blue-600 text-white shadow-xs"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Día <span className="opacity-60 text-[10px] font-mono hidden md:inline">[D]</span>
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                currentViewMode === "week"
                  ? "bg-blue-600 text-white shadow-xs"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semana <span className="opacity-60 text-[10px] font-mono hidden md:inline">[W]</span>
            </button>
          </div>

          {/* Theme Mode Toggle (Apple Calendar Dark vs Notion Light) */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? "bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-800"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
            title={
              isDark ? "Cambiar a Estilo Notion Claro" : "Cambiar a Estilo Apple Calendar Oscuro"
            }
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MINI DATE STRIP (NOTION CALENDAR / CRON DAY SELECTOR) */}
      <div
        className={`px-4 sm:px-6 py-2.5 border-b flex items-center justify-between gap-1 overflow-x-auto text-xs ${
          isDark ? "bg-[#0b0f1a] border-slate-800/60" : "bg-slate-100/60 border-slate-200"
        }`}
      >
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline">
          Semana:
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-between">
          {weekDays.map((d) => {
            const isSelected = formatDateKey(d) === selectedDateStr;
            const isToday = formatDateKey(d) === formatDateKey(new Date());
            const dayName = d.toLocaleDateString("es-ES", { weekday: "short" });
            const dayNum = d.getDate();

            return (
              <button
                key={formatDateKey(d)}
                onClick={() => onDateChange && onDateChange(d)}
                className={`flex-1 py-1 px-2 rounded-xl text-center transition cursor-pointer border ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold border-blue-500 shadow-sm"
                    : isToday
                      ? isDark
                        ? "bg-slate-800 border-blue-500/60 text-blue-400 font-semibold"
                        : "bg-white border-blue-300 text-blue-600 font-semibold"
                      : isDark
                        ? "border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        : "border-transparent text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                <span className="text-[10px] uppercase block tracking-wider opacity-80">
                  {dayName}
                </span>
                <span className="text-sm font-black block">{dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE LIST VIEW (< 768px) */}
      <div className="block md:hidden space-y-3 p-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
          <span className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Turnos de la fecha ({sortedTurnos.length})</span>
          </span>
          {onSlotClick && empleados[0] && (
            <button
              onClick={() => onSlotClick(new Date().getHours(), empleados[0].id, selectedDate)}
              className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Agendar
            </button>
          )}
        </div>

        {sortedTurnos.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No hay citas agendadas para esta fecha.
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTurnos.map((turno) => {
              const startH = Math.floor(turno.horaInicio);
              const startM = Math.round((turno.horaInicio % 1) * 60);
              const endH = Math.floor(turno.horaInicio + turno.duracion);
              const endM = Math.round(((turno.horaInicio + turno.duracion) % 1) * 60);
              const timeRange = `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")} - ${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
              const clienteNombre =
                typeof turno.cliente === "string"
                  ? turno.cliente
                  : turno.cliente?.nombre || "Cliente";

              return (
                <div
                  key={turno.id}
                  onClick={() => onSelectTurno(turno)}
                  className={`py-3 px-4 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition ${getCardClasses(turno.estado)}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold opacity-80">{timeRange}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusBadge(turno.estado)}`}
                      >
                        {turno.estado}
                      </span>
                    </div>
                    <p className="text-sm font-bold truncate max-w-[200px]">{clienteNombre}</p>
                    <p className="text-xs opacity-75 truncate">{turno.servicio}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-blue-500">
                      ${turno.precio?.toLocaleString("es-AR") || "0"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DESKTOP CONTINUOUS TIMELINE CANVAS (>= 768px) */}
      <div className="hidden md:block overflow-x-auto select-none p-4">
        <div
          className={`min-w-[750px] border rounded-2xl overflow-hidden ${
            isDark ? "bg-[#0b0f19] border-slate-800/80" : "bg-white border-slate-200"
          }`}
        >
          {/* Header Row: Columns (Day View = Empleados, Week View = 7 Days) */}
          <div
            className={`flex border-b sticky top-0 z-20 backdrop-blur-md ${
              isDark
                ? "bg-[#0d1322]/95 border-slate-800/80 text-slate-300"
                : "bg-slate-50/95 border-slate-200 text-slate-700"
            }`}
          >
            <div
              className={`w-20 shrink-0 border-r flex items-center justify-center py-3 text-[11px] font-bold uppercase tracking-wider ${
                isDark ? "border-slate-800/80 text-slate-500" : "border-slate-200 text-slate-400"
              }`}
            >
              Hora
            </div>

            {currentViewMode === "day"
              ? empleados.map((emp) => (
                  <div
                    key={emp.id}
                    className={`flex-1 border-r last:border-r-0 text-center py-3 px-2 ${
                      isDark ? "border-slate-800/80" : "border-slate-200"
                    }`}
                  >
                    <span className="text-xs font-bold truncate block">{emp.nombre}</span>
                    {isEmployeeView && (
                      <span className="text-[10px] text-blue-500 font-semibold">Mi Agenda</span>
                    )}
                  </div>
                ))
              : weekDays.map((d) => {
                  const isToday = formatDateKey(d) === formatDateKey(new Date());
                  const isSelected = formatDateKey(d) === selectedDateStr;
                  const dayName = d.toLocaleDateString("es-ES", { weekday: "short" });
                  const dayNum = d.getDate();

                  return (
                    <div
                      key={formatDateKey(d)}
                      onClick={() => onDateChange && onDateChange(d)}
                      className={`flex-1 border-r last:border-r-0 text-center py-2.5 px-2 cursor-pointer transition ${
                        isDark ? "border-slate-800/80" : "border-slate-200"
                      } ${isSelected ? (isDark ? "bg-slate-800/50" : "bg-blue-50/50") : ""}`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">
                        {dayName}
                      </span>
                      <span
                        className={`text-sm font-extrabold inline-block px-2 py-0.5 rounded-full ${
                          isToday ? "bg-blue-600 text-white" : ""
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>
                  );
                })}
          </div>

          {/* Timeline Grid Container */}
          <div className="relative flex" style={{ height: `${TOTAL_HEIGHT}px` }}>
            {/* Hour Markers Column */}
            <div
              className={`w-20 shrink-0 border-r relative ${
                isDark ? "border-slate-800/80 bg-[#090d16]/70" : "border-slate-200 bg-slate-50/50"
              }`}
            >
              {hoursArray.map((hour, idx) => (
                <div
                  key={hour}
                  className={`absolute left-0 right-0 border-b flex items-start justify-center ${
                    isDark ? "border-slate-800/60" : "border-slate-200"
                  }`}
                  style={{ top: `${idx * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }}
                >
                  <span
                    className={`text-[11px] font-mono font-semibold -mt-2.5 px-1.5 py-0.5 rounded border shadow-2xs ${
                      isDark
                        ? "bg-[#0f172a] text-slate-400 border-slate-800"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {/* LANES FOR DAY VIEW (EMPLEADOS) */}
            {currentViewMode === "day" &&
              empleados.map((emp) => (
                <div
                  key={emp.id}
                  className={`flex-1 border-r last:border-r-0 relative group ${
                    isDark ? "border-slate-800/80" : "border-slate-200"
                  }`}
                >
                  {/* Grid hour lines & Hover fast scheduling */}
                  {hoursArray.map((hour, idx) => (
                    <React.Fragment key={hour}>
                      <div
                        className={`absolute left-0 right-0 border-b pointer-events-none ${
                          isDark ? "border-slate-800/50" : "border-slate-100"
                        }`}
                        style={{
                          top: `${idx * PIXELS_PER_HOUR}px`,
                          height: `${PIXELS_PER_HOUR / 2}px`,
                        }}
                      />
                      <div
                        className={`absolute left-0 right-0 border-b border-dashed pointer-events-none ${
                          isDark ? "border-slate-800/30" : "border-slate-100/80"
                        }`}
                        style={{
                          top: `${idx * PIXELS_PER_HOUR + PIXELS_PER_HOUR / 2}px`,
                          height: `${PIXELS_PER_HOUR / 2}px`,
                        }}
                      />

                      {/* Top slot (00 min) */}
                      {onSlotClick && (
                        <div
                          onClick={() => onSlotClick(hour, emp.id, selectedDate)}
                          className={`absolute left-0 right-0 h-[37px] opacity-0 hover:opacity-100 transition flex items-center justify-center cursor-pointer z-5 ${
                            isDark ? "hover:bg-blue-600/10" : "hover:bg-blue-50/60"
                          }`}
                          style={{ top: `${idx * PIXELS_PER_HOUR}px` }}
                          title={`Agendar a las ${hour.toString().padStart(2, "0")}:00`}
                        >
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs flex items-center gap-1 ${
                              isDark
                                ? "bg-slate-800 text-blue-400 border-slate-700"
                                : "bg-white text-blue-600 border-blue-200"
                            }`}
                          >
                            <Plus className="w-3 h-3" /> {hour.toString().padStart(2, "0")}:00
                          </span>
                        </div>
                      )}

                      {/* Bottom slot (30 min) */}
                      {onSlotClick && (
                        <div
                          onClick={() => onSlotClick(hour + 0.5, emp.id, selectedDate)}
                          className={`absolute left-0 right-0 h-[37px] opacity-0 hover:opacity-100 transition flex items-center justify-center cursor-pointer z-5 ${
                            isDark ? "hover:bg-blue-600/10" : "hover:bg-blue-50/60"
                          }`}
                          style={{ top: `${idx * PIXELS_PER_HOUR + PIXELS_PER_HOUR / 2}px` }}
                          title={`Agendar a las ${hour.toString().padStart(2, "0")}:30`}
                        >
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs flex items-center gap-1 ${
                              isDark
                                ? "bg-slate-800 text-blue-400 border-slate-700"
                                : "bg-white text-blue-600 border-blue-200"
                            }`}
                          >
                            <Plus className="w-3 h-3" /> {hour.toString().padStart(2, "0")}:30
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Render Appointments */}
                  {turnos
                    .filter((t) => t.empleadoId === emp.id || empleados.length === 1)
                    .map((turno) => {
                      const topOffset = (turno.horaInicio - START_HOUR) * PIXELS_PER_HOUR;
                      const cardHeight = Math.max(36, turno.duracion * PIXELS_PER_HOUR - 4);
                      const clienteNombre =
                        typeof turno.cliente === "string"
                          ? turno.cliente
                          : turno.cliente?.nombre || "Cliente";

                      const startH = Math.floor(turno.horaInicio);
                      const startM = Math.round((turno.horaInicio % 1) * 60);
                      const endH = Math.floor(turno.horaInicio + turno.duracion);
                      const endM = Math.round(((turno.horaInicio + turno.duracion) % 1) * 60);
                      const timeRange = `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")} - ${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;

                      return (
                        <div
                          key={turno.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTurno(turno);
                          }}
                          style={{
                            top: `${topOffset}px`,
                            height: `${cardHeight}px`,
                          }}
                          className={`absolute left-1.5 right-1.5 rounded-xl p-2.5 shadow-md text-xs border cursor-pointer z-10 transition-all hover:shadow-xl hover:scale-[1.01] flex flex-col justify-between overflow-hidden ${getCardClasses(turno.estado)}`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="truncate">
                              <span className="font-extrabold block truncate text-xs sm:text-sm">
                                {clienteNombre}
                              </span>
                              <span className="text-[11px] opacity-80 truncate block">
                                {turno.servicio}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0 border ${getStatusBadge(turno.estado)}`}
                            >
                              {turno.estado}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-semibold opacity-85 mt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {timeRange}
                            </span>
                            {turno.precio ? (
                              <span className="font-bold text-xs">
                                ${turno.precio.toLocaleString("es-AR")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}

            {/* LANES FOR WEEK VIEW (7 DAYS) */}
            {currentViewMode === "week" &&
              weekDays.map((day) => {
                const dayKey = formatDateKey(day);
                const isSelectedDay = dayKey === selectedDateStr;
                const targetEmpId = empleados[0]?.id || "emp1";

                return (
                  <div
                    key={dayKey}
                    className={`flex-1 border-r last:border-r-0 relative group ${
                      isDark ? "border-slate-800/80" : "border-slate-200"
                    } ${isSelectedDay ? (isDark ? "bg-slate-900/30" : "bg-blue-50/20") : ""}`}
                  >
                    {hoursArray.map((hour, idx) => (
                      <React.Fragment key={hour}>
                        <div
                          className={`absolute left-0 right-0 border-b pointer-events-none ${
                            isDark ? "border-slate-800/50" : "border-slate-100"
                          }`}
                          style={{
                            top: `${idx * PIXELS_PER_HOUR}px`,
                            height: `${PIXELS_PER_HOUR / 2}px`,
                          }}
                        />
                        <div
                          className={`absolute left-0 right-0 border-b border-dashed pointer-events-none ${
                            isDark ? "border-slate-800/30" : "border-slate-100/80"
                          }`}
                          style={{
                            top: `${idx * PIXELS_PER_HOUR + PIXELS_PER_HOUR / 2}px`,
                            height: `${PIXELS_PER_HOUR / 2}px`,
                          }}
                        />

                        {onSlotClick && (
                          <div
                            onClick={() => onSlotClick(hour, targetEmpId, day)}
                            className={`absolute left-0 right-0 h-[37px] opacity-0 hover:opacity-100 transition flex items-center justify-center cursor-pointer z-5 ${
                              isDark ? "hover:bg-blue-600/10" : "hover:bg-blue-50/60"
                            }`}
                            style={{ top: `${idx * PIXELS_PER_HOUR}px` }}
                            title={`Agendar turno el ${dayKey} a las ${hour}:00`}
                          >
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border shadow-xs ${
                                isDark
                                  ? "bg-slate-800 text-blue-400 border-slate-700"
                                  : "bg-white text-blue-600 border-blue-200"
                              }`}
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}

                    {/* Turnos for this day */}
                    {turnos
                      .filter((t) => !t.fecha || t.fecha === dayKey)
                      .map((turno) => {
                        const topOffset = (turno.horaInicio - START_HOUR) * PIXELS_PER_HOUR;
                        const cardHeight = Math.max(36, turno.duracion * PIXELS_PER_HOUR - 4);
                        const clienteNombre =
                          typeof turno.cliente === "string"
                            ? turno.cliente
                            : turno.cliente?.nombre || "Cliente";

                        return (
                          <div
                            key={turno.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTurno(turno);
                            }}
                            style={{
                              top: `${topOffset}px`,
                              height: `${cardHeight}px`,
                            }}
                            className={`absolute left-1 right-1 rounded-xl p-1.5 shadow-md text-xs border cursor-pointer z-10 transition-all hover:scale-[1.01] flex flex-col justify-between overflow-hidden ${getCardClasses(turno.estado)}`}
                          >
                            <div className="truncate">
                              <span className="font-bold text-xs block truncate">
                                {clienteNombre}
                              </span>
                              <span className="text-[10px] opacity-75 truncate block">
                                {turno.servicio}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold opacity-80">
                              {Math.floor(turno.horaInicio)}:
                              {String(Math.round((turno.horaInicio % 1) * 60)).padStart(2, "0")}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                );
              })}

            {/* DYNAMIC RED TIME LINE ("Ahora" with pulse) */}
            {currentMinutesFromStart !== null && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                style={{ top: `${(currentMinutesFromStart / 60) * PIXELS_PER_HOUR}px` }}
              >
                <div className="w-20 flex justify-end pr-1">
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    Ahora
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-rose-500 shadow-md relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -top-1 -left-1 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TurnoTimelineGrid;
