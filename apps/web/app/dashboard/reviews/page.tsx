"use client";

import { useAuth } from "@/lib/auth-context";
import { PaywallModal } from "@/components/paywall-modal";
import { useState, useEffect } from "react";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (user && user.plan !== "PRO") {
      setShowPaywall(true);
    } else {
      setShowPaywall(false);
    }
  }, [user]);

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold">Gestión de Reseñas</h2>
      
      <div className={\space-y-4 \\}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {"★".repeat(5)}
                </div>
                <span className="font-medium text-gray-900">Juan Pérez</span>
              </div>
              <span className="text-sm text-gray-500">Hace 2 días</span>
            </div>
            <p className="text-gray-600 mb-4">¡Excelente servicio! Muy puntuales y profesionales. Definitivamente volveré a reservar con ustedes.</p>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Responder a esta reseña
            </button>
          </div>
        ))}
      </div>

      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => {}}
        title="Gestiona tu Reputación"
        description="Actualiza a PRO para leer y responder reseñas de tus clientes, centralizando la reputación de tu negocio."
      />
    </div>
  );
}
