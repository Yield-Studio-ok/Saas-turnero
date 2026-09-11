"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { user, loading, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (loading) return null;

  if (user) {
    return (
      <main className="p-8 max-w-md mx-auto">
        <h1 className="text-xl font-bold">Logged in</h1>
        <p className="text-gray-600 mb-4">
          {user.email} ({user.role})
        </p>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md mb-6 hover:bg-red-700"
        >
          Logout
        </button>

        <div className="pt-4 border-t">
          <Link
            href="/barberia-vintage"
            className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Ver Landing Pública de Reservas (/barberia-vintage)
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            await login(email, password);
          } catch {
            setError("Invalid credentials");
          }
        }}
        className="space-y-4"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <p style={{ fontSize: 12, color: "#666", marginTop: 16 }}>
        Admin: admin@admin.com / admin123
        <br />
        User: user@user.com / user123
      </p>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Acceso Rápido a Landing Pública:
        </h2>
        <Link
          href="/barberia-vintage"
          className="block text-center w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition shadow-sm"
        >
          📱 Probar Landing Pública (/barberia-vintage)
        </Link>
      </div>
    </main>
  );
}
