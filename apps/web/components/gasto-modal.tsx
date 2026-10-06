"use client";

import React, { useState } from "react";
import { X, Receipt, CheckCircle2 } from "lucide-react";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";

export interface NuevoGastoData {
  concepto: string;
  monto: number;
  categoria: string;
  fecha: string;
  comprobante?: string;
}

interface GastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gasto: NuevoGastoData) => void;
}

const CATEGORIAS_GASTOS: CustomSelectOption[] = [
  { value: "Insumos", label: "Insumos & Productos de Salón" },
  { value: "Alquiler", label: "Alquiler & Expensas" },
  { value: "Servicios", label: "Servicios (Luz, Agua, Internet)" },
  { value: "Comisiones", label: "Comisiones / Sueldos Personal" },
  { value: "Mantenimiento", label: "Mantenimiento & Equipamiento" },
  { value: "Impuestos", label: "Impuestos & Tasas Municipales" },
  { value: "Otros", label: "Otros Gastos Operativos" },
];

export function GastoModal({ isOpen, onClose, onSave }: GastoModalProps) {
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState<number | "">("");
  const [categoria, setCategoria] = useState("Insumos");
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [comprobante, setComprobante] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!concepto.trim()) {
      setError("Por favor ingresa un concepto descriptivo.");
      return;
    }

    const montoNum = Number(monto);
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }

    if (!fecha) {
      setError("Debes indicar la fecha del egreso.");
      return;
    }

    onSave({
      concepto: concepto.trim(),
      monto: montoNum,
      categoria,
      fecha,
      comprobante: comprobante.trim() || undefined,
    });

    // Reset form
    setConcepto("");
    setMonto("");
    setCategoria("Insumos");
    setFecha(new Date().toISOString().split("T")[0]);
    setComprobante("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center ring-4 ring-rose-50/50">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registrar Egreso</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Carga un costo operativo o compra del local
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Concepto / Detalle
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Compra de tinturas y oxidantes"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm text-slate-900 placeholder:text-slate-400 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Monto ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm font-semibold text-slate-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm text-slate-900 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Categoría
            </label>
            <CustomSelect
              options={CATEGORIAS_GASTOS}
              value={categoria}
              onChange={(val) => setCategoria(String(val))}
              placeholder="Seleccionar categoría de gasto"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nº Comprobante / Factura (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. FAC-B-0004-00012891"
              value={comprobante}
              onChange={(e) => setComprobante(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm text-slate-900 placeholder:text-slate-400 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition shadow-sm shadow-rose-600/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Egreso</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
