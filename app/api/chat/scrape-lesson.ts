import { supabaseAdmin, isSupabaseConfigured } from '../../../lib/supabase';
import { LessonData } from '../cron/route';

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
    const maxLength = 15000; // Aumentado para capturar mais conteúdo
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

// Função para detectar a lição atual da semana
async function detectCurrentLesson(): Promise<{ title: string; link: string; verse: string; period: string } | null> {
  try {
    console.log('Detectando lição atual da semana...');
    
    // Usar o link específico fornecido pelo usuário
    const specificLessonLink = 'https://mais.cpb.com.br/licao/vivendo-a-lei-3o-trimestre-2025/';
    
    // Buscar o conteúdo da página para extrair informações
    const response = await fetch(specificLessonLink, {
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
    console.log('HTML da página da lição obtido, tamanho:', html.length);

    // Extrair título da lição do HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Vivendo a Lei - 3º Trimestre 2025';

    // Extrair período da lição (se disponível)
    const periodMatch = html.match(/(\d+\s+a\s+\d+\s+de\s+\w+)/i);
    const period = periodMatch ? periodMatch[1] : '23 a 29 de agosto';

    // Extrair verso para memorizar (se disponível)
    const verseMatch = html.match(/Verso para memorizar[^:]*:\s*"([^"]+)"/i);
    const verse = verseMatch ? verseMatch[1] : 'Êxodo 20:22, 23';

    console.log('Lição detectada:', title);
    return {
      title: title,
      link: specificLessonLink,
      verse: verse,
      period: period
    };
    
  } catch (error) {
    console.error('Erro ao detectar lição atual:', error);
    return null;
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
        .eq('id', existingLesson.id);

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



// Função para obter dados da lição do Supabase
async function getLessonFromSupabase(): Promise<{ title: string; lessonLink: string; lessonContent: string; lastUpdated: string; expiresAt: string } | null> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase não configurado, pulando busca no banco...');
    return null;
  }

  try {
    console.log('Buscando lição no Supabase...');
    
    // Calcular semana atual
    const currentDate = new Date();
    const weekNumber = Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Buscar lição atual no Supabase incluindo conteúdo
    const { data, error } = await supabaseAdmin
      .from('lesson_cache')
      .select('title, lesson_link, lesson_content, last_updated, expires_at')
      .eq('week_number', weekNumber)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar lição no Supabase:', error);
      return null;
    }

    if (data) {
      console.log('Lição encontrada no Supabase:', data.lesson_link);
      return {
        title: data.title,
        lessonLink: data.lesson_link,
        lessonContent: data.lesson_content || '',
        lastUpdated: data.last_updated,
        expiresAt: data.expires_at
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar lição no Supabase:', error);
    return null;
  }
}

// Função para gerar dados de fallback (apenas com link)
function generateFallbackData(): LessonData {
  console.log('Não foi possível obter dados da lição. Retornando dados vazios.');
  return {
    title: 'Lição não disponível',
    days: [],
    verses: [],
    lessonLink: '',
    lessonContent: 'Conteúdo da lição não disponível no momento.',
    lastUpdated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Função principal - busca do Supabase ou detecta automaticamente
export async function getCachedLesson(): Promise<LessonData> {
  console.log('Iniciando busca de dados da lição...');
  
  try {
    // 1. Tentar buscar lição no Supabase
    const lessonData = await getLessonFromSupabase();
    
    if (lessonData && lessonData.lessonLink) {
      // Se já temos conteúdo no Supabase, usar ele
      if (lessonData.lessonContent && lessonData.lessonContent.trim()) {
        console.log('Usando conteúdo da lição armazenado no Supabase');
        return {
          title: lessonData.title,
          days: [], // Mantido para compatibilidade
          verses: [], // Mantido para compatibilidade
          lessonLink: lessonData.lessonLink,
          lessonContent: lessonData.lessonContent,
          lastUpdated: lessonData.lastUpdated,
          expiresAt: lessonData.expiresAt
        };
      } else {
        // Se não temos conteúdo, buscar e atualizar
        console.log('Buscando conteúdo real da lição e atualizando no Supabase...');
        const lessonContent = await fetchLessonContent(lessonData.lessonLink);
        
        // Atualizar no Supabase com o conteúdo
        await saveLessonToSupabase(lessonData.title, lessonData.lessonLink, lessonContent);
        
        return {
          title: lessonData.title,
          days: [], // Mantido para compatibilidade
          verses: [], // Mantido para compatibilidade
          lessonLink: lessonData.lessonLink,
          lessonContent: lessonContent,
          lastUpdated: new Date().toISOString(),
          expiresAt: lessonData.expiresAt
        };
      }
    }

    // 2. Se não encontrar no Supabase, detectar e salvar automaticamente
    console.log('Lição não encontrada no Supabase, detectando nova lição...');
    const currentLesson = await detectCurrentLesson();
    
    if (currentLesson) {
      console.log('Nova lição detectada:', currentLesson.title);
      
      // Buscar conteúdo real da lição
      const lessonContent = await fetchLessonContent(currentLesson.link);
      
      // Salvar lição completa no Supabase
      const saved = await saveLessonToSupabase(currentLesson.title, currentLesson.link, lessonContent);
      
      if (saved) {
        console.log('Lição completa salva no Supabase com sucesso');
        return {
          title: currentLesson.title,
          days: [], // Mantido para compatibilidade
          verses: [], // Mantido para compatibilidade
          lessonLink: currentLesson.link,
          lessonContent: lessonContent,
          lastUpdated: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
    }

    // 3. Se tudo falhar, usar dados de fallback
    console.log('Usando dados de fallback');
    return generateFallbackData();

  } catch (error) {
    console.error('Erro ao obter dados da lição:', error);
    return generateFallbackData();
  }
}

// Função para forçar atualização da lição (exportada para uso externo)
export async function forceUpdateLesson(): Promise<LessonData> {
  console.log('🔄 Forçando atualização da lição...');
  
  try {
    // Detectar nova lição
    const currentLesson = await detectCurrentLesson();
    
    if (currentLesson) {
      console.log('🔄 Nova lição detectada:', currentLesson.title);
      
      // Buscar conteúdo real da lição
      const lessonContent = await fetchLessonContent(currentLesson.link);
      
      // Salvar lição completa no Supabase
      const saved = await saveLessonToSupabase(currentLesson.title, currentLesson.link, lessonContent);
      
      if (saved) {
        console.log('🔄 Lição completa salva com sucesso no Supabase');
        return {
          title: currentLesson.title,
          days: [], // Mantido para compatibilidade
          verses: [], // Mantido para compatibilidade
          lessonLink: currentLesson.link,
          lessonContent: lessonContent,
          lastUpdated: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      } else {
        console.error('🔄 Erro ao salvar lição completa');
        throw new Error('Erro ao salvar lição completa no Supabase');
      }
    } else {
      console.log('🔄 Nenhuma nova lição detectada');
      throw new Error('Nenhuma nova lição detectada');
    }
    
  } catch (error) {
    console.error('🔄 Erro durante atualização forçada:', error);
    throw error;
  }
}