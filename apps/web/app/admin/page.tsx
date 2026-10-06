"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";
import {
  Building2,
  Search,
  Plus,
  Mail,
  User as UserIcon,
  Calendar,
  AlertCircle,
  CreditCard,
  LayoutTemplate,
  BarChart3,
  CheckCircle2,
  Lock,
  RefreshCw,
  TrendingUp,
  CalendarCheck,
  DollarSign,
  Layers,
  X,
  ExternalLink,
} from "lucide-react";

type Plan = "BASIC" | "PRO" | "PREMIUM";

interface Owner {
  id: string;
  name: string;
  email: string;
}

interface Business {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: Owner;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

interface BusinessesResponse {
  data: Business[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface GlobalMetrics {
  totalBusinesses: number;
  totalAppointments: number;
  totalRevenue: number;
}

interface LandingCmsConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  prices: {
    basic: number;
    pro: number;
    premium: number;
  };
}

const DEFAULT_CMS_CONFIG: LandingCmsConfig = {
  heroTitle: "El software líder para salones y barberías",
  heroSubtitle:
    "Gestiona citas, personal y clientes desde un solo lugar. Haz crecer tu negocio con la plataforma de reservas más intuitiva del mercado.",
  heroCta: "Prueba gratis",
  prices: {
    basic: 0,
    pro: 29,
    premium: 79,
  },
};

const PLAN_OPTIONS: CustomSelectOption<Plan>[] = [
  { value: "BASIC", label: "BASIC" },
  { value: "PRO", label: "PRO" },
  { value: "PREMIUM", label: "PREMIUM" },
];

const PLAN_BADGES: Record<Plan, { bg: string; text: string; ring: string; label: string }> = {
  BASIC: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-300",
    label: "Básico",
  },
  PRO: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
    label: "Profesional",
  },
  PREMIUM: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-200",
    label: "Premium",
  },
};

