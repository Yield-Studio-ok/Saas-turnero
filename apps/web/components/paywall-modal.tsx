"use client";

import { useState, useEffect } from "react";

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
  description = "Actualiza a PRO para acceder a analíticas avanzadas, gestión de reseñas y mucho más."
}: PaywallModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div className={ixed inset-0 z-50 flex items-center justify-center transition-all duration-300 }>
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className={elative w-full max-w-lg mx-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 }
      >
        <div className="absolute top-0 right-0 p-4">
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 sm:p-10 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">
            {title}
          </h2>
          
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            {description}
          </p>

          <div className="space-y-4 text-left bg-white/5 rounded-2xl p-6 mb-8 backdrop-blur-md border border-white/10">
            <FeatureItem text="Métricas y Analíticas Avanzadas" />
            <FeatureItem text="Gestión y Respuesta a Reseñas" />
            <FeatureItem text="Prioridad en Soporte Técnico" />
          </div>

          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all duration-200 transform hover:-translate-y-1">
            Actualizar a PRO
          </button>
          
          <p className="mt-4 text-sm text-slate-400">
            Cancela cuando quieras. Sin compromisos.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-200">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
