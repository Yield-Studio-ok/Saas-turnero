"use client";
import { useState } from "react";

const mockEmpleados = [
  { id: 1, nombre: "Juan Pérez" },
  { id: 2, nombre: "María Gómez" },
];

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function HorariosPage() {
  const [selectedEmpleado, setSelectedEmpleado] = useState(mockEmpleados[0].id);
  const [horarios, setHorarios] = useState(
    diasSemana.map((dia) => ({ dia, activo: true, inicio: "09:00", fin: "18:00" })),
  );

  const handleToggleDia = (index: number) => {
    const newHorarios = [...horarios];
    newHorarios[index].activo = !newHorarios[index].activo;
    setHorarios(newHorarios);
  };

  const handleTimeChange = (index: number, field: "inicio" | "fin", value: string) => {
    const newHorarios = [...horarios];
    newHorarios[index][field] = value;
    setHorarios(newHorarios);
  };

  const handleSave = () => {
    // Aquí iría el POST al backend para guardar los horarios del empleado
    alert("Horarios guardados correctamente.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuración de Horarios</h2>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Guardar Cambios
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Empleado
          </label>
          <select
            value={selectedEmpleado}
            onChange={(e) => setSelectedEmpleado(Number(e.target.value))}
            className="mt-1 block w-full sm:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
          >
            {mockEmpleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium mb-4">Días y Horarios de Trabajo</h3>
          <div className="space-y-4">
            {horarios.map((horario, index) => (
              <div key={horario.dia} className="flex items-center gap-4 bg-gray-50 p-4 rounded-md">
                <div className="flex items-center w-32">
                  <input
                    type="checkbox"
                    checked={horario.activo}
                    onChange={() => handleToggleDia(index)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-900">
                    {horario.dia}
                  </label>
                </div>

                {horario.activo ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={horario.inicio}
                      onChange={(e) => handleTimeChange(index, "inicio", e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-1"
                    />
                    <span className="text-gray-500">a</span>
                    <input
                      type="time"
                      value={horario.fin}
                      onChange={(e) => handleTimeChange(index, "fin", e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-1"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">No trabaja</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
