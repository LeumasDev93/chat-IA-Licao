import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '../../../lib/supabase';

export interface LessonData {
  title: string;
  days: string[];
  verses: string[];
  lessonLink: string;
  lastUpdated: string;
  expiresAt: string;
}

// Função para detectar a lição atual da semana
async function detectCurrentLesson(): Promise<{ title: string; link: string; verse: string; period: string } | null> {
  try {
    console.log('Detectando lição atual da semana...');
    
    const response = await fetch('https://mais.cpb.com.br/licao-adultos/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao acessar site: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('HTML da página principal obtido, tamanho:', html.length);

    // Procurar pelo JSON das lições no HTML
    const jsonMatch = html.match(/\[{.*"img":.*"title":.*"verso":.*"periodo":.*"link":.*}\]/);
    
    if (jsonMatch) {
      try {
        const lessonsData = JSON.parse(jsonMatch[0]);
        console.log(`Encontradas ${lessonsData.length} lições no JSON`);
        
        // Encontrar a lição atual baseada na data
        const currentDate = new Date();
        const currentLesson = lessonsData.find((lesson: { periodo?: string; title: string; link: string; verso: string }) => {
          if (!lesson.periodo) return false;
          
          // Extrair datas do período (ex: "16 a 22 de agosto")
          const periodMatch = lesson.periodo.match(/(\d+)\s+a\s+(\d+)\s+de\s+(\w+)/);
          if (!periodMatch) return false;
          
          const startDay = parseInt(periodMatch[1]);
          const endDay = parseInt(periodMatch[2]);
          const month = periodMatch[3];
          
          // Mapear mês para número
          const monthMap: { [key: string]: number } = {
            'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
            'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
          };
          
          const monthNumber = monthMap[month.toLowerCase()];
          if (monthNumber === undefined) return false;
          
          const year = currentDate.getFullYear();
          const startDate = new Date(year, monthNumber, startDay);
          const endDate = new Date(year, monthNumber, endDay);
          
          return currentDate >= startDate && currentDate <= endDate;
        });
        
        if (currentLesson) {
          console.log('Lição atual detectada:', currentLesson.title);
          return {
            title: currentLesson.title,
            link: currentLesson.link,
            verse: currentLesson.verso,
            period: currentLesson.periodo
          };
        } else {
          console.log('Nenhuma lição encontrada para a semana atual, usando a primeira disponível');
          return {
            title: lessonsData[0].title,
            link: lessonsData[0].link,
            verse: lessonsData[0].verso,
            period: lessonsData[0].periodo
          };
        }
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao detectar lição atual:', error);
    return null;
  }
}

// Função para salvar o link da lição no Supabase
async function saveLessonLinkToSupabase(title: string, lessonLink: string): Promise<boolean> {
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
      // Atualizar apenas o link da lição existente
      const { error } = await supabaseAdmin
        .from('lesson_cache')
        .update({
          title: title,
          lesson_link: lessonLink,
          last_updated: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('week_number', weekNumber);

      if (error) {
        console.error('Erro ao atualizar link da lição no Supabase:', error);
        return false;
      }

      console.log('Link da lição atualizado no Supabase com sucesso');
    } else {
      // Inserir nova entrada com arrays vazios para satisfazer constraints
      const { error } = await supabaseAdmin
        .from('lesson_cache')
        .insert({
          title: title,
          lesson_link: lessonLink,
          week_number: weekNumber,
          days: [], // Array vazio para satisfazer constraint
          verses: [], // Array vazio para satisfazer constraint
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) {
        console.error('Erro ao salvar link da lição no Supabase:', error);
        return false;
      }

      console.log('Novo link da lição salvo no Supabase com sucesso');
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar link da lição no Supabase:', error);
    return false;
  }
}

export async function GET() {
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
      
      // Salvar link no Supabase
      const saved = await saveLessonLinkToSupabase(currentLesson.title, currentLesson.link);
      
      if (saved) {
        console.log('Cron Job: Link da lição salvo com sucesso no Supabase');
        return NextResponse.json({
          success: true,
          message: 'Link da lição atualizado com sucesso',
          lesson: {
            title: currentLesson.title,
            link: currentLesson.link,
            period: currentLesson.period
          }
        });
      } else {
        console.error('Cron Job: Erro ao salvar link da lição');
        return NextResponse.json({
          success: false,
          message: 'Erro ao salvar link da lição'
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
export async function POST() {
  console.log('Cron Job: Forçando atualização manual da lição...');
  
  try {
    // Detectar nova lição
    const currentLesson = await detectCurrentLesson();
    
    if (currentLesson) {
      console.log('Cron Job: Lição detectada:', currentLesson.title);
      
      // Salvar link no Supabase
      const saved = await saveLessonLinkToSupabase(currentLesson.title, currentLesson.link);
      
      if (saved) {
        console.log('Cron Job: Link da lição salvo com sucesso no Supabase');
        return NextResponse.json({
          success: true,
          message: 'Link da lição atualizado com sucesso',
          lesson: {
            title: currentLesson.title,
            link: currentLesson.link,
            period: currentLesson.period
          }
        });
      } else {
        console.error('Cron Job: Erro ao salvar link da lição');
        return NextResponse.json({
          success: false,
          message: 'Erro ao salvar link da lição'
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
