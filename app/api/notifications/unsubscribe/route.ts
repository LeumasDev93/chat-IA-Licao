import { NextRequest, NextResponse } from 'next/server';
import { createComponentClient } from '@/models/supabase';

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