"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Logged in</h1>
      <p className="text-gray-600 mb-4">
        {user.email}
      </p>
      <button
        onClick={() => signOut(auth)}
        className="px-4 py-2 bg-red-600 text-white rounded-md mb-6 hover:bg-red-700"
      >
        Logout
      </button>

      <div className="pt-4 border-t">
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 mr-2"
        >
          Ir al Dashboard
        </Link>
        <Link
          href="/barberia-vintage"
          className="inline-block px-4 py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800"
        >
          Ver Landing Pública (/barberia-vintage)
        </Link>
      </div>
    </main>
  );
}
