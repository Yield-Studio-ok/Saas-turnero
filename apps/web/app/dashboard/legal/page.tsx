export default function LegalPage() {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold mb-4">Legal y Documentación</h1>
      <p className="text-gray-600 mb-8">Gestiona contratos, términos de servicio y documentación del personal.</p>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-800">Términos y Condiciones</h3>
            <p className="text-sm text-gray-500">Última actualización: 12/08/2026</p>
          </div>
          <button className="text-blue-600 hover:underline text-sm font-medium">Editar</button>
        </div>
        
        <div className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-800">Contratos de Empleados</h3>
            <p className="text-sm text-gray-500">3 contratos activos, 1 pendiente de firma</p>
          </div>
          <button className="text-blue-600 hover:underline text-sm font-medium">Ver Documentos</button>
        </div>
        
        <div className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-800">Política de Cancelación</h3>
            <p className="text-sm text-gray-500">Configuración de penalizaciones y reembolsos</p>
          </div>
          <button className="text-blue-600 hover:underline text-sm font-medium">Configurar</button>
        </div>
      </div>
    </div>
  );
}
