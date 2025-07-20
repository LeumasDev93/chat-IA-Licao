"use client";

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X, Settings } from 'lucide-react';
import { notificationManager, NotificationPayload } from '@/lib/notifications';
import { useTheme } from '@/contexts/ThemeContext';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState({
    newMessages: true,
    lessonUpdates: true,
    reminders: false,
    marketing: false
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const getSystemTheme = () => (mediaQuery.matches ? "dark" : "light");

    if (theme === "system") {
      setResolvedTheme(getSystemTheme());
      mediaQuery.addEventListener("change", () => setResolvedTheme(getSystemTheme()));
    } else {
      setResolvedTheme(theme === "dark" ? "dark" : "light");
    }

    return () => mediaQuery.removeEventListener("change", () => {});
  }, [theme]);

  useEffect(() => {
    if (isOpen) {
      checkNotificationStatus();
    }
  }, [isOpen]);

  const checkNotificationStatus = async () => {
    setIsLoading(true);
    try {
      await notificationManager.initialize();
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      const status = await notificationManager.getSubscriptionStatus();
      setIsSubscribed(status.isSubscribed);
    } catch (error) {
      console.error('Erro ao verificar status das notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const subscription = await notificationManager.subscribeToPush();
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        
        // Mostrar notificação de boas-vindas
        await notificationManager.showNotification({
          title: 'Notificações Ativadas!',
          body: 'Você receberá notificações sobre novas mensagens e atualizações.',
          tag: 'welcome'
        });
      }
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      alert('Erro ao ativar notificações. Verifique as permissões do navegador.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await notificationManager.unsubscribeFromPush();
      if (success) {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Erro ao desativar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationManager.showNotification({
        title: 'Notificação de Teste',
        body: 'Esta é uma notificação de teste do Assistente IA!',
        tag: 'test',
        requireInteraction: true
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
    }
  };

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  if (!isOpen) return null;

  const isDark = resolvedTheme === 'dark';
  const bgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${bgClass} rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6" />
              <h3 className={`text-lg font-semibold ${textClass}`}>
                Configurações de Notificação
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${textClass}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status das Notificações */}
          <div className={`p-4 rounded-lg border ${borderClass} mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <Bell className="w-5 h-5 text-green-500" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <span className={`font-medium ${textClass}`}>
                  Status: {isSubscribed ? 'Ativadas' : 'Desativadas'}
                </span>
              </div>
              
              {permission !== 'granted' && (
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                  Permissão necessária
                </span>
              )}
            </div>

            <div className="space-y-2">
              {!isSubscribed ? (
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Ativando...' : 'Ativar Notificações'}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleTestNotification}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
                  >
                    Testar Notificação
                  </button>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={isLoading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? 'Desativando...' : 'Desativar Notificações'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Configurações Detalhadas */}
          {isSubscribed && (
            <div className="space-y-4">
              <h4 className={`font-medium ${textClass} mb-3`}>
                Tipos de Notificação
              </h4>

              {Object.entries({
                newMessages: 'Novas mensagens do chat',
                lessonUpdates: 'Atualizações da lição',
                reminders: 'Lembretes de estudo',
                marketing: 'Novidades e promoções'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className={`${textClass}`}>{label}</span>
                  <button
                    onClick={() => handleSettingChange(key as keyof typeof settings)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings[key as keyof typeof settings]
                        ? 'bg-blue-500'
                        : isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Informações sobre Permissões */}
          {permission === 'denied' && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                As notificações foram bloqueadas. Para ativá-las, você precisa:
              </p>
              <ol className="text-sm text-red-700 dark:text-red-300 mt-2 ml-4 list-decimal">
                <li>Clicar no ícone de cadeado na barra de endereços</li>
                <li>Permitir notificações para este site</li>
                <li>Recarregar a página</li>
              </ol>
            </div>
          )}

          {/* Informações sobre o Navegador */}
          {!('Notification' in window) && (
            <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Seu navegador não suporta notificações push. 
                Considere usar um navegador mais recente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}