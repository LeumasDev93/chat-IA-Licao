// hooks/useMobileMenuTheme.ts
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

type ThemeMode = "light" | "dark";

export function useMobileMenuTheme() {
  const { theme } = useTheme(); // "light" | "dark" | "system"
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>("light");
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Detecta tema resolvido
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const getSystemTheme = (): ThemeMode => (mediaQuery.matches ? "dark" : "light");

    const handleThemeChange = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      }
    };

    if (theme === "system") {
      setResolvedTheme(getSystemTheme());
      mediaQuery.addEventListener("change", handleThemeChange);
    } else if (theme === "light" || theme === "dark") {
      setResolvedTheme(theme);
    } else {
      setResolvedTheme("light"); // fallback to light if theme is not supported
    }

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [theme]);

  // Detecta mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };

    handleResize(); // inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { resolvedTheme, isMobile, isOpen, setIsOpen };
}
