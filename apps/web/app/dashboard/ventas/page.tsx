"use client";

import React from "react";
import { EmpleadoVentas } from "@/components/empleado-ventas";
import { useAuth } from "@/lib/auth-context";

export default function VentasPage() {
  const { user } = useAuth();
  const employeeName = user?.name || (user?.email ? user.email.split("@")[0] : "Empleado");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <EmpleadoVentas employeeName={employeeName} />
    </div>
  );
}
