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

export type ExtendedUser = FirebaseUser & { 
  plan?: "BASIC" | "PRO" | "PREMIUM";
  role?: "superadmin" | "owner" | "employee" | "customer";
};

// ── Mock Users for Development ──
export const MOCK_USERS = {
  superadmin: {
    uid: "mock-superadmin-001",
    email: "superadmin@turnero.com",
    role: "superadmin" as const,
    plan: "PREMIUM" as const,
    label: "Superadmin",
  },
  owner: {
    uid: "mock-owner-001",
    email: "carlos@barberiapremium.com",
    role: "owner" as const,
    plan: "BASIC" as const,
    label: "Dueño de Local (Plan BASIC)",
  },
  ownerPro: {
    uid: "mock-owner-002",
    email: "maria@sparelax.com",
    role: "owner" as const,
    plan: "PRO" as const,
    label: "Dueña de Local (Plan PRO)",
  },
  employee: {
    uid: "mock-employee-001",
    email: "juan@barberiapremium.com",
    role: "employee" as const,
    plan: "BASIC" as const,
    label: "Empleado (Barbero)",
  },
  customer: {
    uid: "mock-customer-001",
    email: "cliente@gmail.com",
    role: "customer" as const,
    plan: "BASIC" as const,
    label: "Cliente Final",
  },
} as const;

export type MockUserKey = keyof typeof MOCK_USERS;

interface AuthContextType {
  user: ExtendedUser | null;
  token: string | null;
  loading: boolean;
  switchMockUser: (key: MockUserKey) => void;
  currentMockKey: MockUserKey;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMockKey, setCurrentMockKey] = useState<MockUserKey>("owner");

  const switchMockUser = (key: MockUserKey) => {
    const mock = MOCK_USERS[key];
    const mockUser = {
      uid: mock.uid,
      email: mock.email,
      plan: mock.plan,
      role: mock.role,
      getIdToken: async () => `mock-token-${key}`,
      displayName: mock.label,
    } as unknown as ExtendedUser;
    
    setUser(mockUser);
    setToken(`mock-token-${key}`);
    setCurrentMockKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem("mock_role", key);
    }
  };

  useEffect(() => {
    // If no real Firebase API key is provided, mock the login for local development
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === undefined || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo-api-key") {
      const savedRole = (typeof window !== 'undefined' ? localStorage.getItem("mock_role") : "owner") as MockUserKey;
      switchMockUser(MOCK_USERS[savedRole] ? savedRole : "owner");
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const extendedUser = firebaseUser as ExtendedUser;
        extendedUser.plan = "BASIC";
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
    <AuthContext.Provider value={{ user, token, loading, switchMockUser, currentMockKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
