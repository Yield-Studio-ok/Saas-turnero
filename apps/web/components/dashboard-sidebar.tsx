"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  CalendarDays, 
  BookOpen, 
  Star, 
  Store, 
  TrendingUp, 
  LogOut,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Turnos", href: "/dashboard/turnos", icon: CalendarDays },
  { name: "Catalogo", href: "/dashboard/catalogo", icon: BookOpen },
  { name: "Resenas", href: "/dashboard/reviews", icon: Star },
  { name: "Perfil del Local", href: "/dashboard/perfil", icon: Store },
];

const proItems = [
  { name: "Analiticas", href: "/dashboard/analiticas", icon: TrendingUp },
];

const ownerItems = [
  { name: "Finanzas", href: "/dashboard/finanzas", icon: TrendingUp },
  { name: "Legal", href: "/dashboard/legal", icon: BookOpen },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isOwner = user?.role === "owner" || user?.role === "superadmin";

  return (
    <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/60 bg-[#0B1120]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            T
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Turnero</h2>
            <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mt-0.5">Workspace</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu Principal</p>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive ? "bg-blue-600/10 text-blue-400 font-medium" : "hover:bg-slate-800/50 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-200"}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-500" />}
            </Link>
          );
        })}

        {isOwner && (
          <div className="pt-4">
            <div className="px-3 flex items-center gap-2 mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gestion</p>
            </div>
            {ownerItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? "bg-blue-600/10 text-blue-400 font-medium" : "hover:bg-slate-800/50 hover:text-slate-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-200"}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-blue-500" />}
                </Link>
              );
            })}
          </div>
        )}

        {/* PRO Section */}
        <div className="pt-8 mb-2">
          <div className="px-3 flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-bold text-amber-400/90 uppercase tracking-wider">Avanzado</p>
          </div>
          
          {proItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? "bg-blue-600/10 text-blue-400 font-medium" : "hover:bg-slate-800/50 hover:text-slate-100"}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-200"}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-amber-500" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/60 bg-[#0B1120]/50">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesion</span>
        </button>
      </div>
    </aside>
  );
}
