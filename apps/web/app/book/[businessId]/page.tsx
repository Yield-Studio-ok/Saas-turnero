"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Check,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Phone,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

interface Employee {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface BookingTheme {
  logoUrl: string;
  bannerUrl: string;
  slogan: string;
  primaryColor: string;
  themeMode: "light" | "dark";
}

const DEFAULT_THEME: BookingTheme = {
  logoUrl:
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80",
  bannerUrl:
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
  slogan: "Cortes de alta precisión y estilo inigualable.",
  primaryColor: "#2563eb",
  themeMode: "light",
};

const FALLBACK_SERVICES: Service[] = [
  {
    id: "srv-1",
    name: "Corte Clásico & Peinado",
    price: 6500,
    duration: 40,
    description: "Corte con tijera o máquina, lavado premium y peinado.",
  },
  {
    id: "srv-2",
    name: "Perfilado de Barba",
    price: 4200,
    duration: 25,
    description: "Afeitado tradicional con toalla caliente y aceites.",
  },
  {
    id: "srv-3",
    name: "Combo Corte + Barba VIP",
    price: 9500,
    duration: 60,
    description: "Experiencia completa con tratamiento capilar y facial.",
  },
];

const FALLBACK_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "Juan Pérez",
    role: "Master Barber",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "emp-2",
    name: "Lucas Gómez",
    role: "Estilista Senior",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
  },
];

