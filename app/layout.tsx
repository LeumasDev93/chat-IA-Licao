"use client";

import { Inter, Fraunces } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Suspense, useEffect } from "react";
import AnalyticsHandler from "@/components/AnalyticsHandler";
import { urlBase64ToUint8Array } from "@/utils/push";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    async function initPush() {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;

      try {
        // Service worker que trata os eventos `push` e `notificationclick`.
        await navigator.serviceWorker.register("/sw-notifications.js");
        const registration = await navigator.serviceWorker.ready;

        if (Notification.permission === "denied") return;
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }

        const existing = await registration.pushManager.getSubscription();
        const subscription =
          existing ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          }));

        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });
      } catch {
        // Silencioso: push é um recurso opcional.
      }
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      initPush();
    }
  }, []);

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
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
            <LanguageProvider>
              <Suspense>
                <AnalyticsHandler />
              </Suspense>
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
