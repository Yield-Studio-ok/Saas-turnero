"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import Chatbot from "../../components/Chatbot";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Nuevo turno reservado",
    message: "Juan Pérez reservó un Corte Clásico para mañana a las 14:00.",
    time: "Hace 10 min",
    read: false,
  },
  {
    id: "notif-2",
    title: "Nueva reseña de 5 estrellas",
    message: "Un cliente dejó una calificación excelente para tu local.",
    time: "Hace 1 hora",
    read: false,
  },
  {
    id: "notif-3",
    title: "Recordatorio de turno",
    message: "Tienes un turno programado en 30 minutos.",
    time: "Hace 2 horas",
    read: false,
  },
  {
    id: "notif-4",
    title: "Actualización de sistema",
    message: "El motor de reservas se actualizó a la última versión.",
    time: "Ayer",
    read: true,
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      router.push("/login");
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
  const userRoleLabel =
    user?.role === "superadmin"
      ? "Superadmin"
      : user?.role === "owner"
        ? "Dueño"
        : user?.role === "employee"
          ? "Empleado"
          : "Usuario";

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-slate-50">
        <DashboardSidebar />

        {/* Main content */}
        <main className="flex-1 flex flex-col relative min-w-0">
          <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 justify-between flex-shrink-0 z-10">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notificaciones (Campana Interactiva) */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
                  aria-label="Ver notificaciones"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </button>

                {/* Popover / Dropdown Menu de Notificaciones */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-semibold text-gray-800 text-sm">Notificaciones</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Marcar leídas
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 text-center">
                          No hay notificaciones
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => toggleRead(n.id)}
                            className={`p-3.5 hover:bg-gray-50 cursor-pointer transition flex items-start gap-3 ${
                              !n.read ? "bg-blue-50/50" : ""
                            }`}
                          >
                            <div
                              className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                                !n.read ? "bg-blue-600" : "bg-transparent"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-slate-200 mx-1" />

              {/* Perfil de Usuario y Logout */}
              <div className="relative" ref={userMenuRef}>
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">
                      {user?.email || "Mi Cuenta"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">{userRoleLabel}</p>
                  </div>
                  <div className="h-9 w-9 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-full flex items-center justify-center font-bold border border-blue-200/50 shadow-sm group-hover:shadow transition-all">
                    {userInitial}
                  </div>
                </div>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Conectado como</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="p-8 flex-1 overflow-auto text-slate-900 bg-slate-50/50">{children}</div>

          {/* Floating Chatbot Component */}
          <Chatbot />
        </main>
      </div>
    </ProtectedRoute>
  );
}
