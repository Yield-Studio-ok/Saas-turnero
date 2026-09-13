"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PaywallModal } from "@/components/paywall-modal";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: { name: string; email: string };
  appointment?: { service: { name: string } };
};

export default function ReviewsDashboard() {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // En un caso real se obtendría del contexto del negocio actual
  const businessId = "YOUR_BUSINESS_ID";

  useEffect(() => {
    if (user && user.plan !== "PRO" && user.plan !== "PREMIUM") {
      setShowPaywall(true);
      setLoading(false);
      return;
    } else {
      setShowPaywall(false);
    }

    fetch(`http://localhost:4000/reviews/business/${businessId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching");
        return res.json();
      })
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [businessId, user]);

  if (loading) return <div className="p-6 text-gray-700">Cargando reseñas...</div>;

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="relative">
      <div className={showPaywall ? "blur-sm pointer-events-none select-none opacity-50 space-y-6" : "space-y-6"}>
        <div className="p-6 max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Reseñas y Fidelidad</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">Calificación Promedio</h2>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-yellow-500">{averageRating}</span>
                <span className="text-2xl text-yellow-400">★</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Basado en {reviews.length} reseñas</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">Programa de Fidelidad</h2>
              <p className="text-sm text-gray-600 mb-4">
                Tus clientes suman <span className="font-bold text-blue-600">10 puntos</span> por cada
                reseña que dejan después de su turno.
              </p>
              <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-md text-sm font-medium inline-block">
                Activo
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Últimas Reseñas</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {reviews.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">Aún no tienes reseñas.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {review.user?.name || "Cliente anónimo"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {review.appointment?.service?.name || "Servicio General"}
                        </p>
                      </div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-3 text-sm italic">"{review.comment}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-3">
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
        </div>
      </div>
      
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => router.push("/dashboard")}
        title="Gestiona tu Reputación"
        description="Actualiza a PRO para leer y responder reseñas de tus clientes, centralizando la reputación de tu negocio."
      />
    </div>
  );
}
