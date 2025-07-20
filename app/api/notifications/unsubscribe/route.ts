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
      return NextResponse.json(
        { error: 'Usuário não autenticado', details: authError?.message },
        { status: 401 }
      );
    }

    // Marcar subscription como inativa
    const { error } = await supabase
      .from('push_subscriptions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao desativar subscription:', error);
      return NextResponse.json(
        { error: 'Erro ao desativar subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API de unsubscribe:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}