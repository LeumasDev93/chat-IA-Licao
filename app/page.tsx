/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  Sparkles,
  X,
  LockKeyhole,
  Zap,
  History,
  Image as ImageIcon,
} from "lucide-react";
import { MessageType } from "@/types";
import { generateBotResponse } from "@/utils/botResponses";
import Message from "@/components/chatbot/Message";
import TypingIndicator from "@/components/chatbot/TypingIndicator";
import ImageLoading from "@/components/chatbot/ImageLoading";
import AppLoader from "@/components/AppLoader";
import Image from "next/image";
import logo1 from "@/assets/Logo1.png";

import ChatSidebar from "@/components/Header";
import LanguageSelect from "@/components/LanguageSelect";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSupabaseUser } from "@/hooks/useComponentClient";
import { createComponentClient } from "@/models/supabase";

import { FaSpinner } from "react-icons/fa6";
import Link from "next/link";

import { useNotifications } from "@/hooks/useNotifications";
import { generateUniqueId } from "@/lib/utils";
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
  const { language, t } = useLanguage();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  const {
    isSubscribed,
    error,
    subscribe,
    showNotification,
    requestPermission,
  } = useNotifications();

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

  const user = useSupabaseUser();

  const {
    chatHistory,
    currentChatId,
    addMessage,
    createNewChat,
    deleteChat,
    updateChatTitle,
    setCurrentChatId,
    loading: historyLoading,
    currentMessages,
    currentChat,
  } = useChatHistory(user?.user?.id);

  const [messages, setMessages] = useState<MessageType[]>([]);

  // Carrega mensagens quando o chat atual mudar
  useEffect(() => {
    if (currentChatId) {
      setMessages(currentMessages);
    } else {
      setMessages([]);
    }
  }, [currentChatId]); // Removido currentMessages para evitar loop

  // Sincroniza mensagens quando currentMessages mudar
  useEffect(() => {
    if (currentChatId && currentMessages.length > 0) {
      setMessages(currentMessages);
    }
  }, [currentMessages, currentChatId]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [pendingImage, setPendingImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [alertMessage, setAlert] = useState(false);
  const isMobile = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const INTERVALO_MS = 6 * 60 * 60 * 1000; // 6 horas

    const solicitarPermissaoENotificar = async () => {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission === "granted") {
        new Notification("Olá!", {
          body: "Vamos Estudar Lição Juntos?!",
        });
      }
    };

    // Garantir que só comece após uma interação do usuário
    const onUserInteraction = () => {
      solicitarPermissaoENotificar(); // Primeira notificação imediata
      const interval = setInterval(solicitarPermissaoENotificar, INTERVALO_MS);

      window.removeEventListener("click", onUserInteraction);
      window.removeEventListener("touchstart", onUserInteraction);

      // Opcional: limpar ao desmontar
      return () => clearInterval(interval);
    };

    // Aguarda interação do usuário (obrigatório no Chrome)
    window.addEventListener("click", onUserInteraction);
    window.addEventListener("touchstart", onUserInteraction);
  }, []);

  const textFooter =
    resolvedTheme === "dark" ? "text-blue-400" : "text-blue-700";

  useEffect(() => {
    isMobile.current =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
  }, []);

  const quickReplies = [
    t("saturday_afternoon"),
    t("sunday"),
    t("monday"),
    t("tuesday"),
    t("wednesday"),
    t("thursday"),
    t("friday"),
    t("auxiliary"),
    t("commentary"),
    t("weekly_summary"),
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

    // Se ainda não houver chat atual, cria um novo
    if (!chatId) {
      const newChatId = await createNewChat();
      chatId = newChatId;
      setCurrentChatId(newChatId);
      setMessages([]);
    }

    const userMessage: MessageType = {
      id: generateUniqueId("user"),
      text: content,
      sender: "user",
      timestamp: new Date(),
      parts: [{ text: content }],
    };

    // Adiciona mensagem ao estado local imediatamente
    setMessages((prev) => [...prev, userMessage]);
    // Também salva via hook
    addMessage(chatId, userMessage);

    if (!messageContent) {
      setInputValue("");
      const ta = document.getElementById("message-input");
      if (ta) ta.style.height = "auto";
    }

    const wantsImage =
      imageMode ||
      /\b(ger[ae]|cri[ae]|desenh[ae]|ilustra)\w*\s+(uma?\s+)?(imagem|ilustra|desenho|figura|arte)/i.test(content);
    setPendingImage(wantsImage);
    setIsTyping(true);

    try {
      // Resposta do bot
      const isNewConversation = messages.length === 0; // Se não há mensagens, é uma nova conversa
      const botResponse = await generateBotResponse(
        content,
        language,
        isNewConversation,
        imageMode ? "image" : "text"
      );
      const botMessage: MessageType = {
        id: generateUniqueId("bot"),
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
        parts: [{ text: botResponse.text }],
        image: botResponse.image,
      };

      // Adiciona ao estado local + histórico (a imagem fica em memória; o
      // localStorage descarta o base64 — ver lib/chatHistory.ts).
      setMessages((prev) => [...prev, botMessage]);
      addMessage(chatId, botMessage);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      const errorMessage: MessageType = {
        id: generateUniqueId("error"),
        text: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?",
        sender: "bot",
        timestamp: new Date(),
        parts: [
          {
            text: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?",
          },
        ],
      };

      // Adiciona mensagem ao estado local imediatamente
      setMessages((prev) => [...prev, errorMessage]);
      // Também salva via hook
      addMessage(chatId, errorMessage);
    } finally {
      setIsTyping(false);
      setPendingImage(false);
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
  const handleNewChat = async () => {
    const newChatId = await createNewChat();

    // Adiciona uma saudação automática para nova conversa
    const welcomeMessages = {
      pt: "🌟 Olá! Que alegria ter você aqui! Como posso iluminar seu estudo da Lição da Escola Sabatina hoje?",
      en: "🌟 Hello! What a joy to have you here! How can I illuminate your Sabbath School lesson study today?",
      es: "🌟 ¡Hola! ¡Qué alegría tenerte aquí! ¿Cómo puedo iluminar tu estudio de la Lección de la Escuela Sabática hoy?",
      fr: "🌟 Bonjour! Quelle joie de vous avoir ici! Comment puis-je éclairer votre étude de la Leçon de l'École du Sabbat aujourd'hui?",
      krioulu:
        "🌟 Olá, nha fidju/fidja! Que alegria ter bu li! Como posso iluminar bu estudo da Lição da Escola Sabatina hoje?",
    };

    const welcomeMessage: MessageType = {
      id: generateUniqueId("welcome"),
      text:
        welcomeMessages[language as keyof typeof welcomeMessages] ||
        welcomeMessages.pt,
      sender: "bot",
      timestamp: new Date(),
      parts: [
        {
          text:
            welcomeMessages[language as keyof typeof welcomeMessages] ||
            welcomeMessages.pt,
        },
      ],
    };

    // Adiciona mensagem ao estado local imediatamente
    setMessages([welcomeMessage]);
    // Também salva via hook
    addMessage(newChatId, welcomeMessage);
  };

  if (!mounted) {
    return <AppLoader />;
  }

  const isEmpty = messages.length === 0;
  const isLoggedIn = !!user?.user?.id;

  const runPrompt = (text: string) => {
    if (isLoggedIn) handleSendMessage(undefined, text);
    else setAlert(true);
  };

  return (
    <main className="flex h-[100dvh] flex-col bg-background text-foreground">
      <div className="flex flex-grow overflow-hidden">
        {/* Menu lateral / topo mobile */}
        <ChatSidebar
          onNewChat={handleNewChat}
          chatHistory={chatHistory}
          currentChatId={currentChatId}
          setCurrentChatId={setCurrentChatId}
          deleteChat={deleteChat}
          updateChatTitle={updateChatTitle}
        />

        {/* Coluna principal */}
        <div className="mt-16 flex min-w-0 flex-1 flex-col lg:mt-0">
          {/* Barra superior — só no desktop */}
          <div className="hidden items-center justify-end gap-2 border-b border-border bg-background/70 px-6 py-2.5 backdrop-blur-md lg:flex">
            <LanguageSelect variant="bar" />
            <ThemeSwitch compact />
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-5 sm:px-6 sm:pt-8">
              {isEmpty ? (
                <div className="flex min-h-[calc(100dvh-13rem)] flex-col items-center justify-center py-4 text-center animate-fadeIn">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-primary/20 sm:h-16 sm:w-16">
                    <Image src={logo1} alt="" width={64} height={64} className="h-9 w-9 object-contain brightness-0 invert sm:h-10 sm:w-10" />
                  </div>
                  <h1 className="font-display text-xl font-semibold leading-tight tracking-tight sm:text-4xl">
                    <span className="text-gradient">{t("ai_assistant_title")}</span>
                  </h1>
                  <p className="mt-2.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground sm:mt-3 sm:max-w-md sm:text-sm">
                    Estudo da Lição da Escola Sabatina — resumos, explicações e infográficos da semana.
                  </p>

                  <div className="mt-6 grid w-full max-w-xl grid-cols-2 gap-2 sm:mt-8 sm:gap-2.5">
                    {quickReplies.slice(0, 6).map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => runPrompt(reply)}
                        className="group flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-[13px] shadow-sm transition-all hover:border-primary/40 hover:bg-accent active:scale-[0.98] sm:gap-3 sm:px-4 sm:py-3 sm:text-sm"
                      >
                        <Sparkles size={14} className="flex-shrink-0 text-primary transition-transform group-hover:scale-110 sm:h-4 sm:w-4" />
                        <span className="truncate text-foreground">{reply}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-4">
                  {messages.map((msg) => (
                    <Message
                      key={msg.id}
                      message={{
                        ...msg,
                        text: (msg.parts ?? [{ text: msg.text }]).map((p) => p.text).join(" "),
                      }}
                    />
                  ))}
                  {isTyping && (pendingImage ? <ImageLoading /> : <TypingIndicator />)}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-background">
            <div className="mx-auto w-full max-w-3xl px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 sm:px-6">
              <form onSubmit={handleSendMessage}>
                <div
                  className={`flex items-end gap-1.5 rounded-2xl border bg-surface p-2 shadow-lg transition-colors
                    ${imageMode ? "border-primary/60 ring-1 ring-primary/20" : "border-border focus-within:border-primary/50"}`}
                >
                  <button
                    type="button"
                    disabled={isTyping}
                    onClick={() => setImageMode((v) => !v)}
                    aria-pressed={imageMode}
                    title={imageMode ? "Modo infográfico ativo" : "Gerar infográfico da lição"}
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors
                      ${imageMode ? "bg-brand text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                  >
                    <ImageIcon size={18} />
                  </button>

                  <textarea
                    id="message-input"
                    disabled={isTyping}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (isLoggedIn) handleSendMessage(e);
                        else setAlert(true);
                      }
                    }}
                    placeholder={
                      !isLoggedIn
                        ? t("login_to_send")
                        : imageMode
                        ? "Ex.: infográficos da lição desta semana, ou de quarta-feira…"
                        : t("type_message")
                    }
                    rows={1}
                    className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-[0.95rem] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />

                  {!imageMode && (
                    <button
                      type="button"
                      disabled={isTyping}
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      aria-label="Gravar voz"
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors
                        ${isRecording ? "bg-red-500 text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      <Mic size={18} className={isRecording ? "animate-pulse" : ""} />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={inputValue.trim() === "" || isTyping}
                    aria-label="Enviar"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:active:scale-100"
                  >
                    {isTyping ? (
                      <FaSpinner size={15} className="animate-spin" />
                    ) : imageMode ? (
                      <Sparkles size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </form>

              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                {imageMode
                  ? "Modo infográfico ativo — gera um infográfico completo da lição."
                  : t("ai_assistant_warning")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: login necessário */}
      {alertMessage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setAlert(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAlert(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-primary/25">
                <LockKeyhole className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{t("access_blocked")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("login_to_unlock")}</p>

              <ul className="mt-5 w-full space-y-2.5 text-left text-sm">
                <li className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">{t("intelligent_responses")}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <History className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">{t("complete_history")}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">{t("priority_access")}</span>
                </li>
              </ul>

              <Link
                href="/login"
                className="mt-6 w-full rounded-xl bg-brand py-3 text-center text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
              >
                {t("login_now")}
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">{t("takes_less_than_30_seconds")}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
