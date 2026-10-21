import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { formatDateToYYYYMMDD } from "../lib/appointments-service";
import { calculateAvailableSlots, TimeSlot } from "../lib/availability.engine";
import { TimeSlotOption } from "../components/booking/date-time-picker-modal";

export function useAvailability(
  localId: string,
  date: Date | null,
  openHours: string, // format: "09:00 - 20:00"
  serviceDuration: number,
) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlotOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!localId || !date) {
      setAvailableSlots([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    // Parse working hours from local.openHours
    const [start, end] = openHours.split(" - ");
    const workingHours: TimeSlot[] = [];
    if (start && end) {
      workingHours.push({ startTime: start.trim(), endTime: end.trim() });
    } else {
      workingHours.push({ startTime: "09:00", endTime: "20:00" });
    }

    const dateStr = formatDateToYYYYMMDD(date);

    // Consultar directamente la API de NestJS en PostgreSQL en lugar de abrir WebChannels a Firestore
    apiFetch<any[]>(`/appointments?businessId=${encodeURIComponent(localId)}&date=${dateStr}`)
      .then((appointments) => {
        if (!isMounted) return;
        const bookedSlots: TimeSlot[] = (Array.isArray(appointments) ? appointments : [])
          .filter(
            (app) =>
              app.status !== "Cancelado" &&
              app.status !== "cancelado" &&
              app.status !== "cancelled",
          )
          .map((app) => ({
            startTime: app.startTime,
            endTime: app.endTime,
          }));

        const slots = calculateAvailableSlots({
          workingHours,
          appointments: bookedSlots,
          serviceDuration: serviceDuration || 30,
          slotInterval: serviceDuration || 30,
        });

        const timeSlotOptions: TimeSlotOption[] = slots.map((slot) => {
          const hour = parseInt(slot.startTime.split(":")[0], 10);
          const period = hour < 14 ? "morning" : "afternoon";

          return {
            id: `${period.charAt(0)}-${slot.startTime}`,
            startTime: slot.startTime,
            endTime: slot.endTime,
            available: true,
            period: period as "morning" | "afternoon",
          };
        });

        setAvailableSlots(timeSlotOptions);
      })
      .catch((err) => {
        console.warn(
          "[useAvailability] Error al consultar appointments, generando slots base:",
          err,
        );
        const slots = calculateAvailableSlots({
          workingHours,
          appointments: [],
          serviceDuration: serviceDuration || 30,
          slotInterval: serviceDuration || 30,
        });
        if (isMounted) {
          setAvailableSlots(
            slots.map((slot) => {
              const hour = parseInt(slot.startTime.split(":")[0], 10);
              const period = hour < 14 ? "morning" : "afternoon";
              return {
                id: `${period.charAt(0)}-${slot.startTime}`,
                startTime: slot.startTime,
                endTime: slot.endTime,
                available: true,
                period: period as "morning" | "afternoon",
              };
            }),
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [localId, date, openHours, serviceDuration]);

  return { availableSlots, isLoading };
}
