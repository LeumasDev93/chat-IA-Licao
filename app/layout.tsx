"use client";

import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics } from "@/lib/firebase-client";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAnalytics = async () => {
      const analytics = await initAnalytics();
      if (!analytics) return;

      const url = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

      import("firebase/analytics").then(({ logEvent }) => {
        logEvent(analytics, "page_view", {
          page_path: url,
          page_title: document.title,
          page_location: window.location.href,
        });
      });
    };

    handleAnalytics();
  }, [pathname, searchParams]);

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

        {/* Favicon e ícones */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Splash screens */}
        {[...Array(8)].map((_, i) => (
          <link
            key={i}
            rel="apple-touch-startup-image"
            href={`/splash/splash-${i + 1}.png`}
            media={`(device-width: ${320 + i * 50}px) and (device-height: ${
              568 + i * 50
            }px)`}
          />
        ))}
      </head>

      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider>
            <Suspense> {children}</Suspense>
            <PWAComponents />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
// Componente separado para funcionalidades PWA
function PWAComponents() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                  console.log('ServiceWorker registration successful');
                })
                .catch(err => {
                  console.log('ServiceWorker registration failed: ', err);
                });
            });
          }
          
          let deferredPrompt;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('PWA pode ser instalado');
            // Aqui você pode mostrar um botão de instalação
          });
        `,
      }}
    />
  );
}
