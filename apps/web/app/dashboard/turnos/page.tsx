import React from 'react';

// Mocks
const empleados = [
  { id: 1, nombre: 'Juan Perez' },
  { id: 2, nombre: 'Maria Gomez' },
  { id: 3, nombre: 'Carlos Ruiz' }
];

const horas = Array.from({ length: 12 }, (_, i) => i + 9); // 9 to 20 (9am to 8pm)

// Mock de algunos turnos para mostrar visualmente
const turnosMock = [
  { id: 101, empleadoId: 1, horaInicio: 9, duracion: 1, cliente: 'Ana Fernandez', servicio: 'Corte de pelo' },
  { id: 102, empleadoId: 1, horaInicio: 11, duracion: 1.5, cliente: 'Luis Martinez', servicio: 'Corte + Barba' },
  { id: 103, empleadoId: 2, horaInicio: 10, duracion: 2, cliente: 'Sofia Lopez', servicio: 'Colorimetria' },
  { id: 104, empleadoId: 3, horaInicio: 15, duracion: 1, cliente: 'Diego Maradona', servicio: 'Corte de pelo' },
  { id: 105, empleadoId: 2, horaInicio: 16, duracion: 1, cliente: 'Lionel Messi', servicio: 'Corte' },
];

export default function TurnosPage() {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-bold text-gray-800">Grilla Diaria</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            Hoy
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
            Nuevo Turno
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-[800px] border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Row: Employees */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-24 shrink-0 border-r border-gray-200 flex items-center justify-center py-3">
              <span className="text-sm font-medium text-gray-500">Hora</span>
            </div>
            {empleados.map(empleado => (
              <div key={empleado.id} className="flex-1 shrink-0 border-r last:border-r-0 border-gray-200 text-center py-3">
                <span className="text-sm font-semibold text-gray-700">{empleado.nombre}</span>
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="relative bg-white">
            {horas.map(hora => (
              <div key={hora} className="flex border-b last:border-b-0 border-gray-100 h-16">
                {/* Time Column */}
                <div className="w-24 shrink-0 border-r border-gray-200 flex flex-col justify-start items-center py-2 relative">
                  <span className="text-xs font-medium text-gray-500 -mt-3 bg-white px-1">
                    {hora.toString().padStart(2, '0')}:00
                  </span>
                </div>
                
                {/* Employee Columns for this Hour */}
                {empleados.map(empleado => (
                  <div key={empleado.id} className="flex-1 shrink-0 border-r last:border-r-0 border-gray-200 relative">
                    {/* Render turnos for this employee at this hour */}
                    {turnosMock
                      .filter(t => t.empleadoId === empleado.id && Math.floor(t.horaInicio) === hora)
                      .map(turno => {
                        const topOffset = (turno.horaInicio - hora) * 64; // 64px per hour (h-16)
                        const height = turno.duracion * 64; // 64px per hour
                        
                        return (
                          <div 
                            key={turno.id}
                            className="absolute left-1 right-1 rounded-md p-2 shadow-sm text-xs border bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer overflow-hidden z-10"
                            style={{ top: `${topOffset}px`, height: `${height - 2}px` }}
                          >
                            <div className="font-semibold text-blue-800 truncate">{turno.cliente}</div>
                            <div className="text-blue-600 truncate">{turno.servicio}</div>
                            <div className="text-blue-500 text-[10px] mt-1">
                              {Math.floor(turno.horaInicio)}:{((turno.horaInicio % 1) * 60).toString().padStart(2, '0')} - 
                              {Math.floor(turno.horaInicio + turno.duracion)}:{(((turno.horaInicio + turno.duracion) % 1) * 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
