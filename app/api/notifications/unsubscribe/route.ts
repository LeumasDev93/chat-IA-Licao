import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase-route';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Endpoint opcional: se enviado, desativa só aquele dispositivo;
    // caso contrário, desativa todas as subscriptions do usuário.
    let endpoint: string | undefined;
    try {
      const body = await req.json();
      endpoint = body?.endpoint;
    } catch {
      // sem body — ok
    }

    let query = supabase
      .from('push_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (endpoint) query = query.eq('endpoint', endpoint);

    const { error } = await query;

    if (error) {
      console.error('Erro ao desativar subscription:', error.message);
      return NextResponse.json({ error: 'Erro ao desativar subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API de unsubscribe:', (error as Error).message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
