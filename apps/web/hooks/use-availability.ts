import { useState, useEffect } from "react";
import { subscribeToDailyAppointments } from "../lib/appointments-service";
import { calculateAvailableSlots, TimeSlot } from "../lib/availability.engine";
import { TimeSlotOption } from "../components/booking/date-time-picker-modal";

export function useAvailability(
  localId: string,
  date: Date | null,
  openHours: string, // format: "09:00 - 20:00"
  serviceDuration: number
) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlotOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!localId || !date) {
      setAvailableSlots([]);
      return;
    }

    setIsLoading(true);

    // Parse working hours from local.openHours
    const [start, end] = openHours.split(" - ");
    const workingHours: TimeSlot[] = [];
    if (start && end) {
      workingHours.push({ startTime: start.trim(), endTime: end.trim() });
    } else {
      // Fallback default
      workingHours.push({ startTime: "09:00", endTime: "20:00" });
    }

    const unsubscribe = subscribeToDailyAppointments(
      localId,
      date,
      (appointments) => {
        // Map Appointment[] to TimeSlot[]
        const bookedSlots: TimeSlot[] = appointments
          .filter(app => app.status !== "Cancelado" && app.status !== "cancelado" && app.status !== "cancelled")
          .map((app) => ({
            startTime: app.startTime,
            endTime: app.endTime,
          }));

        const slots = calculateAvailableSlots({
          workingHours,
          appointments: bookedSlots,
          serviceDuration,
          slotInterval: serviceDuration, // usually the same as service duration or custom interval
        });

        // Map to TimeSlotOption
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
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to fetch appointments:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [localId, date, openHours, serviceDuration]);

  return { availableSlots, isLoading };
}
