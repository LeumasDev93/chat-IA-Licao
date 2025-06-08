"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Plus, Trash, X } from "lucide-react";
import { MessageType } from "@/types";
import { ThemeSwitch } from "./ThemeSwitch";
import { useTheme } from "@/contexts/ThemeContext";

interface ChatSidebarProps {
  onNewChat: () => void;
  chatHistory: Record<string, MessageType[]>;
  currentChatId: string;
  setCurrentChatId: (id: string) => void;
  deleteChat: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onNewChat,
  chatHistory,
  currentChatId,
  setCurrentChatId,
  deleteChat,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Detecta tema do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const getSystemTheme = () => (mediaQuery.matches ? "dark" : "light");

    const handleThemeChange = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      }
    };

    if (theme === "system") {
      setResolvedTheme(getSystemTheme());
      mediaQuery.addEventListener("change", handleThemeChange);
    } else {
      setResolvedTheme(theme === "dark" ? "dark" : "light");
    }

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [theme]);

  // Detecta tamanho da tela e ajusta comportamento do sidebar
  useEffect(() => {
    const checkMobile = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      // Em desktop, sidebar começa aberta; em mobile, começa fechada
      setSidebarOpen(!isNowMobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
    if (currentChatId === chatId) onNewChat();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sidebarBg = resolvedTheme === "dark" ? "bg-slate-800" : "bg-white";
  const textColor = resolvedTheme === "dark" ? "text-white" : "text-black";
  const borderColor =
    resolvedTheme === "dark" ? "border-gray-700" : "border-gray-300";
  const hoverBg =
    resolvedTheme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const activeBg = resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-300";

  return (
    <>
      {/* Botão de toggle para mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 z-50 p-2 rounded-lg border ${borderColor} transition-all
            ${sidebarBg} ${textColor} shadow-md`}
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobile && sidebarOpen
            ? "absolute top-0 left-0"
            : "fixed top-0 left-0"
        } h-screen z-40 shadow-lg flex flex-col transition-all duration-300
    ${sidebarOpen ? "w-64" : "w-0 md:w-20"} 
    ${sidebarBg} ${textColor}
    ${isMobile && !sidebarOpen ? "hidden" : ""}
  `}
      >
        <div className="flex flex-col h-full p-2 space-y-4 overflow-hidden">
          {/* Cabeçalho */}
          <div className="p-4">
            <div
              className={`flex items-center gap-2 ${
                !sidebarOpen ? "justify-center" : ""
              }`}
            >
              {!sidebarOpen && !isMobile ? (
                <div
                  className={`w-8 h-8 rounded-full ${
                    resolvedTheme === "dark" ? "bg-blue-600" : "bg-blue-500"
                  } flex items-end sm:items-center justify-center`}
                />
              ) : (
                <h1 className="text-lg ml-20 sm:ml-0 font-bold">Chat Lição</h1>
              )}
            </div>
          </div>

          {/* Botão Nova Conversa */}
          <button
            onClick={() => {
              onNewChat();
              if (isMobile) setSidebarOpen(false);
            }}
            className={`p-2 rounded cursor-pointer flex items-center gap-2 shadow-sm
              ${resolvedTheme === "dark" ? "bg-gray-600" : "bg-gray-200"}
              ${
                !sidebarOpen
                  ? "justify-center w-12 h-12 rounded-full mx-auto"
                  : "ml-2"
              }
            `}
          >
            <Plus size={18} />
            {sidebarOpen && <span className="text-sm">Nova Conversa</span>}
          </button>

          {/* Histórico de conversas */}
          <div ref={contentRef} className="flex-1 overflow-y-auto px-2">
            {sidebarOpen && (
              <h2 className="font-bold mb-2 text-sm">Histórico</h2>
            )}
            <ul className="space-y-2">
              {Object.entries(chatHistory).map(([chatId, messages]) => (
                <li
                  key={chatId}
                  onClick={() => handleChatSelect(chatId)}
                  className={`p-2 rounded cursor-pointer flex items-center transition-colors
                    ${currentChatId === chatId ? activeBg : hoverBg}
                    ${!sidebarOpen ? "justify-center" : "justify-between"}
                  `}
                >
                  {sidebarOpen ? (
                    <>
                      <span className="truncate text-sm flex-1">
                        {messages.find((m) => m.sender === "user")?.text ||
                          "Nova conversa"}
                      </span>
                      <button
                        onClick={(e) => handleDeleteChat(e, chatId)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ThemeSwitch */}
          <div className={`p-4 border-t ${borderColor}`}>
            <div className={sidebarOpen ? "" : "flex justify-center"}>
              <ThemeSwitch compact={!sidebarOpen} />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed top-0 inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Espaço reservado para conteúdo principal */}
      <div
        className={`transition-all duration-300 min-h-screen
          ${sidebarOpen ? "ml-64" : "ml-0 md:ml-20"}
        `}
      >
        {/* Conteúdo principal */}
      </div>
    </>
  );
};

export default ChatSidebar;
