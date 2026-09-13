import Link from "next/link";
import { ArrowRight, CheckCircle, Calendar, Users, BarChart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">Turnero</div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/crear-local" className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section - B2B Fresha Inspiration */}
      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            El software líder para <span className="text-blue-600">salones y barberías</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
            Gestiona citas, personal y clientes desde un solo lugar. Haz crecer tu negocio con la plataforma de reservas más intuitiva del mercado.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/crear-local" className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              Prueba gratis <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500 pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Sin tarjeta de crédito
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Configuración en 5 min
            </div>
          </div>
        </div>
        
        {/* Placeholder for Hero Image */}
        <div className="relative h-[500px] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-2xl border border-slate-200">
           <div className="absolute inset-0 flex items-center justify-center text-slate-400">
             [Hero Image Placeholder]
           </div>
        </div>
      </main>
      
    </div>
  );
}
