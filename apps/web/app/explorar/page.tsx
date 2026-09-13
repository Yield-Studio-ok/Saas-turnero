"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { Search, MapPin, Star, Scissors } from "lucide-react";
import type { LocalInfo } from "@/components/public-landing";

export default function ExplorarPage() {
  const [businesses, setBusinesses] = useState<LocalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadDirectory() {
      try {
        const data = await apiFetch<LocalInfo[]>("/business/public");
        setBusinesses(data || []);
      } catch (err) {
        console.error("Error fetching directory:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        (b.tagline && b.tagline.toLowerCase().includes(q))
      );
    });
  }, [businesses, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 antialiased font-sans">
      {/* Header / Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-16 px-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Encuentra tu próximo look
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
            Reserva turnos en las mejores barberías y salones de belleza de tu zona.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-full border-none ring-4 ring-white/10 bg-white/10 backdrop-blur-md text-white placeholder-slate-300 focus:ring-white/30 focus:bg-white/20 transition-all text-lg shadow-2xl"
              placeholder="Buscar por nombre, servicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <main className="max-w-5xl mx-auto px-5 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Locales Destacados</h2>
          <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {filtered.length} resultados
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-700 mb-2">No se encontraron locales</h3>
            <p className="text-slate-500">Intenta con otra búsqueda.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full font-medium transition"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((business) => (
              <Link
                key={business.slug}
                href={`/${business.slug}`}
                className="group block bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col"
              >
                {/* Card Image Area (Placeholder gradient) */}
                <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-100 relative group-hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute top-3 left-3 flex gap-2">
                    {business.isOpen ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                        Abierto
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                        Cerrado
                      </span>
                    )}
                  </div>
                  {/* Avatar Icon */}
                  <div className="absolute -bottom-6 left-5 w-16 h-16 rounded-2xl bg-white p-1 shadow-lg border border-slate-100">
                    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white">
                       <Scissors className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 pt-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {business.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {business.rating ? (Number(business.rating)).toFixed(1) : "5.0"}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                    {business.tagline || "Servicios de peluquería y estética."}
                  </p>

                  <div className="mt-auto space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{business.address || "Dirección no especificada"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
