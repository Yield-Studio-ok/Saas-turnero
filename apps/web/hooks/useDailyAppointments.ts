"use client";

import { useEffect, useState, useMemo } from "react";
import type { Appointment, AppointmentStatus } from "../types/appointment";
import { subscribeToDailyAppointments, formatDateToYYYYMMDD } from "../lib/appointments-service";

export interface UseDailyAppointmentsOptions {
  employeeId?: string;
  status?: AppointmentStatus | string;
  initialData?: Appointment[];
}

export interface UseDailyAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: Error | null;
  dateKey: string;
}

/**
 * Hook de React para escuchar en tiempo real los turnos del día para un local.
 *
 * @param localId Identificador del local (tenantId)
 * @param date Fecha para la que se consultan los turnos (Date o string YYYY-MM-DD). Por defecto hoy.
 * @param options Filtros opcionales por employeeId, status, o datos iniciales.
 *
 * @example
 * ```tsx
 * const { appointments, loading, error, dateKey } = useDailyAppointments(localId, selectedDate);
 * ```
 */
export function useDailyAppointments(
  localId: string | null | undefined,
  date: string | Date = new Date(),
  options?: UseDailyAppointmentsOptions,
): UseDailyAppointmentsReturn {
  const dateKey = useMemo(() => formatDateToYYYYMMDD(date), [date]);
  const employeeId = options?.employeeId;
  const status = options?.status;
  const initialData = options?.initialData;

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

    const unsubscribe = subscribeToDailyAppointments(
      localId,
      dateKey,
      (data) => {
        let filtered = data;
        if (employeeId) {
          filtered = filtered.filter((appt) => appt.employeeId === employeeId);
        }
        if (status) {
          filtered = filtered.filter((appt) => appt.status === status);
        }
        setAppointments(filtered);
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
  }, [localId, dateKey, employeeId, status, initialData]);

  return { appointments, loading, error, dateKey };
}

export default useDailyAppointments;
