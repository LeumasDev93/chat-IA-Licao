/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function MobileConversationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Verificar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(false); // Fecha menu se redimensionar para desktop
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Simulação de histórico de conversas
  const conversationHistory: any = [];

  if (!isMobile) return null; // Não renderiza em desktop

  return (
    <>
      {/* Botão para abrir o menu */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg  shadow-md md:hidden"
        aria-label="Abrir histórico de conversas"
      >
        <Menu size={24} />
      </button>

      {/* Menu lateral */}
      <div
        className={`fixed inset-0 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:hidden`}
      >
        <div className="relative w-64 h-full shadow-lg">
          {/* Cabeçalho com logo e botão fechar */}
          <div className="flex items-center justify-between p-4 bg-slate-800">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"></div>
              <span className="ml-3 font-semibold">Chat</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Histórico de conversas */}
          <div className="p-2 overflow-y-auto h-[calc(100%-64px)] bg-slate-800">
            <h3 className="px-2 py-3 text-sm font-medium text-gray-500">
              Histórico de Conversas
            </h3>
            <ul className="space-y-1">
              {conversationHistory.map(
                (conversation: string, index: number) => (
                  <li key={index}>
                    <button
                      onClick={() => {
                        // Aqui você adicionaria a lógica para carregar a conversa
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center"
                    >
                      <span className="truncate">{conversation}</span>
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Overlay para fechar o menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
