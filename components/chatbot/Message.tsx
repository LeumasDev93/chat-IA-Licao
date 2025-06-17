/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { User, Bot, Copy, FileText, Volume2, Play, Pause } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MessageType } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import logo2 from "@/assets/Logo2.png";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface MessageProps {
  message: MessageType & { id?: string };
  isLastMessage?: boolean;
  onActionClick?: (action: "copy" | "pdf" | "speak") => void;
}

const Message: React.FC<MessageProps> = ({
  message,
  isLastMessage = false,
  onActionClick,
}) => {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const [pdfSalve, setPdfSalve] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Função ultra-refinada para limpeza de markdown
  const prepareForSpeech = (text: string) => {
    // Limpeza de formatação com preservação de pontuação
    let cleanText = text
      .replace(/#+\s*/g, "") // Remove títulos
      .replace(/\*\*(.*?)\*\*/g, "$1") // Mantém conteúdo do negrito
      .replace(/\*(.*?)\*/g, "$1") // Mantém conteúdo do itálico
      .replace(/_(.*?)_/g, "$1") // Mantém conteúdo sublinhado
      .replace(/`(.*?)`/g, "$1") // Mantém conteúdo de código
      .replace(/~~(.*?)~~/g, "$1") // Mantém conteúdo riscado
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove imagens
      .replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML

    // Adiciona pausas naturais para leitura fluida
    cleanText = cleanText
      .replace(/([.!?:;])\s*/g, "$1\n") // Pausa após pontuação
      .replace(/(\n)+/g, "\n\n") // Pausa maior entre parágrafos
      .replace(/\s+/g, " ") // Normaliza espaços
      .replace(/\*/g, "") // Remove asteriscos residuais
      .trim();

    return cleanText;
  };
  // Função de leitura corrigida
  const handleSpeak = () => {
    if (isSpeaking && !isPaused) {
      // Pausar leitura
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isSpeaking && isPaused) {
      // Retomar leitura
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Iniciar nova leitura
    const preparedText = prepareForSpeech(message.text);
    if (!preparedText.trim()) {
      console.warn("Texto vazio após preparação");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(preparedText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    utterance.lang = "pt-PT";

    const voices = window.speechSynthesis.getVoices();
    const ptPtVoices = voices.filter((v) => v.lang === "pt-PT");
    const ptVoice = ptPtVoices.length
      ? ptPtVoices[0]
      : voices.find((v) => v.lang.startsWith("pt"));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      console.error("Erro na síntese:", event.name, "Texto:", preparedText);
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.cancel(); // Cancela qualquer leitura anterior
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const currentSpeechRef = speechRef.current;
    return () => {
      if (currentSpeechRef) {
        window.speechSynthesis.cancel();
      }
    };
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

  const isBot = message.sender === "bot";
  const isDark = resolvedTheme === "dark";

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Estilos dinâmicos
  const userBubbleClass = isDark
    ? "bg-blue-600 text-white"
    : "bg-blue-100 text-gray-900";

  const userAvatarClass = isDark
    ? "bg-blue-700 text-white"
    : "bg-blue-200 text-blue-800";

  const botBubbleClass = isDark
    ? "bg-gray-800 text-white"
    : "bg-gray-100 text-gray-900";

  const botAvatarClass = isDark
    ? "bg-gray-800 text-white"
    : "bg-white text-gray-800";

  const imageClass = `w-10 h-10 ${isDark ? "filter invert brightness-50" : ""}`;

  const handleCopy = () => {
    try {
      // Método moderno (funciona na maioria dos navegadores)
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(message.text)
          .then(() => showCopySuccess())
          // eslint-disable-next-line react-hooks/rules-of-hooks
          .catch(() => useFallbackCopyMethod());
      } else {
        // Fallback para dispositivos mobile e navegadores antigos
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useFallbackCopyMethod();
      }
    } catch (error) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useFallbackCopyMethod();
    }
  };

  const useFallbackCopyMethod = () => {
    // Criar um elemento textarea temporário
    const textarea = document.createElement("textarea");
    textarea.value = message.text;
    textarea.style.position = "fixed"; // Evitar rolagem
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    // Selecionar e copiar o texto
    textarea.select();
    try {
      document.execCommand("copy");
      showCopySuccess();
    } catch (err) {
      console.error("Falha ao copiar texto", err);
      alert("Não foi possível copiar o texto. Tente manualmente.");
    }

    // Remover o textarea
    document.body.removeChild(textarea);
  };

  const showCopySuccess = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onActionClick?.("copy");
  };

  const handleGeneratePDF = async (lessonTitle: string) => {
    onActionClick?.("pdf");
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });

      // Configurações de estilo
      const mainFont = "times";
      const titleSize = 14;
      const textSize = 12;
      const margin = 20;
      const lineHeight = 6;
      let yPosition = margin;

      // Função para adicionar texto formatado
      const addText = (
        text: string,
        size = textSize,
        style: string = "normal",
        x = margin
      ) => {
        pdf.setFont(mainFont, style);
        pdf.setFontSize(size);

        const lines = pdf.splitTextToSize(
          text,
          pdf.internal.pageSize.getWidth() - 2 * margin
        );

        for (const line of lines) {
          if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.text(line, x, yPosition);
          yPosition += lineHeight;
        }
      };

      // Título principal (Lições da Semana)
      addText(lessonTitle, titleSize, "bold");
      yPosition += lineHeight;

      // Data/hora
      addText(
        `Data: ${new Date(
          message.timestamp
        ).toLocaleDateString()} - Hora: ${formattedTime}`
      );
      yPosition += lineHeight * 1.5;

      // Processar Markdown completo
      const processMarkdown = (content: string) => {
        const blocks = content.split(/\n\s*\n/);

        for (const block of blocks) {
          if (block.startsWith("# ")) {
            addText(block.substring(2), titleSize, "bold");
          } else if (block.startsWith("## ")) {
            addText(block.substring(3), textSize, "bold");
          } else if (block.startsWith("### ")) {
            addText(block.substring(4), textSize, "bolditalic");
          } else if (block.startsWith("* ")) {
            const items = block.split("\n* ");
            for (const item of items.filter((i) => i)) {
              addText(
                `• ${item.replace("* ", "").trim()}`,
                textSize,
                "normal",
                margin + 5
              );
            }
          } else if (block.startsWith("> ")) {
            addText(block.substring(2), textSize, "italic", margin + 5);
          } else if (block.startsWith("```")) {
            // Bloco de código
            const code = block.split("\n").slice(1, -1).join("\n");
            addText(code, textSize - 1, "normal", margin + 10);
            yPosition += lineHeight;
          } else if (block.match(/\[.*\]\(.*\)/)) {
            // Links
            const linkText = block.replace(/\[(.*?)\]\(.*?\)/g, "$1");
            addText(linkText, textSize, "normal");
          } else if (block.match(/\*\*.*\*\*/)) {
            // Negrito
            const boldText = block.replace(/\*\*(.*?)\*\*/g, "$1");
            addText(boldText, textSize, "bold");
          } else if (block.match(/_.*_/)) {
            // Itálico
            const italicText = block.replace(/_(.*?)_/g, "$1");
            addText(italicText, textSize, "italic");
          } else if (block.match(/`.*`/)) {
            // Código inline
            const codeText = block.replace(/`(.*?)`/g, "$1");
            addText(codeText, textSize - 1, "normal");
          } else {
            // Texto normal
            addText(block);
          }

          yPosition += lineHeight / 2;
        }
      };

      // Processar o conteúdo da mensagem
      processMarkdown(message.text);

      // Rodapé
      pdf.setFontSize(10);
      pdf.text(
        `Gerado em: ${new Date().toLocaleString()}`,
        pdf.internal.pageSize.getWidth() - margin,
        pdf.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );

      pdf.save(`${lessonTitle.replace(/[^a-z0-9]/gi, "_")}.pdf`);
      setPdfSalve(true);
      setTimeout(() => setPdfSalve(false), 2000);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Uma versão simplificada será criada.");

      // Fallback simples
      const mainFont = "times";
      const titleSize = 14;
      const textSize = 12;
      const margin = 20;
      const pdf = new jsPDF();
      pdf.setFont(mainFont);
      pdf.setFontSize(titleSize);
      pdf.text(lessonTitle, margin, margin);
      pdf.setFontSize(textSize);
      pdf.text(message.text, margin, margin + 10);
      pdf.save(`${lessonTitle}_simplificado.pdf`);
    }
  };

  return (
    <div
      ref={messageRef}
      className={`flex ${
        isBot ? "justify-start" : "justify-end"
      } animate-fadeIn relative mb-6`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`flex max-w-[90%] sm:max-w-[100%] ${
          isBot ? "flex-row" : "flex-row-reverse"
        }`}
      >
        <div className={`flex-shrink-0 ${isBot ? "mr-2" : "ml-2"} self-end`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isBot ? botAvatarClass : userAvatarClass
            }`}
          >
            {isBot ? (
              <Image
                src={logo2}
                alt="Logo"
                width={100}
                height={100}
                className={imageClass}
              />
            ) : (
              <User size={18} />
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div
            className={`px-4 py-3 rounded-2xl prose prose-sm shadow-sm ${
              isBot
                ? `${botBubbleClass} rounded-bl-none`
                : `${userBubbleClass} rounded-br-none`
            }`}
          >
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className={`underline ${
                      isBot
                        ? isDark
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-600 hover:text-gray-800"
                        : isDark
                        ? "text-blue-200 hover:text-white"
                        : "text-blue-700 hover:text-blue-900"
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                p: ({ node, ...props }) => (
                  <p {...props} className="mb-8" /> // Espaçamento de 2rem (32px) abaixo de cada parágrafo
                ),
                strong: ({ node, ...props }) => (
                  <strong {...props} className="font-semibold" />
                ),
                em: ({ node, ...props }) => (
                  <em {...props} className="italic" />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>

          <div className="flex justify-between items-center mt-1">
            <div
              className={`text-xs ${
                isBot
                  ? isDark
                    ? "text-gray-400 text-left"
                    : "text-gray-500 text-left"
                  : isDark
                  ? "text-blue-300 text-right"
                  : "text-blue-600 text-right"
              }`}
            >
              {formattedTime}
            </div>

            {/* Novos botões de ação no rodapé */}
            <div className={`flex gap-2 ${isBot ? "ml-2" : "mr-2"}`}>
              <button
                onClick={handleCopy}
                className={`p-1 rounded-full ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
                title="Copiar mensagem"
              >
                <Copy
                  size={14}
                  className={isDark ? "text-white" : "text-gray-700"}
                />
                {copied && (
                  <span className="absolute bottom-6 right-4 -translate-x-1/2 text-xs whitespace-nowrap">
                    Copiado!
                  </span>
                )}
              </button>
              <button
                onClick={() => handleGeneratePDF("Resumo")}
                className={`p-1 rounded-full ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
                title="Gerar PDF"
              >
                <FileText
                  size={14}
                  className={isDark ? "text-white" : "text-gray-700"}
                />
                {pdfSalve && (
                  <span className="absolute bottom-6 -right-4 -translate-x-1/2 text-xs whitespace-nowrap">
                    Pdf gerado!
                  </span>
                )}
              </button>
              <button
                onClick={handleSpeak}
                className={`p-1 rounded-full ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
                title={
                  isSpeaking
                    ? isPaused
                      ? "Retomar leitura"
                      : "Pausar leitura"
                    : "Ler em voz alta"
                }
              >
                {isSpeaking ? (
                  isPaused ? (
                    <Play size={14} className="text-yellow-500" />
                  ) : (
                    <Pause size={14} className="text-green-500 animate-pulse" />
                  )
                ) : (
                  <Volume2
                    size={14}
                    className={isDark ? "text-white" : "text-gray-700"}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
