"use client";

import { useAuth } from "@/lib/auth-context";
import { PaywallModal } from "@/components/paywall-modal";
import { useState, useEffect } from "react";

export default function AnaliticasPage() {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    // Si el usuario no tiene plan PRO (o no está cargado y por defecto es BASIC), mostramos el paywall
    if (user && user.plan !== "PRO") {
      setShowPaywall(true);
    } else {
      setShowPaywall(false);
    }
  }, [user]);

  // Si está el paywall abierto, tal vez no queremos ni renderizar los datos reales,
  // o los renderizamos con blur de fondo.
  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold">Analíticas Avanzadas</h2>
      
      <div className={\grid grid-cols-1 md:grid-cols-3 gap-6 \\}>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Ingresos del Mes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">,500</p>
          <span className="text-green-500 text-sm font-medium">+12% vs mes anterior</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Turnos Completados</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">124</p>
          <span className="text-green-500 text-sm font-medium">+5% vs mes anterior</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Nuevos Clientes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">18</p>
          <span className="text-red-500 text-sm font-medium">-2% vs mes anterior</span>
        </div>
      </div>

      <div className={\g-white p-6 rounded-lg shadow border border-gray-200 h-64 flex items-center justify-center \\}>
        <span className="text-gray-400">Gráfico de Analíticas (Simulado)</span>
      </div>

      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => {}} // No dejamos que lo cierre para que no vea la página sin pagar
        title="Desbloquea Analíticas Avanzadas"
        description="Actualiza a PRO para entender a fondo el rendimiento de tu negocio, comparar periodos y tomar mejores decisiones."
      />
    </div>
  );
}
