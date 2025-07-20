import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/models/supabase';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient({
      req: { cookies: Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value])) },
      res: { setHeader: () => {}, getHeader: () => undefined }
    } as any);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json(
        { error: 'Usuário não autenticado', details: authError?.message },
        { status: 401 }
      );
    }

    const subscription = await req.json();

    // Salvar subscription no banco de dados
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Erro ao salvar subscription:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API de subscribe:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}