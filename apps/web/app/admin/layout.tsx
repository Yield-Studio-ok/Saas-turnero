import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">Super Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded-md hover:bg-gray-800 transition">
            Dashboard
          </Link>
          <Link
            href="/admin/locales"
            className="block px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Locales
          </Link>
          <Link
            href="/admin/locales/nuevo"
            className="block px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Alta de Local
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white transition">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <h1 className="text-lg font-medium text-gray-800">Panel de Administración</h1>
        </header>
        <div className="p-6 flex-1 overflow-auto text-gray-900">{children}</div>
      </main>
    </div>
  );
}
