/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { User, Bot, Copy, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MessageType } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import logo2 from "@/assets/Logo2.png";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

interface MessageProps {
  message: MessageType & { id?: string };
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

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
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneratePDF = async () => {
    try {
      if (!messageRef.current) return;

      // Criar PDF diretamente com texto (abordagem mais confiável)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });

      // Configurações iniciais
      pdf.setFont("helvetica");
      pdf.setFontSize(12);
      pdf.setTextColor(isDark ? 255 : 0);

      // Cabeçalho
      pdf.text(`Mensagem ${isBot ? "do Assistente" : "do Usuário"}`, 10, 10);
      pdf.text(`Enviada em: ${formattedTime}`, 10, 15);

      // Conteúdo formatado
      const formattedText = message.text
        .replace(/\\n/g, "\n") // Preserva quebras de linha
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove negrito
        .replace(/\*(.*?)\*/g, "$1"); // Remove itálico

      // Dividir texto em linhas
      const lines = pdf.splitTextToSize(formattedText, 180);

      // Adicionar texto ao PDF
      pdf.text(lines, 10, 25);

      // Adicionar borda e estilo
      pdf.setDrawColor(isDark ? 255 : 0);
      pdf.rect(5, 5, 200, 280);

      // Salvar PDF
      pdf.save(`mensagem-${message.id || Date.now()}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
    }
  };

  return (
    <div
      ref={messageRef}
      className={`flex ${
        isBot ? "justify-start" : "justify-end"
      } animate-fadeIn relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Botões de ação */}
      {showActions && (
        <div
          className={`absolute flex gap-2 ${
            isBot ? "left-0 -translate-x-full" : "right-0 translate-x-full"
          } top-0 p-2`}
        >
          <button
            onClick={handleCopy}
            className={`p-2 rounded-full ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            } transition-colors`}
            title="Copiar mensagem"
          >
            <Copy
              size={16}
              className={isDark ? "text-white" : "text-gray-700"}
            />
            {copied && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                Copiado!
              </span>
            )}
          </button>
          <button
            onClick={handleGeneratePDF}
            className={`p-2 rounded-full ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            } transition-colors`}
            title="Gerar PDF"
          >
            <FileText
              size={16}
              className={isDark ? "text-white" : "text-gray-700"}
            />
          </button>
        </div>
      )}

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

        <div>
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
                p: ({ node, ...props }) => <p {...props} className="my-1" />,
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
          <div
            className={`text-xs mt-1 ${
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
        </div>
      </div>
    </div>
  );
};

export default Message;
