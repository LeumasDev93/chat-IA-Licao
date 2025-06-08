"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeType =
  | "light"
  | "dark"
  | "ocean"
  | "sunset"
  | "forest"
  | "lavender"
  | "midnight"
  | "cosmic"
  | "cherry"
  | "emerald"
  | "system";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  systemTheme: "light" | "dark";
  effectiveTheme: Exclude<ThemeType, "system">;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Detectar tema do sistema
  useEffect(() => {
    const detectSystemTheme = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setSystemTheme(isDark ? "dark" : "light");
    };

    detectSystemTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Carregar tema salvo
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as ThemeType | null;
      if (
        savedTheme &&
        [
          "light",
          "dark",
          "ocean",
          "sunset",
          "forest",
          "lavender",
          "midnight",
          "cosmic",
          "cherry",
          "emerald",
          "system",
        ].includes(savedTheme)
      ) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.warn("Erro ao acessar localStorage:", error);
    }
  }, []);

  // Tema efetivo (resolve 'system' para o tema do sistema)
  const effectiveTheme: Exclude<ThemeType, "system"> =
    theme === "system" ? systemTheme : theme;

  // Aplicar tema ao documento HTML
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      setIsTransitioning(true);

      // Remover todas as classes de tema
      root.classList.remove(
        "light",
        "dark",
        "ocean",
        "sunset",
        "forest",
        "lavender",
        "midnight",
        "cosmic",
        "cherry",
        "emerald"
      );

      // Adicionar classe do tema atual
      root.classList.add(effectiveTheme);

      // Atualizar meta tag theme-color
      const themeColors = {
        light: "#ffffff",
        dark: "#0f172a",
        ocean: "#082f49",
        sunset: "#7c2d12",
        forest: "#14532d",
        lavender: "#581c87",
        midnight: "#1e1b4b",
        cosmic: "#111827",
        cherry: "#881337",
        emerald: "#064e3b",
      };

      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.setAttribute("name", "theme-color");
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute("content", themeColors[effectiveTheme]);

      setTimeout(() => setIsTransitioning(false), 500);
    };

    applyTheme();
  }, [effectiveTheme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch (error) {
      console.warn("Erro ao salvar no localStorage:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, systemTheme, effectiveTheme }}
    >
      <div
        className={`theme-transition ${
          isTransitioning ? "opacity-70" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
