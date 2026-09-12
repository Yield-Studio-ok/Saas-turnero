"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { LegalNotice, LegalNoticeAcceptanceResponse } from "@/types/legal-notice";

export default function LegalNoticeModal() {
  const { user, token, loading: authLoading } = useAuth();
  const [notices, setNotices] = useState<LegalNotice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // fetching unread notices
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadNotices = useCallback(async (authToken: string) => {
    try {
      setError(null);
      const data = await apiFetch<LegalNotice[]>("/legal-notices/unread", {
        token: authToken,
      });
      if (Array.isArray(data)) {
        setNotices(data);
        setCurrentIndex(0);
        setIsChecked(false);
      }
    } catch (err: any) {
      console.error("Error al obtener avisos legales no leídos:", err);
      // No bloqueamos navegación si la API falla temporalmente por red al arrancar,
      // pero registramos el estado
    } finally {
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && token) {
      fetchUnreadNotices(token);
    } else if (!user) {
      setNotices([]);
      setCurrentIndex(0);
      setIsChecked(false);
    }
  }, [authLoading, user, token, fetchUnreadNotices]);

  // Bloquear scroll cuando el modal está activo
  useEffect(() => {
    if (notices.length > 0) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [notices.length]);

  // Si no hay avisos pendientes o no está logueado, no mostrar nada
  if (authLoading || !user || notices.length === 0) {
    return null;
  }

  const currentNotice = notices[currentIndex];
  if (!currentNotice) {
    return null;
  }

  const handleAccept = async () => {
    if (!token || !isChecked || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await apiFetch<LegalNoticeAcceptanceResponse>(`/legal-notices/${currentNotice.id}/accept`, {
        method: "POST",
        token,
      });

      // Si hay más avisos en cola, avanzar al siguiente; de lo contrario cerrar modal
      if (currentIndex + 1 < notices.length) {
        setCurrentIndex((prev) => prev + 1);
        setIsChecked(false);
      } else {
        // Todos los avisos fueron aceptados
        setNotices([]);
        setCurrentIndex(0);
        setIsChecked(false);
      }
    } catch (err: any) {
      console.error("Error al aceptar aviso legal:", err);
      setError(
        err.message || "No se pudo registrar la aceptación del aviso. Por favor, reintenta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-notice-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 sm:p-6"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 id="legal-notice-title" className="text-lg sm:text-xl font-bold tracking-tight">
                {currentNotice.title}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Lectura y conformidad requerida para continuar
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-right">
            {notices.length > 1 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                {currentIndex + 1} de {notices.length}
              </span>
            )}
            <span className="hidden sm:inline-block text-xs bg-blue-900/40 px-2 py-1 rounded text-blue-100 font-mono">
              v{currentNotice.version}
            </span>
          </div>
        </div>

        {/* Notificación informativa */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 text-xs text-blue-800 flex items-center space-x-2">
          <svg
            className="w-4 h-4 text-blue-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Hemos actualizado nuestros términos legales. Es necesario leer y aceptar este documento
            antes de continuar utilizando la plataforma.
          </span>
        </div>

        {/* Cuerpo con scroll */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-gray-700 bg-gray-50/50">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm leading-relaxed whitespace-pre-wrap font-sans select-text">
            {currentNotice.content}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleAccept}
                className="text-xs font-semibold text-red-800 underline hover:no-underline ml-2"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Pie y Aceptación */}
        <div className="p-5 bg-white border-t border-gray-100 space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="accept-checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
            />
            <span className="text-xs sm:text-sm text-gray-700 font-medium">
              Confirmo que he leído detenidamente y acepto de manera expresa los términos
              establecidos en este aviso legal (versión {currentNotice.version}).
            </span>
          </label>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              id="btn-accept-notice"
              onClick={handleAccept}
              disabled={!isChecked || isSubmitting}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-150 flex items-center justify-center space-x-2 ${
                isChecked && !isSubmitting
                  ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer shadow-blue-500/25"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Registrando aceptación...</span>
                </>
              ) : (
                <span>
                  {notices.length > 1 && currentIndex + 1 < notices.length
                    ? "Aceptar y ver siguiente aviso"
                    : "Aceptar y continuar"}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
