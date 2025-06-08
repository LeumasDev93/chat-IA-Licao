/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeType } from "@/contexts/ThemeContext";

const themes = [
  {
    id: "system" as const,
    name: "Sistema",
    icon: "🖥️",
    bgColor: "bg-gray-500",
    hoverBgColor: "bg-gray-600",
    textColor: "text-white",
    borderColor: "border-gray-600",
  },
  {
    id: "light" as const,
    name: "Claro",
    icon: "☀️",
    bgColor: "bg-white",
    hoverBgColor: "bg-gray-100",
    textColor: "text-gray-800",
    borderColor: "border-gray-300",
  },
  {
    id: "dark" as const,
    name: "Escuro",
    icon: "🌙",
    bgColor: "bg-gray-800",
    hoverBgColor: "bg-gray-700",
    textColor: "text-white",
    borderColor: "border-gray-700",
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

  // Classes dinâmicas baseadas no tema atual
  const buttonClass = `flex items-center gap-2 px-4 py-2 rounded-lg ${currentTheme.bgColor} ${currentTheme.textColor} hover:${currentTheme.hoverBgColor} border ${currentTheme.borderColor} transition-colors`;

  const dropdownClass = `absolute z-50 mt-2 w-full ${currentTheme.bgColor} ${currentTheme.textColor} border ${currentTheme.borderColor} rounded-lg shadow-lg`;

  const dropdownItemClass = `w-full text-left px-4 py-2 flex items-center gap-3 hover:${currentTheme.hoverBgColor} ${currentTheme.textColor}`;

  if (compact) {
    return (
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full ${currentTheme.bgColor} ${currentTheme.textColor} hover:${currentTheme.hoverBgColor} border ${currentTheme.borderColor}`}
        aria-label="Alterar tema"
      >
        <span className="text-lg">{currentTheme.icon}</span>
        {isOpen && (
          <div
            ref={dropdownRef}
            className={dropdownClass}
            style={getDropdownStyle()}
          >
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => {
                  setTheme(themeOption.id);
                  setIsOpen(false);
                }}
                className={dropdownItemClass}
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
        className={buttonClass}
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
        <div className={dropdownClass} style={getDropdownStyle()}>
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => {
                setTheme(themeOption.id);
                setIsOpen(false);
              }}
              className={dropdownItemClass}
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
