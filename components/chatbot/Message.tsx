/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { User, Bot, Copy, FileText } from "lucide-react";
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
  onActionClick?: (action: "copy" | "pdf") => void;
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
    onActionClick?.("copy");
  };

  const handleGeneratePDF = async () => {
    onActionClick?.("pdf");
    try {
      if (!messageRef.current) return;

      // 1. Criar um container temporário
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.width = "100%";
      container.style.maxWidth = "600px";
      container.style.padding = "20px";
      container.style.backgroundColor = isDark ? "#1f2937" : "#ffffff";
      container.style.color = isDark ? "#ffffff" : "#000000";

      // 2. Criar o conteúdo manualmente
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 100%;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; 
                background: ${
                  isBot
                    ? isDark
                      ? "#374151"
                      : "#e5e7eb"
                    : isDark
                    ? "#1d4ed8"
                    : "#bfdbfe"
                };
                display: flex; align-items: center; justify-content: center; margin-right: 10px;">
              ${isBot ? "🤖" : "👤"}
            </div>
            <strong>${isBot ? "Assistente" : "Você"}</strong>
          </div>
          <div style="margin-bottom: 10px; white-space: pre-wrap;">${
            message.text
          }</div>
          <div style="font-size: 0.8em; color: ${
            isDark ? "#9ca3af" : "#6b7280"
          };">
            ${formattedTime}
          </div>
        </div>
      `;

      document.body.appendChild(container);

      // 3. Converter para imagem
      const canvas = await html2canvas(container, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
      });

      document.body.removeChild(container);

      // 4. Criar PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });

      const imgProps = pdf.getImageProperties(canvas.toDataURL("image/png"));
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(canvas, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`mensagem-${message.id || Date.now()}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      // Fallback para método simples
      const pdf = new jsPDF();
      pdf.text(`Mensagem ${isBot ? "do Assistente" : "do Usuário"}`, 10, 10);
      pdf.text(`Enviada em: ${formattedTime}`, 10, 15);
      pdf.text(message.text, 10, 25);
      pdf.save(`mensagem-simples-${Date.now()}.pdf`);
    }
  };

  // Botões de ação reutilizáveis
  const ActionButtons = () => (
    <div
      className={`flex gap-2 justify-end mt-2 ${
        isBot ? "justify-start" : "justify-end"
      }`}
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
        <Copy size={16} className={isDark ? "text-white" : "text-gray-700"} />
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
  );

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
              </button>
              <button
                onClick={handleGeneratePDF}
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
