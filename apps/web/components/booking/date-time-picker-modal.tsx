"use client";

import { useState, useMemo, useEffect } from "react";
import { useAvailability } from "../../hooks/use-availability";
import type { ServiceItem } from "../public-landing";

export interface TimeSlotOption {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
  available: boolean;
  period: "morning" | "afternoon";
}

export interface SelectedDateTime {
  date: Date;
  dateFormatted: string;
  timeSlot: string; // "09:30"
  endTime?: string; // "10:00"
}

export interface DateTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  onConfirm?: (selection: SelectedDateTime) => void;
  customSlots?: TimeSlotOption[];
  isLoadingSlots?: boolean;
  localId?: string;
  openHours?: string;
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAY_NAMES = ["Lun", "Mar", "MiÃ©", "Jue", "Vie", "SÃ¡b", "Dom"];

// Generador de slots predeterminados para maquetaciÃ³n y fallback
function generateDefaultSlots(durationMinutes = 30, selectedDate: Date): TimeSlotOption[] {
  const slots: TimeSlotOption[] = [];
  const day = selectedDate.getDate();

  // Horarios de maÃ±ana: 09:00 a 13:00
  for (let hour = 9; hour < 13; hour++) {
    for (let min = 0; min < 60; min += durationMinutes) {
      if (min + durationMinutes > 60 && hour === 12) break;
      const startH = hour.toString().padStart(2, "0");
      const startM = min.toString().padStart(2, "0");

      const totalEndMin = hour * 60 + min + durationMinutes;
      const endH = Math.floor(totalEndMin / 60).toString().padStart(2, "0");
      const endM = (totalEndMin % 60).toString().padStart(2, "0");

      const timeStr = `${startH}:${startM}`;
      // Simular algunos horarios ocupados para realismo de maquetado
      const isBooked = (day + hour + min) % 5 === 0;

      slots.push({
        id: `m-${timeStr}`,
        startTime: timeStr,
        endTime: `${endH}:${endM}`,
        available: !isBooked,
        period: "morning",
      });
    }
  }

  // Horarios de tarde: 14:00 a 20:00
  for (let hour = 14; hour < 20; hour++) {
    for (let min = 0; min < 60; min += durationMinutes) {
      if (min + durationMinutes > 60 && hour === 19) break;
      const startH = hour.toString().padStart(2, "0");
      const startM = min.toString().padStart(2, "0");

      const totalEndMin = hour * 60 + min + durationMinutes;
      const endH = Math.floor(totalEndMin / 60).toString().padStart(2, "0");
      const endM = (totalEndMin % 60).toString().padStart(2, "0");

      const timeStr = `${startH}:${startM}`;
      const isBooked = (day + hour + min) % 4 === 0;

      slots.push({
        id: `a-${timeStr}`,
        startTime: timeStr,
        endTime: `${endH}:${endM}`,
        available: !isBooked,
        period: "afternoon",
      });
    }
  }

  return slots;
}

