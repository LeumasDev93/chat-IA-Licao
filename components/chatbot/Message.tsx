/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { User, Copy, FileText, Volume2, Play, Pause, Check, Download, Maximize2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MessageType } from "@/types";
import Image from "next/image";
import logo2 from "@/assets/Logo2.png";
import { jsPDF } from "jspdf";
import { useSupabaseUser } from "@/hooks/useComponentClient";

interface MessageProps {
  message: MessageType & { id?: string };
  isLastMessage?: boolean;
  onActionClick?: (action: "copy" | "pdf" | "speak") => void;
}

const Message: React.FC<MessageProps> = ({ message, onActionClick }) => {
  const [copied, setCopied] = useState(false);
  const [pdfSalve, setPdfSalve] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const user = useSupabaseUser();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const prepareForSpeech = (text: string) => {
    let cleanText = text
      .replace(/#+\s*/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/~~(.*?)~~/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/<\/?[^>]+(>|$)/g, "");

    cleanText = cleanText
      .replace(/([.!?:;])\s*/g, "$1\n")
      .replace(/(\n)+/g, "\n\n")
      .replace(/\s+/g, " ")
      .replace(/\*/g, "")
      .trim();

    return cleanText;
  };

  const handleSpeak = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    const preparedText = prepareForSpeech(message.text);
    if (!preparedText.trim()) return;

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

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Lightbox: tecla Esc fecha e trava o scroll do fundo
  useEffect(() => {
    if (!zoomSrc) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomSrc(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomSrc]);

  const isBot = message.sender === "bot";

  // Mensagem que é SÓ uma imagem (infográfico): renderiza sem "bolha".
  const singleImg = message.text?.trim().match(/^!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)$/);
  const imageUrl = message.image || singleImg?.[1] || null;
  const extraText = singleImg ? "" : message.text;

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopy = () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onActionClick?.("copy");
    };
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(message.text).then(done).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    } catch {
      fallbackCopy();
    }

    function fallbackCopy() {
      const textarea = document.createElement("textarea");
      textarea.value = message.text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        console.error("Falha ao copiar texto", err);
      }
      document.body.removeChild(textarea);
    }
  };


  const handleGeneratePDF = async (lessonTitle: string) => {
    onActionClick?.("pdf");
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm" });

      const mainFont = "times";
      const titleSize = 14;
      const textSize = 12;
      const margin = 20;
      const lineHeight = 6;
      let yPosition = margin;

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

      addText(lessonTitle, titleSize, "bold");
      yPosition += lineHeight;
      addText(
        `Data: ${new Date(message.timestamp).toLocaleDateString()} - Hora: ${formattedTime}`
      );
      yPosition += lineHeight * 1.5;

      const processMarkdown = (content: string) => {
        const blocks = content.split(/\n\s*\n/);
        for (const block of blocks) {
          if (block.startsWith("# ")) {
            addText(block.substring(2), titleSize, "bold");
          } else if (block.startsWith("## ")) {
            addText(block.substring(3), textSize, "bold");
          } else if (block.startsWith("### ")) {
            addText(block.substring(4), textSize, "bolditalic");
          } else if (block.startsWith("* ") || block.startsWith("- ")) {
            const items = block.split(/\n[*-] /);
            for (const item of items.filter((i) => i)) {
              addText(`• ${item.replace(/^[*-] /, "").trim()}`, textSize, "normal", margin + 5);
            }
          } else if (block.startsWith("> ")) {
            addText(block.substring(2), textSize, "italic", margin + 5);
          } else if (block.match(/\*\*.*\*\*/)) {
            addText(block.replace(/\*\*(.*?)\*\*/g, "$1"), textSize, "bold");
          } else {
            addText(block.replace(/[*_`#]/g, ""));
          }
          yPosition += lineHeight / 2;
        }
      };

      processMarkdown(message.text);

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
      const pdf = new jsPDF();
      pdf.setFont("times");
      pdf.setFontSize(14);
      pdf.text(lessonTitle, 20, 20);
      pdf.setFontSize(12);
      pdf.text(pdf.splitTextToSize(message.text, 170), 20, 32);
      pdf.save(`${lessonTitle}_simplificado.pdf`);
    }
  };

  /* ----------------------------- USER ----------------------------- */
  if (!isBot) {
    return (
      <div className="flex animate-slideUp justify-end gap-2.5">
        <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-brand px-4 py-2.5 text-[0.95rem] leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          <div className="mt-1 text-right text-[10px] text-white/70">{formattedTime}</div>
        </div>
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 ring-1 ring-border">
          {user?.user?.user_metadata?.avatar_url ? (
            <Image
              src={user.user.user_metadata.avatar_url}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={16} className="text-muted-foreground" />
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------ BOT ----------------------------- */
  const ActionButton = ({
    onClick,
    title,
    active,
    children,
  }: {
    onClick: () => void;
    title: string;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors
        hover:border-border hover:bg-accent hover:text-foreground
        ${active ? "border-border bg-accent text-primary" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="group/msg flex animate-slideUp gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand ring-1 ring-border">
        <Image src={logo2} alt="" width={20} height={20} className="h-4 w-4 object-contain brightness-0 invert" />
      </div>

      <div className="min-w-0 flex-1">
        {imageUrl ? (
          <button
            type="button"
            onClick={() => setZoomSrc(imageUrl)}
            className="group/img relative block w-fit max-w-full cursor-zoom-in overflow-hidden rounded-xl"
            aria-label="Ampliar imagem"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={extraText || "Imagem gerada pela IA"}
              loading="lazy"
              className="block max-h-[360px] w-auto max-w-[min(78vw,320px)] object-contain sm:max-h-[420px] sm:max-w-[360px]"
            />
            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/img:opacity-100 max-sm:opacity-100">
              <Maximize2 size={13} />
            </span>
          </button>
        ) : (
          <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3.5 shadow-sm sm:px-5">
            <div className="prose-chat">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                  img: ({ node, src }) =>
                    src ? (
                      <button
                        type="button"
                        onClick={() => setZoomSrc(String(src))}
                        className="my-3 block w-fit max-w-full cursor-zoom-in overflow-hidden rounded-xl"
                        aria-label="Ampliar imagem"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={String(src)}
                          alt=""
                          loading="lazy"
                          className="block max-h-[360px] w-auto max-w-[min(78vw,320px)] object-contain sm:max-h-[420px] sm:max-w-[360px]"
                        />
                      </button>
                    ) : null,
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-1 pl-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/msg:opacity-100 max-sm:opacity-100">
          {imageUrl ? (
            <ActionButton onClick={() => setZoomSrc(imageUrl)} title="Ampliar">
              <Maximize2 size={14} />
            </ActionButton>
          ) : (
            <>
              <ActionButton onClick={handleCopy} title="Copiar" active={copied}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </ActionButton>
              <ActionButton
                onClick={() => handleGeneratePDF("Resumo da Licao")}
                title="Baixar PDF"
                active={pdfSalve}
              >
                <FileText size={14} />
              </ActionButton>
              <ActionButton
                onClick={handleSpeak}
                title={isSpeaking ? (isPaused ? "Retomar" : "Pausar") : "Ouvir"}
                active={isSpeaking}
              >
                {isSpeaking ? (
                  isPaused ? <Play size={14} /> : <Pause size={14} />
                ) : (
                  <Volume2 size={14} />
                )}
              </ActionButton>
            </>
          )}
          <span className="ml-1 text-[10px] text-muted-foreground">{formattedTime}</span>
        </div>
      </div>

      {zoomSrc && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 top-16 z-[200] flex items-center justify-center overflow-auto bg-black/95 p-3 animate-fadeIn sm:p-5 lg:left-48 lg:top-[46px] xl:left-64"
            onClick={() => setZoomSrc(null)}
          >
            <button
              onClick={() => setZoomSrc(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            <a
              href={zoomSrc}
              download={`infografico-${Date.now()}.png`}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-3 top-3 z-10 flex h-9 items-center gap-2 rounded-full bg-white/15 px-3.5 text-sm text-white backdrop-blur-sm hover:bg-white/25"
            >
              <Download size={15} /> Baixar
            </a>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomSrc}
              alt=""
              className="m-auto max-w-full rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default Message;
