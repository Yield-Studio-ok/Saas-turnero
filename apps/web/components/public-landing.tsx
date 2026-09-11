"use client";

import { useState, useMemo } from "react";
import { DateTimePickerModal, type SelectedDateTime } from "./booking/date-time-picker-modal";

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
  name: string;
  slug: string;
  tagline: string;
  address: string;
  phone: string;
  openHours: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
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
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<SelectedDateTime | null>(null);

  const local: LocalInfo = {
    ...DEFAULT_LOCAL,
    ...initialLocal,
    name: initialLocal?.name || (initialSlug ? formatSlugToTitle(initialSlug) : DEFAULT_LOCAL.name),
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

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-900 antialiased">
      {/* Contenedor mobile viewport centrado */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative border-x border-slate-200">
        {/* Banner superior con gradiente de marca */}
        <div className="h-32 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Badge superior */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {local.isOpen ? "Abierto hoy" : "Cerrado"}
            </span>
            <span className="text-xs text-white/80 font-medium px-2 py-0.5 rounded bg-white/10 backdrop-blur-md">
              Paso 1: Elige Servicio
            </span>
          </div>
        </div>

        {/* Header con Logo del Local y Datos */}
        <header className="px-5 pt-0 pb-4 relative -mt-12">
          <div className="flex items-end justify-between">
            {/* Logo del local */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-1 shadow-lg shadow-blue-900/20 ring-4 ring-white flex items-center justify-center text-white">
                <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center">
                  <ScissorsIcon className="w-8 h-8 text-blue-400 mb-0.5" />
                  <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
                    {local.name.slice(0, 3)}
                  </span>
                </div>
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full ring-2 ring-white"
                title="Local Verificado"
              >
                <CheckIcon className="w-3.5 h-3.5" />
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
          <div className="mt-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">{local.name}</h1>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{local.tagline}</p>
          </div>

          {/* Información rápida (Dirección, Horarios, Teléfono) */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
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
        </header>

        {/* Separador suave */}
        <div className="h-2 bg-slate-100 border-y border-slate-200/60" />

        {/* Sección de Selección de Servicios */}
        <main className="px-5 pt-4 pb-28 flex-1">
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
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
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
                <p className="text-sm font-semibold text-slate-700">No se encontraron servicios</p>
                <p className="text-xs text-slate-400 mt-1">
                  Intenta cambiar de categoría o buscar con otra palabra clave.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("Todos");
                    setSearchQuery("");
                  }}
                  className="mt-3 px-3 py-1 text-xs font-semibold text-blue-600 hover:underline"
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
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative group flex items-start justify-between gap-3 ${
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

        {/* Barra Flotante Inferior de Acción (Mobile Sticky Action Bar) */}
        <footer className="fixed bottom-0 max-w-md w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] z-20">
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

              {selectedDateTime && (
                <div className="flex items-center justify-between bg-blue-50/90 border border-blue-200/80 rounded-xl px-3 py-2 text-xs text-blue-900">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedDateTime.dateFormatted}</span>
                  </div>
                  <span className="font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200 text-blue-700 shrink-0">
                    {selectedDateTime.timeSlot} hs
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowNextStepModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>{selectedDateTime ? "Modificar fecha y horario" : "Elegir fecha y horario"}</span>
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
        </footer>

        {/* Modal de Selección de Fecha y Hora (Ticket 25) */}
        <DateTimePickerModal
          isOpen={showNextStepModal}
          onClose={() => setShowNextStepModal(false)}
          service={selectedService}
          onConfirm={(selection) => {
            setSelectedDateTime(selection);
          }}
        />
      </div>
    </div>
  );
}

/* Iconos SVG inline para garantizar compatibilidad total sin dependencias */

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
