"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "./api";

interface User {
  uid: string;
  email: string;
  role: string;
  token: string;
  plan?: "BASIC" | "PRO";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  upgradePlan: () => void;
}

const TOKEN_KEY = "token";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const hydrate = useCallback(async (token: string) => {
    const me = await apiFetch<{ uid: string; email: string; role: string; plan?: "BASIC" | "PRO" }>("/me", { token }).catch(() => ({
      uid: "mock-uid",
      email: "mock@example.com",
      role: "owner",
      plan: "BASIC" as const,
    })); // Fallback to mock for testing frontend
    
    setUser({ ...me, token, plan: me.plan || "BASIC" });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    hydrate(stored)
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [hydrate, logout]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{
      accessToken: string;
      user: { uid: string; email: string; role: string; plan?: "BASIC" | "PRO" };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    await hydrate(data.accessToken);
  };

  const upgradePlan = () => {
    if (user) {
      setUser({ ...user, plan: "PRO" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, upgradePlan }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
