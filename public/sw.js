// Service worker antigo (workbox/next-pwa) descontinuado.
// Este stub se auto-remove e limpa os caches obsoletos que causavam
// erros "failed to fetch script" e conteúdo desatualizado.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        // ignore
      }
      await self.registration.unregister();
      const clientsList = await self.clients.matchAll({ type: "window" });
      clientsList.forEach((c) => c.navigate(c.url));
    })()
  );
});
