import { Menu, X, Plus, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useMobileMenuTheme } from "@/hooks/useMobileMenuTheme";
import { ThemeSwitch } from "./ThemeSwitch";

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
};

const STORAGE_KEY = "conversations";

export default function MobileConversationMenu() {
  const { resolvedTheme, isMobile, isOpen, setIsOpen } = useMobileMenuTheme();
  const isDark = resolvedTheme === "dark";

  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Recupera histórico do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as (Omit<Conversation, "timestamp"> & {
        timestamp: string;
      })[]; // Timestamp como string
      const withDates = parsed.map((c) => ({
        ...c,
        timestamp: new Date(c.timestamp),
      }));
      setConversations(withDates);
    }
  }, []);

  // Atualiza localStorage quando as conversas mudam
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        conversations.map((c) => ({
          ...c,
          timestamp: c.timestamp.toISOString(),
        }))
      )
    );
  }, [conversations]);

  const addConversation = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: `Nova conversa ${conversations.length + 1}`,
      lastMessage: "Iniciada agora...",
      timestamp: new Date(),
    };
    setConversations([newConversation, ...conversations]);
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Botão para abrir o menu */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed top-4 left-4 z-40 p-2 rounded-lg shadow-md ${
            isDark ? "bg-gray-800 text-white" : "bg-gray-200 text-black"
          }`}
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Menu lateral */}
      <div
        className={`absolute inset-0 z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className={`relative flex flex-col w-64 h-full shadow-lg ${
            isDark ? "bg-gray-900 text-white" : "bg-white text-black"
          }`}
        >
          {/* Cabeçalho */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              isDark
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-100"
            }`}
          >
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6" />
              <span className="ml-3 font-semibold">Conversas</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-full ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nova conversa */}
          <div
            className={`p-4 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              onClick={addConversation}
              className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                isDark
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <Plus size={18} />
              <span>Nova conversa</span>
            </button>
          </div>

          {/* Lista de conversas */}
          <div className="flex-1 overflow-y-auto">
            <h3
              className={`sticky top-0 px-4 py-3 text-sm font-medium ${
                isDark ? "bg-gray-900 text-gray-400" : "bg-white text-gray-500"
              }`}
            >
              Histórico de Conversas
            </h3>
            {conversations.length === 0 ? (
              <div
                className={`px-4 py-6 text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Nenhuma conversa recente
              </div>
            ) : (
              <ul className="space-y-1 px-2 pb-4">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setIsOpen(false)}
                      className={`w-full text-left px-3 py-3 rounded-lg flex flex-col ${
                        isDark
                          ? "hover:bg-gray-700 text-white"
                          : "hover:bg-gray-100 text-black"
                      }`}
                    >
                      <span className="font-medium truncate">{c.title}</span>
                      <span
                        className={`text-sm truncate ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {c.lastMessage}
                      </span>
                      <span
                        className={`text-xs mt-1 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {c.timestamp.toLocaleString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Rodapé com ThemeSwitch */}
          <div
            className={`p-4 border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <ThemeSwitch />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
