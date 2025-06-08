/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

export default function ChatSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  // Verificar se é mobile e ajustar estado inicial
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Simulação de conversas
  const conversations: any = [];

  // Verificar se precisa de scroll
  useEffect(() => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      setNeedsScroll(scrollHeight > clientHeight);
    }
  }, [conversations]);

  // Fechar sidebar ao clicar em uma conversa (mobile)
  const handleConversationClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Botão de toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-border transition-all ${
          sidebarOpen && !isMobile ? "md:left-64" : "md:left-4"
        } ${isMobile ? "" : "md:hidden"}`}
        aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 bg-surface shadow-lg bg-slate-800
                   flex flex-col transition-all duration-300
                   ${sidebarOpen ? "lg:w-42 xl:w-64" : "w-0 md:w-20"}`}
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho com logo */}
          <div className="p-4 ">
            <div
              className={`flex items-center gap-2 ${
                !sidebarOpen && "justify-center"
              }`}
            >
              {!sidebarOpen ? (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="">C</span>
                </div>
              ) : (
                <h1 className="text-lg font-bold">Chat App</h1>
              )}
            </div>
          </div>

          {/* Botão Nova Conversa */}
          {/* <button
            className={`mx-4 mt-4 p-2 rounded-lg bg-primary  flex items-center gap-2 justify-center
                      ${
                        !sidebarOpen &&
                        "md:w-12 md:h-12 md:rounded-full md:mx-auto"
                      }`}
          >
            <Plus size={18} />
            {sidebarOpen && <span>Nova Conversa</span>}
          </button> */}

          {/* Histórico de conversas */}
          <div
            ref={contentRef}
            className={`flex-1 mt-4 ${
              needsScroll ? "overflow-y-auto" : "overflow-hidden"
            }`}
          >
            <ul className="space-y-1 px-2">
              {conversations.map((conv: any, i: any) => (
                <li key={i}>
                  <button
                    onClick={handleConversationClick}
                    className={`w-full text-left p-2 rounded hover:bg-surface-hover flex items-center gap-2 mb-1
                              ${!sidebarOpen && "justify-center"}`}
                  >
                    <span>💬</span>
                    {sidebarOpen && <span className="truncate">{conv}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* <div
            className={`p-4 border-t border-border ${
              !sidebarOpen ? "hidden md:block" : ""
            }`}
          >
            <div
              className={`relative ${sidebarOpen ? "" : "flex justify-center"}`}
            >
              <ThemeSwitch compact={!sidebarOpen} />
            </div>
          </div> */}
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Espaço para conteúdo principal */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "md:ml-20"
        }`}
      >
        {/* Área do chat aqui */}
      </div>
    </>
  );
}
