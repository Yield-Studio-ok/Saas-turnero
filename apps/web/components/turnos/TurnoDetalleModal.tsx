"use client";

import React, { useEffect, useState } from "react";
import AlertDialog from "@/components/ui/AlertDialog";

export interface ClienteInfo {
  nombre: string;
  telefono?: string;
  email?: string;
  notas?: string;
  historialTurnos?: number;
}

export interface Turno {
  id: number | string;
  empleadoId: number | string;
  empleadoNombre?: string;
  horaInicio: number;
  duracion: number;
  cliente: string | ClienteInfo;
  servicio: string;
  precio?: number;
  estado?: "confirmado" | "pendiente" | "completado" | "cancelado";
  metodoPago?: string;
  fecha?: string;
  notas?: string;
}

interface TurnoDetalleModalProps {
  turno: Turno | null;
  onClose: () => void;
  onCancelTurno?: (turnoId: number | string) => void | Promise<void>;
  onCompleteTurno?: (
    turnoId: number | string,
    data: { paidAmount?: number; tip?: number },
  ) => void | Promise<void>;
}

export function formatHoraDecimal(horaDecimal: number): string {
  const horas = Math.floor(horaDecimal);
  const minutos = Math.round((horaDecimal % 1) * 60);
  return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;
}

export function formatRangoHorario(horaInicio: number, duracion: number): string {
  const horaFin = horaInicio + duracion;
  const duracionMinutos = Math.round(duracion * 60);
  return `${formatHoraDecimal(horaInicio)} - ${formatHoraDecimal(horaFin)} (${duracionMinutos} min)`;
}

