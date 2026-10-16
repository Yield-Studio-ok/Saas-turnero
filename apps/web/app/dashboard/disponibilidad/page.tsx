"use client";

import React, { useState, useEffect } from "react";
import { Clock, Plus, Trash2, CheckCircle2, CalendarDays, Coffee, CalendarX } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface DaySchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  dayName: string;
  active: boolean;
  startTime: string;
  endTime: string;
  hasBreak: boolean;
  breakStart?: string;
  breakEnd?: string;
}

interface BlockedSlot {
  id: string;
  date: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  reason: string;
}

const initialDays: DaySchedule[] = [
  {
    dayOfWeek: 1,
    dayName: "Lunes",
    active: true,
    startTime: "09:00",
    endTime: "19:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  {
    dayOfWeek: 2,
    dayName: "Martes",
    active: true,
    startTime: "09:00",
    endTime: "19:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  {
    dayOfWeek: 3,
    dayName: "Miércoles",
    active: true,
    startTime: "09:00",
    endTime: "19:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  {
    dayOfWeek: 4,
    dayName: "Jueves",
    active: true,
    startTime: "09:00",
    endTime: "19:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  {
    dayOfWeek: 5,
    dayName: "Viernes",
    active: true,
    startTime: "09:00",
    endTime: "20:00",
    hasBreak: false,
  },
  {
    dayOfWeek: 6,
    dayName: "Sábado",
    active: true,
    startTime: "10:00",
    endTime: "18:00",
    hasBreak: false,
  },
  {
    dayOfWeek: 0,
    dayName: "Domingo",
    active: false,
    startTime: "10:00",
    endTime: "14:00",
    hasBreak: false,
  },
];

