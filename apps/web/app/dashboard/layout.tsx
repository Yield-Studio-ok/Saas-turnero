import { DashboardSidebar } from "@/components/dashboard-sidebar";
import Chatbot from "../../components/Chatbot";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">Mi Cuenta</p>
                  <p className="text-xs text-slate-500 font-medium">Administrador</p>
                </div>
                <div className="h-9 w-9 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 rounded-full flex items-center justify-center font-bold border border-blue-200/50 shadow-sm group-hover:shadow transition-all">
                  D
                </div>
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
