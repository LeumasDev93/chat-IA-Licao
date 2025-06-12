/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Mic } from "lucide-react";
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
import { auth } from "./lib/auth";
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
    return (
      chatHistory[currentChatId] || [
        {
          id: "1",
          text: "Olá! Sou seu assistente virtual especializado para estudos da lição da escola sabatina. Como posso ajudar você hoje?",
          sender: "bot",
          timestamp: new Date(),
          parts: [
            {
              text: "Olá! Sou seu assistente virtual especializado para estudos da lição da escola sabatina. Como posso ajudar você hoje?",
            },
          ],
        },
      ]
    );
  });

  useEffect(() => {
    if (chatHistory[currentChatId]) {
      setMessages(chatHistory[currentChatId]);
    } else {
      setMessages([
        {
          id: "1",
          text: "Olá! Sou seu assistente virtual especializado para estudos da lição da escola sabatina. Como posso ajudar você hoje?",
          sender: "bot",
          timestamp: new Date(),
          parts: [
            {
              text: "Olá! Sou seu assistente virtual especializado para estudos da lição da escola sabatina. Como posso ajudar você hoje?",
            },
          ],
        },
      ]);
    }
  }, [currentChatId, chatHistory]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const isMobile = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
    if (!content) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: content,
      sender: "user",
      timestamp: new Date(),
      parts: [{ text: content }],
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    addMessage(currentChatId, userMessage);

    if (!messageContent) {
      setInputValue("");
    }

    setIsTyping(true);

    try {
      const botResponse = await generateBotResponse(content);
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
        parts: [{ text: botResponse.text }],
      };

      setMessages([...updatedMessages, botMessage]);
      addMessage(currentChatId, botMessage);
    } catch (error) {
      console.error("Erro ao obter resposta do bot:", error);
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
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
      addMessage(currentChatId, errorMessage);
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
    const newChatId = createNewChat();
    setCurrentChatId(newChatId);
  };

  return (
    <main
      className={`flex flex-col h-screen   ${
        resolvedTheme === "dark" ? "dark" : "bg-gray-200"
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

              <div className="p-4 sm:p-6 text-center">
                <p className="text-[12px] md:text-xs xl:text-sm">
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
        : "bg-gray-200 text-gray-700"
    }
  `}
          >
            <div className="mx-auto max-w-3xl w-full sm:px-4 sm:pb-3">
              {messages.length <= 1 && (
                <div className="mb-2">
                  {/* Desktop (grid) */}
                  <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {quickReplies.map((reply, index) => (
                      <QuickReply
                        key={index}
                        text={reply}
                        onClick={
                          !isTyping
                            ? () => {
                                void handleSendMessage(undefined, reply);
                              }
                            : () => {}
                        }
                      />
                    ))}
                  </div>

                  {/* Mobile (scroll horizontal sem barra visível) */}
                  <div className="sm:hidden mx-2 flex overflow-x-auto space-x-2 pb-2 no-scrollbar">
                    {quickReplies.map((reply, index) => (
                      <div key={index} className="flex-shrink-0">
                        <QuickReply
                          text={reply}
                          onClick={
                            !isTyping
                              ? () => {
                                  void handleSendMessage(undefined, reply);
                                }
                              : () => {}
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={(e) => handleSendMessage(e)} className="relative">
                <div className="relative">
                  <textarea
                    id="message-input"
                    disabled={isTyping}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Digite sua mensagem..."
                    rows={3}
                    style={{
                      minHeight: "40px",
                      maxHeight: "150px",
                    }}
                    className={`
        w-full px-4 py-3 pr-16 text-base rounded-t-2xl sm:rounded-xl focus:outline-none focus:ring-1 shadow-lg resize-none
        transition-all duration-200
        ${
          resolvedTheme === "dark"
            ? "bg-gray-700 text-white focus:ring-gray-300"
            : "bg-gray-100 text-black focus:ring-gray-300"
        }
      `}
                  />

                  {/* Botões dentro do textarea */}
                  <div className="absolute right-2 bottom-2 flex gap-1">
                    {/* Botão de gravação */}
                    <button
                      type="button"
                      disabled={isTyping}
                      onMouseDown={!isTyping ? startRecording : undefined}
                      onMouseUp={stopRecording}
                      onMouseLeave={() => {
                        if (isPressing && !isMobile.current) {
                          stopRecording();
                        }
                      }}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`
          p-2 rounded-full transition-colors
          ${isTyping ? "cursor-not-allowed opacity-50" : ""}
          ${isPressing || isRecording ? "bg-red-500 animate-pulse" : ""}
          ${
            !isTyping && !(isPressing || isRecording)
              ? resolvedTheme === "dark"
                ? "hover:text-gray-300 hover:bg-gray-800"
                : "hover:text-gray-800 hover:bg-gray-200"
              : ""
          }
        `}
                      aria-label="Pressione e segure para falar"
                    >
                      <Mic size={18} />
                    </button>

                    {/* Botão de enviar */}
                    <button
                      type="submit"
                      disabled={inputValue.trim() === "" || isTyping}
                      className={`
          p-2 rounded-full transition-colors
          ${inputValue.trim() === "" ? "cursor-not-allowed opacity-50" : ""}
          ${
            inputValue.trim() !== ""
              ? resolvedTheme === "dark"
                ? "bg-gray-500 hover:bg-gray-800"
                : "bg-gray-400 hover:bg-gray-600 text-white"
              : ""
          }
        `}
                      aria-label="Enviar mensagem"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>

                {isRecording && (
                  <div className="text-center text-sm text-red-500 mt-1">
                    {isMobile.current
                      ? "Gravando... Solte para enviar"
                      : "Gravando... Fale agora"}
                  </div>
                )}
              </form>
            </div>

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
    </main>
  );
}
