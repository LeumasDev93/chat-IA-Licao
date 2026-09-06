import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase-route';

export const runtime = 'nodejs';

interface PushSubscriptionBody {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const subscription = (await req.json()) as PushSubscriptionBody;

    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json({ error: 'Subscription inválida' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const row = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh_key: subscription.keys.p256dh,
      auth_key: subscription.keys.auth,
      is_active: true,
      updated_at: now,
    };

    // Upsert manual (não depende de uma constraint UNIQUE específica na tabela).
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .maybeSingle();

    const { error } = existing
      ? await supabase.from('push_subscriptions').update(row).eq('id', existing.id)
      : await supabase.from('push_subscriptions').insert(row);

    if (error) {
      console.error('Erro ao salvar subscription:', error.message);
      return NextResponse.json({ error: 'Erro ao salvar subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API de subscribe:', (error as Error).message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
