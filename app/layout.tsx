"use client";

import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Suspense, useEffect } from "react";
import AnalyticsHandler from "@/components/AnalyticsHandler";
import { urlBase64ToUint8Array } from "@/utils/push";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    async function initPush() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Permissão de notificação negada");
          return;
        }

        // ⚠️ Registra o SW e aguarda ele estar *pronto*
        const swRegistration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        console.log("Service Worker pronto!");

        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });

        console.log("Inscrição realizada:", subscription);

        // Envia para o backend (Supabase ou API)
        await fetch("/api/notifications/subscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Erro ao configurar notificações push:", error);
      }
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      initPush();
    }
  }, []);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <title>IA - Lição da Escola Sabatina</title>
        <meta
          name="description"
          content="Assistente virtual para estudos da Lição da Escola Sabatina"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider>
            <Suspense>
              <AnalyticsHandler />
            </Suspense>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
