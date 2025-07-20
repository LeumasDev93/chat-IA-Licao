/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  X,
  Sparkles,
  LockKeyhole,
  Zap,
  History,
} from "lucide-react";
import { MessageType } from "@/types";
import { generateBotResponse } from "@/utils/botResponses";
import Message from "@/components/chatbot/Message";
import TypingIndicator from "@/components/chatbot/TypingIndicator";
import QuickReply from "@/components/chatbot/QuickReply";
import Image from "next/image";
import logo1 from "@/assets/Logo1.png";

import MobileTopMenu from "@/components/MobileTopMenu";
import ChatSidebar from "@/components/Header";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTheme } from "@/contexts/ThemeContext";
import MobileConversationMenu from "@/components/MobileTopMenu";
import { createBrowserClient } from "@supabase/ssr";
import { useSupabaseUser } from "@/hooks/useComponentClient";
import { createComponentClient } from "@/models/supabase";
import { FaSpinner } from "react-icons/fa6";
import Link from "next/link";
// Tipagens globais para reconhecimento de voz
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export default function Home() {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Garante que o tema já foi resolvido no cliente
    setMounted(true);
  }, []);

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

  const {
    chatHistory,
    currentChatId,
    addMessage,
    createNewChat,
    deleteChat,
    setCurrentChatId,
  } = useChatHistory();

  const [messages, setMessages] = useState<MessageType[]>(() => {
    // Carrega mensagens da conversa atual se existir
    return chatHistory[currentChatId] || [];
  });

  useEffect(() => {
    if (chatHistory[currentChatId]) {
      setMessages(chatHistory[currentChatId]);
    } else {
      setMessages([]);
    }
  }, [currentChatId, chatHistory]);

  const user = useSupabaseUser();

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const isMobile = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [alertMessage, setAlert] = useState(false);
  const textFooter =
    resolvedTheme === "dark" ? "text-blue-400" : "text-blue-700";

  useEffect(() => {
    isMobile.current =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
  }, []);

  const quickReplies = [
    "Sábado à tarde",
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Auxiliar",
    "Comentário",
    "Resumo Semanal",
  ];

  useEffect(() => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      console.warn("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const recognition: SpeechRecognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR";

    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInputValue(final || interim);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") {
        console.debug("Reconhecimento de voz foi abortado manualmente.");
        return;
      }

      console.error("Erro no reconhecimento de voz:", event.error);

      if (event.error === "not-allowed") {
        alert(
          "Permissão de microfone negada. Ative para usar o reconhecimento de voz."
        );
      }

      setIsRecording(false);
      setIsPressing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsPressing(false);
    };

    return () => {
      recognition.stop();
      recognition.abort();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (
    e?: React.FormEvent | React.KeyboardEvent,
    messageContent?: string
  ) => {
    e?.preventDefault();

    if (isTyping) return;

    const content = messageContent || inputValue.trim();
    if (!content || !user?.user?.id) return;

    let chatId = currentChatId;

    // Se ainda não houver chat atual, gera um novo automaticamente
    if (!chatId) {
      chatId = Date.now().toString();
      setCurrentChatId(chatId);
      setMessages([]); // zera mensagens anteriores
    }

    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: content,
      sender: "user",
      timestamp: new Date(),
      parts: [{ text: content }],
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    addMessage(chatId, userMessage);

    if (!messageContent) {
      setInputValue("");
    }

    setIsTyping(true);

    try {
      // Verifica se o chat já está salvo no Supabase
      const { data: existingChat, error: fetchError } = await supabase
        .from("user_chats")
        .select("chat_id")
        .eq("chat_id", chatId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (!existingChat) {
        // Criar novo chat
        const { error: insertError } = await supabase
          .from("user_chats")
          .insert({
            user_id: user.user.id,
            chat_id: chatId,
            messages: [userMessage],
            title: content.slice(0, 100),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      } else {
        // Atualizar chat existente
        const { error: updateError } = await supabase
          .from("user_chats")
          .update({
            messages: updatedMessages,
            updated_at: new Date().toISOString(),
          })
          .eq("chat_id", chatId);

        if (updateError) throw updateError;
      }

      // Resposta do bot
      const botResponse = await generateBotResponse(content);
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
        parts: [{ text: botResponse.text }],
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      addMessage(chatId, botMessage);

      await supabase
        .from("user_chats")
        .update({
          messages: finalMessages,
          updated_at: new Date().toISOString(),
        })
        .eq("chat_id", chatId);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      const errorMessage: MessageType = {
        id: (Date.now() + 2).toString(),
        text: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?",
        sender: "bot",
        timestamp: new Date(),
        parts: [
          {
            text: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?",
          },
        ],
      };

      setMessages([...updatedMessages, errorMessage]);
      addMessage(chatId, errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInputValue(text);
    document.getElementById("message-input")?.focus();
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;

    // Limpa o campo apenas no desktop
    if (!isMobile.current) {
      setInputValue("");
    }

    setIsPressing(true);

    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {}
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsRecording(false);
    setIsPressing(false);

    // No mobile, envia automaticamente se houver conteúdo
    if (isMobile.current && inputValue.trim()) {
      handleSendMessage();
    }
  };
  const handleNewChat = () => {
    if (!user?.user?.id) return;

    const newChatId = Date.now().toString();
    setMessages([]);
    setCurrentChatId(newChatId);
  };

  const supabase = createComponentClient();
  // Função para carregar os chats do usuário
  const loadUserChats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_chats")
      .select("chat_id")
      .eq("user_id", user?.user?.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Erro ao carregar chats:", error);
    return data;
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin" />
      </div>
    );
  }

  return (
    <main
      className={`flex flex-col h-screen   ${
        resolvedTheme === "dark" ? "dark" : "bg-gray-300"
      }`}
    >
      <div className="flex-grow flex overflow-hidden">
        {/* Menu Lateral */}
        <div>
          <ChatSidebar
            onNewChat={handleNewChat}
            chatHistory={chatHistory}
            currentChatId={currentChatId}
            setCurrentChatId={setCurrentChatId}
            deleteChat={deleteChat}
          />
        </div>
        {/* Área de conteúdo principal */}
        <div className="flex-1 flex flex-col mt-16 lg:mt-0 min-w-0">
          {/* Área de mensagens com scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center mx-auto w-full max-w-3xl px-4 py-4">
              {/* Logo e introdução */}
              <div className="hidden lg:flex items-center justify-center w-10 h-10 md:w-14 md:h-14 xl:w-20 xl:h-20  bg-gray-50 border-b border-gray-200 rounded-full">
                <Image
                  src={logo1}
                  alt="Logo"
                  width={200}
                  height={200}
                  className="w-full h-full"
                />
              </div>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="text-primary" />
                  Assistente IA - Escola Sabatina
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Esta é a Inteligência Artificial oficial da Igreja Adventista
                  do Sétimo Dia Em Cabo Verde, desenvolvida para apoiar nos
                  estudos da lição da escola sabatina, inspirar e fortalecer sua
                  jornada espiritual.
                </p>
              </div>

              {/* Mensagens */}
              <div className="w-full space-y-3 sm:space-y-4 pb-24">
                {messages.map((msg) => (
                  <Message
                    key={msg.id}
                    message={{
                      ...msg,
                      text: (msg.parts ?? [{ text: msg.text }])
                        .map((p) => p.text)
                        .join(" "),
                    }}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          <div
            className={`
    sticky bottom-0
    ${
      resolvedTheme === "dark"
        ? "bg-gray-900 text-gray-400"
        : "bg-gray-300 text-gray-700"
    }
  `}
          >
            {alertMessage && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
                <div
                  className={`relative flex flex-col max-w-md w-full p-6 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.01] ${
                    resolvedTheme === "dark"
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30 text-white"
                      : "bg-gradient-to-br from-white to-gray-100 border border-purple-300 text-gray-800"
                  }`}
                >
                  {/* Botão de fechar */}
                  <button
                    onClick={() => setAlert(false)}
                    className={`absolute top-3 right-3 p-1 rounded-full ${
                      resolvedTheme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <X size={20} />
                  </button>

                  {/* Conteúdo principal */}
                  <div className="flex flex-col items-center text-center space-y-4 mt-4">
                    {/* Ícone animado */}
                    <div className="relative">
                      <div
                        className={`absolute inset-0 rounded-full ${
                          resolvedTheme === "dark"
                            ? "bg-purple-500/20 animate-ping"
                            : "bg-purple-300/40 animate-ping"
                        }`}
                      ></div>
                      <LockKeyhole className="h-12 w-12 text-purple-500" />
                    </div>

                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                      Acesso Bloqueado
                    </h3>

                    <p className="text-lg">Inicie sessão para desbloquear:</p>

                    <ul className="space-y-2 text-left w-full pl-6">
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                        Respostas inteligentes e personalizadas
                      </li>
                      <li className="flex items-center gap-2">
                        <History className="h-4 w-4 text-blue-400" />
                        Histórico completo das suas conversas
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-400" />
                        Acesso prioritário a novos recursos
                      </li>
                    </ul>
                  </div>

                  {/* Botão de ação */}
                  <Link
                    href="/login"
                    className={`mt-6 py-3 px-6 rounded-xl font-bold text-center transition-all duration-200 shadow-lg ${
                      resolvedTheme === "dark"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/30"
                        : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-400 hover:to-blue-400 hover:shadow-purple-400/40"
                    }`}
                  >
                    Iniciar Sessão Agora
                  </Link>

                  <p className="text-xs text-center mt-4 opacity-70">
                    Leva menos de 30 segundos!
                  </p>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 bg-background border-t p-4">
              <div className="mx-auto max-w-3xl w-full">
                {/* Quick replies */}
                {messages.length === 0 && (
                  <div className="mb-4">
                    <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {quickReplies.map((reply, index) => (
                        <QuickReply
                          key={index}
                          text={reply}
                          onClick={() => {
                            if (user.user) {
                              handleSendMessage(undefined, reply);
                            }
                          }}
                        />
                      ))}
                    </div>

                    <div className="sm:hidden flex overflow-x-auto space-x-2 pb-2">
                      {quickReplies.map((reply, index) => (
                        <div key={index} className="flex-shrink-0">
                          <QuickReply
                            text={reply}
                            onClick={() => {
                              if (user.user) {
                                handleSendMessage(undefined, reply);
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="relative">
                  <div className="relative">
                    <textarea
                      id="message-input"
                      disabled={isTyping}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (user.user) {
                            handleSendMessage(e);
                          }
                        }
                      }}
                      placeholder={
                        user.user
                          ? "Digite sua mensagem..."
                          : "Faça login para enviar mensagens..."
                      }
                      rows={3}
                      className="w-full px-4 py-3 pr-16 text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-lg resize-none bg-card border border-border"
                      style={{
                        minHeight: "50px",
                        maxHeight: "150px",
                      }}
                    />

                    {/* Botões */}
                    <div className="absolute right-2 bottom-2 flex gap-1">
                      <button
                        type="button"
                        disabled={isTyping}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        aria-label="Gravação de voz"
                      >
                        <Mic size={18} />
                      </button>

                      <button
                        type="submit"
                        disabled={inputValue.trim() === "" || isTyping}
                        className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Enviar mensagem"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </form>

                {/* Footer */}
                <div className="hidden sm:flex flex-col w-full pb-5 text-center text-[10px] xl:text-xs space-y-2">
                  <span>
                    O Assistente IA para estudos da lição pode cometer erros.
                    Verifique informações importantes.
                  </span>
                  <span>
                    Copyright © {currentYear} | desenvolvido por
                    <span className={`${textFooter} font-semibold`}>
                      {" "}
                      Leumas Andrade
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
