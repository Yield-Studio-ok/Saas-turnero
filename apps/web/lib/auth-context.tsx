"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "./api";
import { identifyUser, resetUser, captureEvent } from "./posthog";

export type ExtendedUser = {
  uid: string;
  email: string;
  role: string;
  plan?: string;
  tenantId?: string;
  name?: string;
  displayName?: string;
  businessName?: string;
};

interface AuthContextType {
  user: ExtendedUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchMockUser?: (key: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      resetUser();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
        identifyUser(parsed.uid, {
          email: parsed.email,
          role: parsed.role,
          plan: parsed.plan,
        });

        // Validar token contra /me de manera no bloqueante
        apiFetch("/me", { token: savedToken }).catch((err: any) => {
          if (err?.status === 401) {
            setToken(null);
            setUser(null);
            resetUser();
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
          }
        });
      } catch {
        setUser(null);
        setToken(null);
        resetUser();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ accessToken: string; user: ExtendedUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: password || "" }),
      });
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem("auth_token", data.accessToken);
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      identifyUser(data.user.uid, {
        email: data.user.email,
        role: data.user.role,
        plan: data.user.plan,
      });
      captureEvent("user_logged_in", {
        userId: data.user.uid,
        email: data.user.email,
        role: data.user.role,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    captureEvent("user_logged_out", { userId: user?.uid });
    resetUser();
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
