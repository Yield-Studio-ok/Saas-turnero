"use client";

import { useState, useId, useEffect } from "react";
import type { ServiceItem, LocalInfo } from "../public-landing";
import type { SelectedDateTime } from "./date-time-picker-modal";

export interface CustomerBookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

export interface CustomerBookingSuccessData {
  bookingId: string;
  service: ServiceItem;
  dateTime: SelectedDateTime;
  customer: CustomerBookingFormData;
  createdAt: Date;
}

export interface CustomerBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  selectedDateTime: SelectedDateTime | null;
  localInfo?: Partial<LocalInfo>;
  onBack?: () => void;
  onSubmit?: (data: CustomerBookingFormData) => Promise<{ id?: string } | void> | void;
  onSuccess?: (successData: CustomerBookingSuccessData) => void;
  initialData?: Partial<CustomerBookingFormData>;
}

export function CustomerBookingModal({
  isOpen,
  onClose,
  service,
  selectedDateTime,
  localInfo,
  onBack,
  onSubmit,
  onSuccess,
  initialData,
}: CustomerBookingModalProps) {
  const nameInputId = useId();
  const phoneInputId = useId();
  const emailInputId = useId();
  const notesInputId = useId();

  const [customerName, setCustomerName] = useState(initialData?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || "");
  const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  const [errors, setErrors] = useState<{
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<CustomerBookingSuccessData | null>(null);

  // Reset al abrir el modal con una nueva reserva
  useEffect(() => {
    if (isOpen && !successData) {
      setCustomerName(initialData?.customerName || "");
      setCustomerPhone(initialData?.customerPhone || "");
      setCustomerEmail(initialData?.customerEmail || "");
      setNotes(initialData?.notes || "");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialData, successData]);

  // Manejo de la tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleModalClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  const handleModalClose = () => {
    setSuccessData(null);
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validación de Nombre (mínimo 2 caracteres)
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      newErrors.customerName = "El nombre y apellido son obligatorios";
    } else if (trimmedName.length < 2) {
      newErrors.customerName = "Ingresa al menos 2 caracteres";
    }

    // Validación de WhatsApp (mínimo 8 dígitos numéricos)
    const digitsOnly = customerPhone.replace(/\D/g, "");
    if (!customerPhone.trim()) {
      newErrors.customerPhone = "El número de WhatsApp es obligatorio";
    } else if (digitsOnly.length < 8) {
      newErrors.customerPhone = "Ingresa un número de WhatsApp válido (mínimo 8 dígitos)";
    }

    // Validación de Email si se ingresó
    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        newErrors.customerEmail = "Ingresa un correo electrónico válido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !service || !selectedDateTime) return;

    setIsSubmitting(true);

    const formData: CustomerBookingFormData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      let bookingId = `TRN-${Math.floor(100000 + Math.random() * 900000)}`;

      if (onSubmit) {
        const res = await Promise.resolve(onSubmit(formData));
        if (res && res.id) {
          bookingId = res.id;
        }
      } else {
        // Simulación de delay de red suave
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      const confirmedData: CustomerBookingSuccessData = {
        bookingId,
        service,
        dateTime: selectedDateTime,
        customer: formData,
        createdAt: new Date(),
      };

      setSuccessData(confirmedData);
      if (onSuccess) {
        onSuccess(confirmedData);
      }
    } catch (err) {
      console.error("[CustomerBookingModal] Error submitting booking:", err);
      setErrors((prev) => ({
        ...prev,
        customerName: "Ocurrió un error al confirmar la reserva. Intenta nuevamente.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const localName = localInfo?.name || "Local";
  const localAddress = localInfo?.address || "Atención presencial";
  const localPhone = localInfo?.phone || "";

  // Generar link de WhatsApp para el cliente
  const generateWhatsAppShareUrl = () => {
    if (!successData) return "#";
    const text = encodeURIComponent(
      `¡Hola ${localName}! Acabo de reservar un turno:\n\n` +
        `🔖 Código: #${successData.bookingId}\n` +
        `✂️ Servicio: ${successData.service.name}\n` +
        `📅 Fecha: ${successData.dateTime.dateFormatted}\n` +
        `⏰ Horario: ${successData.dateTime.timeSlot} hs\n` +
        `👤 Cliente: ${successData.customer.customerName}\n` +
        `📱 WhatsApp: ${successData.customer.customerPhone}\n\n` +
        `¡Muchas gracias!`,
    );

    const targetPhone = localPhone.replace(/\D/g, "");
    if (targetPhone) {
      return `https://wa.me/${targetPhone}?text=${text}`;
    }
    return `https://wa.me/?text=${text}`;
  };

  // Generar link de Google Calendar
  const generateGoogleCalendarUrl = () => {
    if (!successData) return "#";
    const { service: srv, dateTime, customer: cust } = successData;
    const dateObj = new Date(dateTime.date);

    const [hours, minutes] = dateTime.timeSlot.split(":").map(Number);
    dateObj.setHours(hours, minutes, 0, 0);

    const endObj = new Date(dateObj.getTime() + srv.duration * 60000);

    const formatGCalDate = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d+/g, "");

    const dates = `${formatGCalDate(dateObj)}/${formatGCalDate(endObj)}`;
    const title = encodeURIComponent(`Turno: ${srv.name} en ${localName}`);
    const details = encodeURIComponent(
      `Turno para ${cust.customerName}\nServicio: ${srv.name} (${srv.duration} min)\nPrecio: $${srv.price.toLocaleString("es-AR")}\nCódigo de reserva: #${successData.bookingId}`,
    );
    const location = encodeURIComponent(localAddress);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-form-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200/80 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Handle bar para mobile */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 pt-3 pb-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                successData
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {successData ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider ${
                  successData ? "text-emerald-600" : "text-blue-600"
                }`}
              >
                {successData ? "Reserva Finalizada" : "Paso 3 de 3"}
              </span>
              <h2
                id="booking-form-modal-title"
                className="text-base font-bold text-slate-900 leading-tight"
              >
                {successData ? "¡Turno Confirmado!" : "Completa tus Datos"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            aria-label="Cerrar ventana"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* PANTALLA DE ÉXITO FINAL (Success State) */}
        {/* ========================================================= */}
        {successData ? (
          <div className="px-5 py-6 overflow-y-auto space-y-5 flex-1 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera de Éxito con Animación Suave */}
            <div className="text-center space-y-2">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                  <CheckIcon className="w-8 h-8 stroke-[3]" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">
                ¡Turno confirmado con éxito!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Te esperamos en <span className="font-semibold text-slate-700">{localName}</span>.
                Hemos guardado tu cita en el sistema.
              </p>
            </div>

            {/* Voucher / Ticket de Confirmación */}
            <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 border-2 border-dashed border-slate-200 rounded-2xl p-4 space-y-3.5 relative overflow-hidden shadow-xs">
              {/* Badge de Código de Reserva */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Código de Turno
                  </span>
                  <span className="font-mono text-sm font-extrabold text-blue-700">
                    #{successData.bookingId}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Confirmado
                </span>
              </div>

              {/* Fila: Servicio y Precio */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Servicio
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {successData.service.name}
                  </p>
                  <span className="text-xs text-slate-500">
                    Duración: {successData.service.duration} min
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Total
                  </span>
                  <p className="text-base font-black text-blue-600">
                    ${successData.service.price.toLocaleString("es-AR")}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Pago en el local
                  </span>
                </div>
              </div>

              {/* Fila: Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Fecha
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{successData.dateTime.dateFormatted}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Horario
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ClockIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{successData.dateTime.timeSlot} hs</span>
                  </div>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-200/70">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Titular:</span>
                  <span className="font-bold text-slate-900">
                    {successData.customer.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">WhatsApp:</span>
                  <span className="font-semibold text-slate-800">
                    {successData.customer.customerPhone}
                  </span>
                </div>
                {successData.customer.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="text-slate-700">
                      {successData.customer.customerEmail}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Lugar:</span>
                  <span className="text-slate-700 truncate max-w-[200px]" title={localAddress}>
                    {localAddress}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas (WhatsApp + Calendario) */}
            <div className="space-y-2 pt-1">
              <a
                href={generateWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Enviar comprobante por WhatsApp</span>
              </a>

              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <GoogleCalendarIcon className="w-4 h-4 text-blue-600" />
                <span>Agregar a Google Calendar</span>
              </a>
            </div>

            {/* Botón de cierre y fin del flujo */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Listo, volver al inicio
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* FORMULARIO DE DATOS DEL CLIENTE */
          /* ========================================================= */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Resumen Superior del Turno Elegido */}
            {service && selectedDateTime && (
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate">
                      {service.name}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-blue-600 shrink-0">
                      ${service.price.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                      {selectedDateTime.dateFormatted}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <ClockIcon className="w-3 h-3 text-slate-400" />
                      {selectedDateTime.timeSlot} hs
                    </span>
                  </div>
                </div>

                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0 bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-100 transition"
                  >
                    Cambiar
                  </button>
                )}
              </div>
            )}

            {/* Contenido scrolleable del formulario */}
            <div className="px-5 py-4 overflow-y-auto space-y-4 flex-1 text-slate-900">
              {/* Campo 1: Nombre y Apellido (Obligatorio) */}
              <div className="space-y-1.5">
                <label
                  htmlFor={nameInputId}
                  className="block text-xs font-bold text-slate-700"
                >
                  Nombre y Apellido <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id={nameInputId}
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) {
                        setErrors((prev) => ({ ...prev, customerName: undefined }));
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition ${
                      errors.customerName
                        ? "border-rose-300 ring-rose-500/20 bg-rose-50/20"
                        : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors.customerName ? (
                  <p className="text-[11px] text-rose-500 font-medium pl-1">
                    {errors.customerName}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 pl-1">
                    Como figurarás en la lista de turnos del local.
                  </p>
                )}
              </div>

              {/* Campo 2: WhatsApp / Teléfono (Obligatorio) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={phoneInputId}
                    className="block text-xs font-bold text-slate-700"
                  >
                    WhatsApp (Celular) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Confirmación inmediata
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                    <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
                  </div>
                  <input
                    id={phoneInputId}
                    type="tel"
                    required
                    placeholder="Ej: +54 9 11 2345-6789 o 1123456789"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (errors.customerPhone) {
                        setErrors((prev) => ({ ...prev, customerPhone: undefined }));
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition ${
                      errors.customerPhone
                        ? "border-rose-300 ring-rose-500/20 bg-rose-50/20"
                        : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.customerPhone ? (
                  <p className="text-[11px] text-rose-500 font-medium pl-1">
                    {errors.customerPhone}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 pl-1">
                    Te enviaremos los datos del turno y recordatorio a este número.
                  </p>
                )}
              </div>

              {/* Campo 3: Correo Electrónico (Opcional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor={emailInputId}
                  className="block text-xs font-bold text-slate-700"
                >
                  Email <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MailIcon className="w-4 h-4" />
                  </div>
                  <input
                    id={emailInputId}
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (errors.customerEmail) {
                        setErrors((prev) => ({ ...prev, customerEmail: undefined }));
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition ${
                      errors.customerEmail
                        ? "border-rose-300 ring-rose-500/20 bg-rose-50/20"
                        : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors.customerEmail && (
                  <p className="text-[11px] text-rose-500 font-medium pl-1">
                    {errors.customerEmail}
                  </p>
                )}
              </div>

              {/* Campo 4: Notas o Preferencias (Opcional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor={notesInputId}
                  className="block text-xs font-bold text-slate-700"
                >
                  Notas o comentarios <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <textarea
                  id={notesInputId}
                  rows={2}
                  placeholder="Ej: Preferencia de corte, algún detalle a tener en cuenta..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* Política de Cancelación / Aviso */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-500 flex items-start gap-2">
                <InfoIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  Al confirmar, tu turno quedará reservado de inmediato. Si no puedes asistir, por
                  favor comunícate con el local para cancelar o reprogramar.
                </p>
              </div>
            </div>

            {/* Modal Footer / Acciones */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 shrink-0">
              <div className="flex gap-2">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shrink-0 disabled:opacity-50"
                  >
                    Volver
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !customerName.trim() || !customerPhone.trim()}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                    !isSubmitting && customerName.trim() && customerPhone.trim()
                      ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-blue-600/25"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <SpinnerIcon className="w-4 h-4 text-white animate-spin" />
                      <span>Confirmando reserva...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Turno</span>
                      <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ========================================================= */
/* Iconos SVG Inline */
/* ========================================================= */

function UserIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function MailIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function CloseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({
  className = "w-4 h-4",
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function InfoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SpinnerIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4", fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg className={className} fill={fill} viewBox="0 0 24 24">
      <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.553 4.17 1.603 5.986L0 24l6.155-1.614c1.758.96 3.754 1.465 5.876 1.465h.005c6.642 0 12.026-5.385 12.026-12.031 0-3.213-1.252-6.233-3.525-8.508C18.263 1.252 15.244 0 12.031 0zm-.005 21.99c-1.8 0-3.565-.484-5.105-1.399l-.366-.217-3.795.996 1.013-3.7-.238-.379c-1.006-1.6-1.536-3.46-1.536-5.36 0-5.518 4.49-10.007 10.015-10.007 2.673 0 5.187 1.042 7.078 2.934 1.89 1.892 2.931 4.407 2.93 7.08-.002 5.519-4.492 10.012-10.013 10.012zm5.485-7.498c-.3-.15-1.776-.876-2.051-.976-.275-.1-.475-.15-.675.15s-.776.976-.951 1.176c-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.488-.892-.796-1.494-1.78-1.669-2.08-.175-.3-.019-.462.131-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525s-.675-1.626-.925-2.226c-.244-.585-.492-.505-.675-.515-.175-.009-.375-.011-.575-.011s-.525.075-.8.375c-.275.3-1.05 1.026-1.05 2.502s1.075 2.898 1.225 3.098c.15.2 2.115 3.23 5.125 4.53.716.31 1.275.495 1.71.634.719.229 1.373.197 1.891.119.578-.087 1.776-.726 2.026-1.427.25-.701.25-1.302.175-1.427-.075-.125-.275-.2-.575-.35z" />
    </svg>
  );
}

function GoogleCalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" />
    </svg>
  );
}
