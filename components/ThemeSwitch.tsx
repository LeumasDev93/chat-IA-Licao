"use client";

import React, { useEffect, useRef, useState } from "react";
import { Monitor, Sun, Moon, Check, ChevronDown } from "lucide-react";
import { useTheme, ThemeType } from "@/contexts/ThemeContext";

const OPTIONS: { id: ThemeType; name: string; icon: React.ReactNode }[] = [
  { id: "system", name: "Sistema", icon: <Monitor size={16} /> },
  { id: "light", name: "Claro", icon: <Sun size={16} /> },
  { id: "dark", name: "Escuro", icon: <Moon size={16} /> },
];

interface ThemeSwitchProps {
  /** true = só ícone (barras compactas) · false = ícone + rótulo */
  compact?: boolean;
  className?: string;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ compact = false, className = "" }) => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = OPTIONS.find((o) => o.id === theme) ?? OPTIONS[0];

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
        aria-label="Mudar tema"
        title="Tema"
        className={`flex items-center gap-2 rounded-xl border border-border bg-surface text-sm font-medium text-foreground
          shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50
          ${compact ? "h-9 w-9 justify-center" : "px-3 py-2"}`}
      >
        {current.icon}
        {!compact && (
          <>
            <span>{current.name}</span>
            <ChevronDown
              size={15}
              className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[9.5rem] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-xl animate-fadeIn"
        >
          {OPTIONS.map((o) => {
            const active = o.id === theme;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setTheme(o.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors
                    ${active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                >
                  {o.icon}
                  <span className="flex-1 text-left">{o.name}</span>
                  {active && <Check size={15} className="text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ThemeSwitch;
