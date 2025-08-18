import { supabaseAdmin, isSupabaseConfigured } from '../../../lib/supabase';
import { LessonData } from '../cron/route';

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

// Função para obter dados da lição do Supabase
async function getLessonFromSupabase(): Promise<{ title: string; lessonLink: string; lastUpdated: string; expiresAt: string } | null> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase não configurado, pulando busca no banco...');
    return null;
  }

  try {
    console.log('Buscando link da lição no Supabase...');
    
    // Calcular semana atual
    const currentDate = new Date();
    const weekNumber = Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Buscar apenas o link da lição atual no Supabase
    const { data, error } = await supabaseAdmin
      .from('lesson_cache')
      .select('title, lesson_link, last_updated, expires_at')
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
      console.log('Link da lição encontrado no Supabase:', data.lesson_link);
      return {
        title: data.title,
        lessonLink: data.lesson_link,
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
    lastUpdated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Função principal - busca do Supabase ou detecta automaticamente
export async function getCachedLesson(): Promise<LessonData> {
  console.log('Iniciando busca de dados da lição...');
  
  try {
    // 1. Tentar buscar link da lição no Supabase
    const lessonLinkData = await getLessonFromSupabase();
    
    if (lessonLinkData && lessonLinkData.lessonLink) {
      console.log('Retornando dados com link da lição para IA explorar');
      return {
        title: lessonLinkData.title,
        days: [], // Vazio - IA deve explorar o site
        verses: [], // Vazio - IA deve explorar o site
        lessonLink: lessonLinkData.lessonLink,
        lastUpdated: lessonLinkData.lastUpdated,
        expiresAt: lessonLinkData.expiresAt
      };
    }

    // 2. Se não encontrar no Supabase, detectar e salvar automaticamente
    console.log('Link não encontrado no Supabase, detectando nova lição...');
    const currentLesson = await detectCurrentLesson();
    
    if (currentLesson) {
      console.log('Nova lição detectada:', currentLesson.title);
      
      // Salvar link no Supabase
      const saved = await saveLessonLinkToSupabase(currentLesson.title, currentLesson.link);
      
      if (saved) {
        console.log('Link salvo no Supabase com sucesso');
        return {
          title: currentLesson.title,
          days: [], // Vazio - IA deve explorar o site
          verses: [], // Vazio - IA deve explorar o site
          lessonLink: currentLesson.link,
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