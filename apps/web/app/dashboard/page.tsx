"use client";

import { useAuth } from "../../lib/auth-context";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Bienvenido, {user?.email}</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Turnos Hoy</h2>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Servicios Activos</h2>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
      </div>
    </div>
  );
}
