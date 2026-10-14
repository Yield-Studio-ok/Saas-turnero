"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Scissors,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createAppointment, calculateEndTime } from "@/lib/appointments-service";
import { CustomSelect } from "@/components/ui/custom-select";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

const defaultServices: ServiceOption[] = [
  { id: "srv_1", name: "Corte Clásico Masculino", price: 3500, duration: 30 },
  { id: "srv_2", name: "Corte y Perfilado de Barba", price: 4800, duration: 45 },
  { id: "srv_3", name: "Perfilado y Ritual de Barba", price: 2500, duration: 30 },
  { id: "srv_4", name: "Corte Infantil", price: 3000, duration: 30 },
  { id: "srv_5", name: "Coloración / Claritos", price: 7500, duration: 60 },
];

interface NuevoTurnoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialHour?: number;
  initialEmployeeId?: string;
  employees: { id: string; nombre: string }[];
  businessId?: string;
}

export function NuevoTurnoModal({
  isOpen,
  onClose,
  onCreated,
  initialHour,
  initialEmployeeId,
  employees,
  businessId = "demo-tenant",
}: NuevoTurnoModalProps) {
  const { user, token } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(defaultServices[0].id);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    initialEmployeeId || employees[0]?.id || "emp1",
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);

  const defaultStart = initialHour
    ? `${Math.floor(initialHour).toString().padStart(2, "0")}:${Math.round((initialHour % 1) * 60)
        .toString()
        .padStart(2, "0")}`
    : "10:00";

  const [startTime, setStartTime] = useState(defaultStart);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialHour) {
      const hStr = `${Math.floor(initialHour).toString().padStart(2, "0")}:${Math.round(
        (initialHour % 1) * 60,
      )
        .toString()
        .padStart(2, "0")}`;
      setStartTime(hStr);
    }
    if (initialEmployeeId) {
      setSelectedEmployeeId(initialEmployeeId);
    }
  }, [initialHour, initialEmployeeId]);

  if (!isOpen) return null;

  const currentService =
    defaultServices.find((s) => s.id === selectedServiceId) || defaultServices[0];
  const calculatedEnd = calculateEndTime(startTime, currentService.duration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg("Por favor ingresa el nombre del cliente");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const effectiveBusinessId = user?.tenantId || businessId || "demo-tenant";
      await createAppointment(
        effectiveBusinessId,
        {
          serviceId: currentService.id,
          serviceName: currentService.name,
          employeeId: selectedEmployeeId,
          date,
          startTime,
          endTime: calculatedEnd,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined,
          price: currentService.price,
          duration: currentService.duration,
          notes: notes.trim() || "Turno manual (Walk-in)",
          status: "confirmed",
        },
        token || undefined,
      );

      onCreated();
      onClose();
      // Reset
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotes("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al crear el turno");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Nuevo Turno Rápido</h2>
              <p className="text-xs text-slate-500">Agendar atención presencial o walk-in</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Nombre del Cliente *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Marcos Rodríguez"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Customer Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Teléfono <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="tel"
                placeholder="11-2345-6789"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="email"
                placeholder="cliente@ejemplo.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-slate-500" />
              Servicio
            </label>
            <CustomSelect
              value={selectedServiceId}
              onChange={(val) => setSelectedServiceId(val as string)}
              options={defaultServices.map((s) => ({
                value: s.id,
                label: `${s.name} - $${s.price.toLocaleString("es-AR")} (${s.duration} min)`,
              }))}
            />
          </div>

          {/* Professional Selector */}
          {employees.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Profesional Asignado
              </label>
              <CustomSelect
                value={selectedEmployeeId}
                onChange={(val) => setSelectedEmployeeId(val as string)}
                options={employees.map((e) => ({
                  value: e.id,
                  label: e.nombre,
                }))}
              />
            </div>
          )}

          {/* Date and Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Inicio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Fin
              </label>
              <div className="w-full px-2.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold flex items-center justify-center">
                {calculatedEnd}
              </div>
            </div>
          </div>

          {/* Price & Summary Box */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-900 block">
                {currentService.name}
              </span>
              <span className="text-[11px] text-blue-700">
                Duración: {currentService.duration} min | Horario: {startTime} a {calculatedEnd}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-blue-900">
                ${currentService.price.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notas Adicionales
            </label>
            <input
              type="text"
              placeholder="Ej. Viene con turno previo cancelado / Cliente frecuente"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Guardando..." : "Confirmar Turno"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NuevoTurnoModal;
