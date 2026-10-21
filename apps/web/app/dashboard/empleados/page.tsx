"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Users, Plus, Mail, Phone, Clock, Sparkles } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";

interface EmpleadoItem {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  isClockedIn: boolean;
}

export default function EmpleadosPage() {
  const { user, token } = useAuth();
  const businessId = user?.tenantId;

  const [empleados, setEmpleados] = useState<EmpleadoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", email: "", telefono: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<EmpleadoItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadEmpleados = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await apiFetch<any[]>(`/employees?businessId=${businessId}`, {
        token: token || undefined,
      });

      if (Array.isArray(data)) {
        setEmpleados(
          data.map((emp) => ({
            id: String(emp.id),
            nombre: emp.name || "",
            email: emp.email || "",
            telefono: emp.phone || "",
            isClockedIn: Array.isArray(emp.shifts) && emp.shifts.length > 0,
          })),
        );
      }
    } catch (err: any) {
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, token]);

  useEffect(() => {
    loadEmpleados();
  }, [loadEmpleados]);

  const handleOpenModal = (empleado?: EmpleadoItem) => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre,
        email: empleado.email,
        telefono: empleado.telefono,
      });
      setEditingId(empleado.id);
    } else {
      setFormData({ nombre: "", email: "", telefono: "" });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      triggerNotification("No se encontró el identificador del negocio.");
      return;
    }

    try {
      if (editingId) {
        await apiFetch(`/employees/${editingId}`, {
          method: "PATCH",
          token: token || undefined,
          body: JSON.stringify({
            name: formData.nombre,
            email: formData.email.trim(),
            phone: formData.telefono.trim(),
          }),
        });
        triggerNotification("Empleado actualizado con éxito.");
      } else {
        await apiFetch("/employees", {
          method: "POST",
          token: token || undefined,
          body: JSON.stringify({
            name: formData.nombre,
            email: formData.email.trim(),
            phone: formData.telefono.trim(),
            businessId,
          }),
        });
        triggerNotification("Empleado añadido al equipo.");
      }
      setShowModal(false);
      await loadEmpleados();
    } catch (err: any) {
      console.error("Error saving employee:", err);
      triggerNotification(err.message || "Error al guardar el empleado.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiFetch(`/employees/${itemToDelete.id}`, {
        method: "DELETE",
        token: token || undefined,
      });
      setEmpleados((prev) => prev.filter((emp) => emp.id !== itemToDelete.id));
      triggerNotification(`Empleado "${itemToDelete.nombre}" eliminado.`);
    } catch (err: any) {
      console.error("Error deleting employee:", err);
      triggerNotification(err.message || "Error al eliminar el empleado.");
    } finally {
      setItemToDelete(null);
    }
  };

  const handleToggleShift = async (id: string) => {
    setEmpleados((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, isClockedIn: !emp.isClockedIn } : emp)),
    );
    try {
      await apiFetch(`/employees/${id}/shift`, {
        method: "POST",
        token: token || undefined,
      });
      triggerNotification("Estado de fichaje actualizado.");
    } catch (error) {
      console.error(error);
      await loadEmpleados();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Empleados</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Administra a tu equipo de trabajo y asígnales accesos mediante su cuenta de Gmail.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 transition-all text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Empleado</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Cargando equipo de trabajo...</p>
          </div>
        ) : empleados.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
            <p className="font-medium text-slate-600">No hay empleados registrados</p>
            <p className="text-sm text-slate-400 mt-1">
              Agrega a tus profesionales vinculando su cuenta de Gmail para darles acceso.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Profesional
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Gmail / Acceso
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Fichaje
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {empleados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                        {empleado.nombre.slice(0, 2)}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {empleado.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {empleado.email ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {empleado.email}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Sin Gmail asignado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {empleado.telefono ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {empleado.telefono}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleToggleShift(empleado.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        empleado.isClockedIn
                          ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{empleado.isClockedIn ? "Fichar Salida" : "Fichar Entrada"}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleOpenModal(empleado)}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setItemToDelete(empleado)}
                      className="text-rose-600 hover:text-rose-800 font-medium transition cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Confirmar Borrado */}
      <ConfirmDeleteModal
        isOpen={Boolean(itemToDelete)}
        title={`¿Eliminar a "${itemToDelete?.nombre}"?`}
        description="Esta acción removerá al empleado de tu equipo y eliminará sus accesos al portal del empleado."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Modal Empleado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? "Editar Empleado" : "Nuevo Empleado"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Gmail de Acceso (Google Account)
                </label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="empleado@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-9 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  El empleado utilizará este Gmail para iniciar sesión en el portal de empleados.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Teléfono (opcional)
                </label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="+54 9 11 1234-5678"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="block w-full pl-9 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold transition shadow-sm shadow-blue-600/20 cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
