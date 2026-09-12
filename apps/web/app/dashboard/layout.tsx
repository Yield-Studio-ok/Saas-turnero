import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar Dueño */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-4 border-b border-blue-800">
          <h2 className="text-xl font-bold">Mi Local</h2>
          <p className="text-sm text-blue-300">Panel de Control</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
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
            Cat�logo
          </Link>
          <Link
            href="/dashboard/perfil"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Perfil del Local
          </Link>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:text-white transition">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
          <h1 className="text-lg font-medium text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
              D
            </div>
            <span className="text-sm font-medium text-gray-600">Dueño</span>
          </div>
        </header>
        <div className="p-6 flex-1 overflow-auto text-gray-900">{children}</div>
      </main>
    </div>
  );
}
