import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase-route';
import { supabaseAdmin } from '@/lib/supabase';
import { getWebPush, isWebPushConfigured } from '@/lib/webpush';

// web-push depende de APIs do Node (crypto), não roda no Edge Runtime.
export const runtime = 'nodejs';

interface PushRow {
  id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

export async function POST(req: NextRequest) {
  if (!isWebPushConfigured()) {
    return NextResponse.json(
      { error: 'Push notifications não configuradas no servidor' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { title, body, data, targetUserId } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Campos "title" e "body" são obrigatórios' },
        { status: 400 }
      );
    }

    // Por padrão o usuário só envia para si mesmo. Enviar para outro usuário
    // exige role de serviço (uso interno / cron), nunca a partir do browser.
    const userId = targetUserId && targetUserId !== user.id ? null : user.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Não é permitido enviar notificações para outro usuário' },
        { status: 403 }
      );
    }

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh_key, auth_key')
      .eq('user_id', userId)
      .eq('is_active', true)
      .returns<PushRow[]>();

    if (error) {
      console.error('Erro ao buscar subscriptions:', error.message);
      return NextResponse.json({ error: 'Erro ao buscar subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'Nenhuma subscription ativa encontrada' }, { status: 404 });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: { url: '/', timestamp: Date.now(), ...(data ?? {}) },
      requireInteraction: true,
      vibrate: [200, 100, 200],
    });

    const webpush = getWebPush();

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
            },
            payload
          );
          return { endpoint: sub.endpoint, success: true };
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          // 404/410 = subscription expirada: desativar para não tentar de novo.
          if (statusCode === 404 || statusCode === 410) {
            await supabaseAdmin
              .from('push_subscriptions')
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq('id', sub.id);
          } else {
            console.error('Falha ao enviar push:', statusCode, (err as Error).message);
          }
          return { endpoint: sub.endpoint, success: false };
        }
      })
    );

    const sent = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: sent > 0,
      sent,
      failed: results.length - sent,
      results,
    });
  } catch (error) {
    console.error('Erro na API de send notification:', (error as Error).message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
