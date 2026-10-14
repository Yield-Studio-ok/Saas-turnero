"use client";

import { useState, useMemo, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { DateTimePickerModal, type SelectedDateTime } from "./booking/date-time-picker-modal";
import {
  CustomerBookingModal,
  type CustomerBookingFormData,
} from "./booking/customer-booking-modal";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { captureEvent } from "@/lib/posthog";

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  popular?: boolean;
}

export interface LocalInfo {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  address: string;
  phone: string;
  openHours: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  imageUrls?: string[];
  avatarUrl?: string;
}

const DEFAULT_LOCAL: LocalInfo = {
  name: "Barbería Vintage",
  slug: "barberia-vintage",
  tagline:
    "Especialistas en cortes clásicos, modernos y perfilado de barba. Atención personalizada.",
  address: "Av. Siempre Viva 123, CABA",
  phone: "+54 9 11 1234-5678",
  openHours: "09:00 - 20:00",
  rating: 4.9,
  reviewCount: 142,
  isOpen: true,
  imageUrls: [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80",
  ],
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
};

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "srv-1",
    name: "Corte Clásico & Peinado",
    description:
      "Corte tradicional a tijera o máquina según tu preferencia. Incluye lavado y peinado con cera mate premium.",
    duration: 30,
    price: 1500,
    category: "Cortes",
    popular: true,
  },
  {
    id: "srv-2",
    name: "Corte + Perfilado de Barba",
    description:
      "Servicio insignia: diseño y corte completo, tratamiento de toalla caliente, perfilado con navaja y bálsamo hidratante.",
    duration: 50,
    price: 2800,
    category: "Combos",
    popular: true,
  },
  {
    id: "srv-3",
    name: "Arreglo y Ritual de Barba",
    description:
      "Afeitado o perfilado con navaja tradicional, vapor y toalla caliente, masaje facial y aceites esenciales.",
    duration: 25,
    price: 1200,
    category: "Barba",
  },
  {
    id: "srv-4",
    name: "Fade / Degradé Urbano",
    description:
      "Técnica de degradé milimétrico (Skin, Low, Mid o High Fade) finalizado con máquina shaver y detalles a navaja.",
    duration: 40,
    price: 1800,
    category: "Cortes",
  },
  {
    id: "srv-5",
    name: "Coloración & Matizado",
    description:
      "Decoloración global, mechas o platinado profesional. Incluye mascarilla nutritiva restauradora.",
    duration: 90,
    price: 5200,
    category: "Tratamientos",
  },
  {
    id: "srv-6",
    name: "Tratamiento Anticaída & Lavado Spa",
    description:
      "Exfoliación suave de cuero cabelludo, ampolla fortalecedora y masaje descontracturante.",
    duration: 35,
    price: 2100,
    category: "Tratamientos",
  },
];

const CATEGORIES = ["Todos", "Cortes", "Combos", "Barba", "Tratamientos"];

function formatSlugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface PublicLandingProps {
  initialSlug?: string;
  initialLocal?: Partial<LocalInfo>;
  initialServices?: ServiceItem[];
}

