import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '../../../lib/supabase';
import { detectCurrentLesson, fetchLessonContent } from '@/lib/lessons';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';

// Função para salvar o link e conteúdo da lição no Supabase
async function saveLessonToSupabase(title: string, lessonLink: string, lessonContent: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase não configurado, pulando salvamento...');
    return false;
  }

  try {
    const currentDate = new Date();
    const weekNumber = Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Verificar se já existe uma lição para esta semana
    const { data: existingLesson } = await supabaseAdmin
      .from('lesson_cache')
      .select('id')
      .eq('week_number', weekNumber)
      .single();

    if (existingLesson) {
      // Atualizar lição existente com novo conteúdo
      const { error } = await supabaseAdmin
        .from('lesson_cache')
        .update({
          title: title,
          lesson_link: lessonLink,
          lesson_content: lessonContent,
          last_updated: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('week_number', weekNumber);

      if (error) {
        console.error('Erro ao atualizar lição no Supabase:', error);
        return false;
      }

      console.log('Lição atualizada no Supabase com sucesso (título, link e conteúdo)');
    } else {
      // Inserir nova entrada com conteúdo
      const { error } = await supabaseAdmin
        .from('lesson_cache')
        .insert({
          title: title,
          lesson_link: lessonLink,
          lesson_content: lessonContent,
          week_number: weekNumber,
          days: [], // Array vazio para satisfazer constraint
          verses: [], // Array vazio para satisfazer constraint
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) {
        console.error('Erro ao salvar lição no Supabase:', error);
        return false;
      }

      console.log('Nova lição salva no Supabase com sucesso (título, link e conteúdo)');
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar lição no Supabase:', error);
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 });
  }

  console.log('Cron Job: Iniciando atualização automática da lição...');

  try {
    // REMOVIDO: Verificação de sábado para facilitar testes
    // const now = new Date();
    // const dayOfWeek = now.getDay(); // 0 = Domingo, 6 = Sábado
    // const hour = now.getHours();
    
    // Executar sempre (removido filtro de sábado)
    console.log('Cron Job: Executando atualização da lição...');
    
    // Detectar nova lição
    const currentLesson = await detectCurrentLesson();
    
    if (currentLesson) {
      console.log('Cron Job: Nova lição detectada:', currentLesson.title);
      
      // Buscar conteúdo real da lição
      const lessonContent = await fetchLessonContent(currentLesson.link);
      
      // Salvar lição completa no Supabase
      const saved = await saveLessonToSupabase(currentLesson.title, currentLesson.link, lessonContent);
      
      if (saved) {
        console.log('Cron Job: Lição completa salva com sucesso no Supabase');
        return NextResponse.json({
          success: true,
          message: 'Lição completa atualizada com sucesso',
          lesson: {
            title: currentLesson.title,
            link: currentLesson.link,
            period: currentLesson.period,
            contentLength: lessonContent.length
          }
        });
      } else {
        console.error('Cron Job: Erro ao salvar lição completa');
        return NextResponse.json({
          success: false,
          message: 'Erro ao salvar lição completa'
        }, { status: 500 });
      }
    } else {
      console.log('Cron Job: Nenhuma nova lição detectada');
      return NextResponse.json({
        success: false,
        message: 'Nenhuma nova lição detectada'
      });
    }
    
  } catch (error) {
    console.error('Cron Job: Erro durante atualização:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro durante atualização da lição'
    }, { status: 500 });
  }
}

// Função para forçar atualização manual (para testes)
export async function POST(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 });
  }

  console.log('Cron Job: Forçando atualização manual da lição...');

  try {
    // Detectar nova lição
    const currentLesson = await detectCurrentLesson();
    
    if (currentLesson) {
      console.log('Cron Job: Lição detectada:', currentLesson.title);
      
      // Buscar conteúdo real da lição
      const lessonContent = await fetchLessonContent(currentLesson.link);
      
      // Salvar lição completa no Supabase
      const saved = await saveLessonToSupabase(currentLesson.title, currentLesson.link, lessonContent);
      
      if (saved) {
        console.log('Cron Job: Lição completa salva com sucesso no Supabase');
        return NextResponse.json({
          success: true,
          message: 'Lição completa atualizada com sucesso',
          lesson: {
            title: currentLesson.title,
            link: currentLesson.link,
            period: currentLesson.period,
            contentLength: lessonContent.length
          }
        });
      } else {
        console.error('Cron Job: Erro ao salvar lição completa');
        return NextResponse.json({
          success: false,
          message: 'Erro ao salvar lição completa'
        }, { status: 500 });
      }
    } else {
      console.log('Cron Job: Nenhuma lição detectada');
      return NextResponse.json({
        success: false,
        message: 'Nenhuma lição detectada'
      });
    }
    
  } catch (error) {
    console.error('Cron Job: Erro durante atualização manual:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro durante atualização da lição'
    }, { status: 500 });
  }
}
