"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { 
  Building2, 
  Search, 
  MoreVertical, 
  Mail, 
  User as UserIcon,
  Calendar,
  AlertCircle
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

const planColors: Record<Plan, { bg: string; text: string; ring: string }> = {
  BASIC: { bg: "bg-gray-50", text: "text-gray-700", ring: "ring-gray-200" },
  PRO: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200" },
  PREMIUM: { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-200" },
};

export default function AdminBusinessesPage() {
  const { token, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const res = await apiFetch<BusinessesResponse>("/admin/businesses?limit=50", {
          token,
        });
        setBusinesses(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch businesses.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [token, authLoading]);

  const handlePlanChange = async (businessId: string, newPlan: Plan) => {
    if (!token) return;
    
    // Optimistic UI update
    const previousBusinesses = [...businesses];
    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, plan: newPlan } : b))
    );
    setUpdatingPlanId(businessId);

    try {
      await apiFetch(`/admin/businesses/${businessId}/plan`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ plan: newPlan }),
      });
    } catch (err: any) {
      // Revert on error
      setBusinesses(previousBusinesses);
      alert(`Failed to update plan: ${err.message}`);
    } finally {
      setUpdatingPlanId(null);
    }
  };

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.owner.email.toLowerCase().includes(search.toLowerCase()) ||
    b.owner.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Locales Registrados</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los negocios, propietarios y planes de suscripción activos.
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Negocio
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                          <div className="ml-4 space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-3 w-24 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-y-2">
                        <div className="h-4 w-28 bg-gray-200 rounded"></div>
                        <div className="h-3 w-36 bg-gray-100 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-8 w-28 bg-gray-200 rounded-md"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-5 w-5 bg-gray-200 rounded-full inline-block"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Building2 className="mx-auto h-12 w-12 text-gray-300" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron negocios</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Intenta ajustar los términos de búsqueda o verifica más tarde.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 group-hover:border-gray-300 transition-colors">
                            <Building2 className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{business.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                              <span className="font-mono text-gray-400">{business.id.split('-')[0]}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <UserIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            {business.owner.name}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            {business.owner.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(business.createdAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-block w-32">
                          <select
                            value={business.plan}
                            onChange={(e) => handlePlanChange(business.id, e.target.value as Plan)}
                            disabled={updatingPlanId === business.id}
                            className={`block w-full appearance-none rounded-md border-0 py-1.5 pl-3 pr-8 text-xs font-medium ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all ${
                              planColors[business.plan].bg
                            } ${planColors[business.plan].text} ${
                              planColors[business.plan].ring
                            } focus:ring-blue-600 ${updatingPlanId === business.id ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                          >
                            <option value="BASIC">BASIC</option>
                            <option value="PRO">PRO</option>
                            <option value="PREMIUM">PREMIUM</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                            <svg className={`h-4 w-4 ${planColors[business.plan].text}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {!loading && businesses.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium text-gray-900">{filteredBusinesses.length}</span> locales
              </div>
              <div className="flex space-x-2">
                <button disabled className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-50 cursor-not-allowed">
                  Anterior
                </button>
                <button disabled className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-50 cursor-not-allowed">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
