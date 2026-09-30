"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { apiFetch } from "../lib/api";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function PaywallModal({
  isOpen,
  onClose,
  title = "Desbloquea el Potencial de tu Negocio",
  description = "Actualiza a PRO para acceder a analíticas avanzadas, gestión de reseñas y mucho más.",
}: PaywallModalProps) {
  const { user, token, switchMockUser } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setSuccessMessage(null);
      setErrorMessage(null);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleUpgrade = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (token) {
        await apiFetch("/businesses/my-plan", {
          method: "PATCH",
          token,
          body: JSON.stringify({ plan: "PRO" }),
        }).catch(() => {
          // Si el backend no tiene ese business en local, simulamos actualización local
        });
      }

      // Actualizar estado de usuario en contexto
      if (user) {
        user.plan = "PRO";
      }
      if (switchMockUser) {
        switchMockUser("ownerPro");
      }

      setSuccessMessage("¡Felicitaciones! Tu negocio ahora cuenta con el plan PRO.");
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocurrió un error al actualizar el plan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg mx-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-8 sm:p-10 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">
            {title}
          </h2>

          <p className="text-slate-300 text-lg leading-relaxed mb-6">{description}</p>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-semibold animate-pulse">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4 text-left bg-white/5 rounded-2xl p-6 mb-8 backdrop-blur-md border border-white/10">
            <FeatureItem text="Métricas y Analíticas Avanzadas" />
            <FeatureItem text="Gestión y Respuesta a Reseñas" />
            <FeatureItem text="Prioridad en Soporte Técnico" />
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                <span>Actualizando plan...</span>
              </>
            ) : (
              "Actualizar a PRO"
            )}
          </button>

          <p className="mt-4 text-sm text-slate-400">Cancela cuando quieras. Sin compromisos.</p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-200">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
        <svg
          className="w-4 h-4 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
