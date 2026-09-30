"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const MONTHLY_FINANCIAL_DATA = [
  { mes: "Ene", ingresos: 4200, gastos: 2100, beneficio: 2100 },
  { mes: "Feb", ingresos: 5100, gastos: 2300, beneficio: 2800 },
  { mes: "Mar", ingresos: 6200, gastos: 2800, beneficio: 3400 },
  { mes: "Abr", ingresos: 5800, gastos: 2600, beneficio: 3200 },
  { mes: "May", ingresos: 7400, gastos: 3100, beneficio: 4300 },
  { mes: "Jun", ingresos: 8900, gastos: 3400, beneficio: 5500 },
  { mes: "Jul", ingresos: 9400, gastos: 3800, beneficio: 5600 },
  { mes: "Ago", ingresos: 8800, gastos: 3500, beneficio: 5300 },
  { mes: "Sep", ingresos: 10200, gastos: 4100, beneficio: 6100 },
];

export default function DashboardFinanzasPage() {
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const totalIngresos = MONTHLY_FINANCIAL_DATA.reduce((acc, curr) => acc + curr.ingresos, 0);
  const totalGastos = MONTHLY_FINANCIAL_DATA.reduce((acc, curr) => acc + curr.gastos, 0);
  const margenNeto = (((totalIngresos - totalGastos) / totalIngresos) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panel Financiero</h2>
          <p className="text-gray-500 text-sm mt-1">
            Supervisión interactiva de flujo de caja, ingresos por servicios y costos operativos.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setChartType("area")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartType === "area"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Área Fluida
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartType === "bar"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Barras Comparativas
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Ingresos Totales (YTD)
          </span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            ${totalIngresos.toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">
            ↑ +18.4% vs periodo anterior
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Gastos Operativos (YTD)
          </span>
          <p className="text-3xl font-extrabold text-rose-600 mt-2">
            ${totalGastos.toLocaleString()}
          </p>
          <span className="text-xs text-gray-500 mt-1 inline-block">
            Insumos, comisiones y alquiler
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Margen Neto Operativo
          </span>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{margenNeto}%</p>
          <span className="text-xs text-blue-600 font-medium mt-1 inline-block">
            Rentabilidad sólida
          </span>
        </div>
      </div>

      {/* Gráfico Interactivo de Ingresos vs Gastos */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Evolución de Ingresos vs Gastos</h3>
            <p className="text-xs text-gray-500">
              Comparativa mensual simulada de rendimiento económico
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart
                data={MONTHLY_FINANCIAL_DATA}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, ""]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="gastos"
                  name="Gastos"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorGastos)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={MONTHLY_FINANCIAL_DATA}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, ""]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend />
                <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
