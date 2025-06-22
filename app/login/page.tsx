"use client";

import { FaGoogle } from "react-icons/fa6";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { createComponentClient } from "@/models/supabase";
import Image from "next/image";
import logo1 from "@/assets/Logo1.png";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase = createComponentClient();
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const router = useRouter();
  const [typeAuth, setTypeAuth] = useState<"login" | "register">("login");

  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

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
    setTimeout(() => {
      window.location.reload();
    }, 10);
  };

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setTimeout(() => {
        setError(null);
      }, 5000);
      //  console.error(error);
    } else {
      router.push("/");
    }
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message);
      setTimeout(() => {
        setError(null);
      }, 5000);
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeAuth === "register") {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  const handleLoginWithGoogle = async () => {
    // Para produção, use o URL do seu site
    // Para desenvolvimento, use o URL definido nas variáveis de ambiente ou fallback para localhost
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? "https://www.iasdlicao.cv/"
        : process.env.NEXT_PUBLIC_REDIRECT_URL || "http://localhost:3000/";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      setError(error.message);
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <div
      className={`flex flex-col space-y-8 ${
        resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-200"
      } items-center justify-center h-screen px-2`}
    >
      <button
        onClick={handleClick}
        className="cursor-pointer flex items-center justify-center w-20 h-20 bg-gray-50 border-b border-gray-200 rounded-full"
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
        <span>
          {typeAuth === "login"
            ? "Faça login para continuar"
            : "Crie uma conta para começar"}
        </span>

        <div className="flex items-center justify-around w-full mt-4">
          <button
            onClick={() => setTypeAuth("login")}
            className={`underline ${
              typeAuth === "login" ? "font-bold" : "opacity-50"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setTypeAuth("register")}
            className={`underline ${
              typeAuth === "register" ? "font-bold" : "opacity-50"
            }`}
          >
            Criar Conta
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 w-full mt-5"
        >
          {error && (
            <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
              {error}
            </div>
          )}
          {typeAuth === "register" && (
            <input
              type="text"
              name="name"
              placeholder="Nome completo"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-4 py-2 rounded border focus:outline-none"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-4 py-2 rounded border focus:outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Senha"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="px-4 py-2 rounded border focus:outline-none"
          />

          <button
            type="submit"
            className={`w-full font-semibold ${
              resolvedTheme === "dark"
                ? "bg-gray-100 hover:bg-gray-300 text-gray-800"
                : "bg-blue-400 hover:bg-blue-500 text-white"
            } rounded-lg px-4 py-2`}
          >
            {typeAuth === "login" ? "Entrar" : "Criar Conta"}
          </button>

          <button
            type="button"
            onClick={handleLoginWithGoogle}
            className={`flex items-center justify-center gap-4 border ${
              resolvedTheme === "dark"
                ? "text-white bg-gray-600 hover:bg-gray-700"
                : "text-gray-900 bg-gray-300 hover:bg-gray-400"
            } rounded-lg px-4 py-2`}
          >
            <FaGoogle className="text-xl" /> Continuar com o Google
          </button>
        </form>
      </div>
    </div>
  );
}
