"use client";

import { useState, useEffect } from "react";
import { Menu, Plus, Trash, X } from "lucide-react";
import { MessageType } from "@/types";
import { ThemeSwitch } from "./ThemeSwitch";
import { useTheme } from "@/contexts/ThemeContext";

import Image from "next/image";
import logo2 from "@/assets/Logo2.png";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
  const { data: session } = useSession();
  console.log(session?.user?.name, "section");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const currentYear = new Date().getFullYear();

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

  // Detecta tamanho da tela
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 801);
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const sidebarBg = resolvedTheme === "dark" ? "bg-slate-800" : "bg-gray-200";
  const hederMobileBg =
    resolvedTheme === "dark" ? "bg-slate-800 shadow-md" : "bg-white shadow-md";
  const textColor = resolvedTheme === "dark" ? "text-white" : "text-black";
  const borderColor =
    resolvedTheme === "dark" ? "border-gray-700" : "border-gray-300";
  const hoverBg =
    resolvedTheme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-400";
  const activeBg = resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-400";
  const textFooter =
    resolvedTheme === "dark" ? "text-blue-400" : "text-blue-700";

  // Componente DesktopSidebar
  const DesktopSidebar = () => (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300
      ${sidebarOpen || !isMobile ? "md:w-48 xl:w-64" : "w-0"}
      ${sidebarBg} ${textColor} shadow-lg overflow-hidden`}
    >
      <div className="flex flex-col h-full p-2 space-y-4">
        {/* Cabeçalho */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center justify-center bg-white rounded-lg">
            <Image
              src={logo2}
              alt="Logo"
              width={100}
              height={100}
              className="w-16 h-16"
            />
          </div>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl ${
              resolvedTheme === "dark"
                ? "bg-gray-600 text-white"
                : "bg-white text-Black border-2 border-gray-300"
            }`}
          >
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>

        {/* Botão Nova Conversa */}
        <button
          onClick={() => {
            onNewChat();
            if (isMobile) setSidebarOpen(false);
          }}
          className={`p-2 rounded flex items-center gap-2 shadow-sm
          ${resolvedTheme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}
        >
          <Plus size={18} />
          <span className="text-sm">Nova Conversa</span>
        </button>

        {/* Conteúdo principal (Histórico) */}
        <div className="flex-1 overflow-y-auto px-2">
          <h2 className="font-bold mb-2 text-sm">Histórico</h2>
          {session?.user?.email && Object.keys(chatHistory).length > 0 ? (
            <ul className="space-y-2">
              {Object.entries(chatHistory).map(([chatId, messages]) => (
                <li
                  key={chatId}
                  onClick={() => handleChatSelect(chatId)}
                  className={`p-2 rounded cursor-pointer flex items-center justify-between
                  transition-colors ${
                    currentChatId === chatId ? activeBg : hoverBg
                  }`}
                >
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
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Sem histórico disponível</p>
          )}
        </div>

        {/* Rodapé: Login (se não logado) + ThemeSwitch */}
        <div className={`p-4 border-t ${borderColor}`}>
          {!session?.user?.email && (
            <Link
              href="/login"
              className={`w-full p-2 rounded flex items-center justify-center gap-2 shadow-sm mb-4
                ${resolvedTheme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}
            >
              <span className="text-sm">Login</span>
            </Link>
          )}
          <ThemeSwitch />
        </div>
      </div>
    </aside>
  );

  // Componente MobileSidebar
  const MobileSidebar = () => (
    <div className={`fixed top-0 left-0 w-full h-16 z-50 ${hederMobileBg}`}>
      <div className="flex items-center justify-between h-full px-4">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg border ${borderColor} ${sidebarBg} ${textColor} shadow-md`}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center justify-end h-full">
          <div className="flex items-center justify-center bg-gray-200 shadow-md rounded-lg">
            <Image
              src={logo2}
              alt="Logo"
              width={100}
              height={100}
              className="w-10 h-10"
            />
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className={`fixed top-0 left-0 h-screen w-64 z-50 shadow-lg flex flex-col ${sidebarBg} ${textColor} transform transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full p-2">
              {/* Cabeçalho */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center justify-center bg-white rounded-lg">
                  <Image
                    src={logo2}
                    alt="Logo"
                    width={100}
                    height={100}
                    className="w-10 h-10"
                  />
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${
                    resolvedTheme === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-Black border-2 border-gray-300"
                  }`}
                >
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>

              {/* Botão Nova Conversa */}
              <button
                onClick={() => {
                  onNewChat();
                  setSidebarOpen(false);
                }}
                className={`p-2 rounded flex items-center gap-2 shadow-sm mb-2 ${
                  resolvedTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
                }`}
              >
                <Plus size={18} />
                <span className="text-sm">Nova Conversa</span>
              </button>

              {/* Histórico */}
              <div className="flex-1 overflow-y-auto px-2">
                <h2 className="font-bold mb-2 text-sm">Histórico</h2>
                {session?.user?.email && Object.keys(chatHistory).length > 0 ? (
                  <ul className="space-y-2">
                    {Object.entries(chatHistory).map(([chatId, messages]) => (
                      <li
                        key={chatId}
                        onClick={() => handleChatSelect(chatId)}
                        className={`p-2 rounded cursor-pointer flex items-center justify-between transition-colors ${
                          currentChatId === chatId ? activeBg : hoverBg
                        }`}
                      >
                        <span className="truncate text-sm">
                          {messages.find((m) => m.sender === "user")?.text ||
                            "Nova conversa"}
                        </span>
                        <button
                          onClick={(e) => handleDeleteChat(e, chatId)}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          <Trash size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">
                    Sem histórico disponível
                  </p>
                )}
              </div>

              {/* Rodapé fixo */}
              <div className={`p-4 border-t ${borderColor}`}>
                {!session?.user?.email && (
                  <Link
                    href="/login"
                    className={`w-full p-2 rounded flex items-center justify-center gap-2 shadow-sm mb-4
                ${resolvedTheme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}
                  >
                    <span className="text-sm">Login</span>
                  </Link>
                )}
                <ThemeSwitch />
              </div>
              <div className="text-[10px] text-center xl:text-xs mt-2">
                <span>
                  O Assistente IA para estudos da lição pode cometer erros.
                  Verifique informações importantes.
                </span>
                <br />
                <span>
                  Copyright © {currentYear} | desenvolvido por
                  <span className={`${textFooter} font-semibold`}>
                    {" "}
                    Leumas Andrade
                  </span>
                </span>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? <MobileSidebar /> : <DesktopSidebar />}
      <div
        className={isMobile ? "" : "ml-64 transition-all duration-300"}
      ></div>
    </>
  );
};

export default ChatSidebar;