export function getClienteDatos(cliente: string | ClienteInfo): ClienteInfo {
  if (typeof cliente === "string") {
    return {
      nombre: cliente,
      telefono: "+54 9 11 5555-1234",
      email: `${cliente.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    };
  }
  return cliente;
}

export default function TurnoDetalleModal({
  turno,
  onClose,
  onCancelTurno,
  onCompleteTurno,
}: TurnoDetalleModalProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [tip, setTip] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isConfirmOpen) {
          setIsConfirmOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConfirmOpen, onClose]);

  // Resetear estados al cambiar de turno
  useEffect(() => {
    setIsConfirmOpen(false);
    setIsCancelling(false);
  }, [turno?.id]);

  if (!turno) return null;

  const cliente = getClienteDatos(turno.cliente);
  const estado = turno.estado || "confirmado";
  const fechaTexto = turno.fecha || "Hoy, 11 de Septiembre 2026";
  const rangoHorario = formatRangoHorario(turno.horaInicio, turno.duracion);

  const handleConfirmCancel = async () => {
    if (!onCancelTurno || !turno) return;
    try {
      setIsCancelling(true);
      await Promise.resolve(onCancelTurno(turno.id));
      setIsConfirmOpen(false);
    } catch (error) {
      console.error("Error al cancelar el turno:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmComplete = async () => {
    if (!onCompleteTurno || !turno) return;
    try {
      setIsCompleting(true);
      await Promise.resolve(
        onCompleteTurno(turno.id, {
          paidAmount: Number(paidAmount) || undefined,
          tip: Number(tip) || undefined,
        }),
      );
      setIsCompleteOpen(false);
    } catch (error) {
      console.error("Error al completar el turno:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  // Iniciales para el avatar
  const iniciales = cliente.nombre
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const estadoBadgeConfig = {
    confirmado: {
      label: "Confirmado",
      badgeClass: "bg-green-100 text-green-800 border-green-200",
      dotClass: "bg-green-500",
    },
    pendiente: {
      label: "Pendiente",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      dotClass: "bg-amber-500",
    },
    completado: {
      label: "Completado",
      badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
      dotClass: "bg-blue-500",
    },
    cancelado: {
      label: "Cancelado",
      badgeClass: "bg-red-100 text-red-800 border-red-200",
      dotClass: "bg-red-500",
    },
  }[estado];

  // Enlace WhatsApp con mensaje pre-rellenado
  const whatsappCleanNumber = cliente.telefono?.replace(/\D/g, "") || "";
  const whatsappMensaje = encodeURIComponent(
    `Hola ${cliente.nombre}, te contactamos desde el local respecto a tu turno de ${turno.servicio} (${rangoHorario}).`,
  );
  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=${whatsappMensaje}`;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-turno-titulo"
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transition-all transform flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabecera del Modal */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="modal-turno-titulo" className="text-lg font-bold text-gray-900">
                    Detalle del Turno
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                    #{turno.id}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{fechaTexto}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${estadoBadgeConfig.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${estadoBadgeConfig.dotClass}`} />
                {estadoBadgeConfig.label}
              </span>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido Principal con Scroll */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Banner de Estado Cancelado */}
            {estado === "cancelado" && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-3 text-red-800"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-sm text-red-900">
                    Este turno se encuentra cancelado
                  </p>
                  <p className="text-red-700 mt-0.5">
                    El horario asignado ha quedado liberado en la grilla diaria para nuevas
                    reservas.
                  </p>
                </div>
              </div>
            )}

            {/* Tarjeta de Informaci�n del Cliente */}
            <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Informaci�n del Cliente
                </span>
                {cliente.historialTurnos && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    {cliente.historialTurnos} turnos previos
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {iniciales || "CL"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 truncate">
                    {cliente.nombre}
                  </h4>
                  {cliente.telefono && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                      <svg
                        className="w-4 h-4 text-gray-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <a
                        href={`tel:${cliente.telefono}`}
                        className="hover:underline hover:text-blue-600"
                      >
                        {cliente.telefono}
                      </a>
                    </div>
                  )}
                  {cliente.email && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                      <svg
                        className="w-4 h-4 text-gray-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={`mailto:${cliente.email}`}
                        className="hover:underline hover:text-blue-600 truncate"
                      >
                        {cliente.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones de contacto r�pido */}
              {cliente.telefono && (
                <div className="pt-2 flex items-center gap-2 border-t border-gray-200/60">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    Enviar WhatsApp
                  </a>
                  <a
                    href={`tel:${cliente.telefono}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Llamar
                  </a>
                </div>
              )}

              {/* Notas del cliente */}
              {(cliente.notas || turno.notas) && (
                <div className="bg-amber-50/70 border border-amber-200/70 rounded-lg p-2.5 text-xs text-amber-900 mt-2">
                  <span className="font-semibold block mb-0.5 text-amber-800">
                    Nota / Observaci�n:
                  </span>
                  <p className="leading-relaxed">{cliente.notas || turno.notas}</p>
                </div>
              )}
            </div>

            {/* Detalles del Servicio y Turno */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Detalles del Servicio
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Servicio */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242 3 3 0 014.242 0z"
                      />
                    </svg>
                    <span>Servicio</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">{turno.servicio}</div>
                  {turno.precio !== undefined && (
                    <div className="text-xs text-gray-600 mt-0.5 font-medium">
                      ${turno.precio.toLocaleString("es-AR")}
                    </div>
                  )}
                </div>

                {/* Profesional */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <svg
                      className="w-4 h-4 text-purple-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Profesional</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {turno.empleadoNombre || `Empleado #${turno.empleadoId}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Asignado</div>
                </div>

                {/* Horario y Duraci�n */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Horario</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">{rangoHorario}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{fechaTexto}</div>
                </div>

                {/* Pago / Facturaci�n */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <svg
                      className="w-4 h-4 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Pago</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {turno.metodoPago || "En el local"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {estado === "cancelado" ? "Cancelado" : "Pendiente de cobro"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con Acciones */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <div>
              {onCancelTurno && estado !== "cancelado" ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  aria-haspopup="dialog"
                >
                  <svg
                    className="w-3.5 h-3.5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Cancelar Turno
                </button>
              ) : estado === "cancelado" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Turno Cancelado
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Di�logo de Confirmaci�n de Cancelaci�n */}
      <AlertDialog
        isOpen={isCompleteOpen}
        onClose={() => {
          if (!isCompleting) setIsCompleteOpen(false);
        }}
        onConfirm={handleConfirmComplete}
        isLoading={isCompleting}
        title="Completar Turno"
        confirmText={isCompleting ? "Completando..." : "Completar"}
        cancelText="Cancelar"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto Pagado</label>
            <input
              type="number"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
              placeholder="Ej. 1500"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Propina (Opcional)
            </label>
            <input
              type="number"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
              placeholder="Ej. 200"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
            />
          </div>
        </div>
      </AlertDialog>

      <AlertDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          if (!isCancelling) setIsConfirmOpen(false);
        }}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
        title="�Confirmar cancelaci�n del turno?"
        variant="danger"
        confirmText={isCancelling ? "Cancelando..." : "S�, cancelar turno"}
        cancelText="No, conservar turno"
        icon={
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        }
        description={
          <div className="space-y-3">
            <p className="text-gray-600">
              �Est�s seguro de que deseas cancelar la cita de{" "}
              <span className="font-semibold text-gray-900">{cliente.nombre}</span>?
            </p>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Servicio:</span>
                <span className="font-semibold text-gray-800">{turno.servicio}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Horario:</span>
                <span className="font-medium text-gray-800">{rangoHorario}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Fecha:</span>
                <span className="font-medium text-gray-800">{fechaTexto}</span>
              </div>
              {turno.empleadoNombre && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Profesional:</span>
                  <span className="font-medium text-gray-800">{turno.empleadoNombre}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-amber-700 bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 leading-relaxed">
              El horario quedar� inmediatamente liberado en la grilla y el turno cambiar� a estado
              cancelado.
            </p>
          </div>
        }
      />
    </>
  );
}
