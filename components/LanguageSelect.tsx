"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import Flag from "./Flag";

const LANGS: { code: Language; short: string; nameKey: string }[] = [
  { code: "pt", short: "PT", nameKey: "portuguese" },
  { code: "en", short: "EN", nameKey: "english" },
  { code: "es", short: "ES", nameKey: "spanish" },
  { code: "fr", short: "FR", nameKey: "french" },
  { code: "krioulu", short: "KR", nameKey: "krioulu" },
];

interface Props {
  /** "bar" = compacto (header mobile) · "block" = largura total (sidebar) */
  variant?: "bar" | "block";
  className?: string;
}

export default function LanguageSelect({ variant = "bar", className = "" }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGS.find((l) => l.code === language) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-xl border border-border bg-surface text-sm font-medium text-foreground
          shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50
          ${variant === "block" ? "w-full justify-between px-3 py-2" : "px-2.5 py-1.5"}`}
      >
        <span className="flex items-center gap-2">
          <Flag code={current.code} size={20} />
          <span className={variant === "block" ? "" : "hidden sm:inline"}>
            {variant === "block" ? t(current.nameKey) : current.short}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute z-50 mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-xl animate-fadeIn
            ${variant === "block" ? "left-0 right-0" : "right-0"}`}
        >
          {LANGS.map((l) => {
            const active = l.code === language;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLanguage(l.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors
                    ${active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                >
                  <Flag code={l.code} size={20} />
                  <span className="flex-1 text-left">{t(l.nameKey)}</span>
                  {active && <Check size={15} className="text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
