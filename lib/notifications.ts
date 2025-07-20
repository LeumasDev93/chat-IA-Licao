/* eslint-disable @typescript-eslint/no-explicit-any */

export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
    requireInteraction?: boolean;
    silent?: boolean;
}

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

class NotificationManager {
    private static instance: NotificationManager;
    private swRegistration: ServiceWorkerRegistration | null = null;

    private constructor() { }

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    async initialize(): Promise<boolean> {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return false;
        }

        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw-notifications.js');
            return true;
        } catch {
            return false;
        }
    }

    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            return 'denied';
        }

        let permission = Notification.permission;

        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        return permission;
    }

    async subscribeToPush(): Promise<PushSubscriptionData | null> {
        if (!this.swRegistration) return null;

        const permission = await this.requestPermission();
        if (permission !== 'granted') return null;

        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
                ),
            });

            const subscriptionData: PushSubscriptionData = {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
                    auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
                },
            };

            await this.saveSubscriptionToServer(subscriptionData);
            return subscriptionData;
        } catch {
            return null;
        }
    }

    async unsubscribeFromPush(): Promise<boolean> {
        if (!this.swRegistration) return false;

        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                await this.removeSubscriptionFromServer();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    async showNotification(payload: NotificationPayload): Promise<void> {
        if (!this.swRegistration) return;

        const permission = await this.requestPermission();
        if (permission !== 'granted') return;

        const options: NotificationOptions = {
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/icon-192x192.png',
            tag: payload.tag,
            data: payload.data,
            requireInteraction: payload.requireInteraction || false,
            silent: payload.silent || false,
        };

        try {
            await this.swRegistration.showNotification(payload.title, options);
        } catch { }
    }

    async getSubscriptionStatus(): Promise<{
        isSubscribed: boolean;
        subscription: PushSubscriptionData | null;
    }> {
        if (!this.swRegistration) {
            return { isSubscribed: false, subscription: null };
        }

        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                return {
                    isSubscribed: true,
                    subscription: {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
                            auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
                        },
                    },
                };
            }
            return { isSubscribed: false, subscription: null };
        } catch {
            return { isSubscribed: false, subscription: null };
        }
    }

    private async saveSubscriptionToServer(subscription: PushSubscriptionData): Promise<void> {
        try {
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription),
            });
        } catch { }
    }

    private async removeSubscriptionFromServer(): Promise<void> {
        try {
            await fetch('/api/notifications/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch { }
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}

export const notificationManager = NotificationManager.getInstance();
