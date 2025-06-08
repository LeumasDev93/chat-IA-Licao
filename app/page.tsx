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
import logo from "@/assets/logo.png";

import MobileTopMenu from "@/components/MobileTopMenu";
import ChatSidebar from "@/components/Header";
import { useChatHistory } from "@/hooks/useChatHistory";
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
  const { chatHistory, addMessage } = useChatHistory();

  const [messages, setMessages] = useState<MessageType[]>([
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
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const isMobile = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

    // Verifica se já está respondendo
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

    setMessages((prev) => [...prev, userMessage]);

    if (!messageContent) {
      setInputValue("");
    }

    setIsTyping(true);

    try {
      const botResponse = await generateBotResponse(content);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: botResponse.text,
          sender: "bot",
          timestamp: new Date(),
          parts: [{ text: botResponse.text }],
        },
      ]);
    } catch (error) {
      console.error("Erro ao obter resposta do bot:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?",
          sender: "bot",
          timestamp: new Date(),
          parts: [
            {
              text: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?",
            },
          ],
        },
      ]);
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

  return (
    <main className="flex flex-col h-screen">
      <div className="flex-grow flex">
        {/* Menu Lateral */}

        {/* Área de conteúdo principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Conteúdo centralizado com scroll condicional */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center mx-auto w-full max-w-3xl px-4 py-4">
              {/* Logo */}
              <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 xl:w-20 xl:h-20 p-3 sm:p-4 bg-gray-50 border-b border-gray-200 rounded-full">
                <Image src={logo} alt="Logo" width={100} height={100} />
              </div>

              {/* Mensagem de introdução */}
              <div className="p-4 sm:p-6 text-center">
                <p className="text-[12px] md:text-xs xl:text-sm ">
                  Esta é a Inteligência Artificial oficial da Igreja Adventista
                  do Sétimo Dia Em Cabo Verde, desenvolvida para apoiar nos
                  estudos da licão da escola sabatina, inspirar e fortalecer sua
                  jornada espiritual.
                </p>
              </div>

              {/* Mensagens com scroll automático */}
              <div className="w-full space-y-3 sm:space-y-4">
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

          {/* Área fixa no rodapé */}
          <div className="sticky bottom-0">
            <div className="mx-auto max-w-3xl w-full px-4 py-3">
              {/* Quick Replies - Agora envia diretamente */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-2">
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

              {/* Formulário com textarea */}
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
                    className="w-full px-4 py-3 pr-16 text-base bg-gray-700 rounded-lg sm:rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 shadow-lg resize-none"
                    rows={4}
                    style={{ minHeight: "50px", maxHeight: "150px" }}
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
                      className={`p-2 rounded-full transition-colors ${
                        isTyping
                          ? "cursor-not-allowed opacity-50"
                          : isPressing || isRecording
                          ? "bg-red-500 animate-pulse"
                          : "hover:text-gray-800 hover:bg-white"
                      }`}
                      aria-label="Pressione e segure para falar"
                    >
                      <Mic size={18} />
                    </button>

                    {/* Botão de enviar */}
                    <button
                      type="submit"
                      disabled={inputValue.trim() === "" || isTyping}
                      className={`p-2 rounded-full transition-colors ${
                        inputValue.trim() === ""
                          ? " cursor-not-allowed"
                          : "bg-gray-500 hover:bg-gray-800"
                      }`}
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
            <div className="flex flex-col w-full pb-5 text-center text-[10px] xl:text-xs space-y-2">
              <span className="">
                O Assistente IA Adventista pode cometer erros. Verifique
                informações importantes.
              </span>
              <span>
                Copyright © {currentYear} | desenvolvido por
                <span className="text-blue-400/70"> Leumas Andrade</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
