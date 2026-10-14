"use client";

import React, { useState } from "react";
import TurnoDetalleModal, { Turno } from "@/components/turnos/TurnoDetalleModal";
import { TurnoTimelineGrid } from "@/components/turnos/TurnoTimelineGrid";
import { NuevoTurnoModal } from "@/components/turnos/NuevoTurnoModal";
import { CustomSelect } from "@/components/ui/custom-select";
import { UserCheck, Plus } from "lucide-react";

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
  const { user } = useAuth();
  const tenantId = user?.tenantId || "demo-tenant";

  const { appointments } = useDailyAppointments(tenantId, new Date());

  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("all");
  const [isNewTurnoModalOpen, setIsNewTurnoModalOpen] = useState(false);
  const [selectedSlotHour, setSelectedSlotHour] = useState<number | undefined>(undefined);
  const [selectedSlotEmployeeId, setSelectedSlotEmployeeId] = useState<string | undefined>(
    undefined,
  );

  const isEmployee = user?.role === "employee";
  const isOwner = user?.role === "owner" || user?.role === "superadmin";

  const filteredEmpleados = empleados.filter((e) => {
    if (isEmployee || !isOwner) {
      // Para el rol employee, restringir únicamente a su agenda personal
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

  const handleOpenNewTurno = (hora?: number, empleadoId?: string) => {
    setSelectedSlotHour(hora);
    setSelectedSlotEmployeeId(empleadoId || (isEmployee ? "emp1" : filteredEmpleados[0]?.id));
    setIsNewTurnoModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3 bg-gray-50 rounded-t-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">
              {isEmployee ? "Mi Agenda Personal" : "Grilla Diaria"}
            </h2>
            {isEmployee && (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                Empleado
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEmployee
              ? "Visualiza y gestiona únicamente tus citas asignadas del día."
              : "Haz clic en un turno para ver los detalles del cliente o en un espacio libre para agendar"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEmployee ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Agenda: {filteredEmpleados[0]?.nombre || "Mi Usuario"}</span>
            </div>
          ) : (
            isOwner && (
              <div className="w-56">
                <CustomSelect
                  value={selectedEmployeeFilter}
                  onChange={(val) => setSelectedEmployeeFilter(val as string)}
                  options={[
                    { value: "all", label: "Todos los empleados" },
                    ...empleados.map((e) => ({ value: e.id, label: e.nombre })),
                  ]}
                />
              </div>
            )
          )}
          <button
            onClick={() => handleOpenNewTurno()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Turno</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <TurnoTimelineGrid
          turnos={turnos}
          empleados={filteredEmpleados}
          onSelectTurno={(turno) => setSelectedTurno(turno)}
          onSlotClick={(hora, empId) => handleOpenNewTurno(hora, empId)}
          isEmployeeView={isEmployee}
        />
      </div>

      {/* Modal de Detalles del Turno */}
      <TurnoDetalleModal
        turno={selectedTurno}
        onClose={() => setSelectedTurno(null)}
        onCancelTurno={handleCancelTurno}
        onCompleteTurno={handleCompleteTurno}
      />

      {/* Modal de Nuevo Turno Rápido (Walk-in) */}
      <NuevoTurnoModal
        isOpen={isNewTurnoModalOpen}
        onClose={() => setIsNewTurnoModalOpen(false)}
        onCreated={() => setIsNewTurnoModalOpen(false)}
        initialHour={selectedSlotHour}
        initialEmployeeId={selectedSlotEmployeeId}
        employees={filteredEmpleados}
        businessId={tenantId}
      />
    </div>
  );
}