export default function DisponibilidadPage() {
  const { user, token } = useAuth();
  const businessId = user?.tenantId || "demo-tenant";
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  useEffect(() => {
    if (!businessId || businessId === "demo-tenant") return;
    let isMounted = true;
    apiFetch<any[]>(`/employees?businessId=${encodeURIComponent(businessId)}`, {
      token: token || undefined,
    })
      .then((data) => {
        if (!isMounted || !Array.isArray(data) || data.length === 0) return;
        const list = data.map((e) => ({ id: e.id, name: e.name || "Empleado" }));
        setEmployees(list);
        setSelectedEmployeeId((prev) => prev || list[0].id);
      })
      .catch((err) => console.warn("No se pudieron cargar los empleados:", err));

    return () => {
      isMounted = false;
    };
  }, [businessId, token]);

  const effectiveEmployeeId =
    selectedEmployeeId || (user as any)?.employeeId || employees[0]?.id || "emp1";

  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("turnero_employee_schedule");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialDays;
  });

  const [blocks, setBlocks] = useState<BlockedSlot[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Block Form Modal
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockAllDay, setNewBlockAllDay] = useState(false);
  const [newBlockStart, setNewBlockStart] = useState("12:00");
  const [newBlockEnd, setNewBlockEnd] = useState("14:00");
  const [newBlockReason, setNewBlockReason] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadBlocks() {
      try {
        setLoadingBlocks(true);
        const data = await apiFetch<any[]>(
          `/schedules/blocks?businessId=${encodeURIComponent(businessId)}&employeeId=${encodeURIComponent(effectiveEmployeeId)}`,
          { token: token || undefined },
        );
        if (isMounted && Array.isArray(data)) {
          const mapped: BlockedSlot[] = data.map((b) => ({
            id: b.id,
            date: b.date,
            allDay: b.startTime === "00:00" && (b.endTime === "23:59" || b.endTime === "24:00"),
            startTime: b.startTime,
            endTime: b.endTime,
            reason: b.reason || "Bloqueo personal",
          }));
          setBlocks(mapped);
        }
      } catch (err) {
        console.error("Error cargando bloqueos:", err);
      } finally {
        if (isMounted) setLoadingBlocks(false);
      }
    }
    loadBlocks();
    return () => {
      isMounted = false;
    };
  }, [businessId, effectiveEmployeeId, token]);

  const handleToggleDay = (dayIndex: number) => {
    setSchedule((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, active: !d.active } : d)));
  };

  const handleScheduleChange = (dayIndex: number, field: keyof DaySchedule, value: any) => {
    setSchedule((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, [field]: value } : d)));
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;

    const start = newBlockAllDay ? "00:00" : newBlockStart;
    const end = newBlockAllDay ? "23:59" : newBlockEnd;
    const reason = newBlockReason.trim() || "Bloqueo personal";

    try {
      const created = await apiFetch<any>("/schedules/blocks", {
        method: "POST",
        token: token || undefined,
        body: JSON.stringify({
          businessId,
          employeeId: effectiveEmployeeId,
          date: newBlockDate,
          startTime: start,
          endTime: end,
          reason,
        }),
      });

      const newBlock: BlockedSlot = {
        id: created.id,
        date: created.date,
        allDay: newBlockAllDay,
        startTime: newBlockAllDay ? undefined : newBlockStart,
        endTime: newBlockAllDay ? undefined : newBlockEnd,
        reason,
      };

      setBlocks((prev) => [...prev, newBlock].toSorted((a, b) => a.date.localeCompare(b.date)));
      setShowBlockModal(false);
      setNewBlockDate("");
      setNewBlockReason("");
      setToastMessage("Bloqueo de horario guardado en base de datos.");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error("Error creando bloqueo:", err);
      setToastMessage(err?.message || "Error al crear bloqueo");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      await apiFetch(`/schedules/blocks/${id}`, {
        method: "DELETE",
        token: token || undefined,
      });
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      setToastMessage("Bloqueo eliminado correctamente.");
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err: any) {
      console.error("Error eliminando bloqueo:", err);
      setToastMessage("Error al eliminar el bloqueo de la base de datos.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSaveAll = () => {
    setSaving(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("turnero_employee_schedule", JSON.stringify(schedule));
        localStorage.removeItem("turnero_employee_blocks");
      }
      setSaving(false);
      setToastMessage("¡Disponibilidad guardada correctamente!");
      setTimeout(() => setToastMessage(null), 3500);
    }, 400);
  };

  const activeDaysCount = schedule.filter((d) => d.active).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Mi Disponibilidad</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
              Agenda Empleado
            </span>
          </div>
          {employees.length > 1 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500 font-medium">Profesional:</span>
              <select
                value={effectiveEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <p className="text-slate-500 text-sm mt-1">
            Configura tus días y franjas habituales de atención, o bloquea horarios puntuales para
            las próximas semanas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBlockModal(true)}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <CalendarX className="w-4 h-4 text-slate-600" />
            <span>Bloquear Franja</span>
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar Disponibilidad"}
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Días Activos</p>
            <p className="text-2xl font-bold text-slate-800">{activeDaysCount} días / semana</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Rango General</p>
            <p className="text-base font-bold text-slate-800">09:00 - 19:00 hs habitual</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <CalendarX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Bloqueos Próximos</p>
            <p className="text-2xl font-bold text-amber-600">{blocks.length} excepciones</p>
          </div>
        </div>
      </div>

      {/* Recurring Weekly Schedule Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Horarios Semanales de Atención</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Define en qué días y horas estás disponible para recibir reservas de clientes.
          </p>
        </div>

        <div className="space-y-4">
          {schedule.map((day, idx) => (
            <div
              key={day.dayOfWeek}
              className={`p-4 rounded-xl border transition-all ${
                day.active
                  ? "bg-slate-50/60 border-slate-200"
                  : "bg-slate-50/20 border-slate-100 opacity-60"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Day Name & Active Toggle */}
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    id={`day-${day.dayOfWeek}`}
                    checked={day.active}
                    onChange={() => handleToggleDay(idx)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor={`day-${day.dayOfWeek}`}
                    className={`font-semibold text-sm cursor-pointer ${
                      day.active ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {day.dayName}
                  </label>
                  {!day.active && (
                    <span className="text-[11px] font-medium text-slate-400 italic">Descanso</span>
                  )}
                </div>

                {/* Hours inputs if active */}
                {day.active ? (
                  <div className="flex flex-wrap items-center gap-3 flex-1 justify-start md:justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">De:</span>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleScheduleChange(idx, "startTime", e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-xs text-slate-500 font-medium">A:</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleScheduleChange(idx, "endTime", e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Break toggle */}
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleScheduleChange(idx, "hasBreak", !day.hasBreak)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition cursor-pointer ${
                          day.hasBreak
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>{day.hasBreak ? "Con Pausa" : "+ Pausa"}</span>
                      </button>

                      {day.hasBreak && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={day.breakStart || "13:00"}
                            onChange={(e) =>
                              handleScheduleChange(idx, "breakStart", e.target.value)
                            }
                            className="px-2 py-1 text-xs border border-amber-200 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                          <span className="text-xs text-slate-400">-</span>
                          <input
                            type="time"
                            value={day.breakEnd || "14:00"}
                            onChange={(e) => handleScheduleChange(idx, "breakEnd", e.target.value)}
                            className="px-2 py-1 text-xs border border-amber-200 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Sin atención al público</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specific Blocks / Exclusions for upcoming weeks */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarX className="w-5 h-5 text-rose-600" />
              <span>Bloqueos y Excepciones para las Próximas Semanas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bloquea días u horas específicas por turnos médicos, vacaciones o ausencias
              temporales.
            </p>
          </div>
          <button
            onClick={() => setShowBlockModal(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center gap-1.5 self-start cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Bloqueo</span>
          </button>
        </div>

        {loadingBlocks ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Cargando bloqueos guardados en base de datos...
          </div>
        ) : blocks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No tienes bloqueos programados. Todos tus días activos funcionarán según tu horario
            habitual.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 hover:border-slate-300 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{block.date}</span>
                    {block.allDay ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                        Día Completo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {block.startTime} - {block.endTime}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{block.reason}</p>
                </div>
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="Eliminar bloqueo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: New Block */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Bloquear Horario o Día</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Los clientes no podrán reservar turnos en este período.
              </p>
            </div>

            <form onSubmit={handleAddBlock} className="space-y-4">
              {employees.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profesional
                  </label>
                  <select
                    value={effectiveEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha a Bloquear
                </label>
                <input
                  type="date"
                  required
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDayCheck"
                  checked={newBlockAllDay}
                  onChange={(e) => setNewBlockAllDay(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                />
                <label
                  htmlFor="allDayCheck"
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Bloquear día entero (no laborable)
                </label>
              </div>

              {!newBlockAllDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Desde</label>
                    <input
                      type="time"
                      value={newBlockStart}
                      onChange={(e) => setNewBlockStart(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hasta</label>
                    <input
                      type="time"
                      value={newBlockEnd}
                      onChange={(e) => setNewBlockEnd(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Detalle
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cita médica, Trámite, Capacitación..."
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition"
                >
                  Guardar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
