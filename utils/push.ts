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
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}


export const subscribeUserToPush = async () => {
    try {
        const sw = await navigator.serviceWorker.ready;

        const subscription = await sw.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
        });

        await fetch("/api/notifications/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription.toJSON()),
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Erro ao inscrever para notificações:", error);
    }
};

