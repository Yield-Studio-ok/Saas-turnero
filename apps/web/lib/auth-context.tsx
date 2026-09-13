"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { 
  onIdTokenChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";

export type ExtendedUser = FirebaseUser & { plan?: "BASIC" | "PRO" | "PREMIUM" };

interface AuthContextType {
  user: ExtendedUser | null;
  token: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no real Firebase API key is provided, mock the login for local development
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === undefined || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo-api-key") {
      const mockUser = {
        uid: "mock-owner-123",
        email: "dueño@ejemplo.com",
        plan: "BASIC",
        getIdToken: async () => "mock-token-123"
      } as unknown as ExtendedUser;
      
      setUser(mockUser);
      setToken("mock-token-123");
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        // Fallback or fetch from DB in a real app, here we mock it to "BASIC" so paywalls trigger
        const extendedUser = firebaseUser as ExtendedUser;
        extendedUser.plan = "BASIC"; // Hardcoded for Epic 10 UI tests
        setUser(extendedUser);
        setToken(idToken);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
