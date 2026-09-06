"use client";

import React from "react";
import LessonStatus from "./LessonStatus";

export default function LessonStatusExample() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Chat IA - Lições da Escola Sabatina
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema inteligente para estudo das lições
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal - Chat */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Chat com IA
                </h2>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-[400px]">
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Interface do chat seria integrada aqui
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar - Status e Controles */}
            <div className="space-y-6">
              {/* Status da Lição */}
              <LessonStatus />

              {/* Informações Adicionais */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Informações do Sistema
                </h3>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Atualização automática:</span>
                    <span className="text-green-600 dark:text-green-400">
                      Ativa
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frequência:</span>
                    <span>Sábados às 12:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache válido:</span>
                    <span>7 dias</span>
                  </div>
                </div>
              </div>

              {/* Controles Rápidos */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Controles Rápidos
                </h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md transition-colors">
                    Forçar Atualização
                  </button>
                  <button className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-md transition-colors">
                    Ver Logs
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Sistema de Lições Automático - Compatível com Vercel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
