"use client";
import React from "react";

export default function PerfilLocalPage() {
  const businessId = "busi_123456"; // Mocked for UI
  const directLink = "https://saas-turnero.com/book/" + businessId;
  const webhookUrl = "https://api.saas-turnero.com/webhooks/reserve";

  return (
    <div className="max-w-3xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Perfil del Local</h2>
      <p className="text-gray-500 mb-8">
        Administra la información pública de tu local que verán los clientes al reservar turnos.
      </p>

      <form className="space-y-6 text-gray-900" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Información Básica</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Comercial
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="Barbería Vintage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción corta
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                defaultValue="Especialistas en cortes clásicos y modernos."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
              Contacto y Ubicación
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Público
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="+54 9 11 1234-5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="Av. Siempre Viva 123, CABA"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Horarios de Atención</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Apertura
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="09:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Cierre</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="20:00"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
            Integraciones (Instagram / Google Reserve)
          </h3>
          <p className="text-sm text-gray-500">
            Copia estos enlaces para integrarlos en tus redes sociales o en Google.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Directo de Reserva (Instagram)
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50 text-gray-600 focus:outline-none"
                  value={directLink}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(directLink);
                    alert("Copiado al portapapeles: " + directLink);
                  }}
                  className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Copiar
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL (Google Reserve / Otros Sistemas)
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50 text-gray-600 focus:outline-none"
                  value={webhookUrl}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    alert("Copiado al portapapeles: " + webhookUrl);
                  }}
                  className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
