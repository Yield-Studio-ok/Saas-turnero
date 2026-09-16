"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "./api";

export type ExtendedUser = { 
  uid: string;
  email: string;
  role: string;
  plan?: string;
};

interface AuthContextType {
  user: ExtendedUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
        setToken(null);
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
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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
