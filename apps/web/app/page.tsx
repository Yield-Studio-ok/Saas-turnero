import Link from "next/link";
import { ArrowRight, CheckCircle, Calendar, Users, BarChart, Check } from "lucide-react";

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

      {/* Pricing Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Planes simples y transparentes</h2>
            <p className="text-lg text-slate-600">Comienza gratis y mejora tu plan a medida que tu negocio crece.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Básico</h3>
              <p className="text-slate-500 mb-6">Para profesionales independientes</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900"></span>
                <span className="text-slate-500">/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-blue-600" /> 1 Profesional</li>
                <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-blue-600" /> Citas ilimitadas</li>
                <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-blue-600" /> Recordatorios básicos</li>
              </ul>
              <Link href="/crear-local" className="block text-center w-full py-3 rounded-full border-2 border-slate-200 text-slate-900 font-semibold hover:border-slate-300 transition-colors">
                Comenzar gratis
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-900 shadow-xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                Más popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <p className="text-slate-400 mb-6">Para salones en crecimiento</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white"></span>
                <span className="text-slate-400">/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-blue-400" /> Hasta 5 Profesionales</li>
                <li className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-blue-400" /> Recordatorios por WhatsApp</li>
                <li className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-blue-400" /> Reportes avanzados</li>
                <li className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-blue-400" /> Control de inventario</li>
              </ul>
              <Link href="/crear-local" className="block text-center w-full py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
                Probar Pro
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ilimitado</h3>
              <p className="text-slate-500 mb-6">Para franquicias y cadenas</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900"></span>
                <span className="text-slate-500">/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-blue-600" /> Profesionales ilimitados</li>
                <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-blue-600" /> Múltiples sucursales</li>
                <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-blue-600" /> API de integración</li>
                <li className="flex items-center gap-3 text-slate-600"><Check className="w-5 h-5 text-blue-600" /> Soporte prioritario 24/7</li>
              </ul>
              <Link href="/crear-local" className="block text-center w-full py-3 rounded-full border-2 border-slate-200 text-slate-900 font-semibold hover:border-slate-300 transition-colors">
                Contactar ventas
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
