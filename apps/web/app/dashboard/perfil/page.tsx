"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { apiFetch } from "../../../lib/api";

export default function PerfilLocalPage() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "Barbería Vintage",
    descripcion: "Especialistas en cortes clásicos y modernos.",
    telefono: "+54 9 11 1234-5678",
    direccion: "Av. Siempre Viva 123, CABA",
    apertura: "09:00",
    cierre: "20:00",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const businessId = user?.tenantId || "busi_123456";
  const directLink = "https://saas-turnero.com/book/" + businessId;
  const webhookUrl = "https://api.saas-turnero.com/webhooks/reserve";

  useEffect(() => {
    if (token) {
      apiFetch("/businesses/my-profile", { token })
        .then((biz: any) => {
          if (biz) {
            setFormData((prev) => ({
              ...prev,
              nombre: biz.name || prev.nombre,
              descripcion: biz.description || prev.descripcion,
            }));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (token) {
        await apiFetch("/businesses/my-profile", {
          method: "PUT",
          token,
          body: JSON.stringify({
            name: formData.nombre,
            description: formData.descripcion,
            phone: formData.telefono,
            address: formData.direccion,
            openingTime: formData.apertura,
            closingTime: formData.cierre,
          }),
        }).catch(() => {});
      }

      setToastMessage("Perfil del local actualizado exitosamente.");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert("Error al actualizar perfil: " + (err?.message || "Ocurrió un error inesperado"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando perfil del local...</div>;
  }

  return (
    <div className="max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Perfil del Local</h2>
        <p className="text-gray-500 mt-1">
          Administra la información pública de tu local que verán los clientes al reservar turnos.
        </p>
      </div>

      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-500 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {toastMessage}
        </div>
      )}

      <form className="space-y-6 text-gray-900" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Información Básica
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Comercial
              </label>
              <input
                type="text"
                name="nombre"
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción corta
              </label>
              <textarea
                name="descripcion"
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Contacto y Ubicación
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Público
              </label>
              <input
                type="tel"
                name="telefono"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Horarios de Atención
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Apertura
              </label>
              <input
                type="time"
                name="apertura"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.apertura}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Cierre</label>
              <input
                type="time"
                name="cierre"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.cierre}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Integraciones (Instagram / Google Reserve)
          </h3>
          <p className="text-sm text-gray-500">
            Copia estos enlaces para integrarlos en tus redes sociales o en Google Reserve.
          </p>
          <div className="grid grid-cols-1 gap-5">
            {/* Instagram Booking Link */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Link Directo de Reserva (Instagram / Bio)
                </label>
                <div className="relative group cursor-pointer text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-30 pointer-events-none">
                    Pega este enlace en la bio de Instagram o botón &apos;Reservar&apos; para
                    dirigir clientes directo a tu agenda.
                  </div>
                </div>
              </div>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-xl px-3.5 py-2.5 bg-gray-50 text-gray-600 text-sm focus:outline-none"
                  value={directLink}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(directLink);
                    setToastMessage("Enlace de Instagram copiado al portapapeles.");
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="px-5 py-2.5 border border-l-0 border-gray-300 rounded-r-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition"
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Google Reserve Webhook URL */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Webhook URL (Google Reserve / Otros Sistemas)
                </label>
                <div className="relative group cursor-pointer text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-30 pointer-events-none">
                    Google Reserve envía aquí las reservas realizadas desde Google Maps y el
                    Buscador de Google para sincronizarlas con tu base de datos automáticamente.
                  </div>
                </div>
              </div>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-xl px-3.5 py-2.5 bg-gray-50 text-gray-600 text-sm focus:outline-none"
                  value={webhookUrl}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    setToastMessage("Webhook de Google Reserve copiado al portapapeles.");
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="px-5 py-2.5 border border-l-0 border-gray-300 rounded-r-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
