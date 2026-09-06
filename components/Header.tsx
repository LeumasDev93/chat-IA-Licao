"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Plus, Trash, X, Edit } from "lucide-react";
import { ThemeSwitch } from "./ThemeSwitch";
import { useLanguage } from "@/contexts/LanguageContext";
import { MdOutlineSettings } from "react-icons/md";
import { IoIosLogIn, IoIosLogOut } from "react-icons/io";
import { BsSend } from "react-icons/bs";

import Image from "next/image";
import logo2 from "@/assets/Logo2.png";
import Link from "next/link";
import LanguageSelect from "./LanguageSelect";
import { createComponentClient } from "@/models/supabase";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/hooks/useComponentClient";

import { ChatData } from "@/types";

interface ChatSidebarProps {
  onNewChat: () => void;
  chatHistory: Record<string, ChatData>;
  currentChatId: string;
  setCurrentChatId: (id: string) => void;
  deleteChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
}

const ChatSidebar = ({
  onNewChat,
  chatHistory,
  currentChatId,
  setCurrentChatId,
  deleteChat,
  updateChatTitle,
}: ChatSidebarProps) => {
  const supabase = createComponentClient();
  const router = useRouter();
  const user = useSupabaseUser();
  const [openProfile, setOpenProfile] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const sidebarBg = "bg-surface";
  const textColor = "text-foreground";
  const borderColor = "border-border";
  const hoverBg = "hover:bg-accent";

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

  // Componente DesktopSidebar
  const DesktopSidebar = () => {
    return (
      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300
      ${sidebarOpen || !isMobile ? "md:w-48 xl:w-64" : "w-0"}
      ${sidebarBg} ${textColor} shadow-lg overflow-hidden`}
      >
        <div className="flex flex-col h-full p-2 space-y-4">
          {/* Cabeçalho */}
          <div className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center bg-white rounded-xl p-1 shadow-sm">
              <Image
                src={logo2}
                alt="Logo"
                width={100}
                height={100}
                className="w-11 h-11"
              />
            </div>
            <span className="font-display text-base font-semibold leading-tight text-foreground">
              Escola Sabatina
            </span>
          </div>

          {/* Botão Nova Conversa */}
          <button
            onClick={() => {
              onNewChat();
              if (isMobile) setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent active:scale-[0.99]"
          >
            <Plus size={17} className="text-primary" />
            <span>{t("new_conversation")}</span>
          </button>

          {user?.user?.id ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="mb-1.5 flex items-center justify-between px-1">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("history")}
                </h2>
                {Object.keys(chatHistory).length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {Object.keys(chatHistory).length}
                  </span>
                )}
              </div>

              {Object.keys(chatHistory).length === 0 ? (
                <p className="px-1 py-4 text-xs leading-relaxed text-muted-foreground">
                  {t("no_conversations") !== "no_conversations"
                    ? t("no_conversations")
                    : "As suas conversas aparecerão aqui."}
                </p>
              ) : (
                <ul className="-mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
                  {Object.entries(chatHistory)
                    .sort((a, b) => {
                      const ta = new Date(a[1].updatedAt || a[1].createdAt || 0).getTime();
                      const tb = new Date(b[1].updatedAt || b[1].createdAt || 0).getTime();
                      return tb - ta;
                    })
                    .map(([chatId, chatData]) => {
                      const active = currentChatId === chatId;
                      return (
                        <li key={chatId}>
                          <div
                            onClick={() => handleChatSelect(chatId)}
                            className={`group/item flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                              active
                                ? "bg-accent font-medium text-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            <span className="flex-1 truncate">
                              {chatData.title || t("new_conversation")}
                            </span>
                            <div
                              className={`flex items-center gap-0.5 transition-opacity ${
                                active ? "opacity-100" : "opacity-0 group-hover/item:opacity-100"
                              }`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newTitle = prompt(
                                    `${t("edit_title")}:`,
                                    chatData.title || t("new_conversation")
                                  );
                                  if (newTitle !== null && newTitle.trim() !== "") {
                                    updateChatTitle(chatId, newTitle.trim());
                                  }
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground"
                                title={t("edit_title")}
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChat(e, chatId);
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-red-500"
                                title={t("delete_conversation")}
                              >
                                <Trash size={13} />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Rodapé: Login (se não logado) + Configurações */}
          <div className="mt-auto border-t border-border pt-3">
            {!user?.user?.id && (
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
              >
                <IoIosLogIn className="size-4" />
                <span>{t("login")}</span>
              </Link>
            )}
            {user?.user?.id && (
              <div
                className="relative flex cursor-pointer items-center gap-2.5 rounded-xl p-2 text-foreground transition-colors hover:bg-accent"
                onClick={() => setOpenProfile(true)}
              >
                {user?.user?.user_metadata?.avatar_url ? (
                  <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-border">
                    <Image
                      src={user.user.user_metadata.avatar_url}
                      alt={`Avatar de ${user.user.user_metadata.full_name || "usuário"}`}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden h-full w-full items-center justify-center bg-brand text-sm font-bold text-white">
                      {user.user.user_metadata.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {user.user.user_metadata.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {user.user.user_metadata.full_name || t("my_account")}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{t("my_account")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  };

  // Componente MobileSidebar
  const MobileSidebar = () => (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-3 backdrop-blur-md">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground shadow-sm active:scale-95"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <LanguageSelect variant="bar" />
          <ThemeSwitch compact />
          <div className="flex items-center justify-center rounded-xl bg-white p-0.5 shadow-sm">
            <Image src={logo2} alt="Logo" width={100} height={100} className="h-8 w-8" />
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-xs flex-col bg-surface text-foreground shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
              <div className="flex flex-col h-full p-3 pt-4">
                {/* Cabeçalho */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-xl bg-white p-1 shadow-sm">
                    <Image src={logo2} alt="Logo" width={100} height={100} className="h-10 w-10" />
                  </div>
                  <span className="font-display text-base font-semibold">Escola Sabatina</span>
                </div>

                {/* Botão Nova Conversa */}
                <button
                  onClick={() => {
                    onNewChat();
                    setSidebarOpen(false);
                  }}
                  className="mb-2 flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent active:scale-[0.99]"
                >
                  <Plus size={17} className="text-primary" />
                  <span>{t("new_conversation")}</span>
                </button>

                {/* Histórico */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  <h2 className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("history")}
                  </h2>
                  {Object.keys(chatHistory).length === 0 ? (
                    <p className="px-1 py-4 text-xs text-muted-foreground">
                      As suas conversas aparecerão aqui.
                    </p>
                  ) : (
                    <ul className="-mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
                      {Object.entries(chatHistory)
                        .sort((a, b) => {
                          const ta = new Date(a[1].updatedAt || a[1].createdAt || 0).getTime();
                          const tb = new Date(b[1].updatedAt || b[1].createdAt || 0).getTime();
                          return tb - ta;
                        })
                        .map(([chatId, chatData]) => {
                          const active = currentChatId === chatId;
                          return (
                            <li key={chatId}>
                              <div
                                onClick={() => handleChatSelect(chatId)}
                                className={`group/item flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                                  active
                                    ? "bg-accent font-medium text-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                }`}
                              >
                                <span className="flex-1 truncate">
                                  {chatData.title || t("new_conversation")}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newTitle = prompt(
                                        `${t("edit_title")}:`,
                                        chatData.title || t("new_conversation")
                                      );
                                      if (newTitle !== null && newTitle.trim() !== "") {
                                        updateChatTitle(chatId, newTitle.trim());
                                      }
                                    }}
                                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground"
                                    title={t("edit_title")}
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteChat(e, chatId);
                                    }}
                                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-red-500"
                                    title={t("delete_conversation")}
                                  >
                                    <Trash size={13} />
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>

                {/* Rodapé fixo */}
                <div className="mt-auto border-t border-border pt-3">
                  <div
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl p-2 text-foreground transition-colors hover:bg-accent"
                    onClick={() => setOpenProfile(true)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                      <MdOutlineSettings className="size-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm">{t("settings")}</span>
                  </div>
                </div>

                <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground">
                  {t("ai_assistant_warning")}
                  <br />
                  {t("copyright")} {currentYear} · Leumas Andrade
                </p>
              </div>
      </aside>
    </>
  );

  return (
    <>
      {isMobile ? <MobileSidebar /> : <DesktopSidebar />}
      {/* Espaçador: reserva a largura do sidebar fixo (deve casar com md:w-48 xl:w-64) */}
      <div
        className={isMobile ? "" : "flex-shrink-0 w-48 xl:w-64 transition-all duration-300"}
      ></div>

      {openProfile && (
        <div
          ref={profileRef}
          className={`absolute bottom-24 left-6 mb-2 sm:w-[18%] lg:w-[15%] xl:w-[11%] p-2 ${sidebarBg} ${textColor} rounded-lg shadow-xl z-50 border ${borderColor} flex flex-col space-y-2`}
        >
          <div className="flex flex-col space-y-2">
            {user?.user?.id && (
              <div
                className={`px-3 py-2 text-xs xl:text-sm font-semibold border-b ${textColor}`}
              >
                {user.user.user_metadata.full_name || user.user.email}
              </div>
            )}
            <button
              onClick={() => {
                setOpenProfile(false);
                setOpenSettings(true);
              }}
              className={`w-full p-2 rounded flex items-center justify-between gap-2 text-sm ${hoverBg}`}
            >
              <MdOutlineSettings className="size-4 xl:size-6" />
              <span className="text-xs xl:text-sm">{t("settings")}</span>
            </button>
            <button
              type="submit"
              className={`w-full p-2 rounded flex items-center justify-between ${hoverBg} gap-2 text-sm`}
            >
              <BsSend className="size-4 xl:size-6" />
              <span className="text-xs xl:text-sm">{t("contact_us")}</span>
            </button>
            <form action={handleLogout} className="w-full">
              <button
                type="submit"
                className={`w-full p-2 rounded flex items-center justify-between ${hoverBg} gap-2 text-sm`}
              >
                <IoIosLogOut className="size-4 xl:size-6" />
                <span className="text-xs xl:text-sm">{t("logout")}</span>
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
                <h3 className="text-lg font-semibold">{t("settings")}</h3>
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
                    {t("general")}
                  </button>
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "about"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {t("about")}
                  </button>
                </nav>
              </div>

              {/* Conteúdo das abas */}
              <div className="space-y-4">
                {/* Tab Geral */}
                {activeTab === "general" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{t("theme")}</h4>
                      <ThemeSwitch />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{t("language")}</h4>
                      <LanguageSelect variant="block" />
                    </div>
                  </div>
                )}

                {/* Tab Sobre Nós */}
                {activeTab === "about" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{t("version")}</h4>
                      <p className="text-sm">1.0.0</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">
                        {t("terms_of_service")}
                      </h4>
                      <p className={`text-sm ${textColor}`}>
                        Leia nossos termos de serviço e política de privacidade.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{t("contact")}</h4>
                      <p className={`text-sm ${textColor}`}>
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
