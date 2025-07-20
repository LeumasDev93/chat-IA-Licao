import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createComponentClient } from '@/models/supabase';

// Configurar VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const supabase = createComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { title, body, data, targetUserId } = await req.json();

    // Se targetUserId for fornecido, enviar apenas para esse usuário
    // Caso contrário, enviar para o usuário atual
    const userId = targetUserId || user.id;

    // Buscar subscription do usuário
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Erro ao buscar subscriptions:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma subscription ativa encontrada' },
        { status: 404 }
      );
    }

    const notificationPayload = {
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: {
        url: '/',
        timestamp: Date.now(),
        ...data
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200]
    };

    // Enviar notificação para todas as subscriptions do usuário
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationPayload)
        );

        return { success: true, endpoint: subscription.endpoint };
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        
        // Se a subscription é inválida, marcar como inativa
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', subscription.id);
        }

        return { success: false, endpoint: subscription.endpoint, error };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      results
    });

  } catch (error) {
    console.error('Erro na API de send notification:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}