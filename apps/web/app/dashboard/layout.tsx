"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Chatbot from "../../components/Chatbot";
import { useAuth } from "../../lib/auth-context";

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
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
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

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar Dueño */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-blue-800">
          <h2 className="text-xl font-bold">Mi Local</h2>
          <p className="text-sm text-blue-300">Panel de Control</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Inicio
          </Link>
          <Link
            href="/dashboard/turnos"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Turnos
          </Link>
          <Link
            href="/dashboard/catalogo"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Catálogo
          </Link>
          <Link
            href="/dashboard/finanzas"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Finanzas
          </Link>
          <Link
            href="/dashboard/legal"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Legal
          </Link>
          <Link
            href="/dashboard/reviews"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Reseñas
          </Link>
          <Link
            href="/dashboard/perfil"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Perfil del Local
          </Link>

          <div className="pt-4 mt-2 border-t border-blue-800/50">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              PRO / Avanzado
            </p>
            <Link
              href="/dashboard/analiticas"
              className="flex items-center justify-between px-4 py-2 rounded-md hover:bg-blue-800 transition"
            >
              <span>Analíticas</span>
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-800/50 rounded-md transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
          <h1 className="text-lg font-medium text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition"
                aria-label="Notificaciones"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Popover / Dropdown Menu */}
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
                      <p className="p-4 text-sm text-gray-500 text-center">No hay notificaciones</p>
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
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                {user?.email ? user.email.charAt(0).toUpperCase() : "D"}
              </div>
              <span className="text-sm font-medium text-gray-600 hidden sm:inline">
                {user?.role === "employee" ? "Empleado" : "Dueño"}
              </span>
            </div>
          </div>
        </header>
        <div className="p-6 flex-1 overflow-auto text-gray-900">{children}</div>

        {/* Floating Chatbot Component */}
        <Chatbot />
      </main>
    </div>
  );
}
