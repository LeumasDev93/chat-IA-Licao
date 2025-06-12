"use client";

import { handleAuth } from "@/app/actions/handle-auth";
import { FaGoogle } from "react-icons/fa6";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
export default function Login() {
  const { theme } = useTheme();
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

  return (
    <div
      className={`flex flex-col ${
        resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-200"
      } items-center justify-center h-screen px-2`}
    >
      <div
        className={`flex flex-col items-center justify-center text-center ${
          resolvedTheme === "dark"
            ? "text-white bg-gray-600"
            : "text-gray-900 bg-gray-300"
        } rounded-lg p-5 shadow-lg w-full sm:w-[400px]`}
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-4">
          Bem-Vindo ao Assistente IA para estudos da Lição da Escola Sabatina
        </h1>
        <span>Faça login para continuar</span>
        <form action={handleAuth}>
          <button
            type="submit"
            className={`flex items-center justify-center gap-4 border-1 ${
              resolvedTheme === "dark"
                ? "text-white bg-gray-600 hover:bg-gray-700"
                : "text-gray-900 bg-gray-300 hover:bg-gray-400"
            } rounded-lg mt-5 cursor-pointer px-4 py-2 `}
          >
            <FaGoogle className="text-xl" /> Continuar com o Google
          </button>
        </form>
      </div>
    </div>
  );
}
