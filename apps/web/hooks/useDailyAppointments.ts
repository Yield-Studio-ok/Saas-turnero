"use client";

import { useEffect, useState, useMemo } from "react";
import type { Appointment, AppointmentStatus } from "../types/appointment";
import { subscribeToDailyAppointments, formatDateToYYYYMMDD } from "../lib/appointments-service";
import { apiFetch } from "../lib/api";

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
    let isMounted = true;

    // 1. Fetch appointments from Postgres API
    apiFetch<any[]>(`/appointments?businessId=${localId}&date=${dateKey}`)
      .then((apiData) => {
        if (!isMounted || !Array.isArray(apiData) || apiData.length === 0) return;
        const mappedFromApi: Appointment[] = apiData.map((a) => ({
          id: a.id,
          tenantId: a.businessId,
          localId: a.businessId,
          employeeId: a.employeeId,
          serviceId: a.serviceId,
          serviceName: a.service?.name || "Servicio",
          employeeName: a.employee?.name || "Empleado",
          date: a.date,
          startTime: a.startTime,
          endTime: a.endTime,
          duration: a.service?.duration || 30,
          status: a.status || "confirmed",
          customerName: a.customerName || "Cliente",
          customerPhone: a.customerPhone || "",
          customerEmail: a.customerEmail || "",
          price: a.service?.price || 0,
          notes: a.notes || "",
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        }));

        setAppointments((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const additions = mappedFromApi.filter((a) => !existingIds.has(a.id));
          if (additions.length === 0) return prev;
          let combined = [...prev, ...additions];
          if (employeeId) combined = combined.filter((appt) => appt.employeeId === employeeId);
          if (status) combined = combined.filter((appt) => appt.status === status);
          combined.sort((a, b) => a.startTime.localeCompare(b.startTime));
          return combined;
        });
      })
      .catch((err) => {
        console.warn("No se pudieron cargar turnos desde el API:", err);
      });

    // 2. Realtime listener on Firestore
    const unsubscribe = subscribeToDailyAppointments(
      localId,
      dateKey,
      (data) => {
        if (!isMounted) return;
        let filtered = data;
        if (employeeId) {
          filtered = filtered.filter((appt) => appt.employeeId === employeeId);
        }
        if (status) {
          filtered = filtered.filter((appt) => appt.status === status);
        }
        setAppointments((prev) => {
          const prevMap = new Map(prev.map((a) => [a.id, a]));
          filtered.forEach((a) => prevMap.set(a.id, a));
          const merged = Array.from(prevMap.values());
          merged.sort((a, b) => a.startTime.localeCompare(b.startTime));
          return merged;
        });
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        setError(err);
        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [localId, dateKey, employeeId, status, initialData]);

  return { appointments, loading, error, dateKey };
}

export default useDailyAppointments;
