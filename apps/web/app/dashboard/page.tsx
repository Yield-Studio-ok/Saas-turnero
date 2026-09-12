"use client";

import { useEffect, useState } from "react";
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Bienvenido, {user?.email}</p>

      {error && <p className="text-red-500 mt-4">Error cargando analíticas: {error}</p>}

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
