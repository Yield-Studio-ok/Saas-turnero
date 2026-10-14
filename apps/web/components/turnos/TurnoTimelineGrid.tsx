"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Turno } from "@/components/turnos/TurnoDetalleModal";
import { Clock, Plus, Calendar } from "lucide-react";

interface Empleado {
  id: string;
  nombre: string;
}

interface TurnoTimelineGridProps {
  turnos: Turno[];
  empleados: Empleado[];
  selectedDate?: Date;
  onSelectTurno: (turno: Turno) => void;
  onSlotClick?: (hora: number, empleadoId: string) => void;
  isEmployeeView?: boolean;
}

const START_HOUR = 8;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const PIXELS_PER_HOUR = 72; // 72px per hour = 1.2px per minute
const TOTAL_HEIGHT = TOTAL_HOURS * PIXELS_PER_HOUR;

const getStatusBadge = (estado: Turno["estado"]) => {
  switch (estado) {
    case "confirmado":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completado":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pendiente":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "cancelado":
      return "bg-rose-100 text-rose-800 border-rose-200 line-through";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getCardClasses = (estado: Turno["estado"]) => {
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
      return "bg-slate-50 border-slate-200 text-slate-800";
  }
};

export function TurnoTimelineGrid({
  turnos,
  empleados,
  onSelectTurno,
  onSlotClick,
  isEmployeeView = false,
}: TurnoTimelineGridProps) {
  // Current time position
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
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const hoursArray = useMemo(() => {
    return Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
  }, []);

  // Sorted turnos for mobile list view
  const sortedTurnos = useMemo(() => {
    return Array.from(turnos).sort((a, b) => a.horaInicio - b.horaInicio);
  }, [turnos]);

  return (
    <div className="w-full">
      {/* Mobile Timeline List (< 768px) */}
      <div className="block md:hidden space-y-3 p-3">
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Turnos de Hoy ({sortedTurnos.length})</span>
          </span>
          {onSlotClick && empleados[0] && (
            <button
              onClick={() => onSlotClick(new Date().getHours(), empleados[0].id)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Agendar turno
            </button>
          )}
        </div>

        {sortedTurnos.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No hay citas agendadas para el día de hoy.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
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
                  className={`py-3 px-3.5 rounded-xl my-1.5 border shadow-xs flex items-center justify-between cursor-pointer transition ${getCardClasses(turno.estado)}`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-600">
                        {timeRange}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getStatusBadge(turno.estado)}`}
                      >
                        {turno.estado}
                      </span>
                    </div>
                    <p className="text-sm font-bold truncate max-w-[200px]">{clienteNombre}</p>
                    <p className="text-xs text-slate-500 truncate">{turno.servicio}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-600">
                      ${turno.precio?.toLocaleString("es-AR") || "0"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Continuous Timeline Canvas (>= 768px) */}
      <div className="hidden md:block overflow-x-auto select-none">
        <div className="min-w-[700px] border border-slate-200 rounded-xl overflow-hidden bg-white">
          {/* Header Row: Employee Columns */}
          <div className="flex border-b border-slate-200 bg-slate-50/90 sticky top-0 z-20 backdrop-blur-xs">
            <div className="w-20 shrink-0 border-r border-slate-200 flex items-center justify-center py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hora
            </div>
            {empleados.map((emp) => (
              <div
                key={emp.id}
                className="flex-1 border-r last:border-r-0 border-slate-200 text-center py-3 px-2"
              >
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {emp.nombre}
                </span>
                {isEmployeeView && (
                  <span className="text-[10px] text-blue-600 font-medium">Agenda Asignada</span>
                )}
              </div>
            ))}
          </div>

          {/* Timeline Grid Container */}
          <div className="relative flex" style={{ height: `${TOTAL_HEIGHT}px` }}>
            {/* Hour Markers Column */}
            <div className="w-20 shrink-0 border-r border-slate-200 relative bg-slate-50/40">
              {hoursArray.map((hour, idx) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-b border-slate-200 flex items-start justify-center"
                  style={{ top: `${idx * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }}
                >
                  <span className="text-[11px] font-semibold text-slate-500 -mt-2.5 bg-white px-1.5 rounded border border-slate-100 shadow-2xs">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Employee Timeline Lanes */}
            {empleados.map((emp) => (
              <div
                key={emp.id}
                className="flex-1 border-r last:border-r-0 border-slate-200 relative group"
              >
                {/* 30-minute Subgrid Lines */}
                {hoursArray.map((hour, idx) => (
                  <React.Fragment key={hour}>
                    {/* Hour line */}
                    <div
                      className="absolute left-0 right-0 border-b border-slate-100 pointer-events-none"
                      style={{
                        top: `${idx * PIXELS_PER_HOUR}px`,
                        height: `${PIXELS_PER_HOUR / 2}px`,
                      }}
                    />
                    {/* Half-hour dashed line */}
                    <div
                      className="absolute left-0 right-0 border-b border-dashed border-slate-100/80 pointer-events-none"
                      style={{
                        top: `${idx * PIXELS_PER_HOUR + PIXELS_PER_HOUR / 2}px`,
                        height: `${PIXELS_PER_HOUR / 2}px`,
                      }}
                    />

                    {/* Clickable slot for fast walk-in scheduling */}
                    {onSlotClick && (
                      <div
                        onClick={() => onSlotClick(hour, emp.id)}
                        className="absolute left-0 right-0 h-[36px] opacity-0 hover:opacity-100 hover:bg-blue-50/50 transition flex items-center justify-center cursor-pointer z-5"
                        style={{ top: `${idx * PIXELS_PER_HOUR}px` }}
                        title={`Agendar a las ${hour.toString().padStart(2, "0")}:00`}
                      >
                        <span className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-xs flex items-center gap-1">
                          <Plus className="w-3 h-3" /> {hour.toString().padStart(2, "0")}:00
                        </span>
                      </div>
                    )}
                    {onSlotClick && (
                      <div
                        onClick={() => onSlotClick(hour + 0.5, emp.id)}
                        className="absolute left-0 right-0 h-[36px] opacity-0 hover:opacity-100 hover:bg-blue-50/50 transition flex items-center justify-center cursor-pointer z-5"
                        style={{ top: `${idx * PIXELS_PER_HOUR + PIXELS_PER_HOUR / 2}px` }}
                        title={`Agendar a las ${hour.toString().padStart(2, "0")}:30`}
                      >
                        <span className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-xs flex items-center gap-1">
                          <Plus className="w-3 h-3" /> {hour.toString().padStart(2, "0")}:30
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {/* Render Appointments in this Lane */}
                {turnos
                  .filter((t) => t.empleadoId === emp.id || empleados.length === 1)
                  .map((turno) => {
                    const topOffset = (turno.horaInicio - START_HOUR) * PIXELS_PER_HOUR;
                    const cardHeight = Math.max(34, turno.duracion * PIXELS_PER_HOUR - 4);
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
                        className={`absolute left-1 right-1 rounded-lg p-2 shadow-xs text-xs border cursor-pointer z-10 transition-all hover:shadow-md hover:scale-[1.01] flex flex-col justify-between overflow-hidden ${getCardClasses(turno.estado)}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="truncate">
                            <span className="font-bold block truncate">{clienteNombre}</span>
                            <span className="text-[11px] opacity-80 truncate block">
                              {turno.servicio}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase shrink-0 border ${getStatusBadge(turno.estado)}`}
                          >
                            {turno.estado}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-medium opacity-75 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeRange}
                          </span>
                          {turno.precio ? (
                            <span className="font-bold">
                              ${turno.precio.toLocaleString("es-AR")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}

            {/* Current Time Dynamic Red Line */}
            {currentMinutesFromStart !== null && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                style={{ top: `${(currentMinutesFromStart / 60) * PIXELS_PER_HOUR}px` }}
              >
                <div className="w-20 flex justify-end pr-1">
                  <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider animate-pulse">
                    Ahora
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-rose-500 shadow-xs relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 absolute -top-1 -left-1 ring-2 ring-white" />
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
