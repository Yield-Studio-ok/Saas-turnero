"use client";

import { useState } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(apiUrl + "/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply || "Sin respuesta" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error al contactar con el asistente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="bg-white border rounded-lg shadow-xl w-80 mb-4 flex flex-col overflow-hidden">
          <div className="bg-blue-900 text-white p-3 font-semibold flex justify-between items-center">
            <span>Asistente IA</span>
            <button onClick={toggleChat} className="text-white hover:text-gray-300">
              &#x2715;
            </button>
          </div>

          <div className="flex-1 p-4 h-64 overflow-y-auto bg-gray-50 flex flex-col gap-2">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                ¡Hola! Soy tu asistente. ¿En qué te ayudo?
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  "max-w-[80%] p-2 rounded-md text-sm " +
                  (m.role === "user"
                    ? "bg-blue-100 self-end text-blue-900"
                    : "bg-gray-200 self-start text-gray-800")
                }
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400 self-start">Escribiendo...</div>}
          </div>

          <form onSubmit={sendMessage} className="border-t p-2 flex bg-white">
            <input
              type="text"
              className="flex-1 border rounded-l-md px-2 py-1 text-sm outline-none"
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-900 text-white px-3 py-1 rounded-r-md text-sm hover:bg-blue-800 disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-blue-900 text-white rounded-full p-4 shadow-lg hover:bg-blue-800 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
