"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicLanding, type LocalInfo, type ServiceItem } from "@/components/public-landing";
import { apiFetch } from "@/lib/api";

interface ResilientLocalLandingProps {
  id: string;
  initialProfile?: any;
}

export function ResilientLocalLanding({ id, initialProfile }: ResilientLocalLandingProps) {
  const [profile, setProfile] = useState<any>(initialProfile || null);
  const [loading, setLoading] = useState<boolean>(!initialProfile);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (initialProfile) return;

    let isMounted = true;
    setLoading(true);

    apiFetch<any>(`/business/public/${id}`)
      .then((data) => {
        if (isMounted) {
          if (data && (data.id || data.name)) {
            setProfile(data);
            setError(false);
          } else {
            setError(true);
          }
        }
      })
      .catch((err) => {
        console.warn(`[ResilientLocalLanding] Client fetch failed for ${id}:`, err);
        if (isMounted) {
          setError(true);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, initialProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Cargando perfil del local...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 px-4">
        <div className="text-center p-8 bg-white shadow-xl rounded-3xl max-w-sm w-full border border-slate-200">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            !
          </div>
          <h1 className="text-2xl font-black mb-2 text-slate-900">Local no encontrado</h1>
          <p className="text-slate-500 mb-6 text-sm">
            No pudimos encontrar el local solicitado en nuestra base de datos.
          </p>
          <Link
            href="/explorar"
            className="inline-block w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
          >
            Explorar locales
          </Link>
        </div>
      </div>
    );
  }

  const localInfo: LocalInfo = {
    name: profile.name,
    slug: profile.slug,
    tagline: profile.tagline || profile.description || "",
    address: profile.address || "",
    phone: profile.phone || "",
    openHours: profile.openHours || "09:00 - 20:00",
    rating: profile.rating || 4.9,
    reviewCount: profile.reviewCount || 0,
    isOpen: profile.isOpen ?? true,
    imageUrls: profile.imageUrls || profile.images,
    avatarUrl: profile.avatarUrl || profile.logoUrl,
    id: profile.id,
  };

  return (
    <PublicLanding
      initialSlug={id}
      initialLocal={localInfo}
      initialServices={profile.services as ServiceItem[]}
    />
  );
}

export default ResilientLocalLanding;
