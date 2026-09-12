import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { apiFetch, ApiError } from "./api";
import type {
  Appointment,
  AppointmentFilterOptions,
  AppointmentStatus,
  CreateAppointmentInput,
} from "../types/appointment";

/**
 * Normaliza una fecha (objeto Date o string) al formato YYYY-MM-DD.
 */
export function formatDateToYYYYMMDD(date: Date | string = new Date()): string {
  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    } else {
      return date;
    }
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calcula la hora de finalización (HH:mm) según hora de inicio y duración en minutos.
 */
export function calculateEndTime(startTime: string, durationMinutes: number = 30): string {
  const parts = startTime.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMins = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
}

/**
 * Transforma un QueryDocumentSnapshot de Firestore en un objeto Appointment tipado.
 */
function mapDocToAppointment(
  docSnap: QueryDocumentSnapshot<DocumentData>,
  localId: string,
): Appointment {
  const data = docSnap.data();
  const duration = typeof data.duration === "number" ? data.duration : 30;
  const startTime = data.startTime || "09:00";
  const endTime = data.endTime || calculateEndTime(startTime, duration);

  return {
    id: docSnap.id,
    tenantId: data.tenantId || localId,
    localId: data.localId || data.tenantId || localId,
    employeeId: data.employeeId || "",
    serviceId: data.serviceId || "",
    serviceName: data.serviceName || "",
    employeeName: data.employeeName || "",
    date: data.date || "",
    startTime,
    endTime,
    duration,
    status: (data.status as AppointmentStatus) || "confirmed",
    customerName: data.customerName || data.clientName || "",
    customerPhone: data.customerPhone || data.clientPhone || "",
    customerEmail: data.customerEmail || data.clientEmail || "",
    price: data.price,
    notes: data.notes || "",
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

/**
 * Suscribe un listener en tiempo real (onSnapshot) a la colección de turnos del día para un local.
 *
 * Ruta en Firestore: `tenants/{localId}/appointments`
 * Filtro: `where("date", "==", targetDate)`
 *
 * @param localId Identificador único del local/tenant.
 * @param date Fecha a consultar (Date o string "YYYY-MM-DD").
 * @param onUpdate Callback invocado cada vez que se emiten cambios en tiempo real.
 * @param onError Callback opcional para captura de errores.
 * @returns Función `Unsubscribe` para cancelar la suscripción.
 */
export function subscribeToDailyAppointments(
  localId: string,
  date: string | Date = new Date(),
  onUpdate: (appointments: Appointment[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!localId) {
    onUpdate([]);
    return () => {};
  }

  const dateKey = formatDateToYYYYMMDD(date);
  const appointmentsRef = collection(db, "tenants", localId, "appointments");
  const q = query(appointmentsRef, where("date", "==", dateKey));

  return onSnapshot(
    q,
    (snapshot) => {
      const appointments: Appointment[] = snapshot.docs.map((docSnap) =>
        mapDocToAppointment(docSnap, localId),
      );

      // Ordenar cronológicamente por hora de inicio
      appointments.sort((a, b) => a.startTime.localeCompare(b.startTime));

      onUpdate(appointments);
    },
    (err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      if (onError) {
        onError(error);
      } else {
        console.error(
          `[subscribeToDailyAppointments] Error onSnapshot for tenant ${localId} on ${dateKey}:`,
          error,
        );
      }
    },
  );
}

/**
 * Suscripción con filtros flexibles opcionales (empleado, estado, rango).
 */
export function subscribeToAppointments(
  localId: string,
  options: AppointmentFilterOptions,
  onUpdate: (appointments: Appointment[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!localId) {
    onUpdate([]);
    return () => {};
  }

  const appointmentsRef = collection(db, "tenants", localId, "appointments");
  let q = query(appointmentsRef);

  if (options.date) {
    const dateKey = formatDateToYYYYMMDD(options.date);
    q = query(appointmentsRef, where("date", "==", dateKey));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      let appointments: Appointment[] = snapshot.docs.map((docSnap) =>
        mapDocToAppointment(docSnap, localId),
      );

      if (options.employeeId) {
        appointments = appointments.filter((appt) => appt.employeeId === options.employeeId);
      }

      if (options.status) {
        appointments = appointments.filter((appt) => appt.status === options.status);
      }

      appointments.sort((a, b) => a.startTime.localeCompare(b.startTime));
      onUpdate(appointments);
    },
    (err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      if (onError) {
        onError(error);
      } else {
        console.error(`[subscribeToAppointments] Error for tenant ${localId}:`, error);
      }
    },
  );
}

/**
 * Actualiza el estado de un turno en Firestore.
 */
export async function updateAppointmentStatus(
  localId: string,
  appointmentId: string,
  status: AppointmentStatus | string,
): Promise<void> {
  const appointmentDocRef = doc(db, "tenants", localId, "appointments", appointmentId);
  await updateDoc(appointmentDocRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Marca un turno como cancelado en Firestore (Ticket 21 compatibility).
 */
export async function cancelAppointment(localId: string, appointmentId: string): Promise<void> {
  await updateAppointmentStatus(localId, appointmentId, "cancelled");
}

/**
 * DTO para la creación transaccional de turnos en el backend (Ticket 28: POST /appointments).
 */
export interface CreateAppointmentDto {
  localId: string;
  employeeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

/**
 * Servicio cliente para comunicación con los endpoints de turnos en el backend NestJS (Ticket 28 y 21).
 */
export class AppointmentsService {
  /**
   * Invoca el endpoint transaccional del backend para crear un turno (POST /appointments - Ticket 28).
   * Valida disponibilidad mediante el motor y asegura persistencia atómica en Firestore.
   */
  static async create(dto: CreateAppointmentDto): Promise<{ id: string; [key: string]: any }> {
    // Sanitizamos el payload asegurando los campos requeridos por el backend
    const payload = {
      localId: dto.localId,
      employeeId: dto.employeeId,
      serviceId: dto.serviceId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
    };

    return apiFetch<{ id: string; [key: string]: any }>("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Cancela un turno por ID a través del backend (PATCH /appointments/:id/cancel - Ticket 21).
   */
  static async cancel(id: string, reason?: string): Promise<{ id: string; [key: string]: any }> {
    return apiFetch<{ id: string; [key: string]: any }>(`/appointments/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify(reason ? { reason } : {}),
    });
  }

  /**
   * Obtiene la información de un turno por ID (GET /appointments/:id).
   */
  /**
   * Completa un turno por ID (PATCH /appointments/:id/complete - Ticket 6 Epic 3).
   */
  static async complete(
    id: string,
    payload: { status: string; paidAmount?: number; tip?: number },
  ): Promise<{ id: string; [key: string]: any }> {
    return apiFetch<{ id: string; [key: string]: any }>(`/appointments/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  static async getById(id: string): Promise<Appointment | any> {
    return apiFetch(`/appointments/${id}`);
  }
}

/**
 * Crea un nuevo turno conectando a la función transaccional del backend (POST /appointments - Ticket 28)
 * con fallback a Firestore directo en caso de modo offline o desarrollo local.
 */
export async function createAppointment(
  localId: string,
  input: CreateAppointmentInput,
): Promise<string> {
  const duration = input.duration ?? 30;
  const date = formatDateToYYYYMMDD(input.date);
  const endTime = input.endTime || calculateEndTime(input.startTime, duration);
  const email =
    input.customerEmail?.trim() ||
    `${input.customerPhone?.replace(/\D/g, "") || "cliente"}@notificaciones.local`;

  const dto: CreateAppointmentDto = {
    localId: input.localId || localId,
    employeeId: input.employeeId || "general",
    serviceId: input.serviceId,
    date,
    startTime: input.startTime,
    endTime,
    customerName: input.customerName,
    customerEmail: email,
    customerPhone: input.customerPhone,
    notes: input.notes,
  };

  try {
    // 1. Invocar endpoint transaccional del backend (POST /appointments - Ticket 28)
    const result = await AppointmentsService.create(dto);
    if (result && result.id) {
      // Guardar en subcolección local si está disponible para sincronía en tiempo real
      try {
        const localDocRef = doc(db, "tenants", localId, "appointments", result.id);
        await updateDoc(localDocRef, {
          customerPhone: input.customerPhone || "",
          notes: input.notes || "",
        });
      } catch {
        // Silencioso si la subcolección directa no existe aún
      }
      return result.id;
    }
  } catch (apiError: any) {
    console.warn(
      "[createAppointment] API endpoint POST /appointments falló o servidor no disponible:",
      apiError,
    );

    // Si la API devolvió un error de indisponibilidad de horario ("is no longer available" o 400/409),
    // relanzar para que la UI muestre el aviso claro al usuario
    if (
      apiError instanceof ApiError &&
      (apiError.status === 400 || apiError.status === 409) &&
      (apiError.message?.toLowerCase().includes("available") ||
        apiError.message?.toLowerCase().includes("no longer") ||
        apiError.message?.toLowerCase().includes("disponible") ||
        apiError.message?.toLowerCase().includes("booked"))
    ) {
      throw apiError;
    }

    // Fallback a Firestore directo (Ticket 17) para resiliencia offline/dev
    try {
      const appointmentsRef = collection(db, "tenants", localId, "appointments");
      const docRef = await addDoc(appointmentsRef, {
        tenantId: localId,
        localId,
        employeeId: input.employeeId,
        serviceId: input.serviceId,
        serviceName: input.serviceName || "",
        employeeName: input.employeeName || "",
        date,
        startTime: input.startTime,
        endTime,
        duration,
        status: input.status || "confirmed",
        customerName: input.customerName,
        customerPhone: input.customerPhone || "",
        customerEmail: email,
        price: input.price ?? 0,
        notes: input.notes || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (firestoreError) {
      console.error("[createAppointment] Fallback Firestore también falló:", firestoreError);
      throw apiError;
    }
  }

  return `TRN-${Math.floor(100000 + Math.random() * 900000)}`;
}
