"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { PaywallModal } from "@/components/paywall-modal";
import { useRouter } from "next/navigation";
import { hasPlanAccess } from "@/lib/plan-utils";
import { Plus, CheckCircle2, X, MessageSquare, ShieldCheck } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: { name: string; email: string };
  appointment?: { service: { name: string } };
};

interface ClientReview {
  id: string;
  clientName: string;
  rating: number;
  tags: string[];
  comment: string;
  date: string;
}

const initialMockReviews: Review[] = [
  {
    id: "rev-1",
    rating: 5,
    comment: "Excelente atención de Juan. Muy puntual, prolijo con el degradé y re buena onda.",
    createdAt: "2026-10-04T16:30:00Z",
    user: { name: "Martín Gómez", email: "martin@gmail.com" },
    appointment: { service: { name: "Corte y Barba" } },
  },
  {
    id: "rev-2",
    rating: 5,
    comment: "El mejor corte que me hicieron en el barrio. Recomendadísimo.",
    createdAt: "2026-10-02T11:00:00Z",
    user: { name: "Santiago Benítez", email: "santi@gmail.com" },
    appointment: { service: { name: "Corte Clásico" } },
  },
  {
    id: "rev-3",
    rating: 4,
    comment: "Muy buen servicio y rapidez. Volveré el próximo mes.",
    createdAt: "2026-09-28T18:15:00Z",
    user: { name: "Lucas Pereyra", email: "lucas@gmail.com" },
    appointment: { service: { name: "Perfilado de Barba" } },
  },
];

const initialClientRatings: ClientReview[] = [
  {
    id: "cr-1",
    clientName: "Martín Gómez",
    rating: 5,
    tags: ["Puntual", "Respetuoso", "Excelente trato"],
    comment: "Llegó 5 minutos antes y fue muy claro con el estilo deseado. Excelente cliente.",
    date: "2026-10-04",
  },
  {
    id: "cr-2",
    clientName: "Santiago Benítez",
    rating: 5,
    tags: ["Puntual", "Amable"],
    comment: "Muy buena comunicación, cliente habitual del local.",
    date: "2026-10-02",
  },
];

const feedbackTagsOptions = [
  "Puntual",
  "Respetuoso",
  "Excelente trato",
  "Comunicación clara",
  "Dejó propina",
  "Asistencia confirmada",
];