export function PublicLanding({
  initialSlug,
  initialLocal,
  initialServices = DEFAULT_SERVICES,
}: PublicLandingProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const local: LocalInfo = {
    ...DEFAULT_LOCAL,
    ...initialLocal,
    imageUrls:
      initialLocal?.imageUrls && initialLocal.imageUrls.length > 0
        ? initialLocal.imageUrls
        : DEFAULT_LOCAL.imageUrls,
    avatarUrl: initialLocal?.avatarUrl || DEFAULT_LOCAL.avatarUrl,
    name: initialLocal?.name || (initialSlug ? formatSlugToTitle(initialSlug) : DEFAULT_LOCAL.name),
  };

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<SelectedDateTime | null>(null);

  // Fetch employees
  useEffect(() => {
    if (local.id) {
      apiFetch<any[]>(`/employees?businessId=${local.id}`)
        .then((data: any) => {
          if (data) setEmployees(data);
        })
        .catch(console.error);
    }
  }, [local.id]);

  const handleBookingSubmit = async (formData: CustomerBookingFormData) => {
    if (!selectedService || !selectedDateTime) return;
    const { createAppointment } = await import("../lib/appointments-service");
    const targetLocalId = (local as any).id || local.slug;
    const targetEmployeeId =
      selectedEmployeeId || (selectedService as any).employeeId || employees[0]?.id || "general";
    const id = await createAppointment(
      targetLocalId,
      {
        employeeId: targetEmployeeId,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: selectedDateTime.date,
        startTime: selectedDateTime.timeSlot,
        endTime: selectedDateTime.endTime,
        duration: selectedService.duration,
        price: selectedService.price,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        notes: formData.notes,
        status: "confirmed",
      },
      token || undefined,
    );
    return { id };
  };

  const filteredServices = useMemo(() => {
    return initialServices.filter((service) => {
      const matchesCategory =
        activeCategory === "Todos" ||
        service.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesQuery =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [initialServices, activeCategory, searchQuery]);

  const selectedService = useMemo(() => {
    return initialServices.find((s) => s.id === selectedServiceId) || null;
  }, [initialServices, selectedServiceId]);

  // Restore pending booking
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const pending = localStorage.getItem("pendingBooking");
      if (pending) {
        try {
          const data = JSON.parse(pending);
          if (data.localId === local.id) {
            setSelectedServiceId(data.serviceId);
            setSelectedEmployeeId(data.employeeId);
            setSelectedDateTime(data.dateTime);
            setShowCustomerModal(true);
          }
        } catch {}
        localStorage.removeItem("pendingBooking");
      }
    }
  }, [user, local.id]);

  const handleProceedBooking = () => {
    captureEvent("landing_cta_clicked", {
      action: selectedDateTime ? "proceed_to_booking_form" : "select_date_time",
      localId: (local as any).id || local.slug,
      serviceId: selectedService?.id,
      serviceName: selectedService?.name,
    });
    if (selectedDateTime) {
      if (!user) {
        // Save state and redirect
        localStorage.setItem(
          "pendingBooking",
          JSON.stringify({
            localId: (local as any).id || local.slug,
            serviceId: selectedService?.id,
            employeeId: selectedEmployeeId || "general",
            dateTime: selectedDateTime,
          }),
        );
        router.push("/login?callbackUrl=" + encodeURIComponent(pathname));
      } else {
        setShowCustomerModal(true);
      }
    } else if (selectedService) {
      if (employees.length > 0 && !selectedEmployeeId) {
        setShowEmployeeModal(true);
      } else {
        setShowNextStepModal(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-900 antialiased lg:py-8 lg:px-4">
      {/* Contenedor responsivo: max-w-md en mobile (< lg), max-w-6xl en desktop (lg:) */}
      <div className="w-full max-w-md lg:max-w-6xl mx-auto">
        {/* Layout en 2 columnas para desktop (12 columnas: 7 u 8 izq, 5 o 4 der) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* ========================================================
              COLUMNA IZQUIERDA: Banner, Info, Carrusel, Servicios
              (lg:col-span-7 xl:col-span-8)
             ======================================================== */}
          <div className="w-full bg-white min-h-screen lg:min-h-0 shadow-2xl lg:shadow-sm flex flex-col relative border-x lg:border border-slate-200 lg:rounded-3xl overflow-hidden lg:col-span-7 xl:col-span-8">
            {/* Banner superior con gradiente de marca */}
            <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Badge superior */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {local.isOpen ? "Abierto hoy" : "Cerrado"}
                </span>
                <span className="text-xs text-white/80 font-medium px-2 py-0.5 rounded bg-white/10 backdrop-blur-md">
                  {selectedDateTime
                    ? "Paso 3: Tus Datos"
                    : selectedService
                      ? "Paso 2: Elige Fecha"
                      : "Paso 1: Elige Servicio"}
                </span>
              </div>
            </div>

            {/* Header con Logo del Local y Datos */}
            <header className="px-5 sm:px-6 pt-0 pb-4 relative -mt-12 lg:-mt-14">
              <div className="flex items-end justify-between">
                {/* Logo o Avatar del local */}
                <div className="relative">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-1 shadow-lg shadow-blue-900/20 ring-4 ring-white flex items-center justify-center text-white overflow-hidden">
                    {local.avatarUrl ? (
                      <img
                        src={local.avatarUrl}
                        alt={local.name}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center">
                        <ScissorsIcon className="w-8 h-8 text-blue-400 mb-0.5" />
                        <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
                          {local.name.slice(0, 3)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full ring-2 ring-white"
                    title="Local Verificado"
                  >
                    <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Calificación y Reseñas */}
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold text-amber-900 shadow-sm">
                  <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{local.rating.toFixed(1)}</span>
                  <span className="text-amber-600 font-normal">({local.reviewCount})</span>
                </div>
              </div>

              {/* Título y descripción */}
              <div className="mt-3 lg:mt-4">
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
                  {local.name}
                </h1>
                <p className="text-sm lg:text-base text-slate-600 mt-1 leading-relaxed">
                  {local.tagline}
                </p>
              </div>

              {/* Información rápida (Dirección, Horarios, Teléfono) */}
              <div className="mt-3 lg:mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{local.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{local.openHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{local.phone}</span>
                </div>
              </div>

              {/* Carrusel de Fotos del Local */}
              {local.imageUrls && local.imageUrls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Galería de fotos
                    </span>
                    <span className="text-xs text-slate-400">
                      {local.imageUrls.length} imágenes
                    </span>
                  </div>
                  <PhotoCarousel images={local.imageUrls} localName={local.name} />
                </div>
              )}
            </header>

            {/* Separador suave */}
            <div className="h-2 bg-slate-100 border-y border-slate-200/60" />

            {/* Sección de Selección de Servicios */}
            <main className="px-5 sm:px-6 pt-4 pb-28 lg:pb-8 flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Servicios disponibles</h2>
                  <p className="text-xs text-slate-500">Toca un servicio para seleccionarlo</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  {filteredServices.length} opciones
                </span>
              </div>

              {/* Buscador de servicios */}
              <div className="relative mb-3">
                <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar corte, barba, combo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filtro por Categorías (Tabs Horizontales) */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Lista de Servicios Clickeables */}
              <div className="space-y-3">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm font-semibold text-slate-700">
                      No se encontraron servicios
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Intenta cambiar de categoría o buscar con otra palabra clave.
                    </p>
                    <button
                      onClick={() => {
                        setActiveCategory("Todos");
                        setSearchQuery("");
                      }}
                      className="mt-3 px-3 py-1 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  filteredServices.map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(isSelected ? null : service.id);
                          setSelectedDateTime(null);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative group flex items-start justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/50 border-blue-600 ring-2 ring-blue-600/30 shadow-md"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        {/* Contenido Izquierdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-sm font-bold truncate ${
                                isSelected ? "text-blue-900" : "text-slate-900"
                              }`}
                            >
                              {service.name}
                            </h3>
                            {service.popular && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Popular
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>

                          <div className="flex items-center gap-3 mt-2.5">
                            {/* Duración */}
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              <ClockIcon className="w-3 h-3 text-slate-500" />
                              {service.duration} min
                            </span>

                            {/* Categoría */}
                            <span className="text-[11px] text-slate-400 font-medium">
                              {service.category}
                            </span>
                          </div>
                        </div>

                        {/* Contenido Derecho: Precio y Selector */}
                        <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                          <span className="text-base font-extrabold text-slate-900">
                            ${service.price.toLocaleString("es-AR")}
                          </span>

                          {/* Indicador de selección */}
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-sm"
                                : "border-slate-300 group-hover:border-slate-400 text-transparent"
                            }`}
                          >
                            <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </main>
          </div>

          {/* ========================================================
              COLUMNA DERECHA: Tarjeta Flotante Sticky de Reserva
              (lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8)
             ======================================================== */}
          <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 p-6 space-y-6">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Tu Reserva</h3>
                  <p className="text-xs text-slate-500">Resumen y confirmación directa</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  {selectedDateTime
                    ? "Paso 3 de 3"
                    : selectedService
                      ? "Paso 2 de 3"
                      : "Paso 1 de 3"}
                </span>
              </div>

              {!selectedService ? (
                /* Estado sin servicio seleccionado */
                <div className="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                    <ScissorsIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Selecciona un servicio</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Elige cualquier opción del catálogo de la izquierda para comenzar a armar tu
                      turno y ver disponibilidad.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span className="text-blue-600 font-semibold">1. Servicio</span>
                    <span>•</span>
                    <span>2. Profesional</span>
                    <span>•</span>
                    <span>3. Horario</span>
                  </div>
                </div>
              ) : (
                /* Estado con servicio seleccionado */
                <div className="space-y-5">
                  {/* Detalle del servicio elegido */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md inline-block mb-1">
                          {selectedService.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {selectedService.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {selectedService.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                          <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                            <ClockIcon className="w-3 h-3 text-slate-400" />
                            {selectedService.duration} min
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-slate-900 block">
                          ${selectedService.price.toLocaleString("es-AR")}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedServiceId(null);
                            setSelectedDateTime(null);
                          }}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline mt-1 cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Selector de Profesional */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Profesional a cargo:</span>
                      {employees.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowEmployeeModal(true)}
                          className="text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    <div
                      onClick={() => {
                        if (employees.length > 0) setShowEmployeeModal(true);
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                        employees.length > 0
                          ? "cursor-pointer hover:border-slate-300 hover:bg-slate-50/70"
                          : ""
                      } ${
                        selectedEmployeeId && selectedEmployeeId !== "general"
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            selectedEmployeeId && selectedEmployeeId !== "general"
                              ? "bg-emerald-200 text-emerald-900"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {selectedEmployeeId && selectedEmployeeId !== "general"
                            ? employees
                                .find((e) => e.id === selectedEmployeeId)
                                ?.firstName?.charAt(0) || "P"
                            : "★"}
                        </div>
                        <div className="truncate text-xs">
                          <div className="font-bold text-slate-900 truncate">
                            {selectedEmployeeId === "general" || !selectedEmployeeId
                              ? "Cualquier profesional"
                              : `${employees.find((e) => e.id === selectedEmployeeId)?.firstName} ${
                                  employees.find((e) => e.id === selectedEmployeeId)?.lastName || ""
                                }`}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {selectedEmployeeId === "general" || !selectedEmployeeId
                              ? "Mayor disponibilidad de turnos"
                              : employees.find((e) => e.id === selectedEmployeeId)?.role ||
                                "Especialista"}
                          </div>
                        </div>
                      </div>
                      {employees.length > 0 && (
                        <span className="text-xs text-slate-400 font-semibold shrink-0">➔</span>
                      )}
                    </div>
                  </div>

                  {/* Selector de Fecha y Horario */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Fecha y Horario:</span>
                      {selectedDateTime && (
                        <button
                          type="button"
                          onClick={() => setShowNextStepModal(true)}
                          className="text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    {selectedDateTime ? (
                      <div
                        onClick={() => setShowNextStepModal(true)}
                        className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-50 transition"
                      >
                        <div className="flex items-center gap-2.5 text-xs text-blue-950">
                          <div className="w-8 h-8 rounded-full bg-blue-200/80 text-blue-700 flex items-center justify-center shrink-0">
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {selectedDateTime.dateFormatted}
                            </div>
                            <div className="text-[11px] text-blue-700 font-semibold">
                              {selectedDateTime.timeSlot} hs
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-blue-400 font-semibold shrink-0">➔</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (employees.length > 0 && !selectedEmployeeId) {
                            setShowEmployeeModal(true);
                          } else {
                            setShowNextStepModal(true);
                          }
                        }}
                        className="w-full p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-600 hover:text-blue-700 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer"
                      >
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        <span>Elegir fecha y horario</span>
                      </button>
                    )}
                  </div>

                  {/* Desglose de Pago */}
                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Duración estimada</span>
                      <span className="font-semibold text-slate-700">
                        {selectedService.duration} min
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Precio del servicio</span>
                      <span className="font-semibold text-slate-700">
                        ${selectedService.price.toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total a abonar</span>
                      <span className="text-base text-blue-600">
                        ${selectedService.price.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>

                  {/* Botón de Confirmación Directo */}
                  <button
                    type="button"
                    onClick={handleProceedBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
                  >
                    <span>{selectedDateTime ? "Confirmar Reserva" : "Elegir Fecha y Horario"}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>

                  {/* Badges de Confianza */}
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Confirmación instantánea</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Cancelación flexible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Pagas directamente en el local</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer branding */}
              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium">
                  Desarrollado con <span className="text-slate-700 font-bold">Saas Turnero</span>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ========================================================
          BARRA FLOTANTE INFERIOR DE ACCIÓN (Mobile Sticky Action Bar)
          Visible únicamente en < lg
         ======================================================== */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] pointer-events-auto">
          {selectedService ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-semibold text-slate-700">Servicio seleccionado:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[170px]">
                    {selectedService.name}
                  </span>
                </div>
                <span className="font-bold text-blue-600 text-sm">
                  ${selectedService.price.toLocaleString("es-AR")}
                </span>
              </div>

              {selectedEmployeeId && (
                <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200/80 rounded-xl px-3 py-2 text-xs text-emerald-900 mt-2">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <span className="truncate">
                      Profesional:{" "}
                      {selectedEmployeeId === "general"
                        ? "Cualquiera"
                        : employees.find((e) => e.id === selectedEmployeeId)?.firstName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmployeeModal(true)}
                    className="font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-700 shrink-0 hover:bg-emerald-50 transition cursor-pointer"
                  >
                    (cambiar)
                  </button>
                </div>
              )}

              {selectedDateTime && (
                <div className="flex items-center justify-between bg-blue-50/90 border border-blue-200/80 rounded-xl px-3 py-2 text-xs text-blue-900">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedDateTime.dateFormatted}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNextStepModal(true)}
                    className="font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200 text-blue-700 shrink-0 hover:bg-blue-50 transition cursor-pointer"
                  >
                    {selectedDateTime.timeSlot} hs (cambiar)
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleProceedBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>
                  {selectedDateTime
                    ? "Completar mis datos para reservar"
                    : "Elegir fecha y horario"}
                </span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500 py-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Selecciona un servicio para habilitar la reserva</span>
              </div>
              <span className="font-semibold text-slate-400">Paso 1 / 3</span>
            </div>
          )}

          {/* Footer branding */}
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400 font-medium">
              Desarrollado con <span className="text-slate-700 font-bold">Saas Turnero</span>
            </span>
          </div>
        </div>
      </footer>

      {/* ========================================================
          MODALES (EmployeeModal, DateTimePickerModal, CustomerBookingModal)
         ======================================================== */}
      {/* Employee Selection Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Selecciona un profesional</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedEmployeeId("general");
                  setShowEmployeeModal(false);
                  setShowNextStepModal(true);
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer"
              >
                <div className="font-bold text-slate-900">Cualquier profesional</div>
                <div className="text-xs text-slate-500">Horarios más flexibles</div>
              </button>
              {employees?.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setSelectedEmployeeId(emp.id);
                    setShowEmployeeModal(false);
                    setShowNextStepModal(true);
                  }}
                  className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer"
                >
                  <div className="font-bold text-slate-900">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{emp.role || "Especialista"}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowEmployeeModal(false)}
              className="mt-5 w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Selección de Fecha y Hora */}
      <DateTimePickerModal
        isOpen={showNextStepModal}
        onClose={() => setShowNextStepModal(false)}
        service={selectedService}
        localId={(local as any).id || local.slug}
        openHours={local.openHours}
        onConfirm={(selection) => {
          setSelectedDateTime(selection);
          setShowNextStepModal(false);
          setShowCustomerModal(true);
        }}
      />

      {/* Modal de Formulario de Cliente y Pantalla de Éxito */}
      <CustomerBookingModal
        isOpen={showCustomerModal}
        onSubmit={handleBookingSubmit}
        onClose={() => setShowCustomerModal(false)}
        service={selectedService}
        selectedDateTime={selectedDateTime}
        localInfo={local}
        localId={(local as any).id || local.slug}
        employeeId={selectedEmployeeId || "general"}
        onBack={() => {
          setShowCustomerModal(false);
          setShowNextStepModal(true);
        }}
      />
    </div>
  );
}

/* ========================================================
    COMPONENTES AUXILIARES
   ======================================================== */

function PhotoCarousel({
  images = [],
  localName = "Local",
}: {
  images?: string[];
  localName?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  const validImages = useMemo(() => {
    return images.filter((img) => Boolean(img && typeof img === "string" && img.trim().length > 0));
  }, [images]);

  if (validImages.length === 0) return null;

  const hasCurrentFailed = failedIndices[currentIndex] || !validImages[currentIndex];
  const allFailed = validImages.every((_, idx) => failedIndices[idx]);

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((c) => (c === 0 ? validImages.length - 1 : c - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((c) => (c === validImages.length - 1 ? 0 : c + 1));
  };

  return (
    <div className="relative w-full h-44 sm:h-52 lg:h-56 rounded-2xl overflow-hidden bg-slate-900 group shadow-inner">
      {hasCurrentFailed || allFailed ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 select-none bg-slate-800">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <StoreIcon className="w-8 h-8 text-indigo-300/60" />
          </div>
          <span className="text-xs text-slate-400 mt-2 font-medium">{localName}</span>
        </div>
      ) : (
        <img
          src={validImages[currentIndex]}
          alt={`${localName} foto ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={() => {
            setFailedIndices((curr) => ({ ...curr, [currentIndex]: true }));
          }}
        />
      )}

      {/* Gradiente sutil para mejorar legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

      {/* Flechas de navegación */}
      {!allFailed && validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Foto anterior"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity backdrop-blur-md z-10 cursor-pointer"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Foto siguiente"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity backdrop-blur-md z-10 cursor-pointer"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>

          {/* Indicadores y Contador */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex gap-1.5 pointer-events-auto">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? "w-5 bg-white shadow-sm"
                      : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Ver foto ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-white/95 bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-md">
              {currentIndex + 1} / {validImages.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/* ========================================================
    ICONOS SVG INLINE
   ======================================================== */

function ScissorsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242 3 3 0 014.242 0L12 12zm0 0L9.121 9.121a3 3 0 10-4.242 4.242 3 3 0 004.242 0L12 12z"
      />
    </svg>
  );
}

function StarIcon({ className = "w-4 h-4", fill }: { className?: string; fill?: string }) {
  return (
    <svg className={className} fill={fill || "currentColor"} viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
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

function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
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

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
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

function StoreIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h18l-2 9H5L3 3zm0 9v9a1 1 0 001 1h16a1 1 0 001-1v-9M9 22V12m6 10V12"
      />
    </svg>
  );
}
