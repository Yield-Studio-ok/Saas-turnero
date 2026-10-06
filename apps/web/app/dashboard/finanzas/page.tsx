"use client";

import React, { useState, useMemo } from "react";
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
import {
  TrendingUp,
  Printer,
  PlusCircle,
  Award,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";
import { GastoModal, NuevoGastoData } from "@/components/gasto-modal";
import { useAuth } from "@/lib/auth-context";

export type PeriodKey = "mes-actual" | "primera-semana" | "trimestre" | "anio";

interface FinancialMovement {
  id: string;
  fecha: string;
  concepto: string;
  tipo: "INGRESO" | "EGRESO";
  categoria: string;
  monto: number;
  comprobante?: string;
  periodo: PeriodKey;
}

const PERIOD_OPTIONS: CustomSelectOption[] = [
  { value: "mes-actual", label: "Mes en curso (Octubre)" },
  { value: "primera-semana", label: "Última semana" },
  { value: "trimestre", label: "Último trimestre (Q3-Q4)" },
  { value: "anio", label: "Año completo (2026)" },
];

// Movimientos base iniciales
const INITIAL_MOVEMENTS: FinancialMovement[] = [
  // Mes en curso
  {
    id: "mov-1",
    fecha: "2026-10-06",
    concepto: "Corte Clásico + Barba (Pack Premium)",
    tipo: "INGRESO",
    categoria: "Servicios",
    monto: 3500,
    periodo: "mes-actual",
  },
  {
    id: "mov-2",
    fecha: "2026-10-05",
    concepto: "Compra mayorista de tinturas y oxidantes",
    tipo: "EGRESO",
    categoria: "Insumos",
    monto: 48000,
    comprobante: "FAC-B-0021",
    periodo: "mes-actual",
  },
  {
    id: "mov-3",
    fecha: "2026-10-05",
    concepto: "Coloración Balayage + Tratamiento Botox",
    tipo: "INGRESO",
    categoria: "Servicios",
    monto: 16500,
    periodo: "mes-actual",
  },
  {
    id: "mov-4",
    fecha: "2026-10-04",
    concepto: "Venta de 3x Cera Modeladora Mate",
    tipo: "INGRESO",
    categoria: "Productos",
    monto: 5400,
    periodo: "mes-actual",
  },
  {
    id: "mov-5",
    fecha: "2026-10-03",
    concepto: "Pago de Alquiler de Local y Expensas",
    tipo: "EGRESO",
    categoria: "Alquiler",
    monto: 150000,
    comprobante: "REC-LOC-1026",
    periodo: "mes-actual",
  },
  {
    id: "mov-6",
    fecha: "2026-10-02",
    concepto: "Corte y Peinado Especial de Novia",
    tipo: "INGRESO",
    categoria: "Servicios",
    monto: 12000,
    periodo: "mes-actual",
  },
  {
    id: "mov-7",
    fecha: "2026-10-01",
    concepto: "Servicio de Internet Fibra Óptica y Software",
    tipo: "EGRESO",
    categoria: "Servicios",
    monto: 18500,
    comprobante: "FAC-TELECOM-99",
    periodo: "mes-actual",
  },

  // Semana
  {
    id: "mov-w1",
    fecha: "2026-10-06",
    concepto: "Corte Degradé + Lavado",
    tipo: "INGRESO",
    categoria: "Servicios",
    monto: 2800,
    periodo: "primera-semana",
  },
  {
    id: "mov-w2",
    fecha: "2026-10-05",
    concepto: "Compra de toallas descartables y alcohol",
    tipo: "EGRESO",
    categoria: "Insumos",
    monto: 12500,
    periodo: "primera-semana",
  },
  {
    id: "mov-w3",
    fecha: "2026-10-04",
    concepto: "Pack 2x Cera Modeladora + Shampoo",
    tipo: "INGRESO",
    categoria: "Productos",
    monto: 6100,
    periodo: "primera-semana",
  },
  {
    id: "mov-w4",
    fecha: "2026-10-03",
    concepto: "Coloración Completa y Nutrición",
    tipo: "INGRESO",
    categoria: "Servicios",
    monto: 9800,
    periodo: "primera-semana",
  },

  // Trimestre
  {
    id: "mov-q1",
    fecha: "2026-09-28",
    concepto: "Comisiones y Sueldos Personal Septiembre",
    tipo: "EGRESO",
    categoria: "Comisiones",
    monto: 290000,
    periodo: "trimestre",
  },
  {
    id: "mov-q2",
    fecha: "2026-09-25",
    concepto: "Mantenimiento y Afilado de Tijeras / Máquinas",
    tipo: "EGRESO",
    categoria: "Mantenimiento",
    monto: 24000,
    periodo: "trimestre",
  },
  {
    id: "mov-q3",
    fecha: "2026-09-20",
    concepto: "Facturación masiva por turnos quincenales",
    tipo: "INGRESO",
    categoria: "Servicios",
    monto: 345000,
    periodo: "trimestre",
  },
  {
    id: "mov-q4",
    fecha: "2026-08-30",
    concepto: "Campaña y stock de productos capilares",
    tipo: "INGRESO",
    categoria: "Productos",
    monto: 98000,
    periodo: "trimestre",
  },

  // Año
  {
    id: "mov-y1",
    fecha: "2026-06-15",
    concepto: "Inversión renovación de sillones de barbero",
    tipo: "EGRESO",
    categoria: "Mantenimiento",
    monto: 450000,
    periodo: "anio",
  },
  {
    id: "mov-y2",
    fecha: "2026-07-20",
    concepto: "Récord de turnos vacaciones de invierno",
    tipo: "INGRESO",
    categoria: "Servicios",
    monto: 780000,
    periodo: "anio",
  },
];

// Datos de Recharts por período
const PERIOD_CHARTS: Record<
  PeriodKey,
  { label: string; ingresos: number; gastos: number; beneficio: number }[]
> = {
  "mes-actual": [
    { label: "Semana 1", ingresos: 48000, gastos: 22000, beneficio: 26000 },
    { label: "Semana 2", ingresos: 62000, gastos: 28000, beneficio: 34000 },
    { label: "Semana 3", ingresos: 71000, gastos: 31000, beneficio: 40000 },
    { label: "Semana 4", ingresos: 89000, gastos: 37000, beneficio: 52000 },
  ],
  "primera-semana": [
    { label: "Lun", ingresos: 9500, gastos: 3200, beneficio: 6300 },
    { label: "Mar", ingresos: 12400, gastos: 4100, beneficio: 8300 },
    { label: "Mié", ingresos: 14200, gastos: 5000, beneficio: 9200 },
    { label: "Jue", ingresos: 16800, gastos: 4800, beneficio: 12000 },
    { label: "Vie", ingresos: 21500, gastos: 7400, beneficio: 14100 },
    { label: "Sáb", ingresos: 26000, gastos: 8900, beneficio: 17100 },
  ],
  trimestre: [
    { label: "Agosto", ingresos: 265000, gastos: 110000, beneficio: 155000 },
    { label: "Septiembre", ingresos: 310000, gastos: 135000, beneficio: 175000 },
    { label: "Octubre", ingresos: 270000, gastos: 118000, beneficio: 152000 },
  ],
  anio: [
    { label: "Ene", ingresos: 195000, gastos: 92000, beneficio: 103000 },
    { label: "Feb", ingresos: 210000, gastos: 98000, beneficio: 112000 },
    { label: "Mar", ingresos: 245000, gastos: 115000, beneficio: 130000 },
    { label: "Abr", ingresos: 230000, gastos: 108000, beneficio: 122000 },
    { label: "May", ingresos: 275000, gastos: 122000, beneficio: 153000 },
    { label: "Jun", ingresos: 290000, gastos: 130000, beneficio: 160000 },
    { label: "Jul", ingresos: 320000, gastos: 140000, beneficio: 180000 },
    { label: "Ago", ingresos: 305000, gastos: 138000, beneficio: 167000 },
    { label: "Sep", ingresos: 340000, gastos: 145000, beneficio: 195000 },
    { label: "Oct", ingresos: 270000, gastos: 118000, beneficio: 152000 },
  ],
};

// Mini-estadísticas por período
const PERIOD_PERFORMANCE = {
  "mes-actual": {
    topEmpleado: {
      nombre: "Lucas Martínez",
      cortes: 84,
      facturado: 215000,
      servicioEstrella: "Corte Fade & Barba",
    },
    topCliente: {
      nombre: "Martín Benítez",
      visitas: 6,
      consumoTotal: 27800,
      ticketPromedio: 4633,
    },
  },
  "primera-semana": {
    topEmpleado: {
      nombre: "Lucas Martínez",
      cortes: 22,
      facturado: 56400,
      servicioEstrella: "Corte Clásico",
    },
    topCliente: {
      nombre: "Gonzalo Ruiz",
      visitas: 2,
      consumoTotal: 9500,
      ticketPromedio: 4750,
    },
  },
  trimestre: {
    topEmpleado: {
      nombre: "Mateo Fernández",
      cortes: 245,
      facturado: 630000,
      servicioEstrella: "Coloración & Styling",
    },
    topCliente: {
      nombre: "Esteban Quiroga",
      visitas: 14,
      consumoTotal: 68000,
      ticketPromedio: 4857,
    },
  },
  anio: {
    topEmpleado: {
      nombre: "Lucas Martínez",
      cortes: 890,
      facturado: 2280000,
      servicioEstrella: "Corte Integral",
    },
    topCliente: {
      nombre: "Martín Benítez",
      visitas: 26,
      consumoTotal: 115400,
      ticketPromedio: 4438,
    },
  },
};

export default function DashboardFinanzasPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("mes-actual");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [movements, setMovements] = useState<FinancialMovement[]>(INITIAL_MOVEMENTS);
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Movimientos del período seleccionado
  const filteredMovements = useMemo(() => {
    return movements.filter(
      (m) =>
        m.periodo === selectedPeriod ||
        // Si es año, incluye todo
        selectedPeriod === "anio",
    );
  }, [movements, selectedPeriod]);

  // Mayores movimientos (ordenados de mayor a menor monto)
  const mayoresMovimientos = useMemo(() => {
    return [...filteredMovements].toSorted((a, b) => b.monto - a.monto).slice(0, 7);
  }, [filteredMovements]);

  // Cálculos de Totales Dinámicos
  const chartData = useMemo(() => {
    return PERIOD_CHARTS[selectedPeriod] || PERIOD_CHARTS["mes-actual"];
  }, [selectedPeriod]);

  // KPIs
  const totalIngresos = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.ingresos, 0);
  }, [chartData]);

  const totalGastos = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.gastos, 0);
  }, [chartData]);

  const margenNeto = useMemo(() => {
    if (totalIngresos === 0) return "0.0";
    return (((totalIngresos - totalGastos) / totalIngresos) * 100).toFixed(1);
  }, [totalIngresos, totalGastos]);

  const rendimiento = PERIOD_PERFORMANCE[selectedPeriod];

  // Acción: Guardar nuevo gasto
  const handleSaveGasto = (nuevo: NuevoGastoData) => {
    const nuevoMovimiento: FinancialMovement = {
      id: `egr-${Date.now()}`,
      fecha: nuevo.fecha,
      concepto: nuevo.concepto,
      tipo: "EGRESO",
      categoria: nuevo.categoria,
      monto: nuevo.monto,
      comprobante: nuevo.comprobante,
      periodo: selectedPeriod,
    };

    setMovements((prev) => [nuevoMovimiento, ...prev]);

    // Actualizar dinámicamente el último punto del gráfico de forma inmediata
    if (chartData.length > 0) {
      const lastPoint = chartData[chartData.length - 1];
      lastPoint.gastos += nuevo.monto;
      lastPoint.beneficio = lastPoint.ingresos - lastPoint.gastos;
    }

    showToast(
      `Egreso "$${nuevo.monto.toLocaleString()}" registrado correctamente en ${nuevo.categoria}.`,
    );
  };

  // Acción: Exportar CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Fecha", "Concepto", "Tipo", "Categoria", "Monto", "Comprobante"];
    const rows = filteredMovements.map((m) => [
      m.id,
      m.fecha,
      `"${m.concepto.replace(/"/g, '""')}"`,
      m.tipo,
      m.categoria,
      m.monto,
      m.comprobante ? `"${m.comprobante}"` : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_financiero_${selectedPeriod}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Archivo CSV exportado exitosamente.");
  };

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === selectedPeriod)?.label;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm border border-slate-700 animate-in fade-in slide-in-from-top-4 print:hidden">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Membrete Oficial para Impresión PDF (Solo visible al imprimir) */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">REPORTE FINANCIERO OFICIAL</h1>
            <p className="text-sm text-slate-600 mt-1">
              {user?.businessName || user?.name || "SaaS Turnero - Gestión Operativa"}
            </p>
            <p className="text-xs text-slate-500">Período de Liquidación: {periodLabel}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Fecha de Emisión: {new Date().toLocaleDateString("es-AR")}</p>
            <p>Moneda: ARS ($)</p>
          </div>
        </div>
      </div>

      {/* Header & Acciones Principales */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Panel Financiero</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Supervisión interactiva de flujo de caja, ingresos por servicios y costos operativos.
          </p>
        </div>

        {/* Acciones Superiores */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Período con CustomSelect */}
          <div className="w-60">
            <CustomSelect
              options={PERIOD_OPTIONS}
              value={selectedPeriod}
              onChange={(val) => setSelectedPeriod(val as PeriodKey)}
              placeholder="Seleccionar período"
            />
          </div>

          {/* Botón Registrar Gasto */}
          <button
            onClick={() => setIsGastoModalOpen(true)}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-rose-600/20 text-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Gasto</span>
          </button>

          {/* Botón Exportar CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm transition shadow-sm"
            title="Exportar transacciones a CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {/* Botón Descargar Reporte PDF */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm transition shadow-sm"
            title="Descargar o imprimir informe en PDF"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Reporte PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ingresos Totales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            ${totalIngresos.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
            <span>↑ +18.4%</span>
            <span className="text-slate-400 font-normal">en {periodLabel}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Gastos Operativos
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600 mt-2">
            ${totalGastos.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>Insumos, comisiones, servicios y alquiler</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Margen Neto Operativo
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{margenNeto}%</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-700 font-medium">
            <span>Rentabilidad calculada en tiempo real</span>
          </div>
        </div>
      </div>

      {/* Gráfico Interactivo de Ingresos vs Gastos */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Evolución de Ingresos vs Gastos</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativa por tramos temporales para {periodLabel}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto print:hidden">
            <button
              onClick={() => setChartType("area")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                chartType === "area"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Área Fluida
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                chartType === "bar"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Barras Comparativas
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                <XAxis dataKey="label" stroke="#94a3b8" />
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
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" />
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

      {/* Mini-Estadísticas de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Empleado Estrella */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-6 rounded-2xl border border-amber-200/80 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700">
                <Award className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Empleado Estrella del Período
              </span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mt-2">
              {rendimiento.topEmpleado.nombre}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Servicio más demandado:{" "}
              <span className="font-semibold text-slate-700">
                {rendimiento.topEmpleado.servicioEstrella}
              </span>
            </p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-amber-100">
              <div>
                <span className="text-xs text-slate-500 block">Servicios / Cortes</span>
                <span className="text-base font-extrabold text-slate-900">
                  {rendimiento.topEmpleado.cortes} realizados
                </span>
              </div>
              <div className="border-l border-amber-200 pl-4">
                <span className="text-xs text-slate-500 block">Facturación Aportada</span>
                <span className="text-base font-extrabold text-emerald-600">
                  ${rendimiento.topEmpleado.facturado.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cliente Frecuente / Top Cliente */}
        <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white p-6 rounded-2xl border border-blue-200/80 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-700">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Cliente Más Frecuente / Top VIP
              </span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mt-2">
              {rendimiento.topCliente.nombre}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Cliente recurrente con alto índice de retención y fidelidad
            </p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-100">
              <div>
                <span className="text-xs text-slate-500 block">Visitas Completadas</span>
                <span className="text-base font-extrabold text-slate-900">
                  {rendimiento.topCliente.visitas} citas
                </span>
              </div>
              <div className="border-l border-blue-200 pl-4">
                <span className="text-xs text-slate-500 block">Consumo Acumulado</span>
                <span className="text-base font-extrabold text-blue-600">
                  ${rendimiento.topCliente.consumoTotal.toLocaleString()}
                </span>
              </div>
              <div className="border-l border-blue-200 pl-4">
                <span className="text-xs text-slate-500 block">Ticket Promedio</span>
                <span className="text-base font-extrabold text-slate-700">
                  ${rendimiento.topCliente.ticketPromedio.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Mayores Movimientos */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mayores Movimientos del Período</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Operaciones de mayor relevancia económica registradas durante {periodLabel}
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto font-medium">
            {mayoresMovimientos.length} operaciones destacadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {mayoresMovimientos.map((mov) => {
                const isIngreso = mov.tipo === "INGRESO";
                return (
                  <tr key={mov.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {mov.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{mov.concepto}</div>
                      {mov.comprobante && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Comp: {mov.comprobante}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isIngreso
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-rose-50 text-rose-700 border border-rose-200/60"
                        }`}
                      >
                        {isIngreso ? "+" : "-"} {mov.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                      {mov.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-extrabold">
                      <span className={isIngreso ? "text-emerald-600" : "text-rose-600"}>
                        {isIngreso ? "+" : "-"}${mov.monto.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Gasto */}
      <GastoModal
        isOpen={isGastoModalOpen}
        onClose={() => setIsGastoModalOpen(false)}
        onSave={handleSaveGasto}
      />
    </div>
  );
}
