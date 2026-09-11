"use client";

import React, { useState } from "react";
import TurnoDetalleModal, { Turno } from "@/components/turnos/TurnoDetalleModal";

// Mocks
const empleados = [
  { id: 1, nombre: "Juan Perez" },
  { id: 2, nombre: "Maria Gomez" },
  { id: 3, nombre: "Carlos Ruiz" },
];

const horas = Array.from({ length: 12 }, (_, i) => i + 9); // 9 to 20 (9am to 8pm)

// Mock de algunos turnos con información detallada del cliente y servicio
const turnosIniciales: Turno[] = [
  {
    id: 101,
    empleadoId: 1,
    empleadoNombre: "Juan Perez",
    horaInicio: 9,
    duracion: 1,
    cliente: {
      nombre: "Ana Fernandez",
      telefono: "+54 9 11 4567-8901",
      email: "ana.fernandez@example.com",
      notas: "Prefiere corte con tijera. Primera vez en el local.",
      historialTurnos: 1,
    },
    servicio: "Corte de pelo",
    precio: 3500,
    estado: "confirmado",
    metodoPago: "Efectivo en local",
    fecha: "Hoy, 11 de Septiembre 2026",
  },
  {
    id: 102,
    empleadoId: 1,
    empleadoNombre: "Juan Perez",
    horaInicio: 11,
    duracion: 1.5,
    cliente: {
      nombre: "Luis Martinez",
      telefono: "+54 9 11 9876-5432",
      email: "luis.martinez@example.com",
      notas: "Perfilado de barba con toalla caliente.",
      historialTurnos: 5,
    },
    servicio: "Corte + Barba",
    precio: 5200,
    estado: "confirmado",
    metodoPago: "Mercado Pago (Señado)",
    fecha: "Hoy, 11 de Septiembre 2026",
  },
  {
    id: 103,
    empleadoId: 2,
    empleadoNombre: "Maria Gomez",
    horaInicio: 10,
    duracion: 2,
    cliente: {
      nombre: "Sofia Lopez",
      telefono: "+54 9 11 2345-6789",
      email: "sofia.lopez@example.com",
      notas: "Balayage tonos cobrizos. Trae foto de referencia de Instagram.",
      historialTurnos: 3,
    },
    servicio: "Colorimetria",
    precio: 12000,
    estado: "confirmado",
    metodoPago: "Tarjeta de Crédito",
    fecha: "Hoy, 11 de Septiembre 2026",
  },
  {
    id: 104,
    empleadoId: 3,
    empleadoNombre: "Carlos Ruiz",
    horaInicio: 15,
    duracion: 1,
    cliente: {
      nombre: "Diego Maradona",
      telefono: "+54 9 11 1010-1010",
      email: "diego10@example.com",
      notas: "Cliente VIP habitual.",
      historialTurnos: 10,
    },
    servicio: "Corte de pelo",
    precio: 3500,
    estado: "confirmado",
    metodoPago: "Efectivo en local",
    fecha: "Hoy, 11 de Septiembre 2026",
  },
  {
    id: 105,
    empleadoId: 2,
    empleadoNombre: "Maria Gomez",
    horaInicio: 16,
    duracion: 1,
    cliente: {
      nombre: "Lionel Messi",
      telefono: "+54 9 11 3410-1010",
      email: "leo.messi@example.com",
      notas: "Degradé medio y arreglo de barba prolijo.",
      historialTurnos: 8,
    },
    servicio: "Corte",
    precio: 3500,
    estado: "confirmado",
    metodoPago: "Transferencia",
    fecha: "Hoy, 11 de Septiembre 2026",
  },
];

export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>(turnosIniciales);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);

  const handleCancelTurno = (turnoId: number | string) => {
    setTurnos((prev) =>
      prev.map((t) => (t.id === turnoId ? { ...t, estado: "cancelado" as const } : t))
    );
    setSelectedTurno((prev) =>
      prev && prev.id === turnoId ? { ...prev, estado: "cancelado" as const } : prev
    );
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
            {empleados.map((empleado) => (
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
                {empleados.map((empleado) => (
                  <div
                    key={empleado.id}
                    className="flex-1 shrink-0 border-r last:border-r-0 border-gray-200 relative"
                  >
                    {/* Render turnos for this employee at this hour */}
                    {turnos
                      .filter(
                        (t) => t.empleadoId === empleado.id && Math.floor(t.horaInicio) === hora
                      )
                      .map((turno) => {
                        const topOffset = (turno.horaInicio - hora) * 64; // 64px per hour (h-16)
                        const height = turno.duracion * 64; // 64px per hour
                        const clienteNombre =
                          typeof turno.cliente === "string"
                            ? turno.cliente
                            : turno.cliente.nombre;
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
                                  esCancelado
                                    ? "text-red-800 line-through"
                                    : "text-blue-800"
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
                              {(
                                ((turno.horaInicio + turno.duracion) % 1) *
                                60
                              )
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
      />
    </div>
  );
}
