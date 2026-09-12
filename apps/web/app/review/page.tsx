"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("businessId") || "";
  const appointmentId = searchParams.get("appointmentId") || "";
  const userId = searchParams.get("userId") || ""; // could be fetched from context

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          businessId,
          appointmentId: appointmentId || undefined,
          userId: userId || undefined,
        }),
      });

      if (!res.ok) throw new Error("Error al enviar reseña");
      setSuccess(true);
    } catch {
      alert("Ocurrió un error al enviar la reseña");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">¡Gracias por tu reseña!</h2>
        <p className="text-gray-600 mb-6">Tus comentarios nos ayudan a mejorar.</p>
        <p className="text-sm text-blue-600 font-medium">¡Has sumado 10 puntos de fidelidad!</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Déjanos tu reseña</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Puntuación</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="¿Qué te pareció el servicio?"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || !businessId}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar reseña"}
        </button>
      </form>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Suspense fallback={<div className="text-center mt-20">Cargando...</div>}>
        <ReviewForm />
      </Suspense>
    </div>
  );
}
