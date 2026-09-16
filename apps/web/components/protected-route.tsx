"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user) {
      // Validate roles (Dueño or Empleado could be 'owner' or 'employee', or check if valid role)
      if (user.role !== "owner" && user.role !== "employee") {
         // redirect somewhere else if not authorized for dashboard? Or just let them be if they have a dashboard.
         // Wait, the ticket says "validates the user role (Dueño vs Empleado) using the JWT token and redirects unauthorized access"
         router.push("/login"); // or another page
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // We could conditionally render different dashboards based on role, 
  // but for now, just validate they are authorized
  if (user.role !== "owner" && user.role !== "employee") {
    return null;
  }

  return <>{children}</>;
}
