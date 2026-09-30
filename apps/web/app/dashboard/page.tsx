"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { apiFetch } from "../../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      apiFetch("/businesses/my-analytics/data", { token })
        .then((data: any) => setAnalytics(data))
        .catch((err) => setError(err.message));
    }
  }, [token]);

  if (loading) return <div>Cargando...</div>;

  const chartData = analytics
    ? [
        { name: "Completados", turnos: analytics.totalAppointments - analytics.noShowAppointments },
        { name: "No Show", turnos: analytics.noShowAppointments },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Banner Principal con Botón Nuevo Turno */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
            Gestión Rápida
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bienvenido al Panel de Control
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mt-1">
            Administra tus reservas, visualiza métricas y registra nuevos clientes en tiempo real.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link
            href="/dashboard/turnos"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nuevo Turno
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Sesión activa como: <strong className="text-gray-700">{user?.email}</strong>
        </p>
      </div>

      {error && <p className="text-red-500 mt-2">Error cargando analíticas: {error}</p>}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Facturación del Mes</h2>
          <p className="text-3xl font-bold text-green-600">
            ${analytics?.totalRevenue?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Tasa de Ausentismo</h2>
          <p className="text-3xl font-bold text-red-600">
            {analytics?.absenteeismRate?.toFixed(1) || "0.0"}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Turnos</h2>
          <p className="text-3xl font-bold text-blue-600">{analytics?.totalAppointments || 0}</p>
        </div>
      </div>

      {analytics && analytics.totalAppointments > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-100 h-80">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Turnos: Completados vs Ausentes
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="turnos" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
