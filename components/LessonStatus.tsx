"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface LessonStatusProps {
  className?: string;
}

interface LessonData {
  title: string;
  lastUpdated: string;
  expiresAt: string;
  lessonContent?: string; // Conteúdo real da lição para a IA usar
}

export default function LessonStatus({ className = "" }: LessonStatusProps) {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "updating"
  >("loading");
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkLessonStatus = async () => {
    try {
      setStatus("loading");
      const response = await fetch("/api/cron");
      const data = await response.json();

      if (response.ok) {
        setLessonData(data.lesson || data);
        setStatus("success");
      } else {
        setStatus("error");
      }
      setLastCheck(new Date());
    } catch (error) {
      console.error("Erro ao verificar status da lição:", error);
      setStatus("error");
      setLastCheck(new Date());
    }
  };

  const forceUpdate = async () => {
    try {
      setStatus("updating");
      const response = await fetch("/api/cron", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLessonData(data.lesson);
        setStatus("success");
      } else {
        setStatus("error");
      }
      setLastCheck(new Date());
    } catch (error) {
      console.error("Erro ao forçar atualização:", error);
      setStatus("error");
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkLessonStatus();
  }, []);

  const isExpired = lessonData
    ? new Date() > new Date(lessonData.expiresAt)
    : false;
  const timeUntilExpiry = lessonData
    ? new Date(lessonData.expiresAt).getTime() - new Date().getTime()
    : 0;
  const daysUntilExpiry = Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24));

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Status da Lição
        </h3>
        <button
          onClick={forceUpdate}
          disabled={status === "updating" || status === "loading"}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          title="Forçar atualização"
        >
          <RefreshCw
            className={`w-4 h-4 ${status === "updating" ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-2">
        {status === "loading" && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            Verificando status...
          </div>
        )}

        {status === "success" && lessonData && (
          <>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              Lição atualizada
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400">
              <div>Título: {lessonData.title}</div>
              <div>
                Última atualização:{" "}
                {new Date(lessonData.lastUpdated).toLocaleString("pt-BR")}
              </div>

              {isExpired ? (
                <div className="flex items-center text-red-600 dark:text-red-400 mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Expirada
                </div>
              ) : (
                <div className="flex items-center text-blue-600 dark:text-blue-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Válida por mais {daysUntilExpiry} dia
                  {daysUntilExpiry !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </>
        )}

        {status === "error" && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            Erro ao verificar status
          </div>
        )}

        {status === "updating" && (
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Atualizando lição...
          </div>
        )}

        {lastCheck && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Última verificação: {lastCheck.toLocaleString("pt-BR")}
          </div>
        )}
      </div>
    </div>
  );
}
