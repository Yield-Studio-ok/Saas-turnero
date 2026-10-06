"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { apiFetch } from "../../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  TrendingUp,
  Users,
  CalendarCheck,
  AlertCircle,
  Clock,
  ShoppingBag,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface EmployeeTodayAppointment {
  id: string;
  time: string;
  clientName: string;
  service: string;
  status: "confirmado" | "pendiente" | "completado";
  price: number;
}

const mockEmployeeTodayAppointments: EmployeeTodayAppointment[] = [
  {
    id: "1",
    time: "10:00 - 10:45",
    clientName: "Martín Gómez",
    service: "Corte y Barba",
    status: "completado",
    price: 2500,
  },
  {
    id: "2",
    time: "11:30 - 12:00",
    clientName: "Santiago Benítez",
    service: "Corte Clásico",
    status: "completado",
    price: 1800,
  },
  {
    id: "3",
    time: "14:00 - 14:30",
    clientName: "Lucas Pereyra",
    service: "Perfilado de Barba",
    status: "completado",
    price: 1500,
  },
  {
    id: "4",
    time: "16:30 - 17:15",
    clientName: "Tomás Rossi",
    service: "Corte Premium",
    status: "confirmado",
    price: 2200,
  },
  {
    id: "5",
    time: "18:00 - 18:45",
    clientName: "Juan Ignacio Paz",
    service: "Corte y Color",
    status: "pendiente",
    price: 4500,
  },
];

function EmployeeDashboardHome({ user }: { user: any }) {
  const employeeName = user?.name || (user?.email ? user.email.split("@")[0] : "Empleado");
  const appointments = mockEmployeeTodayAppointments;
  const completedCount = appointments.filter((a) => a.status === "completado").length;
  const pendingCount = appointments.filter((a) => a.status !== "completado").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">¡Hola, {employeeName}! 👋</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
              Portal Empleado
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Este es el resumen de tus citas programadas para el día de hoy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/turnos"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm flex items-center gap-2 text-sm cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Ver Mi Agenda</span>
          </Link>
          <Link
            href="/dashboard/ventas"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition flex items-center gap-2 text-sm cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Venta Mostrador</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards for Employee */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400">Citas de Hoy</span>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{appointments.length}</p>
          <p className="text-xs text-slate-500 mt-1">Asignadas a tu agenda personal</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400">Atendidas</span>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{completedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Citas completadas con éxito</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400">Próximas</span>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-slate-500 mt-1">Pendientes de atención en tu turno</p>
        </div>
      </div>

      {/* Today's Appointments List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Mis Citas del Día</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Listado cronológico de turnos asignados a ti hoy.
            </p>
          </div>
          <Link
            href="/dashboard/turnos"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Abrir Grilla Completa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 text-center shrink-0">
                  <div className="px-2 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold text-xs">
                    {appt.time.split(" - ")[0]}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{appt.clientName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{appt.service}</p>
                  <span className="text-[11px] text-slate-400">Horario: {appt.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className="text-sm font-bold text-slate-700">
                  ${appt.price.toLocaleString("es-AR")}
                </span>
                {appt.status === "completado" ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Completado
                  </span>
                ) : appt.status === "confirmado" ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Confirmado
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Pendiente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState("");

  const isEmployee = user?.role === "employee";

  useEffect(() => {
    if (isEmployee) return;
    if (token) {
      apiFetch("/businesses/my-analytics/data", { token })
        .then((data: any) => setAnalytics(data))
        .catch((err) => setError(err.message));
    }
  }, [token, isEmployee]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (isEmployee) {
    return <EmployeeDashboardHome user={user} />;
  }

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
            ¡Hola, {user?.email || "Usuario"}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Este es el resumen de tu local al día de hoy.</p>
        </div>
        <Link
          href="/dashboard/turnos"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-2"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Nuevo Turno</span>
        </Link>
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
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +12.5%
            </span>
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
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
              -2.4%
            </span>
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
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              +42
            </span>
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
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "#F1F5F9" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
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
