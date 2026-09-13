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
            href="/dashboard/servicios"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Servicios
          </Link>
          <Link
            href="/dashboard/perfil"
            className="block px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Perfil del Local
          </Link>
          
          <div className="pt-4 mt-2 border-t border-blue-800/50">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">PRO / Avanzado</p>
            <Link
              href="/dashboard/analiticas"
              className="flex items-center justify-between px-4 py-2 rounded-md hover:bg-blue-800 transition"
            >
              <span>Analíticas</span>
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </Link>
            <Link
              href="/dashboard/reviews"
              className="flex items-center justify-between px-4 py-2 rounded-md hover:bg-blue-800 transition"
            >
              <span>Reseñas</span>
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:text-white transition">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between flex-shrink-0">
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
