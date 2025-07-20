export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
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

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications não são suportadas neste navegador');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw-notifications.js');
      console.log('Service Worker registrado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Este navegador não suporta notificações');
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  async subscribeToPush(): Promise<PushSubscriptionData | null> {
    if (!this.swRegistration) {
      throw new Error('Service Worker não está registrado');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permissão para notificações negada');
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      // Salvar subscription no servidor
      await this.saveSubscriptionToServer(subscriptionData);

      return subscriptionData;
    } catch (error) {
      console.error('Erro ao se inscrever para push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      return false;
    }
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker não está registrado');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permissão para notificações negada');
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };

    await this.swRegistration.showNotification(payload.title, options);
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
              auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
            }
          }
        };
      }
      return { isSubscribed: false, subscription: null };
    } catch (error) {
      console.error('Erro ao verificar status da inscrição:', error);
      return { isSubscribed: false, subscription: null };
    }
  }

  private async saveSubscriptionToServer(subscription: PushSubscriptionData): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
        credentials: 'include', // Importante para incluir cookies de sessão
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar subscription no servidor:', error);
      throw error; // Re-throw para que o erro seja tratado no nível superior
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para incluir cookies de sessão
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao remover subscription do servidor:', error);
      throw error;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

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