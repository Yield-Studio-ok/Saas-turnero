"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { apiFetch } from "../../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, CalendarCheck, AlertCircle } from "lucide-react";

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

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const chartData = analytics
    ? [
        { name: "Completados", turnos: analytics.totalAppointments - analytics.noShowAppointments },
        { name: "No Show", turnos: analytics.noShowAppointments },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            ¡Hola, {user?.displayName || "Usuario"}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Este es el resumen de tu local al día de hoy.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4" />
          <span>Nuevo Turno</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Error cargando analíticas</p>
            <p className="text-sm mt-1 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <h2 className="text-sm font-semibold text-slate-500 mb-1">Facturación del Mes</h2>
          <p className="text-3xl font-bold text-slate-800">
            ${analytics?.totalRevenue?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">-2.4%</span>
          </div>
          <h2 className="text-sm font-semibold text-slate-500 mb-1">Tasa de Ausentismo</h2>
          <p className="text-3xl font-bold text-slate-800">
            {analytics?.absenteeismRate?.toFixed(1) || "0.0"}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+42</span>
          </div>
          <h2 className="text-sm font-semibold text-slate-500 mb-1">Total Turnos</h2>
          <p className="text-3xl font-bold text-slate-800">{analytics?.totalAppointments || 0}</p>
        </div>
      </div>

      {/* Chart Section */}
      {analytics && analytics.totalAppointments > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-96 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Turnos: Completados vs Ausentes</h2>
            <p className="text-sm text-slate-500">Resumen de la asistencia de tus clientes</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="turnos" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
