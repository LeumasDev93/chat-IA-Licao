/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Plus, Trash, X } from "lucide-react";
import { MessageType } from "@/types";
import { ThemeSwitch } from "./ThemeSwitch";
import { useTheme } from "@/contexts/ThemeContext";
import { MdOutlineSettings } from "react-icons/md";
import { IoIosLogIn, IoIosLogOut } from "react-icons/io";
import { BsSend } from "react-icons/bs";

import Image from "next/image";
import logo2 from "@/assets/Logo2.png";
import Link from "next/link";
import { createComponentClient } from "@/models/supabase";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/hooks/useComponentClient";

interface ChatSidebarProps {
  onNewChat: () => void;
  chatHistory: Record<string, MessageType[]>;
  currentChatId: string;
  setCurrentChatId: (id: string) => void;
  deleteChat: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onNewChat,
  currentChatId,
  setCurrentChatId,
}) => {
  const supabase = createComponentClient();
  const router = useRouter();
  const user = useSupabaseUser();

  // console.log(user, "user");

  const [openProfile, setOpenProfile] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const currentYear = new Date().getFullYear();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
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

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();

    // Remove do Supabase
    const { error } = await supabase
      .from("user_chats")
      .delete()
      .eq("chat_id", chatId);

    if (error) {
      console.error("Erro ao deletar chat:", error);
      return;
    }

    // Remove do estado local
    setChatHistory((prev) => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });

    // Se o chat deletado for o atual, limpa a seleção
    if (currentChatId === chatId) {
      onNewChat(); // Cria novo chat ou redefine o estado
    }
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

  const profileRef = useRef<HTMLDivElement>(null);

  // Fechar popup ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [chatHistory, setChatHistory] = useState<
    Record<string, { messages: any[]; title: string }>
  >({});

  useEffect(() => {
    if (!user?.user?.id) return;

    const fetchChatHistory = async () => {
      const { data, error } = await supabase
        .from("user_chats")
        .select("chat_id, messages, title")
        .eq("user_id", user?.user?.id);

      if (error) {
        console.error("Erro ao buscar histórico de chats:", error);
        return;
      }

      const history: Record<string, { messages: any[]; title: string }> = {};

      data?.forEach((chat) => {
        history[chat.chat_id] = {
          messages: chat.messages || [],
          title: chat.title || "Nova conversa",
        };
      });

      setChatHistory(history);
    };

    // Fetch inicial
    fetchChatHistory();

    // Configura intervalo de 5 segundos
    const intervalId = setInterval(fetchChatHistory, 1000);

    // Limpa intervalo ao desmontar o componente ou user mudar
    return () => clearInterval(intervalId);
  }, [supabase, user?.user?.id]);

  // Componente DesktopSidebar
  const DesktopSidebar = () => {
    // Adicionar referência para o popup

    return (
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

          {user?.user?.id && Object.keys(chatHistory).length > 0 ? (
            <div className="flex-1 overflow-y-auto px-2">
              <h2 className="font-bold mb-2 text-sm">Histórico</h2>
              <ul className="space-y-2">
                {Object.entries(chatHistory).map(([chatId, chatData]) => (
                  <li
                    key={chatId}
                    onClick={() => handleChatSelect(chatId)}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between transition-colors ${
                      currentChatId === chatId
                        ? "bg-gray-800"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    <span className="truncate text-sm flex-1">
                      {chatData.title || "Nova conversa"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(e, chatId);
                      }}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <Trash size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-2"></div>
          )}
          {/* Rodapé: Login (se não logado) + ThemeSwitch */}
          <div className={`p-4 border-t ${borderColor}`}>
            {!user?.user?.id && (
              <Link
                href="/login"
                className={`w-full p-2 rounded flex items-center border justify-center gap-2 text-sm ${hoverBg} ${textColor} ${borderColor}`}
              >
                <IoIosLogIn className="size-4 xl:size-6" />
                <span className="text-sm xl:text-lg">Entrar</span>
              </Link>
            )}
            {user?.user?.id && (
              <div
                className={`relative cursor-pointer flex items-center p-2 rounded ${hoverBg} ${textColor}`}
                onClick={() => setOpenProfile(true)}
              >
                {user?.user?.user_metadata?.avatar_url ? (
                  <div
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 ${borderColor} `}
                  >
                    <Image
                      src={user.user.user_metadata.avatar_url}
                      alt={`Avatar de ${
                        user.user.user_metadata.full_name || "usuário"
                      }`}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback em caso de erro no carregamento da imagem
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    {/* Fallback visual - só aparece se a imagem falhar */}
                    <div
                      className={`hidden w-full h-full  items-center justify-center font-bold text-xl ${
                        resolvedTheme === "dark"
                          ? "bg-gray-600 text-white"
                          : "bg-gray-100 text-black"
                      }`}
                    >
                      {user.user.user_metadata.full_name
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${
                      resolvedTheme === "dark"
                        ? "bg-gray-600 text-white"
                        : "bg-gray-100 text-black border-2 border-gray-300"
                    }`}
                  >
                    {user.user.user_metadata.full_name
                      ?.charAt(0)
                      .toUpperCase() || "U"}
                  </div>
                )}
                <span className="ml-2 text-xs xl:text-sm ">Minha Conta</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  };
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
                {user?.user?.id && (
                  <div className="relative">
                    {user?.user?.user_metadata?.avatar_url ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <Image
                          src={user.user.user_metadata.avatar_url}
                          alt={`Avatar de ${
                            user.user.user_metadata.full_name || "usuário"
                          }`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback em caso de erro no carregamento da imagem
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                        {/* Fallback visual - só aparece se a imagem falhar */}
                        <div
                          className={`w-full h-full flex items-center justify-center font-bold text-xl ${
                            resolvedTheme === "dark"
                              ? "bg-gray-600 text-white"
                              : "bg-gray-100 text-black"
                          }`}
                        >
                          {user.user.user_metadata.full_name
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${
                          resolvedTheme === "dark"
                            ? "bg-gray-600 text-white"
                            : "bg-gray-100 text-black border-2 border-gray-300"
                        }`}
                      >
                        {user.user.user_metadata.full_name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                )}
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
              {user?.user?.id && Object.keys(chatHistory).length > 0 ? (
                <div className="flex-1 overflow-y-auto px-2">
                  <h2 className="font-bold mb-2 text-sm">Histórico</h2>

                  <ul className="space-y-2">
                    {Object.entries(chatHistory).map(([chatId, chatData]) => (
                      <li
                        key={chatId}
                        onClick={() => handleChatSelect(chatId)}
                        className={`p-2 rounded cursor-pointer flex items-center justify-between transition-colors ${
                          currentChatId === chatId ? activeBg : hoverBg
                        }`}
                      >
                        <span className="truncate text-sm">
                          {chatData.title || "Nova conversa"}
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
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-2"></div>
              )}
              {/* Rodapé fixo */}
              <div className={`p-4 border-t ${borderColor}`}>
                {!user?.user?.id && (
                  <Link
                    href="/login"
                    className={`w-full p-2 rounded flex items-center border justify-center gap-2 text-sm ${sidebarBg} ${borderColor}`}
                  >
                    <IoIosLogIn className="size-4 xl:size-6" />
                    <span className="text-sm xl:text-lg">Entrar</span>
                  </Link>
                )}
                {user?.user?.id && (
                  <div
                    className="relative cursor-pointer flex items-center p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setOpenProfile(true)}
                  >
                    {user?.user?.user_metadata?.avatar_url ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <Image
                          src={user.user.user_metadata.avatar_url}
                          alt={`Avatar de ${
                            user.user.user_metadata.full_name || "usuário"
                          }`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback em caso de erro no carregamento da imagem
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                        {/* Fallback visual - só aparece se a imagem falhar */}
                        <div
                          className={`hidden w-full h-full  items-center justify-center font-bold text-xl ${
                            resolvedTheme === "dark"
                              ? "bg-gray-600 text-white"
                              : "bg-gray-100 text-black"
                          }`}
                        >
                          {user.user.user_metadata.full_name
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${
                          resolvedTheme === "dark"
                            ? "bg-gray-600 text-white"
                            : "bg-gray-100 text-black border-2 border-gray-300"
                        }`}
                      >
                        {user.user.user_metadata.full_name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="ml-2 text-xs xl:text-sm">Minha Conta</span>
                  </div>
                )}
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
      {openProfile && (
        <div
          ref={profileRef}
          className={`absolute bottom-24 left-6 mb-2 sm:w-[18%] lg:w-[15%] xl:w-[11%] p-2 ${sidebarBg}  ${textColor} rounded-lg shadow-xl z-50 border ${borderColor} flex flex-col space-y-2`}
        >
          <div className="flex flex-col space-y-2">
            {user?.user?.id && (
              <div
                className={`px-3 py-2 text-xs xl:text-sm font-semibold ${textColor}`}
              >
                {user.user.user_metadata.full_name || user.user.email}
              </div>
            )}

            <button
              onClick={() => {
                setOpenProfile(false);
                setOpenSettings(true);
              }}
              className={`w-full p-2 rounded flex items-center justify-between gap-2 text-sm ${hoverBg} `}
            >
              <MdOutlineSettings className="size-4 xl:size-6" />
              <span className="text-xs xl:text-sm">Configurações</span>
            </button>
            <button
              type="submit"
              className={`w-full p-2 rounded flex items-center justify-between ${hoverBg} gap-2 text-sm `}
            >
              <BsSend className="size-4 xl:size-6" />
              <span className="text-xs xl:text-sm">Contacte-nos</span>
            </button>
            <form action={handleLogout} className="w-full">
              <button
                type="submit"
                className={`w-full p-2 rounded flex items-center justify-between ${hoverBg} gap-2 text-sm `}
              >
                <IoIosLogOut className="size-4 xl:size-6" />
                <span className="text-xs xl:text-sm">Sair</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {openSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className={`${sidebarBg} rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Configurações</h3>
                <button
                  onClick={() => setOpenSettings(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Abas de navegação */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "general"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Geral
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "profile"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Perfil
                  </button>
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "about"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Sobre Nós
                  </button>
                </nav>
              </div>

              {/* Conteúdo das abas */}
              <div className="space-y-4">
                {/* Tab Geral */}
                {activeTab === "general" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Tema</h4>
                      <ThemeSwitch />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Idioma</h4>
                      <select
                        className={`w-full p-2 border rounded ${sidebarBg} d${borderColor}`}
                      >
                        <option>Português</option>
                      </select>
                    </div>
                    {/* Adicione mais configurações gerais aqui */}
                  </div>
                )}

                {/* Tab Perfil */}
                {activeTab === "profile" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Informações Pessoais</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm mb-1">Nome</label>
                          <input
                            type="text"
                            defaultValue={
                              user?.user?.user_metadata?.full_name || ""
                            }
                            className={`w-full p-2 border rounded ${sidebarBg} ${borderColor}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Email</label>
                          <input
                            type="email"
                            defaultValue={user?.user?.email || ""}
                            disabled
                            className={`w-full p-2 border rounded ${sidebarBg} ${borderColor}`}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Adicione mais configurações de perfil aqui */}
                  </div>
                )}

                {/* Tab Sobre Nós */}
                {activeTab === "about" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Versão</h4>
                      <p className="text-sm">1.0.0</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Termos de Serviço</h4>
                      <p className={`text-sm t${textColor}`}>
                        Leia nossos termos de serviço e política de privacidade.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Contato</h4>
                      <p className={`text-sm t${textColor}`}>
                        suporte@empresa.com
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;
