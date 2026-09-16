export default function FinanzasPage() {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold mb-4">Finanzas</h1>
      <p className="text-gray-600 mb-8">Gestión de ingresos, gastos y reportes financieros.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 border rounded-xl bg-blue-50/50">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ingresos del Mes</h3>
          <p className="text-3xl font-bold text-gray-900">,000</p>
        </div>
        <div className="p-6 border rounded-xl bg-green-50/50">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Crecimiento</h3>
          <p className="text-3xl font-bold text-green-600">+12.5%</p>
        </div>
        <div className="p-6 border rounded-xl bg-purple-50/50">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ticket Promedio</h3>
          <p className="text-3xl font-bold text-gray-900">,500</p>
        </div>
      </div>
      
      <div className="h-64 border rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
        [Gráfico de Ingresos vs Gastos]
      </div>
    </div>
  );
}
