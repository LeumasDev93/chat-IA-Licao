import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '../../../lib/supabase';

export interface LessonData {
  title: string;
  days: string[];
  verses: string[];
  lessonLink: string;
  lessonContent?: string; // Conteúdo real da lição para a IA usar
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

// Função para buscar o conteúdo real da lição
async function fetchLessonContent(lessonLink: string): Promise<string> {
  try {
    console.log('Buscando conteúdo da lição:', lessonLink);
    
    const response = await fetch(lessonLink, {
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
      throw new Error(`Erro ao acessar lição: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Conteúdo da lição obtido, tamanho:', html.length);

    // Extrair texto limpo do HTML (remover tags HTML)
    const cleanText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove CSS
      .replace(/<[^>]+>/g, ' ') // Remove tags HTML
      .replace(/\s+/g, ' ') // Normaliza espaços
      .replace(/&nbsp;/g, ' ') // Remove entidades HTML
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    // Limitar o tamanho do conteúdo para não exceder limites da API
    const maxLength = 8000; // Limite conservador para o Gemini
    const truncatedText = cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '... [conteúdo truncado]'
      : cleanText;

    console.log('Conteúdo da lição processado, tamanho final:', truncatedText.length);
    return truncatedText;

  } catch (error) {
    console.error('Erro ao buscar conteúdo da lição:', error);
    return 'Conteúdo da lição não disponível no momento.';
  }
}

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
export async function POST() {
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
