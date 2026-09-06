/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { notificationManager, NotificationPayload } from '@/lib/notifications';
import { useState, useEffect, useCallback } from 'react';

export interface NotificationState {
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    isLoading: boolean;
    error: string | null;
}

export function useNotifications() {
    const [state, setState] = useState<NotificationState>({
        isSupported: false,
        permission: 'default',
        isSubscribed: false,
        isLoading: true,
        error: null
    });

    const updateState = useCallback((updates: Partial<NotificationState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const initialize = useCallback(async () => {
        updateState({ isLoading: true, error: null });

        try {
            const isSupported = typeof window !== 'undefined' &&
                'Notification' in window &&
                'serviceWorker' in navigator;

            if (!isSupported) {
                updateState({
                    isSupported: false,
                    isLoading: false,
                    //error: 'Notificações não são suportadas neste navegador'
                });
                return;
            }

            await notificationManager.initialize();

            const permission = Notification.permission;
            const status = await notificationManager.getSubscriptionStatus();

            updateState({
                isSupported: true,
                permission,
                isSubscribed: status.isSubscribed,
                isLoading: false
            });

        } catch (error) {
            //console.error('Erro ao inicializar notificações:', error);
            updateState({
                isLoading: false,
            });
        }
    }, [updateState]);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        updateState({ isLoading: true, error: null });

        try {
            const permission = await notificationManager.requestPermission();
            updateState({ permission, isLoading: false });
            return permission === 'granted';
        } catch (error) {
            // console.error('Erro ao solicitar permissão:', error);
            updateState({
                isLoading: false,
            });
            return false;
        }
    }, [updateState]);

    const subscribe = useCallback(async (): Promise<boolean> => {
        updateState({ isLoading: true, error: null });

        try {
            const subscription = await notificationManager.subscribeToPush();
            const success = subscription !== null;

            updateState({
                isSubscribed: success,
                isLoading: false,
                permission: success ? 'granted' : state.permission
            });

            return success;
        } catch (error) {
            //console.error('Erro ao se inscrever:', error);
            updateState({
                isLoading: false,
            });
            return false;
        }
    }, [updateState, state.permission]);

    const unsubscribe = useCallback(async (): Promise<boolean> => {
        updateState({ isLoading: true, error: null });

        try {
            const success = await notificationManager.unsubscribeFromPush();
            updateState({
                isSubscribed: !success,
                isLoading: false
            });
            return success;
        } catch (error) {
            //console.error('Erro ao cancelar inscrição:', error);
            updateState({
                isLoading: false,
            });
            return false;
        }
    }, [updateState]);

    const showNotification = useCallback(async (payload: NotificationPayload): Promise<boolean> => {
        try {
            await notificationManager.showNotification(payload);
            return true;
        } catch (error) {
            console.error('Erro ao mostrar notificação:', error);
            updateState({ error: 'Erro ao mostrar notificação' });
            return false;
        }
    }, [updateState]);

    const sendPushNotification = useCallback(async (
        title: string,
        body: string,
        data?: any
    ): Promise<boolean> => {
        try {
            const response = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body, data }),
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Erro ao enviar push notification:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            initialize();
        }
    }, [initialize]);

    return {
        ...state,
        requestPermission,
        subscribe,
        unsubscribe,
        showNotification,
        sendPushNotification,
        refresh: initialize
    };
}