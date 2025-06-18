"use client";

import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import AnalyticsHandler from "@/components/AnalyticsHandler";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <PWAComponents />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

function PWAComponents() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('SW registrado com sucesso'))
                .catch(err => console.log('Erro ao registrar SW:', err));
            });
          }

          let deferredPrompt;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('PWA pode ser instalado');
          });
        `,
      }}
    />
  );
}
