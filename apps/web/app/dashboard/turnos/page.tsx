"use client";

import React, { useState } from "react";
import TurnoDetalleModal, { Turno } from "@/components/turnos/TurnoDetalleModal";

import { useDailyAppointments } from "@/hooks/useDailyAppointments";
import { cancelAppointment, AppointmentsService } from "@/lib/appointments-service";
import { Appointment } from "@/types/appointment";
import { useAuth } from "@/lib/auth-context";

// Mocks para empleados (hasta que se integre el servicio de empleados)
const empleados = [
  { id: "emp1", nombre: "Juan Perez" },
  { id: "emp2", nombre: "Maria Gomez" },
  { id: "emp3", nombre: "Carlos Ruiz" },
];

const horas = Array.from({ length: 12 }, (_, i) => i + 9); // 9 to 20 (9am to 8pm)

const mapAppointmentToTurno = (appt: Appointment): Turno => {
  const [hours, minutes] = appt.startTime.split(":").map(Number);
  const horaInicio = hours + minutes / 60;
  const duracion = appt.duration / 60;

  return {
    id: appt.id,
    empleadoId: appt.employeeId,
    empleadoNombre: appt.employeeName || "Empleado",
    horaInicio,
    duracion,
    cliente: {
      nombre: appt.customerName,
      telefono: appt.customerPhone,
      email: appt.customerEmail,
      notas: appt.notes,
    },
    servicio: appt.serviceName || "Servicio",
    precio: appt.price,
    estado: (appt.status === "pending"
      ? "pendiente"
      : appt.status === "confirmed"
        ? "confirmado"
        : appt.status === "cancelled"
          ? "cancelado"
          : appt.status === "completed"
            ? "completado"
            : "confirmado") as any,
    fecha: appt.date,
  };
};

export default function TurnosPage() {
  // Asumimos un tenantId de demostración por ahora
  const tenantId = "demo-tenant";
  const { user } = useAuth();

  const { appointments, loading } = useDailyAppointments(tenantId, new Date());
  
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("all");

  const isOwner = user?.role === "owner" || user?.role === "superadmin";
  const filteredEmpleados = empleados.filter(e => {
    if (!isOwner) {
      // Si es empleado, asume que emp1 es él (para mockup)
      return e.id === "emp1";
    }
    if (selectedEmployeeFilter !== "all") {
      return e.id === selectedEmployeeFilter;
    }
    return true;
  });

  const turnos: Turno[] = appointments.map(mapAppointmentToTurno);

  const handleCancelTurno = async (turnoId: number | string) => {
    try {
      await cancelAppointment(tenantId, turnoId.toString());
      setSelectedTurno((prev) =>
        prev && prev.id === turnoId ? { ...prev, estado: "cancelado" as const } : prev,
      );
    } catch (error) {
      console.error("Error cancelando turno:", error);
    }
  };

  const handleCompleteTurno = async (
    turnoId: number | string,
    data: { paidAmount?: number; tip?: number },
  ) => {
    try {
      await AppointmentsService.complete(turnoId.toString(), { status: "completado", ...data });
      setSelectedTurno((prev) =>
        prev && prev.id === turnoId ? { ...prev, estado: "completado" as const } : prev,
      );
    } catch (error) {
      console.error("Error completando turno:", error);
    }
  };
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Grilla Diaria</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Haz clic en un turno para ver los detalles del cliente y la reserva
          </p>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <select 
              value={selectedEmployeeFilter} 
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los empleados</option>
              {empleados.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          )}
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
            Hoy
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer">
            Nuevo Turno
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-[800px] border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Row: Employees */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-24 shrink-0 border-r border-gray-200 flex items-center justify-center py-3">
              <span className="text-sm font-medium text-gray-500">Hora</span>
            </div>
            {filteredEmpleados.map((empleado) => (
              <div
                key={empleado.id}
                className="flex-1 shrink-0 border-r last:border-r-0 border-gray-200 text-center py-3"
              >
                <span className="text-sm font-semibold text-gray-700">{empleado.nombre}</span>
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="relative bg-white">
            {horas.map((hora) => (
              <div key={hora} className="flex border-b last:border-b-0 border-gray-100 h-16">
                {/* Time Column */}
                <div className="w-24 shrink-0 border-r border-gray-200 flex flex-col justify-start items-center py-2 relative">
                  <span className="text-xs font-medium text-gray-500 -mt-3 bg-white px-1">
                    {hora.toString().padStart(2, "0")}:00
                  </span>
                </div>

                {/* Employee Columns for this Hour */}
                {filteredEmpleados.map((empleado) => (
                  <div
                    key={empleado.id}
                    className="flex-1 shrink-0 border-r last:border-r-0 border-gray-200 relative"
                  >
                    {/* Render turnos for this employee at this hour */}
                    {turnos
                      .filter(
                        (t) => t.empleadoId === empleado.id && Math.floor(t.horaInicio) === hora,
                      )
                      .map((turno) => {
                        const topOffset = (turno.horaInicio - hora) * 64; // 64px per hour (h-16)
                        const height = turno.duracion * 64; // 64px per hour
                        const clienteNombre =
                          typeof turno.cliente === "string" ? turno.cliente : turno.cliente.nombre;
                        const esCancelado = turno.estado === "cancelado";

                        return (
                          <div
                            key={turno.id}
                            onClick={() => setSelectedTurno(turno)}
                            className={`absolute left-1 right-1 rounded-md p-2 shadow-sm text-xs border cursor-pointer overflow-hidden z-10 transition-all hover:shadow-md ${
                              esCancelado
                                ? "bg-red-50 border-red-200 opacity-60 hover:opacity-100"
                                : "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                            }`}
                            style={{ top: `${topOffset}px`, height: `${height - 2}px` }}
                            title="Haz clic para ver detalles del turno"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`font-semibold truncate ${
                                  esCancelado ? "text-red-800 line-through" : "text-blue-800"
                                }`}
                              >
                                {clienteNombre}
                              </span>
                              {esCancelado && (
                                <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-semibold uppercase shrink-0">
                                  Cancelado
                                </span>
                              )}
                            </div>
                            <div
                              className={`truncate ${
                                esCancelado ? "text-red-600" : "text-blue-600"
                              }`}
                            >
                              {turno.servicio}
                            </div>
                            <div
                              className={`text-[10px] mt-1 ${
                                esCancelado ? "text-red-500" : "text-blue-500"
                              }`}
                            >
                              {Math.floor(turno.horaInicio)}:
                              {((turno.horaInicio % 1) * 60).toString().padStart(2, "0")} -{" "}
                              {Math.floor(turno.horaInicio + turno.duracion)}:
                              {(((turno.horaInicio + turno.duracion) % 1) * 60)
                                .toString()
                                .padStart(2, "0")}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalles del Turno */}
      <TurnoDetalleModal
        turno={selectedTurno}
        onClose={() => setSelectedTurno(null)}
        onCancelTurno={handleCancelTurno}
        onCompleteTurno={handleCompleteTurno}
      />
    </div>
  );
}