export default function ReviewsDashboard() {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isEmployee = user?.role === "employee";
  const businessId = user?.tenantId || "local-basic";

  // Mutual review state
  const [activeTab, setActiveTab] = useState<"clientes" | "mutuas">("clientes");
  const [clientReviews, setClientReviews] = useState<ClientReview[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("turnero_client_reviews");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialClientRatings;
  });

  // Modal State
  const [showRateModal, setShowRateModal] = useState(false);
  const [clientNameToRate, setClientNameToRate] = useState("");
  const [ratingStars, setRatingStars] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Puntual", "Respetuoso"]);
  const [ratingComment, setRatingComment] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // If user is employee, do NOT block with owner paywall
    if (!isEmployee && user && !hasPlanAccess(user?.plan, "PRO")) {
      setShowPaywall(true);
      setLoading(false);
      return;
    } else {
      setShowPaywall(false);
    }

    apiFetch<Review[]>(`/reviews/business/${businessId}`)
      .then((data) => {
        if (data && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(initialMockReviews);
        }
      })
      .catch((err) => {
        console.error("Error cargando reseñas:", err);
        setReviews(initialMockReviews);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [businessId, user, isEmployee]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmitClientRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNameToRate.trim()) return;

    const newRating: ClientReview = {
      id: "cr_" + Date.now(),
      clientName: clientNameToRate.trim(),
      rating: ratingStars,
      tags: selectedTags,
      comment: ratingComment.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRating, ...clientReviews];
    setClientReviews(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("turnero_client_reviews", JSON.stringify(updated));
    }

    setShowRateModal(false);
    setClientNameToRate("");
    setRatingComment("");
    setSelectedTags(["Puntual", "Respetuoso"]);
    setRatingStars(5);

    setToastMessage("¡Calificación al cliente guardada con éxito!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (loading) return <div className="p-6 text-gray-700">Cargando reseñas...</div>;

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="relative">
      <div
        className={
          showPaywall ? "blur-sm pointer-events-none select-none opacity-50 space-y-6" : "space-y-6"
        }
      >
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  {isEmployee ? "Reseñas Mutuas" : "Reseñas y Fidelidad"}
                </h1>
                {isEmployee && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                    Modo Empleado
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {isEmployee
                  ? "Consulta las valoraciones de tus clientes y califica a los clientes atendidos."
                  : "Supervisa la satisfacción de tus clientes y programa de fidelidad."}
              </p>
            </div>

            {isEmployee && (
              <button
                onClick={() => setShowRateModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Calificar a un Cliente</span>
              </button>
            )}
          </div>

          {toastMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {isEmployee ? "Tu Calificación Promedio" : "Calificación del Negocio"}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold text-yellow-500">{averageRating}</span>
                <div className="flex text-yellow-400 text-2xl">{"★★★★★"}</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Basado en {reviews.length} opiniones verificadas
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {isEmployee ? "Reseñas Mutuas Emitidas" : "Programa de Fidelidad"}
              </h2>
              {isEmployee ? (
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-blue-600">
                      {clientReviews.length}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      clientes calificados por ti
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Ayuda al equipo a identificar clientes ejemplares y preferencias.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Tus clientes suman <span className="font-bold text-blue-600">10 puntos</span>{" "}
                    por cada reseña que dejan después de su turno.
                  </p>
                  <div className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-semibold inline-block">
                    Activo
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs (Employee View) */}
          {isEmployee && (
            <div className="flex border-b border-gray-200 gap-6">
              <button
                onClick={() => setActiveTab("clientes")}
                className={`py-3 font-semibold text-sm transition relative cursor-pointer ${
                  activeTab === "clientes"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Opiniones de Clientes Recibidas ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab("mutuas")}
                className={`py-3 font-semibold text-sm transition relative cursor-pointer ${
                  activeTab === "mutuas"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Mis Calificaciones a Clientes ({clientReviews.length})
              </button>
            </div>
          )}

          {/* Tab 1: Customer Reviews Received */}
          {(!isEmployee || activeTab === "clientes") && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Opiniones de Clientes</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {reviews.length === 0 ? (
                  <p className="p-8 text-gray-400 text-center text-sm">Aún no tienes reseñas.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="p-6 hover:bg-gray-50/80 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.user?.name || "Cliente anónimo"}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {review.appointment?.service?.name || "Servicio General"}
                          </p>
                        </div>
                        <div className="flex text-yellow-400 text-sm">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= review.rating ? "text-yellow-400" : "text-gray-200"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mt-2.5 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-3">
                        {new Date(review.createdAt).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Mutual Reviews - Employee Rating Client */}
          {isEmployee && activeTab === "mutuas" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Calificaciones Emitidas a Clientes</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Historial de evaluaciones que registraste tras atender a cada cliente.
                  </p>
                </div>
                <button
                  onClick={() => setShowRateModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
                >
                  + Calificar Cliente
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {clientReviews.length === 0 ? (
                  <p className="p-8 text-gray-400 text-center text-sm">
                    Aún no has registrado calificaciones mutuas. Usa el botón &quot;Calificar a un
                    Cliente&quot; para registrar la primera.
                  </p>
                ) : (
                  clientReviews.map((cr) => (
                    <div key={cr.id} className="p-6 hover:bg-gray-50/80 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{cr.clientName}</h4>
                            <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Reseña Mutua
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {cr.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex text-yellow-400 text-sm">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={star <= cr.rating ? "text-yellow-400" : "text-gray-200"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {cr.comment && (
                        <p className="text-slate-600 mt-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                          &ldquo;{cr.comment}&rdquo;
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-2.5">Fecha: {cr.date}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Calificar al Cliente Atendido */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Calificar Cliente Atendido</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Reseña mutua interna sobre puntualidad y comportamiento.
                </p>
              </div>
              <button
                onClick={() => setShowRateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClientRating} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lucas Romero"
                  value={clientNameToRate}
                  onChange={(e) => setClientNameToRate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Stars rating */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Puntuación General
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingStars(star)}
                      className={`text-2xl transition cursor-pointer ${
                        star <= ratingStars
                          ? "text-yellow-400 scale-110"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-600 ml-2">
                    {ratingStars} de 5 estrellas
                  </span>
                </div>
              </div>

              {/* Tags / Aspectos valorados */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Aspectos Destacados
                </label>
                <div className="flex flex-wrap gap-2">
                  {feedbackTagsOptions.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 border-blue-300 shadow-xs"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Observaciones o Notas Internas
                </label>
                <textarea
                  rows={3}
                  placeholder="Comentarios sobre el servicio, puntualidad o preferencias del cliente..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition"
                >
                  Guardar Calificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isEmployee && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => router.push("/dashboard")}
          title="Gestiona tu Reputación"
          description="Actualiza a PRO para leer y responder reseñas de tus clientes, centralizando la reputación de tu negocio."
        />
      )}
    </div>
  );
}
