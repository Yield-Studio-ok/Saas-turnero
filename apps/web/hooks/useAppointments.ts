"use client";

import { useEffect, useState } from "react";
import type { Appointment, AppointmentFilterOptions } from "../types/appointment";
import { subscribeToAppointments } from "../lib/appointments-service";

export interface UseAppointmentsOptions extends AppointmentFilterOptions {
  initialData?: Appointment[];
}

export interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook de React para escuchar en tiempo real turnos con filtros dinámicos.
 */
export function useAppointments(
  localId: string | null | undefined,
  options: UseAppointmentsOptions = {},
): UseAppointmentsReturn {
  const { initialData, ...filters } = options;
  const [appointments, setAppointments] = useState<Appointment[]>(initialData ?? []);
  const [loading, setLoading] = useState<boolean>(Boolean(localId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!localId) {
      setAppointments(initialData ?? []);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAppointments(
      localId,
      filters,
      (data) => {
        setAppointments(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [localId, filters.date, filters.employeeId, filters.status, initialData]);

  return { appointments, loading, error };
}

export default useAppointments;
