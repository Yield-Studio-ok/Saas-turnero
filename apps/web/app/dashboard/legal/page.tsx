"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { apiFetch } from "../../../lib/api";

interface LegalSettings {
  termsAndConditions: string;
  serviceContracts: string;
  cancellationPolicy: string;
}

const DEFAULT_SETTINGS: LegalSettings = {
  termsAndConditions:
    "Al utilizar nuestros servicios, el cliente acepta presentarse puntualmente a su turno y seguir las normas de convivencia del establecimiento.",
  serviceContracts:
    "El profesional se compromete a prestar los servicios contratados con los más altos estándares de calidad e higiene del rubro.",
  cancellationPolicy:
    "Las cancelaciones deben efectuarse con al menos 2 horas de antelación. En caso de no presentación, el turno se computará como no asistido.",
};

export default function DashboardLegalPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<LegalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<"terms" | "contracts" | "cancellation" | null>(
    null,
  );
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      apiFetch("/businesses/my-legal-settings", { token })
        .then((data: any) => {
          if (data) {
            setSettings({
              termsAndConditions: data.termsAndConditions || DEFAULT_SETTINGS.termsAndConditions,
              serviceContracts: data.serviceContracts || DEFAULT_SETTINGS.serviceContracts,
              cancellationPolicy: data.cancellationPolicy || DEFAULT_SETTINGS.cancellationPolicy,
            });
          }
        })
        .catch(() => {
          // Mantener valores por defecto si no hay conexión
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleOpenModal = (type: "terms" | "contracts" | "cancellation") => {
    setActiveModal(type);
    if (type === "terms") setEditValue(settings.termsAndConditions);
    if (type === "contracts") setEditValue(settings.serviceContracts);
    if (type === "cancellation") setEditValue(settings.cancellationPolicy);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setEditValue("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    setSaving(true);
    const updated: Partial<LegalSettings> = {};
    if (activeModal === "terms") updated.termsAndConditions = editValue;
    if (activeModal === "contracts") updated.serviceContracts = editValue;
    if (activeModal === "cancellation") updated.cancellationPolicy = editValue;

    try {
      if (token) {
        await apiFetch("/businesses/my-legal-settings", {
          method: "PUT",
          token,
          body: JSON.stringify(updated),
        }).catch(() => {});
      }

      setSettings((prev) => ({ ...prev, ...updated }));
      setToastMessage("Documento legal actualizado correctamente.");
      setTimeout(() => setToastMessage(null), 3000);
      handleCloseModal();
    } catch (err: any) {
      alert("Error al guardar: " + (err?.message || "Ocurrió un error inesperado"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando marco legal...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Marco Legal y Políticas</h2>
        <p className="text-gray-500 mt-1">
          Configura y mantén actualizados los términos, contratos y políticas que aplican a tus
          turnos y profesionales.
        </p>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Términos y Condiciones */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Términos y Condiciones</h3>
            <p className="text-gray-500 text-xs mt-1 mb-4">
              Aceptados por los clientes al confirmar sus citas.
            </p>
            <p className="text-gray-700 text-sm line-clamp-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {settings.termsAndConditions}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("terms")}
            className="mt-6 w-full py-2.5 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-xl text-sm transition"
          >
            Editar Términos
          </button>
        </div>

        {/* Contratos de Servicios */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Contratos de Servicios</h3>
            <p className="text-gray-500 text-xs mt-1 mb-4">
              Convenio de prestación entre el local y colaboradores.
            </p>
            <p className="text-gray-700 text-sm line-clamp-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {settings.serviceContracts}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("contracts")}
            className="mt-6 w-full py-2.5 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-xl text-sm transition"
          >
            Editar Contratos
          </button>
        </div>

        {/* Política de Cancelación */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Política de Cancelación</h3>
            <p className="text-gray-500 text-xs mt-1 mb-4">
              Reglas de reembolso y ventana de cancelación previa.
            </p>
            <p className="text-gray-700 text-sm line-clamp-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {settings.cancellationPolicy}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("cancellation")}
            className="mt-6 w-full py-2.5 px-4 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold rounded-xl text-sm transition"
          >
            Editar Políticas
          </button>
        </div>
      </div>

      {/* Modal Interactivo de Edición */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeModal === "terms" && "Editar Términos y Condiciones"}
              {activeModal === "contracts" && "Editar Contratos de Servicios"}
              {activeModal === "cancellation" && "Editar Política de Cancelación"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Ingresa el contenido detallado del documento. Los cambios se guardarán y reflejarán de
              inmediato.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <textarea
                  rows={8}
                  required
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Redacta el contenido legal aquí..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