export function DateTimePickerModal({
  isOpen,
  onClose,
  service,
  onConfirm,
  customSlots,
  isLoadingSlots = false,
  localId,
  openHours,
}: DateTimePickerModalProps) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotOption | null>(null);
  const [activePeriod, setActivePeriod] = useState<"all" | "morning" | "afternoon">("all");
  const [stepConfirmed, setStepConfirmed] = useState(false);

  const { availableSlots: fetchedSlots, isLoading: isFetchingSlots } = useAvailability(
    localId || "",
    selectedDate,
    openHours || "09:00 - 20:00",
    service?.duration || 30
  );

  // Reiniciar estado si se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(today);
      setCurrentMonthDate(today);
      setSelectedSlot(null);
      setStepConfirmed(false);
    }
  }, [isOpen, today]);

  // Manejo de navegaciÃ³n de mes
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  const isPrevMonthDisabled = useMemo(() => {
    return (
      currentYear === today.getFullYear() &&
      currentMonth <= today.getMonth()
    );
  }, [currentYear, currentMonth, today]);

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    setCurrentMonthDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // CÃ³mputo de la grilla del mes
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  // DÃ­a de la semana del 1er dÃ­a (Lunes = 0, ..., Domingo = 6)
  const firstDayOfWeek = useMemo(() => {
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [currentYear, currentMonth]);

  // Slots computados para la fecha seleccionada
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    if (customSlots) return customSlots;
    if (selectedDate.getDay() === 0) return [];
    if (localId) return fetchedSlots;
    return generateDefaultSlots(service?.duration || 30, selectedDate);
  }, [selectedDate, customSlots, service?.duration, fetchedSlots, localId]);

  const filteredSlots = useMemo(() => {
    if (activePeriod === "all") return availableSlots;
    return availableSlots.filter((slot) => slot.period === activePeriod);
  }, [availableSlots, activePeriod]);

  const availableCount = useMemo(() => {
    return availableSlots.filter((s) => s.available).length;
  }, [availableSlots]);

  // Funciones auxiliares de fecha
  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === currentYear &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getDate() === day
    );
  };

  const isDatePast = (day: number) => {
    const dateToCheck = new Date(currentYear, currentMonth, day);
    return dateToCheck < today;
  };

  const isDateToday = (day: number) => {
    return (
      today.getFullYear() === currentYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === day
    );
  };

  const handleSelectDay = (day: number) => {
    if (isDatePast(day)) return;
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    setSelectedSlot(null); // Reset horario al cambiar de dÃ­a
  };

  const handleQuickSelectToday = () => {
    setCurrentMonthDate(today);
    setSelectedDate(today);
    setSelectedSlot(null);
  };

  const handleQuickSelectTomorrow = () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCurrentMonthDate(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1));
    setSelectedDate(tomorrow);
    setSelectedSlot(null);
  };

  const formatFullDate = (date: Date | null) => {
    if (!date) return "";
    const weekday = ["Domingo", "Lunes", "Martes", "MiÃ©rcoles", "Jueves", "Viernes", "SÃ¡bado"][
      date.getDay()
    ];
    const month = MONTH_NAMES[date.getMonth()];
    return `${weekday} ${date.getDate()} de ${month}`;
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedSlot || !service) return;
    const selection: SelectedDateTime = {
      date: selectedDate,
      dateFormatted: formatFullDate(selectedDate),
      timeSlot: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    };
    if (onConfirm) {
      onConfirm(selection);
    }
    setStepConfirmed(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200/80 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Handle bar para mobile */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 pt-3 pb-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                Paso 2 de 3
              </span>
              <h2 id="modal-title" className="text-base font-bold text-slate-900 leading-tight">
                Selecciona Fecha y Hora
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen del Servicio Seleccionado */}
        {service && (
          <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-slate-500">Servicio:</span>
              <span className="font-bold text-slate-900 truncate">{service.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 font-medium">
                <ClockIcon className="w-3 h-3 text-slate-400" />
                {service.duration} min
              </span>
              <span className="font-bold text-blue-700">
                ${service.price.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        )}

        {/* Contenido scrolleable del modal */}
        <div className="px-5 py-4 overflow-y-auto space-y-6 flex-1 text-slate-900">
          
          {stepConfirmed ? (
            /* Vista de confirmaciÃ³n de fecha/hora (TransiciÃ³n para Ticket 27) */
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Â¡Horario seleccionado con Ã©xito!</h3>
                <p className="text-xs text-slate-500">
                  Tu turno ha sido pre-reservado. Completa tus datos para confirmar.
                </p>
              </div>

              {/* Tarjeta resumen de la reserva */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Servicio
                    </span>
                    <p className="text-sm font-bold text-slate-900">{service?.name}</p>
                  </div>
                  <span className="text-sm font-black text-blue-600">
                    ${service?.price.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Fecha
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedDate ? formatFullDate(selectedDate) : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Horario
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedSlot?.startTime} hs ({service?.duration} min)
                    </span>
                  </div>
                </div>
              </div>

              {/* Nota sobre el flujo del Ticket 27 */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2.5 text-left">
                <InfoIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Paso siguiente:</p>
                  <p className="text-blue-700 mt-0.5">
                    Completa tus datos de contacto (Nombre y WhatsApp) para confirmar la reserva y recibir tu comprobante.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStepConfirmed(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cambiar fecha/hora
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
                >
                  Continuar con mis datos
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* SecciÃ³n: Calendario Mensual */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">1. Elige una fecha</h3>
                    <p className="text-xs text-slate-500">Selecciona el dÃ­a de tu turno</p>
                  </div>

                  {/* Atajos rÃ¡pidos: Hoy / MaÃ±ana */}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleQuickSelectToday}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                        selectedDate && isDateToday(selectedDate.getDate()) && selectedDate.getMonth() === today.getMonth()
                          ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickSelectTomorrow}
                      className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition"
                    >
                      MaÃ±ana
                    </button>
                  </div>
                </div>

                {/* Tarjeta del Calendario */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 shadow-xs">
                  {/* NavegaciÃ³n del mes */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      disabled={isPrevMonthDisabled}
                      aria-label="Mes anterior"
                      className={`p-1.5 rounded-lg border transition ${
                        isPrevMonthDisabled
                          ? "opacity-30 cursor-not-allowed border-transparent text-slate-400"
                          : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs"
                      }`}
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>

                    <span className="text-sm font-bold text-slate-800">
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      aria-label="Mes siguiente"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs transition"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Encabezado dÃ­as de la semana */}
                  <div className="grid grid-cols-7 text-center gap-1 mb-1.5">
                    {WEEKDAY_NAMES.map((name, idx) => (
                      <span
                        key={name}
                        className={`text-[11px] font-bold py-1 ${
                          idx === 6 ? "text-rose-500" : "text-slate-400"
                        }`}
                      >
                        {name}
                      </span>
                    ))}
                  </div>

                  {/* Grilla de dÃ­as */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Espacios vacÃ­os antes del dÃ­a 1 */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-9" />
                    ))}

                    {/* DÃ­as del mes */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNumber = i + 1;
                      const isSelected = isDateSelected(dayNumber);
                      const isPast = isDatePast(dayNumber);
                      const isTodayDate = isDateToday(dayNumber);
                      const dayOfWeek = new Date(currentYear, currentMonth, dayNumber).getDay();
                      const isSunday = dayOfWeek === 0;

                      return (
                        <button
                          key={`day-${dayNumber}`}
                          type="button"
                          disabled={isPast || isSunday}
                          onClick={() => handleSelectDay(dayNumber)}
                          className={`h-9 rounded-xl text-xs flex flex-col items-center justify-center relative transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 scale-105 z-10 ring-2 ring-blue-500/20"
                              : isPast
                              ? "text-slate-300 cursor-not-allowed line-through"
                              : isSunday
                              ? "text-rose-300/80 cursor-not-allowed bg-rose-50/30"
                              : "hover:bg-blue-100/70 hover:text-blue-700 text-slate-700 font-semibold bg-white border border-slate-200/50"
                          }`}
                          title={
                            isPast
                              ? "Fecha pasada"
                              : isSunday
                              ? "Domingo cerrado"
                              : `${dayNumber} de ${MONTH_NAMES[currentMonth]}`
                          }
                        >
                          <span>{dayNumber}</span>
                          {isTodayDate && !isSelected && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Leyenda rÃ¡pida */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Seleccionado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-slate-300 bg-white" />
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-100 border border-rose-300" />
                    <span>Cerrado (Dom)</span>
                  </div>
                </div>
              </section>

              {/* Separador */}
              <div className="border-t border-slate-100" />

              {/* SecciÃ³n: Horarios Disponibles (Chips) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">2. Elige el horario</h3>
                    <p className="text-xs text-slate-500">
                      {selectedDate ? (
                        <>
                          Para el <span className="font-semibold text-slate-700">{formatFullDate(selectedDate)}</span>
                        </>
                      ) : (
                        "Primero selecciona un dÃ­a arriba"
                      )}
                    </p>
                  </div>

                  {/* Filtro MaÃ±ana / Tarde / Todos */}
                  {selectedDate && availableSlots.length > 0 && (
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
                      <button
                        type="button"
                        onClick={() => setActivePeriod("all")}
                        className={`px-2 py-0.5 rounded-md transition ${
                          activePeriod === "all" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePeriod("morning")}
                        className={`px-2 py-0.5 rounded-md transition ${
                          activePeriod === "morning" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
                        }`}
                      >
                        MaÃ±ana
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePeriod("afternoon")}
                        className={`px-2 py-0.5 rounded-md transition ${
                          activePeriod === "afternoon" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
                        }`}
                      >
                        Tarde
                      </button>
                    </div>
                  )}
                </div>

                {/* Estado de Carga */}
                {isLoadingSlots ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                    <SpinnerIcon className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="text-xs text-slate-500">Buscando turnos disponibles...</span>
                  </div>
                ) : !selectedDate ? (
                  <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                    <ClockIcon className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-600">
                      Selecciona un dÃ­a en el calendario
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PodrÃ¡s ver todos los turnos disponibles para esa fecha
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-6 px-4 text-center rounded-2xl border border-slate-200 bg-amber-50/50">
                    <p className="text-xs font-bold text-amber-900">
                      El local no atiende en esta fecha
                    </p>
                    <p className="text-[11px] text-amber-700 mt-1">
                      Los domingos el local permanece cerrado. Por favor elige otro dÃ­a.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Cantidad de turnos */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2.5">
                      <span>{availableCount} horarios libres disponibles</span>
                      {selectedSlot && (
                        <span className="font-bold text-blue-600">
                          Horario seleccionado: {selectedSlot.startTime} hs
                        </span>
                      )}
                    </div>

                    {/* Grilla de Chips de Horarios */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {filteredSlots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        const isAvailable = slot.available;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-500/20 scale-[1.02]"
                                : isAvailable
                                ? "bg-white border border-slate-200 text-slate-800 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/40 shadow-xs"
                                : "bg-slate-100/70 border border-slate-200/50 text-slate-300 cursor-not-allowed line-through"
                            }`}
                            title={
                              isAvailable
                                ? `Turno disponible de ${slot.startTime} a ${slot.endTime}`
                                : "Horario no disponible / ocupado"
                            }
                          >
                            <ClockIcon className={`w-3 h-3 ${isSelected ? "text-white" : isAvailable ? "text-slate-400" : "text-slate-300"}`} />
                            <span>{slot.startTime}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

        </div>

        {/* Modal Footer / Barra de AcciÃ³n */}
        {!stepConfirmed && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2.5 shrink-0">
            {/* Resumen dinÃ¡mico de la selecciÃ³n */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selectedDate && selectedSlot ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="font-semibold text-slate-600">
                  {selectedDate && selectedSlot ? (
                    <span className="text-slate-900 font-bold">
                      {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)} â€¢ {selectedSlot.startTime} hs
                    </span>
                  ) : (
                    "Elige fecha y horario para continuar"
                  )}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Paso 2 / 3
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shrink-0"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={!selectedDate || !selectedSlot}
                onClick={handleContinue}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                  selectedDate && selectedSlot
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-[0.99]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                <span>Continuar reserva</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* Iconos SVG inline */

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

function ChevronLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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