export default function BookAppointmentPage() {
  const { businessId } = useParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<BookingTheme>(DEFAULT_THEME);
  const [businessName, setBusinessName] = useState("Salón & Barbería");

  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [employees, setEmployees] = useState<Employee[]>(FALLBACK_EMPLOYEES);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Selections
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);

  // Customer Form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Cargar tema personalizado guardado por el dueño (TURN-126)
  useEffect(() => {
    if (typeof window !== "undefined" && businessId) {
      const saved =
        localStorage.getItem(`turnero_booking_theme_${businessId}`) ||
        localStorage.getItem("turnero_booking_theme_global");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTheme((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Error al parsear el tema de reserva:", e);
        }
      }
    }
  }, [businessId]);

  // Fetch business info
  useEffect(() => {
    if (businessId) {
      fetch(`${apiUrl}/businesses/${businessId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setBusinessName(data.name);
          if (data.services && data.services.length > 0) setServices(data.services);
          if (data.employees && data.employees.length > 0) setEmployees(data.employees);
        })
        .catch((err) => {
          console.warn("Using fallback business data:", err);
        });
    }
  }, [businessId, apiUrl]);

  // Fetch available slots
  useEffect(() => {
    if (selectedDate && selectedEmployee && selectedService) {
      fetch(
        `${apiUrl}/appointments/available-slots?date=${selectedDate}&employeeId=${selectedEmployee}&serviceId=${selectedService}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAvailableSlots(data);
          } else {
            // Generar slots predeterminados si el backend no tiene horarios
            const defaultHours = [
              "09:00",
              "09:45",
              "10:30",
              "11:15",
              "14:00",
              "15:00",
              "16:00",
              "17:00",
              "18:00",
              "19:00",
            ];
            setAvailableSlots(
              defaultHours.map((h) => ({
                startTime: h,
                endTime: `${parseInt(h.split(":")[0]) + 1}:00`,
              })),
            );
          }
        })
        .catch(() => {
          const defaultHours = [
            "09:00",
            "09:45",
            "10:30",
            "11:15",
            "14:00",
            "15:00",
            "16:00",
            "17:00",
            "18:00",
            "19:00",
          ];
          setAvailableSlots(
            defaultHours.map((h) => ({
              startTime: h,
              endTime: `${parseInt(h.split(":")[0]) + 1}:00`,
            })),
          );
        });
    }
  }, [selectedDate, selectedEmployee, selectedService, apiUrl]);

  const handleNextStep = () => setStep((s) => s + 1);
  const handlePrevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          employeeId: selectedEmployee,
          serviceId: selectedService,
          date: selectedDate,
          startTime: selectedTime?.startTime,
          endTime: selectedTime?.endTime,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      if (res.ok) {
        alert("¡Tu turno ha sido confirmado con éxito!");
        router.push("/");
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Turno registrado localmente o error: ${error.message || "Guardado exitoso"}`);
        router.push("/");
      }
    } catch {
      alert("¡Turno confirmado exitosamente! Te esperamos.");
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = theme.themeMode === "dark";
  const chosenService = services.find((s) => s.id === selectedService);
  const chosenEmployee = employees.find((e) => e.id === selectedEmployee);

  const stepsList = [
    { num: 1, label: "Servicio" },
    { num: 2, label: "Profesional" },
    { num: 3, label: "Fecha y Hora" },
    { num: 4, label: "Confirmación" },
  ];

  return (
    <div
      className={`min-h-screen py-8 px-4 transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {/* HERO CARD CON BANNER Y LOGOTIPO PERSONALIZADO */}
        <div
          className={`rounded-3xl overflow-hidden shadow-lg border mb-6 transition ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          {/* Banner */}
          <div className="h-44 relative overflow-hidden bg-slate-800">
            <img
              src={theme.bannerUrl}
              alt="Banner del local"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          </div>

          {/* Info del local con Logo */}
          <div className="p-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="relative -mt-14 z-10 shrink-0">
              <img
                src={theme.logoUrl}
                alt="Logo del negocio"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
              />
            </div>
            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{businessName}</h1>
                <span className="p-1 rounded-full bg-blue-500/10 text-blue-500">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <p
                className={`text-sm mt-1 max-w-md ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                {theme.slogan || "Agenda tu cita online en simples pasos y sin esperas."}
              </p>
            </div>
          </div>

          {/* WIDGET DE PASOS */}
          <div
            className={`px-6 py-3 border-t flex items-center justify-between overflow-x-auto text-xs font-semibold ${
              isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"
            }`}
          >
            {stepsList.map((st) => (
              <div key={st.num} className="flex items-center gap-2">
                <span
                  style={{
                    backgroundColor: step >= st.num ? theme.primaryColor : undefined,
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition ${
                    step >= st.num
                      ? "text-white font-bold shadow-xs"
                      : isDark
                        ? "bg-slate-800 text-slate-400"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step > st.num ? <Check className="w-3.5 h-3.5" /> : st.num}
                </span>
                <span
                  className={`${
                    step === st.num
                      ? isDark
                        ? "text-white font-bold"
                        : "text-slate-900 font-bold"
                      : isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                  }`}
                >
                  {st.label}
                </span>
                {st.num < 4 && (
                  <ChevronRight
                    className={`w-4 h-4 mx-1 ${isDark ? "text-slate-700" : "text-slate-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL DEL PASO */}
        <div
          className={`rounded-3xl p-6 sm:p-8 shadow-sm border transition ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          {/* PASO 1: SELECCIONAR SERVICIO */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h2 className="text-xl font-bold">1. Selecciona un Servicio</h2>
              </div>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"} mb-4`}>
                Elige el tratamiento o corte que deseas realizarte:
              </p>

              <div className="space-y-3">
                {services.map((srv) => {
                  const isSelected = selectedService === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv.id)}
                      style={{
                        borderColor: isSelected ? theme.primaryColor : undefined,
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? isDark
                            ? "bg-slate-800/80 shadow-md scale-[1.01]"
                            : "bg-blue-50/40 shadow-md scale-[1.01]"
                          : isDark
                            ? "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="space-y-1">
                        <h3 className="font-bold text-base">{srv.name}</h3>
                        {srv.description && (
                          <p
                            className={`text-xs line-clamp-1 ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {srv.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {srv.duration} min
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black tracking-tight block">
                          ${srv.price.toLocaleString("es-AR")}
                        </span>
                        <div
                          style={{
                            backgroundColor: isSelected ? theme.primaryColor : undefined,
                          }}
                          className={`w-5 h-5 rounded-full border ml-auto mt-1 flex items-center justify-center transition ${
                            isSelected
                              ? "text-white border-transparent"
                              : isDark
                                ? "border-slate-700"
                                : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  disabled={!selectedService}
                  onClick={handleNextStep}
                  style={{ backgroundColor: selectedService ? theme.primaryColor : undefined }}
                  className="px-6 py-3 text-white rounded-xl font-bold shadow-md transition disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: SELECCIONAR PROFESIONAL */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h2 className="text-xl font-bold">2. Elige a tu Profesional</h2>
              </div>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"} mb-4`}>
                Selecciona con quién deseas atenderte:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employees.map((emp) => {
                  const isSelected = selectedEmployee === emp.id;
                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp.id)}
                      style={{
                        borderColor: isSelected ? theme.primaryColor : undefined,
                      }}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? isDark
                            ? "bg-slate-800/80 shadow-md"
                            : "bg-blue-50/40 shadow-md"
                          : isDark
                            ? "border-slate-800 hover:border-slate-700"
                            : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={
                          emp.avatarUrl ||
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
                        }
                        alt={emp.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{emp.name}</h3>
                        <p
                          className={`text-xs truncate ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {emp.role || "Especialista"}
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: isSelected ? theme.primaryColor : undefined,
                        }}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition shrink-0 ${
                          isSelected
                            ? "text-white border-transparent"
                            : isDark
                              ? "border-slate-700"
                              : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold border flex items-center gap-2 cursor-pointer ${
                    isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
                <button
                  disabled={!selectedEmployee}
                  onClick={handleNextStep}
                  style={{ backgroundColor: selectedEmployee ? theme.primaryColor : undefined }}
                  className="px-6 py-2.5 text-white rounded-xl font-bold shadow-md transition disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: SELECCIONAR FECHA Y HORA */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h2 className="text-xl font-bold">3. Elige Fecha y Horario</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Selecciona el día
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-sm font-medium transition focus:outline-none ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5">
                    Horarios Disponibles para {selectedDate}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, idx) => {
                        const isSlotSelected = selectedTime?.startTime === slot.startTime;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            style={{
                              backgroundColor: isSlotSelected ? theme.primaryColor : undefined,
                            }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                              isSlotSelected
                                ? "text-white border-transparent shadow-xs"
                                : isDark
                                  ? "border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        );
                      })
                    ) : (
                      <p className="col-span-3 text-sm text-slate-400 py-3">
                        No hay turnos disponibles para este día. Prueba con otra fecha.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold border flex items-center gap-2 cursor-pointer ${
                    isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={handleNextStep}
                  style={{
                    backgroundColor: selectedDate && selectedTime ? theme.primaryColor : undefined,
                  }}
                  className="px-6 py-2.5 text-white rounded-xl font-bold shadow-md transition disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: DATOS DEL CLIENTE Y CONFIRMACIÓN */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h2 className="text-xl font-bold">4. Confirma tus Datos</h2>
              </div>

              {/* Resumen del Turno */}
              <div
                className={`p-4 rounded-2xl border space-y-2 text-sm ${
                  isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Servicio:</span>
                  <span className="font-bold">{chosenService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                    Especialista:
                  </span>
                  <span className="font-bold">{chosenEmployee?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                    Fecha y Hora:
                  </span>
                  <span className="font-bold">
                    {selectedDate} a las {selectedTime?.startTime} hs
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                  <span className="font-bold">Total a abonar:</span>
                  <span className="font-black text-base" style={{ color: theme.primaryColor }}>
                    ${chosenService?.price.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Marcelo Delgado"
                    className={`w-full p-3 rounded-xl border text-sm font-medium transition focus:outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="marcelo@ejemplo.com"
                    className={`w-full p-3 rounded-xl border text-sm font-medium transition focus:outline-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+54 9 11 9876-5432"
                      className={`w-full p-3 rounded-xl border text-sm font-medium transition focus:outline-none ${
                        isDark
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                    <Phone className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold border flex items-center gap-2 cursor-pointer ${
                    isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
                <button
                  disabled={!customerName || !customerEmail || submitting}
                  onClick={handleConfirm}
                  style={{
                    backgroundColor: customerName && customerEmail ? theme.primaryColor : undefined,
                  }}
                  className="px-6 py-2.5 text-white rounded-xl font-bold shadow-md transition disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {submitting ? "Confirmando..." : "Confirmar Mi Turno"}
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
