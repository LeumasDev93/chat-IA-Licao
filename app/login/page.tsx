"use client";

import { handleAuth } from "@/app/actions/handle-auth";
import { FaGoogle } from "react-icons/fa6";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

import Image from "next/image";
import logo1 from "@/assets/Logo1.png";
import { useRouter } from "next/navigation";

export default function Login() {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const router = useRouter();

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();

    // Aguarda brevemente antes de forçar o reload
    setTimeout(() => {
      window.location.reload();
    }, 10);
  };

  return (
    <div
      className={`flex flex-col space-y-8 ${
        resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-200"
      } items-center justify-center h-screen px-2`}
    >
      <button
        onClick={handleClick}
        className=" cursor-pointer flex items-center justify-center w-20 h-20  bg-gray-50 border-b border-gray-200 rounded-full"
      >
        <Image
          src={logo1}
          alt="Logo"
          width={200}
          height={200}
          className="w-full h-full"
        />
      </button>
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
