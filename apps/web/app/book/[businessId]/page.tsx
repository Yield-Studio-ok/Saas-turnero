"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Service { id: string; name: string; price: number; duration: number }
interface Employee { id: string; name: string }
interface TimeSlot { startTime: string; endTime: string }

export default function BookAppointmentPage() {
  const { businessId } = useParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Selections
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  
  // Customer Form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Mock fetch if real endpoint doesn't exist, but we assume it does based on the spec
  useEffect(() => {
    if (businessId) {
      // Fetch services and employees for the business (assuming these exist)
      fetch(`${apiUrl}/businesses/${businessId}`)
        .then(res => res.json())
        .then(data => {
          if (data.services) setServices(data.services);
          if (data.employees) setEmployees(data.employees);
        })
        .catch(err => console.error("Error fetching business details:", err));
    }
  }, [businessId]);

  useEffect(() => {
    if (selectedDate && selectedEmployee && selectedService) {
      // Fetch available slots
      fetch(`${apiUrl}/appointments/available-slots?date=${selectedDate}&employeeId=${selectedEmployee}&serviceId=${selectedService}`)
        .then(res => res.json())
        .then(data => {
          setAvailableSlots(data);
        })
        .catch(err => console.error("Error fetching slots:", err));
    }
  }, [selectedDate, selectedEmployee, selectedService]);

  const handleNextStep = () => setStep(s => s + 1);
  const handlePrevStep = () => setStep(s => Math.max(1, s - 1));

  const handleConfirm = async () => {
    try {
      const res = await fetch(`${apiUrl}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          employeeId: selectedEmployee,
          serviceId: selectedService,
          date: selectedDate,
          startTime: selectedTime?.startTime,
          endTime: selectedTime?.endTime,
          customerName,
          customerEmail,
        })
      });

      if (res.ok) {
        alert("¡Turno reservado con éxito!");
        router.push("/");
      } else {
        const error = await res.json();
        alert(`Error al reservar: ${error.message || "Error desconocido"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Reservar Turno</h1>

      {step === 1 && (
        <div>
          <h2 className="text-xl mb-4">Paso 1: Elige un Servicio</h2>
          <div className="space-y-2">
            {services.map(srv => (
              <label key={srv.id} className="block p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="service" 
                  value={srv.id} 
                  checked={selectedService === srv.id} 
                  onChange={() => setSelectedService(srv.id)} 
                  className="mr-2"
                />
                {srv.name} - ${srv.price} ({srv.duration} min)
              </label>
            ))}
          </div>
          <button 
            disabled={!selectedService} 
            onClick={handleNextStep} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >Siguiente</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl mb-4">Paso 2: Elige un Empleado</h2>
          <div className="space-y-2">
            {employees.map(emp => (
              <label key={emp.id} className="block p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="employee" 
                  value={emp.id} 
                  checked={selectedEmployee === emp.id} 
                  onChange={() => setSelectedEmployee(emp.id)} 
                  className="mr-2"
                />
                {emp.name}
              </label>
            ))}
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={handlePrevStep} className="px-4 py-2 bg-gray-300 rounded">Atrás</button>
            <button 
              disabled={!selectedEmployee} 
              onClick={handleNextStep} 
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            >Siguiente</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl mb-4">Paso 3: Elige Fecha y Hora</h2>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTime(null);
            }}
            className="border p-2 w-full mb-4 rounded"
            min={new Date().toISOString().split("T")[0]}
          />
          
          {selectedDate && (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedTime(slot)}
                    className={`p-2 border rounded ${selectedTime?.startTime === slot.startTime ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {slot.startTime}
                  </button>
                ))
              ) : (
                <p className="col-span-3 text-gray-500">No hay horarios disponibles.</p>
              )}
            </div>
          )}

          <div className="mt-4 flex space-x-2">
            <button onClick={handlePrevStep} className="px-4 py-2 bg-gray-300 rounded">Atrás</button>
            <button 
              disabled={!selectedDate || !selectedTime} 
              onClick={handleNextStep} 
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            >Siguiente</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-xl mb-4">Paso 4: Confirma tus Datos</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Nombre</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input 
                type="email" 
                value={customerEmail} 
                onChange={e => setCustomerEmail(e.target.value)} 
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div className="mt-6 flex space-x-2">
            <button onClick={handlePrevStep} className="px-4 py-2 bg-gray-300 rounded">Atrás</button>
            <button 
              disabled={!customerName || !customerEmail} 
              onClick={handleConfirm} 
              className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
            >Confirmar Reserva</button>
          </div>
        </div>
      )}
    </div>
  );
}
