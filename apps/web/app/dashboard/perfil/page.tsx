"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { apiFetch } from "../../../lib/api";
import { Camera, Check, Shield, Sparkles, Palette, Crown, Lock } from "lucide-react";
import { hasPlanAccess } from "@/lib/plan-utils";

const avatarPresets = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
];

const bannerPresets = [
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
];

const colorOptions = [
  { name: "Azul Real", hex: "#2563eb", bgClass: "bg-blue-600" },
  { name: "Esmeralda", hex: "#10b981", bgClass: "bg-emerald-600" },
  { name: "Púrpura VIP", hex: "#8b5cf6", bgClass: "bg-purple-600" },
  { name: "Ámbar Cálido", hex: "#f59e0b", bgClass: "bg-amber-500" },
  { name: "Rosa Glam", hex: "#ec4899", bgClass: "bg-pink-500" },
  { name: "Slate Dark", hex: "#0f172a", bgClass: "bg-slate-900" },
];

function EmpleadoPerfil({ user }: { user: any }) {
  const [nombre, setNombre] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("employee_profile_name") || user?.name || "Juan Pérez";
    }
    return user?.name || "Juan Pérez";
  });

  const [avatarUrl, setAvatarUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("employee_profile_avatar") || avatarPresets[1];
    }
    return avatarPresets[1];
  });

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("employee_profile_name", nombre);
        localStorage.setItem("employee_profile_avatar", avatarUrl);
        localStorage.setItem("user_profile_avatar", avatarUrl);
        window.dispatchEvent(
          new CustomEvent("profile:updated", {
            detail: { avatarUrl, name: nombre },
          }),
        );
      }
      setSaving(false);
      setToastMessage("Perfil de empleado actualizado exitosamente.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 400);
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between border-b pb-5 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
          <p className="text-gray-500 text-sm mt-1">
            Administra tu nombre público y foto de perfil visibles para los clientes al agendar.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Empleado</span>
        </div>
      </div>

      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500 shrink-0" />
          {toastMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Foto / Avatar de Perfil
          </label>
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-sm"
              />
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs text-gray-500">
                Selecciona un avatar sugerido o ingresa una URL personalizada:
              </p>
              <div className="flex gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
                      avatarUrl === preset
                        ? "border-blue-600 scale-105"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={preset}
                      alt={`Preset ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <input
              type="url"
              placeholder="https://ejemplo.com/mi-foto.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Public Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Público</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Tu nombre completo"
          />
          <p className="text-xs text-gray-400 mt-1">
            Este nombre aparecerá en la grilla y en la confirmación de turnos para los clientes.
          </p>
        </div>

        {/* Read-only Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico (Cuenta)
          </label>
          <input
            type="email"
            disabled
            value={user?.email || "empleado@turnero.com"}
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">
            El correo de acceso es gestionado por la administración del negocio.
          </p>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PerfilLocalPage() {
  const { user, token } = useAuth();
  const businessId = user?.tenantId || "busi_123456";

  const [formData, setFormData] = useState({
    nombre: "Barbería Vintage",
    descripcion: "Especialistas en cortes clásicos y modernos.",
    telefono: "+54 9 11 1234-5678",
    direccion: "Av. Siempre Viva 123, CABA",
    apertura: "09:00",
    cierre: "20:00",
  });

  // TURN-125: Avatar personal del dueño sincronizado con Header
  const [avatarUrl, setAvatarUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("user_profile_avatar") || avatarPresets[0];
    }
    return avatarPresets[0];
  });

  // TURN-126: Personalización estética de página de reservas según plan
  const [bookingTheme, setBookingTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved =
        localStorage.getItem(`turnero_booking_theme_${businessId}`) ||
        localStorage.getItem("turnero_booking_theme_global");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      logoUrl:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80",
      bannerUrl: bannerPresets[0],
      slogan: "Cortes de alta precisión y estilo inigualable.",
      primaryColor: "#2563eb",
      themeMode: "light" as "light" | "dark",
    };
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isEmployee = user?.role === "employee";
  const canCustomizeAdvanced = hasPlanAccess(user?.plan, "pro", user?.role);

  const directLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/book/${businessId}`
      : `https://saas-turnero.com/book/${businessId}`;
  const webhookUrl = "https://api.saas-turnero.com/webhooks/reserve";

  useEffect(() => {
    if (isEmployee) {
      setLoading(false);
      return;
    }
    if (token) {
      apiFetch("/businesses/my-profile", { token })
        .then((biz: any) => {
          if (biz) {
            setFormData((prev) => ({
              ...prev,
              nombre: biz.name || prev.nombre,
              descripcion: biz.description || prev.descripcion,
            }));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, isEmployee]);

  if (isEmployee) {
    return <EmpleadoPerfil user={user} />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (token) {
        await apiFetch("/businesses/my-profile", {
          method: "PUT",
          token,
          body: JSON.stringify({
            name: formData.nombre,
            description: formData.descripcion,
            phone: formData.telefono,
            address: formData.direccion,
            openingTime: formData.apertura,
            closingTime: formData.cierre,
          }),
        }).catch(() => {});
      }

      // Sincronización de Avatar del dueño en Header (TURN-125)
      if (typeof window !== "undefined") {
        localStorage.setItem("user_profile_avatar", avatarUrl);
        // Persistencia estética de reservas (TURN-126)
        localStorage.setItem(`turnero_booking_theme_${businessId}`, JSON.stringify(bookingTheme));
        localStorage.setItem("turnero_booking_theme_global", JSON.stringify(bookingTheme));

        window.dispatchEvent(
          new CustomEvent("profile:updated", {
            detail: { avatarUrl, name: formData.nombre },
          }),
        );
      }

      setToastMessage("Perfil y estética de reservas actualizados exitosamente.");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert("Error al actualizar perfil: " + (err?.message || "Ocurrió un error inesperado"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando perfil del local...</div>;
  }

  return (
    <div className="max-w-4xl bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-6 flex items-center justify-between border-b pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Perfil del Local & Marca</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Administra la identidad del negocio, foto de tu cuenta y la estética visual de tu página
            pública de reservas.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>{user?.role === "superadmin" ? "Superadmin" : "Dueño del Negocio"}</span>
        </div>
      </div>

      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500 shrink-0" />
          {toastMessage}
        </div>
      )}

      <form className="space-y-8 text-gray-900" onSubmit={handleSubmit}>
        {/* SECCIÓN TURN-125: Avatar de Perfil del Dueño */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            Foto / Avatar de tu Cuenta (Header Dashboard)
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt="Avatar de cuenta"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-sm"
              />
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-2 w-full">
              <p className="text-xs text-gray-500">
                Selecciona una foto sugerida o ingresa la URL de tu imagen:
              </p>
              <div className="flex flex-wrap gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                      avatarUrl === preset
                        ? "border-blue-600 scale-105"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={preset}
                      alt={`Preset ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <input
                type="url"
                placeholder="https://ejemplo.com/tu-foto.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* INFORMACIÓN BÁSICA DEL LOCAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800 border-b pb-2">
              Información Básica
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Comercial
              </label>
              <input
                type="text"
                name="nombre"
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción corta
              </label>
              <textarea
                name="descripcion"
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800 border-b pb-2">
              Contacto y Ubicación
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Público
              </label>
              <input
                type="tel"
                name="telefono"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* HORARIOS DE ATENCIÓN */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800 border-b pb-2">
            Horarios de Atención
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Apertura
              </label>
              <input
                type="time"
                name="apertura"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.apertura}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Cierre</label>
              <input
                type="time"
                name="cierre"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={formData.cierre}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN TURN-126: Personalización Estética de la Página de Reservas (Booking) */}
        <div className="space-y-5 pt-2 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600" />
                Personalización Estética de la Página de Reservas
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Modifica cómo verán tus clientes la pantalla al elegir y reservar sus servicios.
              </p>
            </div>
            {canCustomizeAdvanced ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 text-xs font-semibold">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                Plan PRO Activo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200 text-xs font-medium">
                Personalización Básica
              </span>
            )}
          </div>

          {/* Opciones Básicas: Logo y Banner de Fondo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logotipo del Negocio (URL)
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={bookingTheme.logoUrl}
                  alt="Logo preview"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                />
                <input
                  type="url"
                  placeholder="https://ejemplo.com/logo.png"
                  value={bookingTheme.logoUrl}
                  onChange={(e) =>
                    setBookingTheme((prev: any) => ({ ...prev, logoUrl: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner de Portada (Foto de Encabezado)
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://ejemplo.com/banner.jpg"
                  value={bookingTheme.bannerUrl}
                  onChange={(e) =>
                    setBookingTheme((prev: any) => ({ ...prev, bannerUrl: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white"
                />
                <div className="flex gap-2">
                  {bannerPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setBookingTheme((prev: any) => ({ ...prev, bannerUrl: preset }))
                      }
                      className={`h-7 w-14 rounded-md overflow-hidden border-2 transition cursor-pointer ${
                        bookingTheme.bannerUrl === preset
                          ? "border-blue-600 scale-105"
                          : "border-gray-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Banner ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Opciones Avanzadas (Gated por Plan PRO/PREMIUM) */}
          <div
            className={`p-5 rounded-2xl border transition relative ${
              canCustomizeAdvanced
                ? "bg-slate-50/60 border-slate-200"
                : "bg-slate-50/30 border-slate-200 opacity-80"
            }`}
          >
            {!canCustomizeAdvanced && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 text-amber-800 rounded-full text-xs font-semibold border border-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Desbloquea con Plan PRO
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Personalización Avanzada de Marca
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Define el eslogan comercial, paleta de colores y estilo claro u oscuro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Eslogan comercial */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Eslogan o Mensaje de Bienvenida
                </label>
                <input
                  type="text"
                  disabled={!canCustomizeAdvanced}
                  value={bookingTheme.slogan}
                  onChange={(e) =>
                    setBookingTheme((prev: any) => ({ ...prev, slogan: e.target.value }))
                  }
                  placeholder="Ej: Cortes de alta precisión y estilo inigualable."
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Tema visual (Claro / Oscuro) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tema Visual de la Página
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={!canCustomizeAdvanced}
                    onClick={() =>
                      setBookingTheme((prev: any) => ({ ...prev, themeMode: "light" }))
                    }
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                      bookingTheme.themeMode === "light"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    ☀️ Modo Claro
                  </button>
                  <button
                    type="button"
                    disabled={!canCustomizeAdvanced}
                    onClick={() => setBookingTheme((prev: any) => ({ ...prev, themeMode: "dark" }))}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                      bookingTheme.themeMode === "dark"
                        ? "border-blue-600 bg-slate-900 text-white font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    🌙 Modo Oscuro Elegante
                  </button>
                </div>
              </div>

              {/* Selector de Color de Acento */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Color Principal de Marca (Botones y Selección)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {colorOptions.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      disabled={!canCustomizeAdvanced}
                      onClick={() =>
                        setBookingTheme((prev: any) => ({ ...prev, primaryColor: c.hex }))
                      }
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        bookingTheme.primaryColor === c.hex
                          ? "border-gray-900 ring-2 ring-gray-900/10 bg-white shadow-xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.bgClass}`} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-xs text-gray-400">Personalizado:</span>
                    <input
                      type="color"
                      disabled={!canCustomizeAdvanced}
                      value={bookingTheme.primaryColor}
                      onChange={(e) =>
                        setBookingTheme((prev: any) => ({ ...prev, primaryColor: e.target.value }))
                      }
                      className="w-7 h-7 p-0 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vista Previa en Vivo (Live Preview) */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
              Vista Previa de tu Portada en /book/{businessId}
            </span>
            <div
              className={`rounded-xl overflow-hidden border shadow-sm transition ${
                bookingTheme.themeMode === "dark"
                  ? "bg-slate-900 text-white border-slate-800"
                  : "bg-white text-slate-900 border-slate-200"
              }`}
            >
              <div className="h-28 relative overflow-hidden bg-slate-800">
                <img
                  src={bookingTheme.bannerUrl}
                  alt="Banner preview"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="p-4 pt-0 relative flex items-start gap-4">
                <img
                  src={bookingTheme.logoUrl}
                  alt="Logo preview"
                  className="w-16 h-16 rounded-2xl object-cover border-3 border-white shadow-md -mt-8 relative z-10 bg-white"
                />
                <div className="flex-1 pt-2">
                  <h4 className="font-bold text-base leading-tight">
                    {formData.nombre || "Mi Local"}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {bookingTheme.slogan || "Servicios profesionales y atención personalizada."}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    style={{ backgroundColor: bookingTheme.primaryColor }}
                    className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs"
                  >
                    Reservar Turno
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INTEGRACIONES INSTAGRAM Y GOOGLE RESERVE */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-base font-semibold text-gray-800 border-b pb-2">
            Integraciones (Instagram / Google Reserve)
          </h3>
          <p className="text-sm text-gray-500">
            Copia estos enlaces para integrarlos en tus redes sociales o en Google Reserve.
          </p>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Link Directo de Reserva (Instagram / Bio)
                </label>
              </div>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-xl px-3.5 py-2.5 bg-gray-50 text-gray-600 text-sm focus:outline-none"
                  value={directLink}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(directLink);
                    setToastMessage("Enlace de Instagram copiado al portapapeles.");
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="px-5 py-2.5 border border-l-0 border-gray-300 rounded-r-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition cursor-pointer"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Webhook URL (Google Reserve / Otros Sistemas)
                </label>
              </div>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-xl px-3.5 py-2.5 bg-gray-50 text-gray-600 text-sm focus:outline-none"
                  value={webhookUrl}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    setToastMessage("Webhook de Google Reserve copiado al portapapeles.");
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="px-5 py-2.5 border border-l-0 border-gray-300 rounded-r-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition cursor-pointer"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
