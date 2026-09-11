export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Appointment {
  id: string;
  tenantId: string;
  localId?: string;
  employeeId: string;
  serviceId: string;
  serviceName?: string;
  employeeName?: string;
  date: string; // Formato YYYY-MM-DD
  startTime: string; // Ej: "09:00", "14:30"
  endTime: string; // Ej: "09:30", "15:00"
  duration: number; // Duración en minutos
  status: AppointmentStatus | string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  price?: number;
  notes?: string;
  createdAt?: string | number | { seconds: number; nanoseconds: number } | null;
  updatedAt?: string | number | { seconds: number; nanoseconds: number } | null;
}

export interface AppointmentFilterOptions {
  date?: string | Date;
  employeeId?: string;
  status?: AppointmentStatus | string;
}

export interface CreateAppointmentInput {
  tenantId?: string;
  localId?: string;
  employeeId: string;
  serviceId: string;
  serviceName?: string;
  employeeName?: string;
  date: string | Date;
  startTime: string;
  endTime?: string;
  duration?: number;
  status?: AppointmentStatus | string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  price?: number;
  notes?: string;
}
