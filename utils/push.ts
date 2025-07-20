// utils/push.ts

export async function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        return navigator.serviceWorker.register("/sw.js");
    } else {
        return Promise.reject(new Error("Service Worker não suportado"));
    }
}

export function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export async function subscribeUserToPush() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
    });

    // Envie essa subscription para seu backend (supabase) para salvar
    console.log("Push subscription:", subscription);

    // Exemplo: enviar para seu backend (implemente seu fetch)
    await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
    });

    return subscription;
}
