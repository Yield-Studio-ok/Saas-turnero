"use client";

import { useAuth, MOCK_USERS, type MockUserKey } from "@/lib/auth-context";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DevRoleSwitcher() {
  const { switchMockUser, currentMockKey } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Only show in dev mode (no real Firebase)
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key") {
    return null;
  }

  const roleColors: Record<MockUserKey, string> = {
    superadmin: "bg-red-500",
    owner: "bg-blue-500",
    ownerPro: "bg-purple-500",
    employee: "bg-green-500",
    customer: "bg-amber-500",
  };

  const handleSwitch = (key: MockUserKey) => {
    switchMockUser(key);
    setIsOpen(false);
    
    // Redirect based on role and force a full page reload so layouts update correctly
    setTimeout(() => {
      let targetPath = "/dashboard";
      if (key === "superadmin") targetPath = "/admin";
      else if (key === "customer") targetPath = "/explorar";
      else if (key === "employee") targetPath = "/dashboard/turnos";
      
      window.location.href = targetPath;
    }, 50);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {isOpen && (
        <div className="mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-72">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">🔧 Modo Desarrollo</p>
            <p className="text-xs text-gray-400 mt-0.5">Cambiar cuenta activa</p>
          </div>
          <div className="p-2 space-y-1">
            {(Object.entries(MOCK_USERS) as [MockUserKey, typeof MOCK_USERS[MockUserKey]][]).map(([key, mock]) => (
              <button
                key={key}
                onClick={() => handleSwitch(key)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                  currentMockKey === key
                    ? "bg-blue-50 border border-blue-200 text-blue-900 font-semibold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${roleColors[key]} ${currentMockKey === key ? "ring-2 ring-offset-1 ring-blue-400" : ""}`} />
                  <div>
                    <p className="font-medium">{mock.label}</p>
                    <p className="text-xs text-gray-400">{mock.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-bold transition-all hover:scale-105 ${roleColors[currentMockKey]}`}
      >
        <span className="text-base">🎭</span>
        <span>{MOCK_USERS[currentMockKey].label}</span>
      </button>
    </div>
  );
}
