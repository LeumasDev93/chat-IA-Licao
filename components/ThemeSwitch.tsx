/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeType } from "@/contexts/ThemeContext";

const themes = [
  {
    id: "system" as const,
    name: "Sistema",
    icon: "🖥️",
  },
  {
    id: "light" as const,
    name: "Claro",
    icon: "☀️",
  },
  {
    id: "dark" as const,
    name: "Escuro",
    icon: "🌙",
  },
];

interface ThemeSwitchProps {
  compact?: boolean;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  compact = false,
}) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  // Fechar dropdown ao clicar fora ou pressionar Escape
  useEffect(() => {
    const handleInteraction = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Posicionamento inteligente do dropdown
  const getDropdownStyle = (): React.CSSProperties => {
    if (!buttonRef.current) return {};

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceRight = window.innerWidth - buttonRect.right;

    return {
      position: "absolute",
      top: spaceBelow > 150 ? "100%" : undefined,
      bottom: spaceBelow <= 150 ? "100%" : undefined,
      left: spaceRight > 200 ? "0" : undefined,
      right: spaceRight <= 200 ? "0" : undefined,
      minWidth: "200px",
    };
  };

  if (compact) {
    return (
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-surface-hover"
        aria-label="Alterar tema"
      >
        <span className="text-lg">{currentTheme.icon}</span>
        {isOpen && (
          <div
            ref={dropdownRef}
            className="fixed z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
            style={getDropdownStyle()}
          >
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => {
                  setTheme(themeOption.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="text-lg">{themeOption.icon}</span>
                <span>{themeOption.name}</span>
              </button>
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Alterar tema"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentTheme.icon}</span>
        <span className="text-sm font-medium">{currentTheme.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          style={getDropdownStyle()}
        >
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => {
                setTheme(themeOption.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="text-lg">{themeOption.icon}</span>
              <span>{themeOption.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