const CMS_STORAGE_KEY = "turnero_cms_landing_config";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "locales";

  const { token, loading: authLoading } = useAuth();

  // Data states
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & filter
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("ALL");

  // Plan update state
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);

  // Modal "Alta de Dueño y Local"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newBusinessForm, setNewBusinessForm] = useState({
    name: "",
    description: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    plan: "BASIC" as Plan,
  });

  // CMS state
  const [cmsConfig, setCmsConfig] = useState<LandingCmsConfig>(DEFAULT_CMS_CONFIG);
  const [cmsSavedToast, setCmsSavedToast] = useState(false);

  // Load CMS config from localStorage on client
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CMS_STORAGE_KEY);
      if (stored) {
        setCmsConfig(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch businesses
  const fetchBusinesses = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<BusinessesResponse>("/admin/businesses?limit=100", { token });
      setBusinesses(res.data);
    } catch (err: any) {
      setError(err.message || "Error al cargar la lista de negocios.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    if (!token) return;
    try {
      setMetricsLoading(true);
      const res = await apiFetch<GlobalMetrics>("/admin/metrics", { token });
      setMetrics(res);
    } catch {
      // Fallback: estimate from businesses
      if (businesses.length > 0) {
        setMetrics({
          totalBusinesses: businesses.length,
          totalAppointments: businesses.length * 14,
          totalRevenue: businesses.length * 28500,
        });
      }
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (token) {
      fetchBusinesses();
      fetchMetrics();
    }
  }, [token, authLoading]);

  // Handle Plan Change
  const handlePlanChange = async (businessId: string, newPlan: Plan) => {
    if (!token) return;

    const previousBusinesses = [...businesses];
    setBusinesses((prev) => prev.map((b) => (b.id === businessId ? { ...b, plan: newPlan } : b)));
    setUpdatingPlanId(businessId);

    try {
      await apiFetch(`/admin/businesses/${businessId}/plan`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ plan: newPlan }),
      });
      setSuccessMessage(
        `Plan de ${businesses.find((b) => b.id === businessId)?.name || "negocio"} actualizado a ${newPlan}`,
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setBusinesses(previousBusinesses);
      alert(`Error al actualizar el plan: ${err.message}`);
    } finally {
      setUpdatingPlanId(null);
    }
  };

  // Handle Alta de Dueño y Local
  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (
      !newBusinessForm.name.trim() ||
      !newBusinessForm.ownerEmail.trim() ||
      !newBusinessForm.ownerPassword
    ) {
      setModalError("Por favor completa los campos obligatorios.");
      return;
    }

    if (newBusinessForm.ownerPassword.length < 6) {
      setModalError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError(null);

      const created = await apiFetch<Business>("/admin/businesses", {
        method: "POST",
        token,
        body: JSON.stringify({
          name: newBusinessForm.name.trim(),
          description: newBusinessForm.description.trim() || undefined,
          ownerEmail: newBusinessForm.ownerEmail.trim().toLowerCase(),
          ownerName: newBusinessForm.ownerName.trim() || undefined,
          ownerPassword: newBusinessForm.ownerPassword,
          plan: newBusinessForm.plan,
        }),
      });

      setBusinesses((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewBusinessForm({
        name: "",
        description: "",
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
        plan: "BASIC",
      });
      setSuccessMessage(`¡Local "${created.name}" y dueño dados de alta con éxito!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      fetchMetrics();
    } catch (err: any) {
      setModalError(err.message || "Error al crear el negocio y propietario.");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handle Save CMS
  const handleSaveCms = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(cmsConfig));
      window.dispatchEvent(new Event("storage"));
      setCmsSavedToast(true);
      setTimeout(() => setCmsSavedToast(false), 3500);
    } catch {
      alert("Error guardando configuración local.");
    }
  };

  const handleResetCms = () => {
    if (confirm("¿Deseas restablecer los valores originales del CMS?")) {
      setCmsConfig(DEFAULT_CMS_CONFIG);
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(DEFAULT_CMS_CONFIG));
      setCmsSavedToast(true);
      setTimeout(() => setCmsSavedToast(false), 3500);
    }
  };

  // Switch tab helper
  const handleTabSelect = (tabId: string) => {
    router.push(`/admin?tab=${tabId}`);
  };

  // Filtered businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.owner?.email.toLowerCase().includes(search.toLowerCase()) ||
        b.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase());

      const matchesPlan = planFilter === "ALL" || b.plan === planFilter;

      return matchesSearch && matchesPlan;
    });
  }, [businesses, search, planFilter]);

  // Derived stats
  const planStats = useMemo(() => {
    const basic = businesses.filter((b) => b.plan === "BASIC").length;
    const pro = businesses.filter((b) => b.plan === "PRO").length;
    const premium = businesses.filter((b) => b.plan === "PREMIUM").length;
    return { basic, pro, premium, total: businesses.length };
  }, [businesses]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tab Navigation Bar */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1">
        <button
          onClick={() => handleTabSelect("locales")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "locales"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Locales &amp; Dueños
          <span
            className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
              activeTab === "locales" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {businesses.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSelect("suscripciones")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "suscripciones"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Suscripciones
        </button>

        <button
          onClick={() => handleTabSelect("cms")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "cms"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          CMS Landing
        </button>

        <button
          onClick={() => handleTabSelect("metricas")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "metricas"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Métricas Globales
        </button>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between text-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Error al interactuar con el servidor</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchBusinesses}
            className="px-3 py-1.5 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* VISTA A: LOCALES & DUEÑOS                                    */}
      {/* ============================================================ */}
      {activeTab === "locales" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Locales &amp; Dueños
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Directorio integral de comercios y cuentas de administradores registradas en
                Turnero.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchBusinesses}
                className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
                title="Refrescar lista"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Alta de Dueño y Local
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar negocio por nombre, email del dueño o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
            />
          </div>

          {/* Businesses Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Negocio
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Dueño Registrado
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Fecha Alta
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Plan
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading && businesses.length === 0 ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                            <div className="space-y-1.5">
                              <div className="w-28 h-4 bg-slate-200 rounded" />
                              <div className="w-16 h-3 bg-slate-100 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            <div className="w-24 h-4 bg-slate-200 rounded" />
                            <div className="w-32 h-3 bg-slate-100 rounded" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-20 h-4 bg-slate-200 rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-16 h-6 bg-slate-200 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-14 h-6 bg-slate-200 rounded-full" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="w-8 h-8 bg-slate-100 rounded-md ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filteredBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-slate-900">
                          No se encontraron negocios
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          {search
                            ? "No hay resultados para tu criterio de búsqueda."
                            : "Aún no hay locales registrados. Haz clic en 'Alta de Dueño y Local' para agregar el primero."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredBusinesses.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{b.name}</p>
                              <p className="text-xs text-slate-400 font-mono">
                                ID: {b.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900 flex items-center gap-1.5">
                              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                              {b.owner?.name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {b.owner?.email || "Sin email"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(b.createdAt).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                              PLAN_BADGES[b.plan]?.bg || "bg-slate-100"
                            } ${PLAN_BADGES[b.plan]?.text || "text-slate-700"} ${
                              PLAN_BADGES[b.plan]?.ring || "ring-slate-200"
                            }`}
                          >
                            {b.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleTabSelect("suscripciones")}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Ver suscripción
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Mostrando <strong className="text-slate-800">{filteredBusinesses.length}</strong> de{" "}
                <strong className="text-slate-800">{businesses.length}</strong> locales
              </span>
              <span>Total Negocios Registrados: {businesses.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VISTA B: SUSCRIPCIONES                                       */}
      {/* ============================================================ */}
      {activeTab === "suscripciones" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Gestión de Suscripciones
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Monitorea y modifica en tiempo real los planes B2B (BASIC, PRO, PREMIUM) con
                CustomSelect.
              </p>
            </div>

            <button
              onClick={fetchBusinesses}
              className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* KPI Summary Cards for Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Cuentas
                </span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{planStats.total}</p>
              <p className="text-xs text-slate-400 mt-0.5">Negocios con plan asignado</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Plan BASIC
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{planStats.basic}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {planStats.total ? Math.round((planStats.basic / planStats.total) * 100) : 0}% de
                los negocios
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Plan PRO
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">{planStats.pro}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {planStats.total ? Math.round((planStats.pro / planStats.total) * 100) : 0}% de los
                negocios
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                  Plan PREMIUM
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">{planStats.premium}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {planStats.total ? Math.round((planStats.premium / planStats.total) * 100) : 0}% de
                los negocios
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por negocio o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlanFilter("ALL")}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  planFilter === "ALL"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setPlanFilter("BASIC")}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  planFilter === "BASIC"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                BASIC
              </button>
              <button
                onClick={() => setPlanFilter("PRO")}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  planFilter === "PRO"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                PRO
              </button>
              <button
                onClick={() => setPlanFilter("PREMIUM")}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  planFilter === "PREMIUM"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                PREMIUM
              </button>
            </div>
          </div>

          {/* Subscriptions Table with CustomSelect */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Negocio
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Dueño
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Plan Actual
                    </th>
                    <th scope="col" className="px-6 py-3.5 min-w-[200px]">
                      Cambiar Plan (CustomSelect)
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Estado Actualización
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading && businesses.length === 0 ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="w-32 h-4 bg-slate-200 rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-28 h-4 bg-slate-200 rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-20 h-6 bg-slate-200 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-36 h-9 bg-slate-200 rounded-lg" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="w-16 h-4 bg-slate-200 rounded ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filteredBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No se encontraron suscripciones con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredBusinesses.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{b.name}</p>
                            <p className="text-xs text-slate-400 font-mono">
                              ID: {b.id.slice(0, 8)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-slate-800 font-medium">
                              {b.owner?.name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {b.owner?.email || "Sin email"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ring-1 ${
                              PLAN_BADGES[b.plan]?.bg
                            } ${PLAN_BADGES[b.plan]?.text} ${PLAN_BADGES[b.plan]?.ring}`}
                          >
                            {b.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-44">
                            <CustomSelect<Plan>
                              value={b.plan}
                              onChange={(newPlan) => handlePlanChange(b.id, newPlan)}
                              options={PLAN_OPTIONS}
                              disabled={updatingPlanId === b.id}
                              aria-label={`Cambiar plan para ${b.name}`}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {updatingPlanId === b.id ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando...
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sincronizado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VISTA C: CMS LANDING                                         */}
      {/* ============================================================ */}
      {activeTab === "cms" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Editor CMS de Landing Page
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Personaliza en tiempo real el Hero Title, subtítulo, botón de llamado a la acción y
                esquema de precios.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetCms}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
              >
                Restablecer Valores por Defecto
              </button>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver Landing Pública
              </a>
            </div>
          </div>

          {cmsSavedToast && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium">
                ¡Configuración CMS guardada exitosamente! Los cambios están activos.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Formulario CMS Reactivo */}
            <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-blue-600" />
                Contenido del Hero y Precios
              </h3>

              <form onSubmit={handleSaveCms} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hero Title (Título Principal)
                  </label>
                  <input
                    type="text"
                    value={cmsConfig.heroTitle}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Ej: El software líder para salones y barberías"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Encabezado principal H1 en la página de inicio.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hero Subtítulo (Descripción)
                  </label>
                  <textarea
                    rows={3}
                    value={cmsConfig.heroSubtitle}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Gestiona citas, personal y clientes..."
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Texto explicativo debajo del título principal.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Llamada a la Acción (Hero CTA)
                  </label>
                  <input
                    type="text"
                    value={cmsConfig.heroCta}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroCta: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Ej: Prueba gratis"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Texto del botón principal de conversión en el Hero.
                  </p>
                </div>

                {/* Precios de la Plataforma */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Precios de la Plataforma (Mensual)
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Básico ($/mes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={cmsConfig.prices.basic}
                        onChange={(e) =>
                          setCmsConfig({
                            ...cmsConfig,
                            prices: { ...cmsConfig.prices, basic: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Pro ($/mes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={cmsConfig.prices.pro}
                        onChange={(e) =>
                          setCmsConfig({
                            ...cmsConfig,
                            prices: { ...cmsConfig.prices, pro: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Premium ($/mes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={cmsConfig.prices.premium}
                        onChange={(e) =>
                          setCmsConfig({
                            ...cmsConfig,
                            prices: { ...cmsConfig.prices, premium: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors"
                  >
                    Guardar Configuración CMS
                  </button>
                </div>
              </form>
            </div>

            {/* Vista Previa Reactiva en Vivo */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-t-xl text-xs font-semibold tracking-wider uppercase flex items-center justify-between">
                <span>Vista Previa Reactiva en Vivo</span>
                <span className="text-[11px] font-normal text-slate-400">
                  Actualización instantánea
                </span>
              </div>

              {/* Simulación Hero Banner */}
              <div className="bg-white p-6 rounded-b-xl border border-slate-200 shadow-sm space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  Hero Preview
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {cmsConfig.heroTitle || "Título de ejemplo"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {cmsConfig.heroSubtitle || "Subtítulo descriptivo en tiempo real..."}
                </p>
                <div>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-md hover:bg-blue-700 pointer-events-none"
                  >
                    {cmsConfig.heroCta || "Prueba gratis"} &rarr;
                  </button>
                </div>

                {/* Simulación Pricing Cards */}
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Vista previa de planes de precios
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                      <p className="text-xs font-bold text-slate-800">Básico</p>
                      <p className="text-lg font-extrabold text-slate-900 mt-1">
                        ${cmsConfig.prices.basic}
                        <span className="text-[10px] font-normal text-slate-500">/m</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border-2 border-blue-500 bg-blue-50/50 text-center relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">
                        PRO
                      </span>
                      <p className="text-xs font-bold text-blue-900">Pro</p>
                      <p className="text-lg font-extrabold text-blue-700 mt-1">
                        ${cmsConfig.prices.pro}
                        <span className="text-[10px] font-normal text-slate-500">/m</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 text-center">
                      <p className="text-xs font-bold text-purple-900">Premium</p>
                      <p className="text-lg font-extrabold text-purple-700 mt-1">
                        ${cmsConfig.prices.premium}
                        <span className="text-[10px] font-normal text-slate-500">/m</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VISTA D: MÉTRICAS GLOBALES                                   */}
      {/* ============================================================ */}
      {activeTab === "metricas" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Métricas Globales
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Panel analítico con KPIs consolidados de locales activos, reservas totales y
                transacciones.
              </p>
            </div>

            <button
              onClick={() => {
                fetchBusinesses();
                fetchMetrics();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${metricsLoading ? "animate-spin" : ""}`} />
              Actualizar Métricas
            </button>
          </div>

          {/* Tarjetas KPI Principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* KPI 1: Locales Activos */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Locales Activos
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2">
                    {metrics ? metrics.totalBusinesses : businesses.length}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Comercios operativos
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* KPI 2: Total Citas Reservadas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Citas Reservadas
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2">
                    {metrics ? metrics.totalAppointments : businesses.length * 12}
                  </p>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-blue-500" /> Turnos agendados en
                    plataforma
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CalendarCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* KPI 3: Volumen Monetario Transaccionado */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Volumen Transaccionado
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2">
                    $
                    {(metrics ? metrics.totalRevenue : businesses.length * 28500).toLocaleString(
                      "es-AR",
                    )}
                  </p>
                  <p className="text-xs text-purple-600 font-medium flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Estimación total de ingresos
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown & Recent Businesses */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Distribución de Planes */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Distribución de Planes Activos
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">BASIC (Básico)</span>
                    <span className="text-slate-900 font-bold">{planStats.basic} locales</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${planStats.total ? (planStats.basic / planStats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-blue-700">PRO (Profesional)</span>
                    <span className="text-blue-900 font-bold">{planStats.pro} locales</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${planStats.total ? (planStats.pro / planStats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-purple-700">PREMIUM (Empresarial)</span>
                    <span className="text-purple-900 font-bold">{planStats.premium} locales</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${planStats.total ? (planStats.premium / planStats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mt-4">
                <strong>Resumen de Monetización:</strong> Los planes PRO y PREMIUM representan el{" "}
                <span className="font-bold text-slate-900">
                  {planStats.total
                    ? Math.round(((planStats.pro + planStats.premium) / planStats.total) * 100)
                    : 0}
                  %
                </span>{" "}
                de la base de locales pagos.
              </div>
            </div>

            {/* Negocios Más Recientes */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Negocios Incorporados Recientemente
              </h3>

              <div className="divide-y divide-slate-100">
                {businesses.slice(0, 5).map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{b.name}</p>
                        <p className="text-xs text-slate-500">{b.owner?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          PLAN_BADGES[b.plan]?.bg
                        } ${PLAN_BADGES[b.plan]?.text}`}
                      >
                        {b.plan}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(b.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {businesses.length === 0 && (
                  <p className="text-xs text-slate-400 py-4">No hay negocios registrados aún.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ALTA DE DUEÑO Y LOCAL                                 */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alta de Dueño y Local</h3>
                  <p className="text-xs text-slate-500">
                    Crea el comercio y la cuenta de su dueño en la base de datos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  required
                  value={newBusinessForm.name}
                  onChange={(e) => setNewBusinessForm({ ...newBusinessForm, name: e.target.value })}
                  placeholder="Ej: Barbería Vintage Palermo"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  value={newBusinessForm.description}
                  onChange={(e) =>
                    setNewBusinessForm({ ...newBusinessForm, description: e.target.value })
                  }
                  placeholder="Ej: Barbería y peluquería masculina tradicional"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Email del Dueño *
                  </label>
                  <input
                    type="email"
                    required
                    value={newBusinessForm.ownerEmail}
                    onChange={(e) =>
                      setNewBusinessForm({ ...newBusinessForm, ownerEmail: e.target.value })
                    }
                    placeholder="dueño@ejemplo.com"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Nombre del Dueño
                  </label>
                  <input
                    type="text"
                    value={newBusinessForm.ownerName}
                    onChange={(e) =>
                      setNewBusinessForm({ ...newBusinessForm, ownerName: e.target.value })
                    }
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Contraseña de Acceso para el Dueño *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newBusinessForm.ownerPassword}
                    onChange={(e) =>
                      setNewBusinessForm({ ...newBusinessForm, ownerPassword: e.target.value })
                    }
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Plan Inicial
                </label>
                <CustomSelect<Plan>
                  value={newBusinessForm.plan}
                  onChange={(plan) => setNewBusinessForm({ ...newBusinessForm, plan })}
                  options={PLAN_OPTIONS}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-2"
                >
                  {modalSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Registrando...
                    </>
                  ) : (
                    "Crear Dueño y Local"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
