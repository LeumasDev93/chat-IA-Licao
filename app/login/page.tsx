"use client";

import { FaGoogle } from "react-icons/fa6";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { createComponentClient } from "@/models/supabase";
import Image from "next/image";
import logo1 from "@/assets/Logo1.png";
import { useRouter } from "next/navigation";
import { AlertCircle, Mail, User, Lock } from "lucide-react";

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
    const SITE_URL = "https://www.iasdlicao.cv"; // SEM barra no final

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${SITE_URL}/auth/callback`,
        queryParams: {
          prompt: "select_account", // Força a seleção de conta
        },
      },
    });

    if (error) {
      console.error("Erro no login:", error.message);
      setError(error.message);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 ${
        resolvedTheme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      {/* Card Principal */}
      <div
        className={`relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-700 border border-purple-500/20"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Cabeçalho com gradiente */}
        <div
          className={`w-full py-6 ${
            resolvedTheme === "dark"
              ? "bg-gradient-to-r from-purple-600 to-blue-600"
              : "bg-gradient-to-r from-purple-500 to-blue-500"
          } text-center`}
        >
          <div className="flex justify-center mb-4">
            <div
              onClick={handleClick}
              className={`p-3 rounded-full cursor-pointer ${
                resolvedTheme === "dark" ? "bg-gray-800/30" : "bg-white/20"
              } backdrop-blur-sm`}
            >
              <Image
                src={logo1}
                alt="Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Bem-Vindo(a) de volta ao
            <span className="block">Assistente IA</span>
          </h1>
          <p className="text-white/90 mt-1">
            {typeAuth === "login"
              ? "Faça login para continuar"
              : "Crie sua conta gratuitamente"}
          </p>
        </div>

        {/* Tabs Login/Registro */}
        <div className="flex border-b">
          <button
            onClick={() => setTypeAuth("login")}
            className={`flex-1 py-4 font-medium transition-colors ${
              typeAuth === "login"
                ? resolvedTheme === "dark"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-purple-600 border-b-2 border-purple-600"
                : resolvedTheme === "dark"
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setTypeAuth("register")}
            className={`flex-1 py-4 font-medium transition-colors ${
              typeAuth === "register"
                ? resolvedTheme === "dark"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-purple-600 border-b-2 border-purple-600"
                : resolvedTheme === "dark"
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div
              className={`p-3 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-red-900/50 text-red-200"
                  : "bg-red-100 text-red-800"
              } flex items-center gap-2`}
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {typeAuth === "register" && (
            <div className="relative">
              <input
                type="text"
                name="name"
                placeholder="Nome completo"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 focus:ring-purple-500"
                    : "bg-white border-gray-300 focus:ring-blue-500"
                }`}
              />
              <User className="absolute right-3 top-3.5 text-gray-400" />
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                resolvedTheme === "dark"
                  ? "bg-gray-700 border-gray-600 focus:ring-purple-500"
                  : "bg-white border-gray-300 focus:ring-blue-500"
              }`}
            />
            <Mail className="absolute right-3 top-3.5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Senha"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                resolvedTheme === "dark"
                  ? "bg-gray-700 border-gray-600 focus:ring-purple-500"
                  : "bg-white border-gray-300 focus:ring-blue-500"
              }`}
            />
            <Lock className="absolute right-3 top-3.5 text-gray-400" />
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg ${
              resolvedTheme === "dark"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
                : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white"
            }`}
          >
            {typeAuth === "login" ? "Entrar" : "Criar Conta"}
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-300/50"></div>
            <span
              className={`flex-shrink mx-4 ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              ou
            </span>
            <div className="flex-grow border-t border-gray-300/50"></div>
          </div>

          <button
            type="button"
            onClick={handleLoginWithGoogle}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium border transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <FaGoogle
              className={`text-xl ${
                resolvedTheme === "dark" ? "text-red-400" : "text-red-500"
              }`}
            />
            Continuar com Google
          </button>
        </form>

        {/* Rodapé */}
        <div
          className={`px-6 py-4 text-center ${
            resolvedTheme === "dark" ? "bg-gray-800/50" : "bg-gray-50"
          }`}
        >
          <p
            className={`text-sm ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {typeAuth === "login"
              ? "Não tem uma conta? "
              : "Já tem uma conta? "}
            <button
              onClick={() =>
                setTypeAuth(typeAuth === "login" ? "register" : "login")
              }
              className={`font-medium ${
                resolvedTheme === "dark"
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-purple-600 hover:text-purple-500"
              }`}
            >
              {typeAuth === "login" ? "Crie agora" : "Faça login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
